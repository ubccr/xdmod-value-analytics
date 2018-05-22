---
title: Ingestion Guide
---

This guide will outline the use of the Value Analytics ingestor command line
utility.  The ingestor is responsible for loading data into the Open XDMoD
database and preparing data so that it can be queried by the Open XDMoD portal.
This process also includes aggregating the data in the Open XDMoD database to
increase the performance of the queries performed by the Open XDMoD portal.

## Preparation

Before data can be ingested into Open XDMoD, it must first be converted to
the expected formats and placed in the expected locations.

### Grant Data

Grant data will be ingested into Open XDMoD from three JSON files in
`[xdmod_etc_dir]/etl/etl_data.d/value_analytics`:

- `grants.json` Detailed information on individual grants.
- `organizations.json` Definition of the institutional organization.
- `people.json` Detailed information on the people associated with grants.

For common financial systems, we will include tools to generate the
required files. These tools may be found in
`[xdmod_share_dir]/tools/value-analytics`. We currently support:

- Kuali

If you are using a common financial system to manage your grant data and it is
not listed above, please contact `ccr-xdmod-help` at `buffalo.edu` for more
information. Otherwise, you will need to convert your data according to the
corresponding JSON schemas in
`[xdmod_etc_dir]/etl/etl_schemas.d/value_analytics`. These schemas may also
be [viewed online](https://github.com/ubccr/xdmod-value-analytics/tree/master/configuration/etl/etl_schemas.d/value_analytics).

To import grant data from Kuali Financial Services, run the `kuali_grants.py`
script. Configuration of the fields to be used and the Kuali database
configuration is controlled by a file, kuali.cfg. A template is provided with
the application. The output file after running the script will be `grants.json`,
in a suitable format for XDMoD-VA to import.

To import personnel data from LDAP, run the `ldap_users.py` script. Similarly,
the `ldap.cfg` file contains information concerning loading of personal
information via an LDAP connection. Pass as parameters to the script, either
the `grants.json` file made available in the previous step, or a comma-separated
file of ID's to pull down from LDAP, with the ID as the first field of each
row. Output will be `users.json`, which will again be in a suitable format for
XDMoD-VA to import.

To import personnel data from ORCID, run the `orcid_users.py` script.
Similarly, the `orcid.cfg` file contains information concerning loading of
personal information from the ORCID scientific user community. Pass a
comma-separated file of ORCID ID's to load from the ORCID site, with the ID as
the first field of each row. Output will be `users.json`, which will be in a
suitable format for XDMoD-VA to import.

To import publication data from the NIH, go to the [NIH
Exporter](https://exporter.nih.gov/ExPORTER_Catalog.aspx) and download three
related files: a projects file, a publications file, and a link file connecting
the two. For example, to import data from all of 2016, download
`RePORTER_PRJ_C_FY2016.zip` for projects, `RePORTER_PUB_C_2016.zip` for
publications, and `RePORTER_PUBLNK_C_2016.zip` to link the files. The files
should be downloaded in CSV format and unzipped.

Copy the file `nih_publications.cfg.template` to `nih_publications.cfg` and, if
required, specify paths to the relevant files. Then run the nih_publications
script. The script will attempt to match grant ID's from `grants.json` to NIH
award ID's and will place the output in the file specified in the config
(`publications.json` by default).

## Ingestion

**Note: Prior to running the XDMoD Value Analytics ingestor, you must first ensure that
XDMoD has been properly configured and job data has been ingested. See
[Configuration](configuration.html).**

To begin the ingestion and aggregation process, simply run the command below.

```
$ xdmod-value-analytics-ingestor
```

## Resetting

To clear all Value Analytics data from the database, run the command below.

```
$ xdmod-value-analytics-reset
```
