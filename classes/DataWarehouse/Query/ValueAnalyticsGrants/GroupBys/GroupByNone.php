<?php
/**
 * Default GroupBy used for aggregate Value Analytics grants queries.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

class GroupByNone extends GroupBy
{
    public function __construct()
    {
        parent::__construct('none', array());
    }

    public static function getLabel()
    {
        return ORGANIZATION_NAME;
    }

    public function getDefaultDatasetType()
    {
        return 'timeseries';
    }

    public function getInfo()
    {
        return "Summarizes all Value Analytics data.";
    }

    public function getDefaultDisplayType($datasetType = null)
    {
        return $datasetType == 'timeseries' ? 'line' : 'h_bar';
    }

    public function getDefaultCombineMethod()
    {
        return 'stack';
    }

    public function getDefaultShowTrendLine()
    {
        return 'y';
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addField(new FormulaField('-9999', $this->getIdColumnName($multiGroup)));

        $fieldLabel = "'".ORGANIZATION_NAME."'";

        $query->addField(new FormulaField($fieldLabel, $this->getLongNameColumnName($multiGroup)));
        $query->addField(new FormulaField($fieldLabel, $this->getShortNameColumnName($multiGroup)));
        $query->addField(new FormulaField($fieldLabel, $this->getOrderIdColumnName($multiGroup)));
    }

    public function addWhereJoin(
        Query &$query,
        Table $dataTable,
        $multiGroup = false,
        $operation,
        $whereConstraint
    ) {
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        return array();
    }
}
