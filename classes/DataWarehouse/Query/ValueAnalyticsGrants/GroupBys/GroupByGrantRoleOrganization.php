<?php
/**
 * GroupBy used for viewing Value Analytics grant queries by grant role organization.
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

class GroupByGrantRoleOrganization extends GroupBy
{
    public function __construct()
    {
        $dimensionTableAlias = 'o';
        $this->idFieldName = 'id';
        $this->shortNameFieldFormula = "COALESCE(
            $dimensionTableAlias.abbrev,
            $dimensionTableAlias.name
        )";
        $this->longNameFieldName = "name";
        $this->orderIdFieldName = "name";
        $this->dimensionSchema = new Schema('modw_value_analytics');
        $dimensionTableName = 'organizations';
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );

        parent::__construct(
            'va_grant_role_organization',
            array(),
            "
                SELECT
                    $dimensionTableAlias.$this->idFieldName AS id,
                    $this->shortNameFieldFormula AS short_name,
                    $dimensionTableAlias.$this->longNameFieldName AS long_name
                FROM $dimensionTableName AS $dimensionTableAlias
                WHERE 1
                ORDER BY $dimensionTableAlias.$this->orderIdFieldName
            "
        );
    }

    public static function getLabel()
    {
        return 'VA Grant Role Organization';
    }

    public function getInfo()
    {
        return "An organization a person on a grant acted on behalf of.";
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $bridgeTable = new SubqueryTable(
            "
                SELECT DISTINCT
                    grant_id,
                    organization_id
                FROM
                    $this->dimensionSchema.grants_people
            ",
            'grants_role_organizations'
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
                'organization_id'
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
                    organization_id $operation $whereConstraint
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
                    organization_id IN (_filter_)
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
