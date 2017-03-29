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
        $idFieldName = 'id';
        $shortNameFieldName = 'name';
        $longNameFieldName = 'name';
        $orderIdFieldName = 'name';
        $dimensionTableName = 'funding_agencies';
        $dimensionTableAlias = 'fa';

        parent::__construct(
            'va_funding_agency',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$idFieldName AS id,
                    $dimensionTableAlias.$shortNameFieldName AS short_name,
                    $dimensionTableAlias.$longNameFieldName AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $dimensionTableAlias.$orderIdFieldName
            "
        );

        $this->_id_field_name = $idFieldName;
        $this->_short_name_field_name = $shortNameFieldName;
        $this->_long_name_field_name = $longNameFieldName;
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
            $this->_id_field_name,
            $this->getIdColumnName($multiGroup)
        );
        $dimensionShortNameField = new TableField(
            $this->dimensionTable,
            $this->_short_name_field_name,
            $this->getShortNameColumnName($multiGroup)
        );
        $dimensionLongNameField = new TableField(
            $this->dimensionTable,
            $this->_long_name_field_name,
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
            $this->_id_field_name,
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
                    $this->_long_name_field_name AS field_label
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
