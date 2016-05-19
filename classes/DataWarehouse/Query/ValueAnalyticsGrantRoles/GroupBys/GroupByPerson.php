<?php
/**
 * GroupBy used for viewing Value Analytics grant roles queries by person.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrantRoles\GroupBy;

class GroupByPerson extends GroupBy
{
    public function __construct()
    {
        $dimensionTableAlias = 'p';
        $this->idFieldName = 'id';
        $this->shortNameFieldFormula = "CONCAT(
            $dimensionTableAlias.last_name,
            ', ',
            $dimensionTableAlias.first_name,
            IF(
                $dimensionTableAlias.middle_name IS NOT NULL,
                CONCAT(' ', $dimensionTableAlias.middle_name),
                ''
            )
        )";
        $this->longNameFieldFormula = $this->shortNameFieldFormula;
        $this->orderIdFieldFormula = $this->shortNameFieldFormula;
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $dimensionTableName = 'people';
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );

        parent::__construct(
            'va_person',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$this->idFieldName AS id,
                    $this->shortNameFieldFormula AS short_name,
                    $this->longNameFieldFormula AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $this->orderIdFieldFormula
            "
        );
    }

    public static function getLabel()
    {
        return 'VA Person';
    }

    public function getInfo()
    {
        return "The person performing a role on a grant.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $idField = new TableField(
            $this->dimensionTable,
            $this->idFieldName,
            $this->getIdColumnName($multiGroup)
        );
        $shortNameField = new FormulaField(
            $this->shortNameFieldFormula,
            $this->getShortNameColumnName($multiGroup)
        );
        $longNameField = new FormulaField(
            $this->longNameFieldFormula,
            $this->getLongNameColumnName($multiGroup)
        );
        $orderIdField = new FormulaField(
            $this->orderIdFieldFormula,
            $this->getOrderIdColumnName($multiGroup)
        );

        $query->addField($idField);
        $query->addField($shortNameField);
        $query->addField($longNameField);
        $query->addField($orderIdField);

        $query->addGroup($idField);

        $dataTableIdField = new TableField(
            $dataTable,
            'person_id'
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
            'person_id'
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
            'person_id'
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
                    $this->idFieldName IN (_filter_)
                ORDER BY
                    $this->orderIdFieldFormula
            "
        );
    }
}
