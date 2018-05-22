---
title: Software Requirements
---

The Value Analytics Open XDMoD module requires all of the software for
**[Open XDMoD 7.5](https://open.xdmod.org/7.5/)** and the following additional packages:

- [jq](https://stedolan.github.io/jq/) 1.5+

Linux Distribution Packages
---------------------------

The Open XDMoD Value Analytics module can be run on most recent Linux distributions,
but has been tested on CentOS 7.

The Value Analytics module requirements can be met using packages from the EPEL repository.

### CentOS 7

**NOTE**: The package list below includes packages included with
[EPEL](http://fedoraproject.org/wiki/EPEL).  This repository can be
added with this command for CentOS:

    # yum install epel-release

Install the required dependencies:

    # yum install jq

[jq]: https://stedolan.github.io/jq/
