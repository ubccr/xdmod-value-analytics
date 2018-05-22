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

