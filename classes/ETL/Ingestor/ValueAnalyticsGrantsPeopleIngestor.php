<?php
/**
 * Ingestor for Value Analytics grant stakeholder data.
 *
 * This is done as a custom ingestor because there are mutliple methods for
 * specifying a stakeholder on a grant.
 */

namespace ETL\Ingestor;

use PDOException;

use CCR\Json;

use ETL\EtlOverseerOptions;
use ETL\iAction;
use ETL\Utilities\ValueAnalyticsDataFinder;

class ValueAnalyticsGrantsPeopleIngestor extends StructuredFileIngestor
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

        // This is a specialized ingestor so we are only using the first entry in the
        // field map and destination table list. Also note that we are not generating a
        // destination_field_map here because we are doing custom lookups below.

        reset($this->etlDestinationTableList);
        $etlDestinationTable = current($this->etlDestinationTableList);

        $destinationSchema = $this->destinationEndpoint->getSchema();
        $destinationTable = $etlDestinationTable->getFullName();

        // Prepare SQL statements for updating various people-related tables.

        $insertSql = "
            INSERT INTO
                $destinationTable
                (
                    grant_id,
                    person_id,
                    grant_role_id,
                    organization_id
                )
            VALUES (
                :grant_id,
                :person_id,
                (
                    SELECT id
                    FROM $destinationSchema.grant_roles
                    WHERE name = :grant_role_name
                ),
                COALESCE(
                    (
                        SELECT o.id
                        FROM $destinationSchema.organizations o
                        WHERE o.name = :organization_name
                    ),
                    (
                        SELECT o.id
                        FROM $destinationSchema.organizations o
                        ORDER BY o.id ASC
                        LIMIT 1
                    )
                )
            )
            ON DUPLICATE KEY UPDATE
                organization_id = VALUES(organization_id)
        ";

        try {
            $destinationHandle = $this->destinationHandle;
            $insertStatement = $destinationHandle->prepare($insertSql);
        } catch (PDOException $e) {
            $this->logAndThrowException("Failed to prepare statement. ({$e->getMessage()})");
        }

        if ( $this->getEtlOverseerOptions()->isDryrun() ) {
            return $numRecordsProcessed;
        }

        // The records returned from a StructuredFile endpoint will be Traversable as
        // ($key, $value) pairs, however this does not mean that we can assume they can be
        // treated as arrays (e.g., $sourceRecord[$sourceField]) because they may be
        // objects or store data in private members that are exposed by the Iterator
        // interface.

        foreach ($this->sourceEndpoint as $sourceValue) {
            // Get the grant ID.
            $grantId = ValueAnalyticsDataFinder::findGrant(
                $sourceValue,
                $destinationSchema,
                $destinationHandle,
                array($this, 'logAndThrowException')
            );
            if ($grantId === null) {
                $this->logAndThrowException(
                    "Could not find grant."
                );
            }

            // For every person on the grant...
            foreach ($sourceValue->people as $person) {
                // Get the person's ID.
                if (property_exists($person, 'id')) {
                    $personSearchValue = (object) array(
                        'organizations' => array(
                            (object) array(
                                'name' =>
                                    property_exists($person, 'organization')
                                    ? $person->organization
                                    : null,
                                'id' => $person->id,
                            ),
                        )
                    );
                } else {
                    $personSearchValue = $person;
                    $personSearchValue->organizations = array(
                        (object) array(
                            'name' => $person->organization,
                            'id' => null,
                        ),
                    );
                }
                $personId = ValueAnalyticsDataFinder::findPerson(
                    $personSearchValue,
                    $destinationSchema,
                    $destinationHandle,
                    array($this, 'logAndThrowException')
                );

                // If the person could not be found, throw a warning and continue.
                if ($personId === null) {
                    $this->logger->warning(
                        "Could not find person referenced by grant."
                        . " They will not be associated with the grant."
                        . "\n\nPerson: "
                        . Json::prettyPrint(json_encode($personSearchValue))
                    );
                    continue;
                }

                // Add or update the grant-person relationship.
                try {
                    $insertStatement->execute(array(
                        ':grant_id' => $grantId,
                        ':person_id' => $personId,
                        ':grant_role_name' => $person->role,
                        ':organization_name' =>
                            property_exists($person, 'organization')
                            ? $person->organization
                            : null,
                    ));
                } catch (PDOException $e) {
                    $this->logAndThrowException(
                        "Error inserting person-grant mapping.",
                        array(
                            'sql' => $insertSql,
                            'exception' => $e,
                        )
                    );
                }

                $numRecordsProcessed++;
            }
        }  // foreach ($this->sourceEndpoint as $sourceValue)

        return $numRecordsProcessed;
    }  // _execute()
}  // class ValueAnalyticsGrantsPeopleIngestor
