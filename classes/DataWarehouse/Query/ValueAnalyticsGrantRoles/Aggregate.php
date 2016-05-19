<?php
/**
 * Perform a query on aggregate Value Analytics grant role data.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrantRoles;

use DataWarehouse\Query\Query;

class Aggregate extends Query
{
    public function __construct(
        $aggregation_unit_name,
        $start_date,
        $end_date,
        $group_by,
        $stat = '',
        array $parameters = array(),
        $query_groupname = 'query_groupname',
        array $parameterDescriptions = array(),
        $single_stat = false
    ) {
        parent::__construct(
            'ValueAnalyticsGrantRoles',
            'modw_aggregates',
            'va_grant_role_fact',
            array(),
            $aggregation_unit_name,
            $start_date,
            $end_date,
            $group_by,
            $stat,
            $parameters,
            $query_groupname,
            $parameterDescriptions,
            $single_stat
        );
    }
}
