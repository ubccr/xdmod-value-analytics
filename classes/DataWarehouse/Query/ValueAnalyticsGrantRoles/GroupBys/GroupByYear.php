<?php
/**
 * GroupBy used for viewing aggregate Value Analytics grant role data by year.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\OrderBy;
use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBy;

class GroupByYear extends GroupBy
{
    public function __construct()
    {
        parent::__construct(
            'year',
            array(),
            "
                SELECT DISTINCT
                    gt.id,
                    DATE(gt.year_start) AS long_name,
                    DATE(gt.year_start) AS short_name,
                    gt.year_start_ts AS start_ts
                FROM modw.years gt
                WHERE 1
                ORDER BY gt.id ASC
            ",
            array()
        );
        $this->setAvailableOnDrilldown(false);
    }

    public static function getLabel()
    {
        return 'Year';
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $modwSchema = new Schema('modw');
        $modwAggregatesSchema = new Schema('modw_aggregates');

        $idField = new TableField(
            $query->getDataTable(),
            "year_id",
            $this->getIdColumnName($multiGroup)
        );
        $nameField = new FormulaField(
            'date('.$query->getDateTable()->getAlias().".year_start)",
            $this->getLongNameColumnName($multiGroup)
        );
        $shortnameField = new FormulaField(
            'date('.$query->getDateTable()->getAlias().".year_start)",
            $this->getShortNameColumnName($multiGroup)
        );
        $valueField = new TableField(
            $query->getDateTable(),
            "year_start_ts"
        );
        $query->addField($idField);
        $query->addField($nameField);
        $query->addField($shortnameField);
        $query->addField($valueField);

        $query->addGroup($idField);

        $this->addOrder($query, $multiGroup);
    }

    public function addOrder(
        Query &$query,
        $multiGroup = false,
        $dir = 'asc',
        $prepend = false
    ) {
        $orderField = new OrderBy(
            new TableField($query->getDataTable(), "year_id"),
            $dir,
            $this->getName()
        );
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }

    public function pullQueryParameters(&$request)
    {
        return array();
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        return array();
    }
}
