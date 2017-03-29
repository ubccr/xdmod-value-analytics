<?php
/**
 * The number of active PIs.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class ActivePICountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(COUNT(DISTINCT(jf.pi_id)), 0)',
            'active_pi_count',
            'Number of PIs on Active Grants',
            'Number of PIs on Active Grants',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of active PIs. An active PI is defined as a PI that was on an
active grant during the given time period.
EOT;
    }
}
