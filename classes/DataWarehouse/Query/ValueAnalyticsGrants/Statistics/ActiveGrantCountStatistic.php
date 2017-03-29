<?php
/**
 * The number of active grants.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class ActiveGrantCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(COUNT(DISTINCT(jf.grant_id)), 0)',
            'active_grant_count',
            'Number of Grants Active',
            'Number of Grants Active',
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
