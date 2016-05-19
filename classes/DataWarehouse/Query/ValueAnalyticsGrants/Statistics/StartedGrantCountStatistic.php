<?php
/**
 * The number of grants that started.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class StartedGrantCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.num_grants_started), 0)',
            'started_grant_count',
            'Number of Grants Started',
            'Number of Grants Started',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of grants that started.
EOT;
    }
}
