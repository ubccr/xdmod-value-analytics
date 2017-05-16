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
     * @see aIngestor::_execute
     */

    // @codingStandardsIgnoreLine
    protected function _execute()
    {
        // Prepare SQL statements for updating various people-related tables.
        $destColumns = $this->executionData['destColumns'];
        $destColumnsToSourceKeys = $this->executionData['destColumnsToSourceKeys'];
        $sourceValues = $this->executionData['sourceValues'];

        // If no data was provided in the file, use the StructuredFile endpoint
        if ( null === $sourceValues ) {
            $sourceValues = $this->sourceEndpoint;
        }

        $destinationSchema = $this->destinationEndpoint->getSchema();
        $destinationTable = $this->etlDestinationTable->getFullName();

        $insertPeopleSql = "
            INSERT INTO
                $destinationTable
                (" . implode(', ', $destColumns) . ")
            VALUES (
                " . implode(', ', array_fill(0, count($destColumns), '?')) . "
            )
        ";

        $updatePeopleSetClauses = array_map(function ($destColumn) {
            return "$destColumn = ?";
        }, $destColumns);
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
                    title,
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
                :title,
                :last_modified
            )
            ON DUPLICATE KEY UPDATE
                person_organization_id = VALUES(person_organization_id),
                title = VALUES(title),
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

        $numRecordsProcessed = 0;

        if ( $this->getEtlOverseerOptions()->isDryrun() ) {
            return $numRecordsProcessed;
        }

        // For every person in the source data...
        foreach ($sourceValues as $sourceValue) {
            // Check if the person exists already in the database.
            $personId = ValueAnalyticsDataFinder::findPerson(
                $sourceValue,
                $destinationSchema,
                $destinationHandle,
                array($this, 'logAndThrowSqlException')
            );

            // If the person does not exist in the database, add them.
            // Otherwise, update their data.
            $peopleValues = $this->convertSourceValueToRow(
                $sourceValue,
                $destColumns,
                $destColumnsToSourceKeys
            );
            if ($personId === null) {
                try {
                    $insertPeopleStatement->execute($peopleValues);
                } catch (PDOException $e) {
                    $this->logAndThrowSqlException(
                        $insertPeopleSql,
                        $e,
                        "Error inserting person data."
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
                    $this->logAndThrowSqlException(
                        $updatePeopleSql,
                        $e,
                        "Error inserting person data."
                    );
                }

            }

            // Update the person's organization data.
            foreach ($sourceValue->organizations as $personOrganization) {
                try {
                    $peopleOrganizationsStatement->execute(array(
                        ':person_id' => $personId,
                        ':organization_name' => $personOrganization->name,
                        ':person_organization_id' => $personOrganization->id,
                        ':title' =>
                            property_exists($personOrganization, 'title')
                            ? $personOrganization->title
                            : null
                        ,
                        ':last_modified' =>
                            property_exists($personOrganization, 'last_modified')
                            ? $personOrganization->last_modified
                            : null
                        ,
                    ));
                } catch (PDOException $e) {
                    $this->logAndThrowSqlException(
                        $peopleOrganizationsSql,
                        $e,
                        "Error inserting/updating a person's organization data."
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
                            $this->logAndThrowSqlException(
                                $peopleGroupsSql,
                                $e,
                                "Error inserting/updating a person's group data."
                            );
                        }
                    }
                }
            }  // foreach ($sourceValue->organizations as $personOrganization)

            // Update the person's identifiers.
            $personIdentifiersExist = property_exists($sourceValue, 'identifiers');
            if ($personIdentifiersExist) {
                foreach ($sourceValue->identifiers as $personIdentifier) {
                    try {
                        $peopleIdentifiersStatement->execute(array(
                            ':person_id' => $personId,
                            ':identity_provider_name' => $personIdentifier->type,
                            ':person_identity_provider_id' => $personIdentifier->id,
                        ));
                    } catch (PDOException $e) {
                        $this->logAndThrowSqlException(
                            $peopleIdentifiersSql,
                            $e,
                            "Error inserting/updating a person's identifiers."
                        );
                    }
                }
            }

            $numRecordsProcessed++;

        }  // foreach ($sourceValues as $sourceValue)

        // Update each person's Jobs realm ID.
        try {
            $peopleJobsIdStatement->execute();
        } catch (PDOException $e) {
            $this->logAndThrowSqlException(
                $peopleJobsIdSql,
                $e,
                "Error updating Jobs realm IDs for VA person data."
            );
        }

        return $numRecordsProcessed;
    }  // _execute()
}  // class ValueAnalyticsPeopleIngestor
