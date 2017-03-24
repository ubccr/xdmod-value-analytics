<?php
/**
 * The amount of grant dollars disbursed for each active grant in
 * the requested time period(s), assuming an even, linear distribution of funds
 * over the lifetime of each grant.
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
            'Grant Funding Profile: Linear Disbursements',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The amount of grant dollars disbursed for each active grant in
the requested time period(s), assuming an even, linear distribution of funds
over the lifetime of each grant.
EOT;
    }
}
