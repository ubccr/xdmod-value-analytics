<?php
/**
 * GroupBy used for viewing Value Analytics grant roles queries by grant role type.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBys;

use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBy;

class GroupByGrantRoleType extends GroupBy
{
    public function __construct()
    {
        $this->idFieldName = 'id';
        $this->shortNameFieldName = 'name';
        $this->longNameFieldName = 'name';
        $this->orderIdFieldName = 'name';
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $dimensionTableName = 'grant_roles';
        $dimensionTableAlias = 'gr';
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );

        parent::__construct(
            'va_grant_role_type',
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
        return 'VA Grant Role Type';
    }

    public function getInfo()
    {
        return "The type of a role a person can have on a grant.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $idField = new TableField(
            $this->dimensionTable,
            $this->idFieldName,
            $this->getIdColumnName($multiGroup)
        );
        $shortNameField = new TableField(
            $this->dimensionTable,
            $this->shortNameFieldName,
            $this->getShortNameColumnName($multiGroup)
        );
        $longNameField = new TableField(
            $this->dimensionTable,
            $this->longNameFieldName,
            $this->getLongNameColumnName($multiGroup)
        );
        $orderIdField = new TableField(
            $this->dimensionTable,
            $this->orderIdFieldName,
            $this->getOrderIdColumnName($multiGroup)
        );

        $query->addField($idField);
        $query->addField($shortNameField);
        $query->addField($longNameField);
        $query->addField($orderIdField);

        $query->addGroup($idField);

        $dataTableIdField = new TableField(
            $dataTable,
            'grant_role_id'
        );
        $query->addWhereCondition(new WhereCondition(
            $idField,
            '=',
            $dataTableIdField
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

        $idField = new TableField(
            $this->dimensionTable,
            $this->idFieldName,
            $this->getIdColumnName($multiGroup)
        );
        $dataTableIdField = new TableField(
            $dataTable,
            'grant_role_id'
        );
        $query->addWhereCondition(new WhereCondition(
            $idField,
            '=',
            $dataTableIdField
        ));

        if (is_array($whereConstraint)) {
            $whereConstraintCsv = implode(',', $whereConstraint);
            $whereConstraint = "($whereConstraintCsv)";
        }
        $query->addWhereCondition(new WhereCondition(
            $idField,
            $operation,
            $whereConstraint
        ));
    }

    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2(
            $request,
            '_filter_',
            'grant_role_id'
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
