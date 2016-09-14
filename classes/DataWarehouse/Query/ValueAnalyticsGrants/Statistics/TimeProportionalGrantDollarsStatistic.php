<?php
/**
 * The proportional amount of grant dollars for each active grant covering
 * the requested time period(s).
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class TimeProportionalGrantDollarsStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.time_proportional_dollars), 0)',
            'time_proportional_grant_dollars',
            'Time-Proportional Dollars of Active Grants',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The sum of each of the amount of dollars associated with applicable, active
grants multiplied by the percentage of their lifetimes a data point covers. This
assumes an even distribution of grant dollars over the lifetime of a grant.
EOT;
    }
}
