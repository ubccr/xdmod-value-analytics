---
title: RPM Installation Guide
---

**IMPORTANT**: We *strongly* advise against using a production Open XDMoD
instance for beta testing this module. Please conduct the beta test of
Value Analytics using a separate Open XDMoD instance dedicated to the beta test.
This will avoid risking unwanted changes to your production instance of
Open XDMoD.

Install RPM Package
----------------------

```
# yum install xdmod-value-analytics-x.x.x-x.x.*.noarch.rpm
```

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
