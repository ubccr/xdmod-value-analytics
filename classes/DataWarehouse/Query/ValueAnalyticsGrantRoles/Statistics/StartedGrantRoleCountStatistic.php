<?php
/**
 * The number of grant roles that started.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrantRoles\Statistics;

use DataWarehouse\Query\Statistic;

class StartedGrantRoleCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.num_grant_roles_started), 0)',
            'started_grant_role_count',
            'Number of Grant Roles Started',
            'Number of Grant Roles Started',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of grant roles that started.
EOT;
    }
}
