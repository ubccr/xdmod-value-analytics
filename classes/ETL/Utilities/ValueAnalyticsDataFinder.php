<?php
/**
 * Finds people in the Value Analytics database tables.
 */

namespace ETL\Utilities;

class ValueAnalyticsDataFinder
{
    /**
     * Find a person in the Value Analytics database tables.
     *
     * @param  object $sourceValue          A person definition structured as
     *                                      defined by the person JSON schema.
     *                                      (Ad hoc people have a single
     *                                      organization with a null ID.)
     * @param  string $destinationSchema    The name of the destination schema.
     * @param  PDODB  $destinationHandle    A handle for the destination DB.
     * @param  callable $sqlExceptionCallback A callback to invoke if a
     *                                        PDOException is thrown.
     * @return int|null                     The ID of a person, if found, or
     *                                      null if not found.
     */
    public static function findPerson(
        $sourceValue,
        $destinationSchema,
        $destinationHandle,
        $sqlExceptionCallback
    ) {
        $checkPeopleOrganizationsValues = array();
        $peopleOrganizationsParams = array();
        $peopleOrganizationsNullIdParams = array();
        foreach ($sourceValue->organizations as $poIndex => $personOrganization) {
            $organizationNameParam = ":organization_name_$poIndex";
            $checkPeopleOrganizationsValues[$organizationNameParam] = $personOrganization->name;
            if ($personOrganization->id === null) {
                $peopleOrganizationsNullIdParams[] = $organizationNameParam;
            } else {
                $peopleOrganizationIdParam = ":people_organization_id_$poIndex";
                $checkPeopleOrganizationsValues[$peopleOrganizationIdParam] = $personOrganization->id;
                $peopleOrganizationsParams[] = array(
                    'name' => $organizationNameParam,
                    'id' => $peopleOrganizationIdParam,
                );
            }
        }
        $checkPeopleOrganizationsWhereClauses = array();
        if (!empty($peopleOrganizationsParams)) {
            $peopleOrganizationsParamsInClauses = array_map(
                function ($peopleOrganizationsParamSet) use (
                    $destinationSchema,
                    &$checkPeopleOrganizationsValues
                ) {
                    $poNameParam = $peopleOrganizationsParamSet['name'];
                    if ($checkPeopleOrganizationsValues[$poNameParam] === null) {
                        $inClause = "(
                            (
                                SELECT o.id
                                FROM $destinationSchema.organizations o
                                ORDER BY o.id ASC
                                LIMIT 1
                            ),
                            ${peopleOrganizationsParamSet['id']}
                        )";
                        unset($checkPeopleOrganizationsValues[$poNameParam]);
                    } else {
                        $inClause = "(
                            (
                                SELECT o.id
                                FROM $destinationSchema.organizations o
                                WHERE o.name = $poNameParam
                            ),
                            ${peopleOrganizationsParamSet['id']}
                        )";
                    }
                    return $inClause;
                },
                $peopleOrganizationsParams
            );
            $peopleOrganizationsParamsInClausesStr = implode(
                ",\n",
                $peopleOrganizationsParamsInClauses
            );
            $checkPeopleOrganizationsWhereClauses[] = "
                (po.organization_id, po.person_organization_id) IN (
                    $peopleOrganizationsParamsInClausesStr
                )
            ";
        }
        if (!empty($peopleOrganizationsNullIdParams)) {
            $peopleOrganizationsNullIdParamsStr = implode(
                ",\n",
                $peopleOrganizationsNullIdParams
            );
            $checkPeopleOrganizationsWhereClauses[] = "(
                po.person_organization_id IS NULL
                AND po.organization_id IN (
                    SELECT o.id
                    FROM $destinationSchema.organizations o
                    WHERE o.name IN (
                        $peopleOrganizationsNullIdParamsStr
                    )
                )
                AND (
                    p.first_name = :first_name
                    AND COALESCE(p.middle_name, '') = :middle_name
                    AND p.last_name = :last_name
                )
            )";
            $checkPeopleOrganizationsValues += array(
                ':first_name' => $sourceValue->first_name,
                ':middle_name' =>
                    property_exists($sourceValue, 'middle_name')
                    ? $sourceValue->middle_name
                    : ''
                ,
                ':last_name' => $sourceValue->last_name,
            );
        }
        $checkPeopleOrganizationsWhereClausesStr = implode(
            " OR ",
            $checkPeopleOrganizationsWhereClauses
        );
        $checkPeopleOrganizationsSql = "
            SELECT po.person_id
            FROM $destinationSchema.people_organizations po
                JOIN $destinationSchema.people p
                    ON p.id = po.person_id
            WHERE $checkPeopleOrganizationsWhereClausesStr
            LIMIT 1
        ";
        try {
            $checkPeopleResult = $destinationHandle->query(
                $checkPeopleOrganizationsSql,
                $checkPeopleOrganizationsValues
            );
        } catch (PDOException $e) {
            call_user_func(
                $sqlExceptionCallback,
                "Error checking for existing person using organizational data.",
                array(
                    'sql' => $checkPeopleOrganizationsSql,
                    'exception' => $e,
                )
            );
        }

        // If the person was not found using organizational identifiers,
        // try their identifiers from identity providers.
        $personIdentifiersExist = property_exists($sourceValue, 'identifiers');
        if ($personIdentifiersExist && empty($checkPeopleResult)) {
            $checkPeopleIdentifiersValues = array();
            $peopleIdentifiersParams = array();
            foreach ($sourceValue->identifiers as $piIndex => $personIdentifier) {
                $identityProviderNameParam = ":identity_provider_name_$piIndex";
                $peopleIdentifierIdParam = ":people_identifier_id_$piIndex";
                $peopleIdentifiersParams[] = "(
                    (
                        SELECT id
                        FROM $destinationSchema.identity_providers
                        WHERE name = $identityProviderNameParam
                    ),
                    $peopleIdentifierIdParam
                )";
                $checkPeopleIdentifiersValues[$identityProviderNameParam] = $personIdentifier->type;
                $checkPeopleIdentifiersValues[$peopleIdentifierIdParam] = $personIdentifier->id;
            }
            $peopleIdentifiersParamsStr = implode(",\n", $peopleIdentifiersParams);
            $checkPeopleIdentifiersSql = "
                SELECT person_id
                FROM $destinationSchema.people_identifiers
                WHERE (
                    identity_provider_id,
                    person_identity_provider_id
                ) IN (
                    $peopleIdentifiersParamsStr
                )
            ";
            try {
                $checkPeopleResult = $destinationHandle->query(
                    $checkPeopleIdentifiersSql,
                    $checkPeopleIdentifiersValues
                );
            } catch (PDOException $e) {
                call_user_func(
                    $sqlExceptionCallback,
                    "Error checking for existing person using identity provider data.",
                    array(
                        'sql' => $checkPeopleIdentifiersSql,
                        'exception' => $e,
                    )
                );
            }
        }

        return
            !empty($checkPeopleResult)
            ? $checkPeopleResult[0]['person_id']
            : null;
    }

    /**
     * Find a grant in the Value Analytics database tables.
     *
     * @param  object $sourceValue          A grant definition structured as
     *                                      defined by the grant JSON schema.
     * @param  string $destinationSchema    The name of the destination schema.
     * @param  PDODB  $destinationHandle    A handle for the destination DB.
     * @param  callable $sqlExceptionCallback A callback to invoke if a
     *                                        PDOException is thrown.
     * @return int|null                     The ID of a grant, if found, or
     *                                      null if not found.
     */
    public static function findGrant(
        $sourceValue,
        $destinationSchema,
        $destinationHandle,
        $sqlExceptionCallback
    ) {
        $findGrantSql = "
            SELECT id
            FROM $destinationSchema.grants
            WHERE
                agency_id = (
                    SELECT id
                    FROM $destinationSchema.funding_agencies
                    WHERE name = :agency_name
                )
                AND agency_grant_number = :agency_grant_number
                AND organization_grant_number = :organization_grant_number
        ";

        try {
            $findGrantResults = $destinationHandle->query(
                $findGrantSql,
                array(
                    ':agency_name' => $sourceValue->agency,
                    ':agency_grant_number' => $sourceValue->agency_grant_id,
                    ':organization_grant_number' => $sourceValue->organization_grant_id,
                )
            );
        } catch (PDOException $e) {
            call_user_func(
                $sqlExceptionCallback,
                "Error finding grant in database.",
                array(
                    'sql' => $findGrantSql,
                    'exception' => $e,
                )
            );
        }

        return
            !empty($findGrantResults)
            ? $findGrantResults[0]['id']
            : null;
    }
}
