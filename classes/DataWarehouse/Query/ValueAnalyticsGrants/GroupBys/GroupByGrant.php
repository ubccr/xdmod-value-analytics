<?php
/**
 * GroupBy used for viewing Value Analytics grants queries by grant.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

class GroupByGrant extends GroupBy
{
    public function __construct()
    {
        $dimensionTableAlias = 'fa';
        $idFieldName = 'id';
        $shortNameFieldName = 'organization_grant_number';
        $longNameFieldFormula = "CONCAT(
            $dimensionTableAlias.organization_grant_number,
            ': ',
            $dimensionTableAlias.title
        )";
        $orderIdFieldName = 'organization_grant_number';
        $dimensionTableName = 'grants';

        parent::__construct(
            'va_grant',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$idFieldName AS id,
                    $dimensionTableAlias.$shortNameFieldName AS short_name,
                    $longNameFieldFormula AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $dimensionTableAlias.$orderIdFieldName
            "
        );

        $this->_id_field_name = $idFieldName;
        $this->_short_name_field_name = $shortNameFieldName;
        $this->longNameFieldFormula = $longNameFieldFormula;
        $this->orderIdFieldName = $orderIdFieldName;
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );
    }

    public static function getLabel()
    {
        return 'VA Grant';
    }

    public function getInfo()
    {
        return "A grant as defined by the receiving organization.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $dimensionIdField = new TableField(
            $this->dimensionTable,
            $this->_id_field_name,
            $this->getIdColumnName($multiGroup)
        );
        $dimensionShortNameField = new TableField(
            $this->dimensionTable,
            $this->_short_name_field_name,
            $this->getShortNameColumnName($multiGroup)
        );
        $dimensionLongNameField = new FormulaField(
            $this->longNameFieldFormula,
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
            'grant_id'
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
            $this->_id_field_name,
            $this->getIdColumnName($multiGroup)
        );
        $dataTableDimensionIdField = new TableField(
            $dataTable,
            'grant_id'
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
            'grant_id'
        );
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        $dimensionTableFromClause = $this->dimensionTable->getQualifiedName(true);
        return parent::pullQueryParameterDescriptions2(
            $request,
            "
                SELECT
                    $this->longNameFieldFormula AS field_label
                FROM
                    $dimensionTableFromClause
                WHERE
                    $this->_id_field_name IN (_filter_)
                ORDER BY
                    $this->orderIdFieldName
            "
        );
    }
}
