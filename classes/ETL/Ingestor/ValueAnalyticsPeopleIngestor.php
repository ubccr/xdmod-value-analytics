<?php
/**
 * Ingestor for Value Analytics people data.
 *
 * This is done as a custom ingestor because the relationships between
 * people and their various identifiers are stored in separate tables. The
 * auto-generated IDs for people need to be acquired after insertion and used
 * to insert their identifiers.
 */

namespace ETL\Ingestor;

use PDOException;

use ETL\EtlOverseerOptions;
use ETL\iAction;
use ETL\Utilities\ValueAnalyticsDataFinder;

class ValueAnalyticsPeopleIngestor extends StructuredFileIngestor
{
    /**
     * @see aIngestor::_execute()
     */

    // @codingStandardsIgnoreLine
    protected function _execute()
    {
        $numRecordsProcessed = 0;

        $this->sourceEndpoint->parse();
        $recordFieldNames = $this->sourceEndpoint->getRecordFieldNames();
        $this->logger->debug(
            sprintf("Requested %d record fields: %s", count($recordFieldNames), implode(', ', $recordFieldNames))
        );

        if ( 0 == count($recordFieldNames) ) {
            return $numRecordsProcessed;
        }

        $this->parseDestinationFieldMap($recordFieldNames);

        // This is a specialized ingestor so we are only using the first entry in the
        // field map and destination table list.

        reset($this->destinationFieldMappings);
        $destFieldToSourceFieldMap = current($this->destinationFieldMappings);
        $destinationFields = array_keys($destFieldToSourceFieldMap);

        reset($this->etlDestinationTableList);
        $etlDestinationTable = current($this->etlDestinationTableList);

        $destinationSchema = $this->destinationEndpoint->getSchema();
        $destinationTable = $etlDestinationTable->getFullName();

        // Prepare SQL statements for updating various people-related tables.

        $insertPeopleSql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $destinationTable,
            implode(', ', $destinationFields),
            implode(', ',
                    array_map(function ($destColumn) {
                        return '?';
                    }, $destinationFields)
            )
        );

        $this->logger->debug("Insert SQL: " . $insertPeopleSql);

        $updatePeopleSetClauses = array_map(function ($destColumn) {
            return "$destColumn = ?";
        }, $destinationFields);
        $updatePeopleSetClausesStr = implode(",\n", $updatePeopleSetClauses);
        $updatePeopleSql = "
            UPDATE
                $destinationTable
            SET
                $updatePeopleSetClausesStr
            WHERE
                id = ?
        ";

        $peopleOrganizationsSql = "
            INSERT INTO
                $destinationSchema.people_organizations
                (
                    person_id,
                    organization_id,
                    person_organization_id,
                    appointment_type,
                    division,
                    title,
                    `primary`,
                    last_modified
                )
            VALUES (
                :person_id,
                (
                    SELECT id
                    FROM $destinationSchema.organizations
                    WHERE name = :organization_name
                ),
                :person_organization_id,
                :appointment_type,
                :division,
                :title,
                :primary,
                :last_modified
            )
            ON DUPLICATE KEY UPDATE
                person_organization_id = VALUES(person_organization_id),
                appointment_type = VALUES(appointment_type),
                division = VALUES(division),
                title = VALUES(title),
                `primary` = VALUES(`primary`),
                last_modified = VALUES(last_modified)
        ";

        $peopleGroupsSql = "
            INSERT INTO
                $destinationSchema.people_groups
                (
                    person_id,
                    group_id
                )
            VALUES (
                :person_id,
                (
                    SELECT id
                    FROM $destinationSchema.groups
                    WHERE
                        name = :group_name
                        AND organization_id = (
                            SELECT id
                            FROM $destinationSchema.organizations
                            WHERE name = :organization_name
                        )
                )
            )
            ON DUPLICATE KEY UPDATE
                person_id = person_id
        ";

        $peopleIdentifiersSql = "
            INSERT INTO
                $destinationSchema.people_identifiers
                (
                    person_id,
                    identity_provider_id,
                    person_identity_provider_id
                )
            VALUES (
                :person_id,
                (
                    SELECT id
                    FROM $destinationSchema.identity_providers
                    WHERE name = :identity_provider_name
                ),
                :person_identity_provider_id
            )
            ON DUPLICATE KEY UPDATE
                person_identity_provider_id = VALUES(person_identity_provider_id)
        ";

        $peopleJobsIdSql = "
            UPDATE
                $destinationTable AS p
                JOIN $destinationSchema.people_organizations AS po
                    ON p.id = po.person_id
                JOIN $destinationSchema.organizations AS vao
                    ON vao.id = po.organization_id
                JOIN modw.systemaccount AS sa
                    ON sa.username = po.person_organization_id
                JOIN modw.resourcefact AS rf
                    ON sa.resource_id = rf.id
                JOIN modw.organization AS o
                    ON rf.organization_id = o.id
                    AND o.name = vao.name
            SET
                p.jobs_person_id = sa.person_id
        ";

        try {
            $destinationHandle = $this->destinationHandle;
            list(
                $insertPeopleStatement,
                $updatePeopleStatement,
                $peopleOrganizationsStatement,
                $peopleGroupsStatement,
                $peopleIdentifiersStatement,
                $peopleJobsIdStatement,
            ) = array_map(function ($sql) use ($destinationHandle) {
                return $destinationHandle->prepare($sql);
            }, array(
                $insertPeopleSql,
                $updatePeopleSql,
                $peopleOrganizationsSql,
                $peopleGroupsSql,
                $peopleIdentifiersSql,
                $peopleJobsIdSql,
            ));
        } catch (PDOException $e) {
            $this->logAndThrowException("Failed to prepare statement. ({$e->getMessage()})");
        }

