---
Financial System Ingestion Guide
---

Usage
----------------------

XDMoD-VA requires input in the form of two JSON files, one holding grant information and one holding PI information.
Details on the schema of these files may be found at /xdmod-value-analytics/specs/README.md. The scripts in this
directory generate JSON in the correct format, but must be customized for use at an individual site. Currently 
provided are scripts to gather grant data from a Kuali Financial System database, and scripts to gather user 
information from a local LDAP connection and an ORCID database.

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

To import personnel data from ORCID, run the orcid_users.py script. Similarly, the orcid.cfg file contains information
concerning loading of personal information from the ORCID scientific user community. Pass a comma-separated file of 
ORCID ID's to load from the ORCID site, with the ID as the first field of each row. Output will be users.json, which 
will be in a suitable format for XDMoD-VA to import.

To import publication data from the NIH, go to the NIH Exporter web site (https://exporter.nih.gov/ExPORTER_Catalog.aspx) 
and download three related files: a projects file, a publications file, and a link file connecting the two. For example, 
to import data from all of 2016, download RePORTER_PRJ_C_FY2016.zip for projects, RePORTER_PUB_C_2016.zip for
publications, and RePORTER_PUBLNK_C_2016.zip to link the files. The files should be downloaded in CSV format and 
unzipped.

Copy the file "nih_publications.cfg.template" to "nih_publications.cfg" and, if required, specify paths to the relevant
files. Then run the nih_publications script. The script will attempt to match grant ID's from grants.json to NIH 
award ID's and will place the output in the file specified in the config (publications.json by default).

Visualizations
--------------

Visualizations are provided to demonstrate the flow between grants, HPC resources, and publications. The data source
for the visualization is the file "sankey.json". This file can be generated as a secondary step from the grants.json
and publications.json files, as well as resource files exported from XDMoD. Use Metric Explorer to export CSV files 
with the requested data. Create a Metric Explorer chart with the "Jobs -> CPU Hours: Total" metric grouped by User, 
then add a filter for one resource.
