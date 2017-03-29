<?php
/**
 * The total dollars associated with each grant that started.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class TotalGrantDollarsStartedStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.total_dollars_started), 0)',
            'total_grant_dollars_started',
            'Grant Funding Profile: Total of Grants Started',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total dollars associated with each grant that started.
EOT;
    }
}
