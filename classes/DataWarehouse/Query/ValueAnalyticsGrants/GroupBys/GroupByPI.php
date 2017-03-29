<?php
/**
 * GroupBy used for viewing Value Analytics grants queries by PI.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\FormulaField;
use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

class GroupByPI extends GroupBy
{
    public function __construct()
    {
        $dimensionTableAlias = 'p';
        $idFieldName = 'id';
        $shortNameFieldFormula = "CONCAT(
            $dimensionTableAlias.last_name,
            ', ',
            $dimensionTableAlias.first_name,
            IF(
                $dimensionTableAlias.middle_name IS NOT NULL,
                CONCAT(' ', $dimensionTableAlias.middle_name),
                ''
            )
        )";
        $longNameFieldFormula = $shortNameFieldFormula;
        $orderIdFieldFormula = $shortNameFieldFormula;
        $dimensionTableName = 'people';

        parent::__construct(
            'va_pi',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$idFieldName AS id,
                    $shortNameFieldFormula AS short_name,
                    $longNameFieldFormula AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $orderIdFieldFormula
            "
        );

        $this->_id_field_name = $idFieldName;
        $this->shortNameFieldFormula = $shortNameFieldFormula;
        $this->longNameFieldFormula = $longNameFieldFormula;
        $this->orderIdFieldFormula = $orderIdFieldFormula;
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );
    }

    public static function getLabel()
    {
        return 'VA PI';
    }

    public function getInfo()
    {
        return "The PI on a grant.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $idField = new TableField(
            $this->dimensionTable,
            $this->_id_field_name,
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
            'pi_id'
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
            $this->_id_field_name,
            $this->getIdColumnName($multiGroup)
        );
        $dataTableIdField = new TableField(
            $dataTable,
            'pi_id'
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
            'pi_id'
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
                    $this->orderIdFieldFormula
            "
        );
    }
}