        if ( $this->getEtlOverseerOptions()->isDryrun() ) {
            return $numRecordsProcessed;
        }

        // The destination field map may specify that the same source field is mapped to
        // multiple destination fields and the order that the source record fields is
        // returned may be different from the order the fields were specified in the
        // map. Maintain a mapping between source fields and the position (index) that
        // they were specified in the map so we cam properly build the SQL parameter list.

        $sourceFieldIndexes = array_values($destFieldToSourceFieldMap);

        // The records returned from a StructuredFile endpoint will be Traversable as
        // ($key, $value) pairs, however this does not mean that we can assume they can be
        // treated as arrays (e.g., $sourceRecord[$sourceField]) because they may be
        // objects or store data in private members that are exposed by the Iterator
        // interface.

        foreach ($this->sourceEndpoint as $sourceRecord) {
            // Check if the person exists already in the database.
            $personId = ValueAnalyticsDataFinder::findPerson(
                $sourceRecord,
                $destinationSchema,
                $destinationHandle,
                array($this, 'logAndThrowException')
            );

            $peopleValues = array();

            foreach ($sourceRecord as $sourceField => $sourceValue) {
                // Find all indexes that match the current source field
                $indexes = array_keys(array_intersect($sourceFieldIndexes, array($sourceField)));
                foreach ( $indexes as $i ) {
                    $peopleValues[$i] = $sourceValue;
                }
            }

            // If the person does not exist in the database, add them.
            // Otherwise, update their data.

            if ($personId === null) {
                try {
                    $insertPeopleStatement->execute($peopleValues);
                } catch (PDOException $e) {
                    $this->logAndThrowException(
                        "Error inserting person data.",
                        array(
                            'sql' => $insertPeopleSql,
                            'exception' => $e,
                        )
                    );
                }

                try {
                    $personId = $destinationHandle->handle()->lastInsertId();
                } catch (PDOException $e) {
                    $this->logAndThrowException("Error getting ID for new person.");
                }
            } else {
                try {
                    $peopleValues[] = $personId;
                    $updatePeopleStatement->execute($peopleValues);
                } catch (PDOException $e) {
                    $this->logAndThrowException(
                        "Error inserting person data.",
                        array(
                            'sql' => $updatePeopleSql,
                            'exception' => $e,
                        )
                    );
                }

            }

            // Update the person's organization data.
            foreach ($sourceRecord->organizations as $personOrganization) {
                try {
                    $peopleOrganizationsStatement->execute(array(
                        ':person_id' => $personId,
                        ':organization_name' => $personOrganization->name,
                        ':person_organization_id' => $personOrganization->id,
                        ':appointment_type' => (
                            property_exists($personOrganization, 'appointment_type')
                            ? $personOrganization->appointment_type
                            : null
                        ),
                        ':division' => (
                            property_exists($personOrganization, 'division')
                            ? $personOrganization->division
                            : null
                        ),
                        ':title' =>
                            property_exists($personOrganization, 'title')
                            ? $personOrganization->title
                            : null
                        ,
                        ':primary' => (
                            property_exists($personOrganization, 'primary')
                            ? $personOrganization->primary
                            : false
                        ),
                        ':last_modified' =>
                            property_exists($personOrganization, 'last_modified')
                            ? $personOrganization->last_modified
                            : null
                        ,
                    ));
                } catch (PDOException $e) {
                    $this->logAndThrowException(
                        "Error inserting/updating a person's organization data.",
                        array(
                            'sql' => $peopleOrganizationsSql,
                            'exception' => $e,
                        )
                    );
                }

                if (property_exists($personOrganization, 'groups')) {
                    foreach ($personOrganization->groups as $personGroup) {
                        try {
                            $peopleGroupsStatement->execute(array(
                                ':person_id' => $personId,
                                ':organization_name' => $personOrganization->name,
                                ':group_name' => $personGroup,
                            ));
                        } catch (PDOException $e) {
                            $this->logAndThrowException(
                                "Error inserting/updating a person's group data.",
                                array(
                                    'sql' => $peopleGroupsSql,
                                    'exception' => $e,
                                )
                            );
                        }
                    }
                }
            }  // foreach ($sourceRecord->organizations as $personOrganization)

            // Update the person's identifiers.
            $personIdentifiersExist = property_exists($sourceRecord, 'identifiers');
            if ($personIdentifiersExist) {
                foreach ($sourceRecord->identifiers as $personIdentifier) {
                    try {
                        $peopleIdentifiersStatement->execute(array(
                            ':person_id' => $personId,
                            ':identity_provider_name' => $personIdentifier->type,
                            ':person_identity_provider_id' => $personIdentifier->id,
                        ));
                    } catch (PDOException $e) {
                        $this->logAndThrowException(
                            "Error inserting/updating a person's identifiers.",
                            array(
                                'sql' => $peopleIdentifiersSql,
                                'exception' => $e,
                            )
                        );
                    }
                }
            }

            $numRecordsProcessed++;

        }  // foreach ($this->sourceEndpoint as $sourceRecord)

        // Update each person's Jobs realm ID.
        try {
            $peopleJobsIdStatement->execute();
        } catch (PDOException $e) {
            $this->logAndThrowException(
                "Error updating Jobs realm IDs for VA person data.",
                array(
                    'sql' => $peopleJobsIdSql,
                    'exception' => $e,
                )
            );
        }

        return $numRecordsProcessed;
    }  // _execute()
}  // class ValueAnalyticsPeopleIngestor
