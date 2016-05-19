<?php
/**
 * Perform a timeseries query on aggregate Value Analytics grant roles data.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrantRoles;

use DataWarehouse\Query\Timeseries as BaseTimeseries;

class Timeseries extends BaseTimeseries
{
    public function __construct(
        $aggregation_unit_name,
        $start_date,
        $end_date,
        $group_by,
        $stat = '',
        array $parameters = array(),
        $query_groupname = 'query_groupname',
        array $parameter_description = array(),
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
            $parameter_description,
            $single_stat
        );
    }
}
