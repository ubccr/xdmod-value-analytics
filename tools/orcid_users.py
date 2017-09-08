"""Ingest users by ORCID ID

Given a file containing ORCID ID's as a field, generate a file suitable for ingestion into XDMoD-VA """

import ConfigParser
import argparse
import json
import urllib2
import time


def get_user_list(id_files):
    result = list()
    for id_file in id_files:
        with open(id_file) as f:
            if id_file.endswith('json'):
                data = json.load(f)
                result.extend(set(p['id'] for grant in data for p in grant['people']))
            else:  # Assume a csv file with the id as the first value
                result.extend([line.split(',')[0].strip() for line in f])
    return result


def orcid_request(orcid):
    token = config.get('ORCID', 'token')
    base_url = config.get('ORCID', 'url')
    url = base_url + '/v1.2/search/orcid-bio'
    request_string = url + "/?q=orcid:" + orcid
    request = urllib2.Request(request_string)
    request.add_header("Authorization", "Bearer " + token)
    request.add_header("Content-Type", "application/orcid+xml")
    request.add_header("Accept", "application/orcid+json")
    return urllib2.urlopen(request)


def load_users():
    ids = list(get_user_list(args.id_files))
    result = []
    not_found = []
    for id in ids:
        r = json.load(orcid_request(id))
        items = r['orcid-search-results']['orcid-search-result']
        if items:
            result.append(items[0])
        else:
            not_found.append(id)
        time.sleep(1)
    return result, not_found


def build_json_missing_user(user, organization_name):
    result = dict(last_name='unknown', first_name='unknown')
    result['organizations'] = [
        dict(id=user,
             name=organization_name,
             appointment_type='unknown',
             division='unknown')]
    return result


def build_json_user(d, organization_name):
    f = d['orcid-profile']
    fn = f['orcid-bio']['personal-details']['given-names']['value']
    ln = f['orcid-bio']['personal-details']['family-name']['value']
    id = f['orcid-identifier']['path']
    result = dict(last_name=ln, first_name=fn)
    result['organizations'] = [
        dict(id=id,
             name=organization_name,
             appointment_type='None',
             division='None')
    ]
    return result


def write_json(data, not_found):
    org_name = config.get('Organization', 'name')
    user_list = [build_json_user(r, org_name) for r in data]
    user_list.extend(build_json_missing_user(r, org_name) for r in not_found)
    with open(config.get('Output', 'file'), 'wb') as jsonfile:
        json.dump(user_list, jsonfile, indent=4)


def main():
    data, not_found = load_users()
    write_json(data, not_found)

    for d in data:
        print d


if __name__ == '__main__':
    config = ConfigParser.SafeConfigParser()
    config.optionxform = str  # Make parser case-sensitive
    config.read('orcid.cfg')

    parser = argparse.ArgumentParser()
    parser.add_argument("id_files", nargs='+')

    args = parser.parse_args()

    main()
