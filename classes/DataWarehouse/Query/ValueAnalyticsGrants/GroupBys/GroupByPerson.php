<?php
/**
 * GroupBy used for viewing Value Analytics grant queries by person.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\SubqueryTable;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

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

        $bridgeTable = new SubqueryTable(
            "
                SELECT DISTINCT
                    grant_id,
                    person_id
                FROM
                    $this->dimensionSchema.grants_people
            ",
            'grants_unique_people'
        );
        $query->addTable($bridgeTable);

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
            'grant_id'
        );
        $query->addWhereCondition(new WhereCondition(
            new TableField(
                $bridgeTable,
                'grant_id'
            ),
            '=',
            $dataTableIdField
        ));
        $query->addWhereCondition(new WhereCondition(
            new TableField(
                $bridgeTable,
                'person_id'
            ),
            '=',
            new TableField(
                $this->dimensionTable,
                $this->idFieldName
            )
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
        $dataTableIdField = new TableField(
            $dataTable,
            'grant_id'
        );

        if (is_array($whereConstraint)) {
            $whereConstraintCsv = implode(',', $whereConstraint);
            $whereConstraint = "($whereConstraintCsv)";
        }
        $query->addWhereCondition(new WhereCondition(
            $dataTableIdField,
            'IN',
            "(
                SELECT
                    grant_id
                FROM
                    $this->dimensionSchema.grants_people
                WHERE
                    person_id $operation $whereConstraint
            )"
        ));
    }

    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2(
            $request,
            "
                SELECT
                    grant_id
                FROM
                    $this->dimensionSchema.grants_people
                WHERE
                    person_id IN (_filter_)
            ",
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
                    $this->idFieldName IN (_filter_)
                ORDER BY
                    $this->orderIdFieldFormula
            "
        );
    }
}
