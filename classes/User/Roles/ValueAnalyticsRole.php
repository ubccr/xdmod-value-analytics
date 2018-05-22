<?php

namespace User\Roles;

/**
 *  The Financial role provides access to data in the Value Analytics module
 */

class ValueAnalyticsRole extends \User\AuthenticatedRole
{

    public function __construct()
    {
        // Note that the ACL descriptor MUST match the string provided in roles.json
        parent::__construct('acl.value-analytics');
    }//__construct

}  // class ValueAnalyticsRole

