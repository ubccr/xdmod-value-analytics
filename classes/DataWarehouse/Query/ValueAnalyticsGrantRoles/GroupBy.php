<?php
/**
 * Add GroupBys to a Value Analytics grant roles query.
 *
 * Based on DataWarehouse\Query\Grants\GroupBy.
 */
namespace DataWarehouse\Query\ValueAnalyticsGrantRoles;

use DataWarehouse\Query\GroupBy as BaseGroupBy;

abstract class GroupBy extends BaseGroupBy
{
    public function __construct(
        $name,
        array $additional_permitted_parameters = array(),
        $possible_values_query = null
    ) {
        $permitted_paramters = array_merge(
            array_keys(Aggregate::getRegisteredStatistics()),
            $additional_permitted_parameters
        );

        parent::__construct(
            $name,
            $permitted_paramters,
            $possible_values_query
        );
    }

    public function getDrillTargets($statistic_name, $query_classname)
    {
        $registerd_group_bys = Aggregate::getRegisteredGroupBys();
        $drill_target_group_bys = array();

        foreach ($registerd_group_bys as $group_by_name => $group_by_classname) {
            if ($group_by_name == 'none' || $group_by_name == $this->getName()) {
                continue;
            }

            $group_by_classname = $query_classname::getGroupByClassname($group_by_name);
            $group_by_instance = $query_classname::getGroupBy($group_by_name);
            $permitted_stats = $group_by_instance->getPermittedStatistics();
            if (
                $group_by_instance->getAvailableOnDrilldown() !== false
                && array_search($statistic_name, $permitted_stats) !== false
            ) {
                $drill_target_group_bys[] = $group_by_name.'-'.$group_by_instance->getLabel();
            }
        }
        sort($drill_target_group_bys);
        return $drill_target_group_bys;
    }
}
