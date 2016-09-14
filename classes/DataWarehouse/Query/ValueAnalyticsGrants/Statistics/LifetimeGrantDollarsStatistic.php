<?php
/**
 * The lifetime amount of grant dollars for each active grant.
 *
 * NOTE: This is disabled as there is currently no way to handle this correctly
 * in aggregate form.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrants\Statistics;

use DataWarehouse\Query\Statistic;

class LifetimeGrantDollarsStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.total_dollars), 0)',
            'lifetime_grant_dollars',
            'Lifetime Dollars of Active Grants',
            '$',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total amount of dollars associated with applicable, active grants.<br />
<strong>NOTE:</strong> <em>Each</em> data point includes the <em>total</em>
award amount <em>over the entire life</em> of each individual grant.
EOT;
    }
}
