---
title: Source Installation Guide
---

**IMPORTANT**: We *strongly* suggest using a separate, testing-only instance of
Open XDMoD for beta testing this module. This will avoid any risks to your
production instance of Open XDMoD.

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

After successfully installing and configuring the Value Analytics package you
should check the Open XDMoD portal to make sure everything is working correctly.
By default, the Value Analytics data is only available to authorized users, so
you must log into the portal. After logging in, the "Value Analytics" category
should be visible in the "Usage" and "Metric Explorer" tabs.
