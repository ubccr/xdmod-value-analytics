<?php
/**
 * The total dollars associated with each grant that ended.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class TotalGrantDollarsEndedStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.total_dollars_ended), 0)',
            'total_grant_dollars_ended',
            'Grant Funding Profile: Total of Grants Ended',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total dollars associated with each grant that ended.
EOT;
    }
}
