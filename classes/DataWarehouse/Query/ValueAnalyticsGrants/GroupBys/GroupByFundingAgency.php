<?php
/**
 * GroupBy used for viewing Value Analytics grants queries by funding agency.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

class GroupByFundingAgency extends GroupBy
{
    public function __construct()
    {
        $this->idFieldName = 'id';
        $this->shortNameFieldName = 'name';
        $this->longNameFieldName = 'name';
        $this->orderIdFieldName = 'name';
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $dimensionTableName = 'funding_agencies';
        $dimensionTableAlias = 'fa';
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );

        parent::__construct(
            'va_funding_agency',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$this->idFieldName AS id,
                    $dimensionTableAlias.$this->shortNameFieldName AS short_name,
                    $dimensionTableAlias.$this->longNameFieldName AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $dimensionTableAlias.$this->orderIdFieldName
            "
        );
    }

    public static function getLabel()
    {
        return 'VA Funding Agency';
    }

    public function getInfo()
    {
        return "An organization that funds grants.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $dimensionIdField = new TableField(
            $this->dimensionTable,
            $this->idFieldName,
            $this->getIdColumnName($multiGroup)
        );
        $dimensionShortNameField = new TableField(
            $this->dimensionTable,
            $this->shortNameFieldName,
            $this->getShortNameColumnName($multiGroup)
        );
        $dimensionLongNameField = new TableField(
            $this->dimensionTable,
            $this->longNameFieldName,
            $this->getLongNameColumnName($multiGroup)
        );
        $dimensionOrderIdField = new TableField(
            $this->dimensionTable,
            $this->orderIdFieldName,
            $this->getOrderIdColumnName($multiGroup)
        );

        $query->addField($dimensionIdField);
        $query->addField($dimensionShortNameField);
        $query->addField($dimensionLongNameField);
        $query->addField($dimensionOrderIdField);

        $query->addGroup($dimensionIdField);

        $dataTableDimensionIdField = new TableField(
            $dataTable,
            'agency_id'
        );
        $query->addWhereCondition(new WhereCondition(
            $dimensionIdField,
            '=',
            $dataTableDimensionIdField
        ));

        $this->addOrder($query, $multiGroup, 'ASC', false);
    }

    public function addWhereJoin(
        Query &$query,
        Table $dataTable,
        $multiGroup = false,
        $operation,
        $whereConstraint
    ) {
        $query->addTable($this->dimensionTable);

        $dimensionIdField = new TableField(
            $this->dimensionTable,
            $this->idFieldName,
            $this->getIdColumnName($multiGroup)
        );
        $dataTableDimensionIdField = new TableField(
            $dataTable,
            'agency_id'
        );
        $query->addWhereCondition(new WhereCondition(
            $dimensionIdField,
            '=',
            $dataTableDimensionIdField
        ));

        if (is_array($whereConstraint)) {
            $whereConstraintCsv = implode(',', $whereConstraint);
            $whereConstraint = "($whereConstraintCsv)";
        }
        $query->addWhereCondition(new WhereCondition(
            $dimensionIdField,
            $operation,
            $whereConstraint
        ));
    }

    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2(
            $request,
            '_filter_',
            'agency_id'
        );
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        $dimensionTableFromClause = $this->dimensionTable->getQualifiedName(true);
        return parent::pullQueryParameterDescriptions2(
            $request,
            "
                SELECT
                    $this->longNameFieldName AS field_label
                FROM
                    $dimensionTableFromClause
                WHERE
                    $this->idFieldName IN (_filter_)
                ORDER BY
                    $this->orderIdFieldName
            "
        );
    }
}
