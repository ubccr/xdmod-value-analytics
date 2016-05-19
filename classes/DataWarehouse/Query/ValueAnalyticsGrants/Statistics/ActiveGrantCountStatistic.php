<?php
/**
 * The number of active grants.
 *
 * NOTE: This is disabled as there is currently no way to handle this correctly
 * in aggregate form.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class ActiveGrantCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.num_grants), 0)',
            'active_grant_count',
            'Number of Active Grants',
            'Number of Active Grants',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of active grants.
EOT;
    }
}
