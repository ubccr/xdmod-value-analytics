<?php
/**
 * Perform a timeseries query on aggregate Value Analytics grants data.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants;

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
            'ValueAnalytics',
            'modw_aggregates',
            'va_grant_fact',
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
