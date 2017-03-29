<?php
/**
 * The total dollars associated with each grant that is active.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class TotalGrantDollarsActiveStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.total_dollars), 0)',
            'total_grant_dollars_active',
            'Grant Funding Profile: Total of Grants Active',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total dollars associated with each grant that is active.
EOT;
    }

    /**
     * @see DataWarehouse\Query\Statistic
     */
    public function usesTimePeriodTablesForAggregate()
    {
        return false;
    }
}
