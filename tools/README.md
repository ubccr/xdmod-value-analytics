---
Financial System Ingestion Guide
---

Usage
----------------------

XDMoD-VA requires input in the form of two JSON files, one holding grant information and one holding PI information.
These scripts must be customized for use at an individual site. Currently provided are scripts to gather grant
data from a Kuali Financial System database, and scripts to gather user information from a local LDAP connection
and an ORCID database

Run Configuration Scripts
------------------------

To import grant data from Kuali Financial Services, run the kuali_grants.py script. Configuration of the fields to be 
used and the Kuali database configuration is controlled by a file, kuali.cfg. A template is provided with the 
application. The output file after running the script will be grants.json, in a suitable format for XDMoD-VA to import.

To import personnel data from LDAP, run the ldap_users.py script. Similarly, the ldap.cfg file contains information
concerning loading of personal information via an LDAP connection. Pass as parameters to the script, either the
grants.json file made available in the previous step, or a comma-separated file of ID's to pull down from LDAP, with 
the ID as the first field of each row. Output will be users.json, which will again be in a suitable format for XDMoD-VA
to import.

To import personnel data from ORCID, run the orcid_users.py script. Similarly, the ldap.cfg file contains information
concerning loading of personal information via an LDAP connection. Pass as parameters to the script, either the
grants.json file made available in the previous step, or a comma-separated file of ID's to pull down from LDAP, with 
the ID as the first field of each row. Output will be users.json, which will again be in a suitable format for XDMoD-VA
to import.



