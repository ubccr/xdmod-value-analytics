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

Two visualizations are provided: one to demonstrate the relationships between PI's on grants and the other to 
demonstrate the flow between grants, computing resources, and publications. The data sources for these
visualizations are independent of the main XDMoD database and consist of JSON files in the xdmodtemporal/data directory
on the web site.

Creating these files is very site-dependent. In the viz_samples directory you will find Python scripts that will
create sample files based on CSV files. The NIH_Projects file is based on data from the NIH Exporter web site, but
filtering the list of projects to only include HPC users and/or grant awardees is left as an exercise to the reader.

The format of the Co-PI JSON file is fairly simple: a list of PI's followed by a list of PI pairs, listing the total
amount of awarded grants and the value of those grants. The copi.py script acts on the NIH project file to generate 
data appropriate for the visualization.

The format of the Sankey JSON file is more complex. Fundamentally each datum required by the Sankey diagram is a triple
consisting of an initial grant, some amount of resources (computing or storage) used, and a resulting publication. Here 
is a sample:

	{
		"AuthorID": "wdisney",
		"PublicationTitle": "Categorizing Forceful Jealousy: Mice in the Primitive",
		"PublicationJournal": "Behavioural pharmacology.",
		"Date": "2015",
		"PubID": "23750231",
		"GrantID": "1B32ZZ023345-01A1",
		"GrantSource": "NIH-NIAAA",
		"GrantSize": 50000.0,
		"ResourceID": "SDA",
		"ResourceType": "Storage",
		"ResourceUnitsUsed": 2177.0,
		"Discipline": "Brain Research"
	},

The sankey.py file will generate these tuples (and various supplemental fields) based on csv files for Grants, Jobs,
Projects, and Publications. Calculating the correlations between these fields can be a difficult task and is left to
a site administrator.

In addition, deciding the category of publication for the diagram may not be a simple exercise. An example
mapping_discipline.csv file is provided as a starting point, and the sankey.py takes some steps to normalize
journal titles in an attempt to properly match them to the correct discipline. Additional research in this area
is being performed and users are encouraged to contact the Value Analytics team for assistance in creating this
json file.

Resource files may be exported from XDMoD. Use Metric Explorer to export CSV files with the requested data. Create a 
Metric Explorer chart with the "Jobs -> CPU Hours: Total" metric grouped by User, then add a filter for one resource.
