<?php
/**
 * GroupBy used for viewing Value Analytics grants queries by PI using person
 * IDs defined by the Jobs realm.
 */

namespace DataWarehouse\Query\ValueAnalyticsGrants\GroupBys;

use DataWarehouse\Query\Model\Schema;
use DataWarehouse\Query\Model\Table;
use DataWarehouse\Query\Model\TableField;
use DataWarehouse\Query\Model\WhereCondition;
use DataWarehouse\Query\Query;
use DataWarehouse\Query\ValueAnalyticsGrants\GroupBy;

class GroupByJobsPI extends GroupBy
{
    public function __construct()
    {
        $dimensionTableAlias = 'p';
        $idFieldName = 'person_id';
        $shortNameFieldName = 'short_name';
        $longNameFieldName = 'long_name';
        $orderIdFieldName = 'order_id';
        $dimensionTableName = 'piperson';

        parent::__construct(
            'pi',
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
        $this->shortNameFieldName = $shortNameFieldName;
        $this->longNameFieldName = $longNameFieldName;
        $this->orderIdFieldName = $orderIdFieldName;
        $this->dimensionSchema = new Schema('modw');
        $this->dimensionTable = new Table(
            $this->dimensionSchema,
            $dimensionTableName,
            $dimensionTableAlias
        );
    }

    public static function getLabel()
    {
        return 'PI';
    }

    public function getInfo()
    {
        return <<<EOS
The principal investigator. This dimension uses the person IDs managed by the
Jobs realm. If a person in the Value Analytics data could not be matched with a
person in the Jobs data, they will be treated as an unknown person when using
this dimension.
EOS;
    }

    public function applyTo(Query &$query, Table $dataTable, $multiGroup = false)
    {
        $query->addTable($this->dimensionTable);

        $idField = new TableField(
            $this->dimensionTable,
            $this->_id_field_name,
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
            'pi_jobs_person_id'
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
            'pi_jobs_person_id'
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
            'pi_jobs_person_id'
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
                    $this->_id_field_name IN (_filter_)
                ORDER BY
                    $this->orderIdFieldName
            "
        );
    }
}
