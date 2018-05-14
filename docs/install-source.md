---
title: Source Installation Guide
---

Install Source Package
----------------------

```
$ tar zxvf xdmod-value-analytics-x.y.z.tar.gz
$ cd xdmod-value-analytics-x.y.z
# ./install -prefix=/opt/xdmod
```

**NOTE**: The installation prefix must be the same as your existing Open
XDMoD installation. These instructions assume you have already installed
Open XDMoD in `/opt/xdmod`.

Configure Value Analytics Module
------------------------

See the [Configuration Guide](configuration.html) for details.

Check Open XDMoD Portal
-----------------------

After successfully installing and configuring the Value Analytics package you should check the Open
XDMoD portal to make sure everything is working correctly. Note that, by default, the Value
Analytics data is only available to authenticated users who have been granted the "Value Analytics"
ACL by an XDMoD administrator.  After logging in with the required privileges, the "Value Analytics"
category will be visible in the "Usage" and "Metric Explorer" tabs.
