"""Generate a publications.json file based on the previously created grants.json and various files made
available by the NIH. The NIH data is filtered by the agency_grant_id field of the grants, and a match
is made whenever the publication's project ID is contained in the agency_grant_id field."""
import csv
import ConfigParser
import json
from collections import defaultdict

def load_pub_data(grants):
    """Load publication data and link data between NIH award ID's and publication ID's"""
    with open(config.get('NIH', 'link_file')) as f:
        reader = csv.DictReader(f)
        project_publications = dict([r['PROJECT_NUMBER'], r['PMID']] for r in reader)
    with open(config.get('NIH', 'publication_file')) as f:
        reader = csv.DictReader(f)
        publications = dict([r['PMID'], r] for r in reader)

    result = list()
    with open(config.get('NIH', 'project_file')) as f:
        reader = csv.DictReader(f)
        for project in reader:
            for grant_id in grants.keys():
                if unicode(project['CORE_PROJECT_NUM']) in grant_id:
                    if project['CORE_PROJECT_NUM'] in project_publications:
                        pmid = project_publications[project['CORE_PROJECT_NUM']]
                        publications[pmid]['AUTHOR_IDS'] = list(grants[grant_id])
                        result.append(publications[pmid])
                    break
    return result


def load_grant_data():
    # load grants from the specified grants.json file
    with open(config.get('Grants', 'file')) as f:
        return json.load(f)


def main():
    """Load grant and publication data and write publications that can be associated with grants"""
    grants = defaultdict(set)
    for grant in load_grant_data():
        grants[grant['agency_grant_id']].update(person['id'] for person in grant['people'])
    publications = load_pub_data(grants)
    with open(config.get('Output', 'file'), 'wb') as jsonfile:
        json.dump(publications, jsonfile, indent=4)


if __name__ == "__main__":
    config = ConfigParser.SafeConfigParser()
    config.optionxform = str  # Make parser case-sensitive
    config.read('nih_publications.cfg')

    main()
