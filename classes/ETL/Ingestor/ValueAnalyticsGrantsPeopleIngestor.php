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
     * @see aIngestor::_execute
     */

    // @codingStandardsIgnoreLine
    protected function _execute()
    {
        // Prepare SQL statements for updating various people-related tables.
        $sourceValues = $this->executionData['sourceValues'];

        // If no data was provided in the file, use the StructuredFile endpoint
        if ( null === $sourceValues ) {
            $sourceValues = $this->sourceEndpoint;
        }

        $destinationSchema = $this->destinationEndpoint->getSchema();
        $destinationTable = $this->etlDestinationTable->getFullName();

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

        $numRecordsProcessed = 0;

        if ( $this->getEtlOverseerOptions()->isDryrun() ) {
            return $numRecordsProcessed;
        }

        // For every grant in the source data...

        foreach ($sourceValues as $sourceValue) {
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
        }

        return $numRecordsProcessed;
    }  // _execute()
}  // class ValueAnalyticsGrantsPeopleIngestor
