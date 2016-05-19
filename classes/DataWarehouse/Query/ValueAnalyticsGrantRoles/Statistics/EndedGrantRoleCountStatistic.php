<?php
/**
 * The number of grant roles that ended.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrantRoles\Statistics;

use DataWarehouse\Query\Statistic;

class EndedGrantRoleCountStatistic extends Statistic
{
    public function __construct($queryInstance = null)
    {
        parent::__construct(
            'COALESCE(SUM(jf.num_grant_roles_ended), 0)',
            'ended_grant_role_count',
            'Number of Grant Roles Ended',
            'Number of Grant Roles Ended',
            0
        );
    }

    public function getInfo()
    {
        return <<<EOT
The total number of grant roles that ended.
EOT;
    }
}
