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

- `grants.json`
- `organizations.json`
- `people.json`

For common financial systems, we will include tools to generate the
required files. These tools may be found in
`[xdmod_share_dir]/tools/value-analytics`. We currently support:

- Kuali

If you are using a common financial system to manage your grant data and it is
not listed above, please contact `ccr-xdmod-help` at `buffalo.edu` for more
information. Otherwise, you will need to convert your data according to the
corresponding JSON schemas in
`[xdmod_etc_dir]/etl/etl_schemas.d/value_analytics`. These schemas may also
be viewed online [here](https://github.com/ubccr/xdmod-value-analytics/tree/master/configuration/etl/etl_schemas.d/value_analytics).

## Ingestion

To begin the ingestion and aggregation process, simply run the command below.

```
$ xdmod-value-analytics-ingestor
```

## Resetting

To clear all Value Analytics data from the database, run the command below.

```
$ xdmod-value-analytics-reset
```
