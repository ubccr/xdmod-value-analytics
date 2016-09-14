<?php
/**
 * The number of grants that ended.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class EndedGrantCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.num_grants_ended), 0)',
            'ended_grant_count',
            'Number of Grants Ended',
            'Number of Grants Ended',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of grants that ended.
EOT;
    }
}
