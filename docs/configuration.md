---
title: Configuration Guide
---

Install and Configure Open XDMoD
--------------------------------

**IMPORTANT**: Ensure that [Open XDMoD](http://open.xdmod.org) is installed and
configured correctly and the [shredder](http://open.xdmod.org/shredder.html) and
[ingestor](http://open.xdmod.org/ingestor.html) scripts have been run successfully
to ingest job accounting data before configuring the Value Analytics module.

These steps must be taken before the Value Analytics module is configured because once
configured, Open XDMoD will be unable to ingest job data again until Value Analytics data
has been ingested.

Run Configuration Script
------------------------

    # xdmod-setup

There will be a new section titled "Value Analytics" in the list.  Select that
option to show the Value Analytics module configuration menu. The options in the
menu are listed below:

### Setup Database

This option creates the necessary Value Analytics database schema
in the XDMoD data warehouse. You will
need to provide the credentials for your MySQL root user, or another
user that has privileges to create databases.  The created schema will be
called `modw_value_analytics`.  The XDMoD database user that is
specified in your `portal_settings.ini` will be granted access to these
databases.

### Patch Open XDMoD

In order for certain Open XDMoD components to behave as expected with Value
Analytics data, they must currently be patched. This setup option will patch
Open XDMoD as required by this module. There is also an option to reverse the
patches if the need arises.
