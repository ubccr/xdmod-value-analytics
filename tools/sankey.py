"""Script to compile data for a Sankay display. Loads data from XDMoD Ingestion files grants.json and publications.json,
and an export from XDMoD. Use Metric Explorer to export CSV files with the requested data. Create a Metric Explorer
chart with the "Jobs -> CPU Hours: Total" metric grouped by User, then if desired, add a filter for one resource to
filter by. """
import json
import ConfigParser
from collections import defaultdict
import random


def load_grant_data():
    """load grants from the specified grants.json file"""
    with open(config.get('Input', 'grants')) as f:
        return json.load(f)


def load_pub_data():
    """load publications from the specified publications.json file"""
    with open(config.get('Input', 'publications')) as f:
        return json.load(f)


def load_resource_data():
    """load job information from the jobs file exported from XDMoD"""
    d = defaultdict(dict)
    with open(config.get('Input', 'resources')) as f:
        line = ''
        while not line.startswith('"Resource = '):
            line = f.readline()
        s = line.split()
        resource = s[2].strip('"')

        while not line.startswith('Month'):
            line = f.readline()

        headers = line.split('[')
        users = [h[:h.find(']')] for h in headers]
        for line in f:
            hours = line.split(',')
            month = hours[0]
            for user, hour in zip(users, hours):
                d[user][resource] = hour
    return d


def allocate_resources(matching):
    """Generate a series of keys consisting of the agency grant ID, the resource, the publication ID, and the agency.
        Assign grant dollars and resource hours at random to each key. If a more direct association between the keys
        and the grant dollars and hours is known, it should be used instead."""
    result = []
    for k, v in matching.iteritems():
        if len(v) < 3: continue

        accumulator = dict()
        for g in v['grants']:
            for c in v['hours']:
                for p in v['pubs']:
                    key = (g['agency_grant_id'], c.keys()[0], p['PMID'], g['agency'])
                    if key not in accumulator:
                        accumulator[key] = dict(GrantSize=0, ResourceUnitsUsed=0.0)

        # distribute hours across matching keys
        for c in v['hours']:
            items = [key for key in accumulator.keys() if key[1] in c.keys()]
            accumulator[random.choice(items)]['ResourceUnitsUsed'] += float(c[key[1]])

        for g in v['grants']:
            items = [key for key in accumulator.keys() if key[0] == g['agency_grant_id']]
            accumulator[random.choice(items)]['GrantSize'] += g['total_dollars']

        for k, v in accumulator.iteritems():
            if v['GrantSize'] > 0 and v['ResourceUnitsUsed'] > 0:
                result.append(dict(
                    GrantID=k[0],
                    GrantSize=v['GrantSize'],
                    GrantSource=k[3],
                    ResourceID=k[1],
                    ResourceUnitsUsed=v['ResourceUnitsUsed'],
                    PubID=k[2]))

    return result

def main():
    """Load grant, publication, and resource hour data and combine them into a single file in the format
    used by the Sankey visualization."""
    matching = dict()
    for g in load_grant_data():
        for p in g['people']:
            if p['id'] not in matching:
                matching[p['id']] = defaultdict(list)
            matching[p['id']]["grants"].append(g)

    for user, data in load_resource_data().iteritems():
        if user not in matching:
            matching[user] = defaultdict(list)
        matching[user]["hours"].append(data)

    for pub in load_pub_data():
        for author in pub['AUTHOR_IDS']:
            if author not in matching:
                matching[author] = defaultdict(list)
        matching[author]["pubs"].append(pub)

    sankey_data = allocate_resources(matching)
    with open('sankey.json', 'wb') as jsonfile:
        json.dump(sankey_data, jsonfile, indent=4)


if __name__ == "__main__":
    config = ConfigParser.SafeConfigParser()
    config.optionxform = str  # Make parser case-sensitive
    config.read('sankey.cfg')

    main()
