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

To import publication data from the NIH, run the nih_publications script. Input for this script consists of three
CSV files from the NIH: a projects file, a publications file, and a link file connecting the two. The script compares
award ID's from the previously generated grants.json file to the NIH files to generate a publications.json file, which
matches the grant awardee to the publication data.

Visualizations
--------------

Visualizations are provided to demonstrate the flow between grants, HPC resources, and publications. The data source
for the visualization is the file "sankey.json". This file can be generated as a secondary step from the grants.json
and publications.json files, as well as resource files exported from XDMoD. Use Metric Explorer to export CSV files 
with the requested data. Create a Metric Explorer chart with the "Jobs -> CPU Hours: Total" metric grouped by User, 
then add a filter for one resource.
