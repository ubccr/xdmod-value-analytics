---
title: Configuration Guide
---

Ensure that [Open XDMoD](http://open.xdmod.org) is installed and configured
correctly and the [shredder](http://open.xdmod.org/shredder.html) and
[ingestor](http://open.xdmod.org/ingestor.html) scripts have been run successfully
before configuring the Value Analytics module.

Run Configuration Script
------------------------

    # xdmod-setup

There should be a new section titled "Value Analytics" in the list.  Select that
option to show the Value Analytics module configuration menu. The options in the
menu are listed below:

### Setup Database

This option creates the necessary Value Analytics database schema
in the XDMoD data warehouse. You will
need to provide the credentials for your MySQL root user, or another
user that has privileges to create databases.  The created schema will be
called `modw_value_analytics`.  The database user that is
specified in your `portal_settings.ini` will be granted access to these
databases.

### Patch Open XDMoD

In order for certain Open XDMoD components to behave as expected with Value
Analytics data, they must currently be patched. (These components are planned to
be modularized and won't require patches by the time a production-ready version
of this module is released.)

This setup option will patch Open XDMoD as required by this module. There is
also an option to reverse the patches if the need arises.
