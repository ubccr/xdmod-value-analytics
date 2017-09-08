#!/usr/bin/env python

"""Load fields of interest over an LDAP cnnection given a list of users"""

import argparse
import ConfigParser
import csv
import getpass
import json
import ldap.sasl
import itertools

def parse_groups(groups):
    g = []
    for r in groups:
        attrs = r.split(',')
        for a in attrs:
            if a.startswith('CN='):
                g.append(a[3:])
    return "|".join(g)


def get_user():
    if args.user: return args.user
    cfg_user = config.get('Credentials', 'user')
    if cfg_user: return cfg_user
    return getpass.getuser()


def get_password(user):
    if args.password: return args.password
    try:
        cfg_pw = config.get('Credentials', 'password')
        if cfg_pw: return cfg_pw
    except ConfigParser.NoOptionError:
        pass
    return getpass.getpass("Password for %s: " % user)


def normalize(field, row):
    key = field[0]
    if key == config.get('LDAP', 'splitfield'):
        return parse_groups(row[key])
    return row[key][0] if key in row else 'None'


def load_users(fields):
    ids = list(get_user_list(args.id_file))
    con = ldap.initialize(config.get('LDAP', 'connectstring'))
    con.simple_bind_s("ads\\" + user_name, pw)
    print "Connected! Identity %s" % con.whoami_s()
    baseDN = config.get('LDAP', 'baseDN')
    id_field = config.get('LDAP', 'idfield')
    result = []

    for i in range(0, len(ids), 500):
        searchScope = '(|%s)' % "".join(('(%s=%s)' % (id_field, id)) for id in ids[i:i + 500])
        ldap_result_id = con.search(baseDN, ldap.SCOPE_SUBTREE, searchScope, [f[0] for f in fields])
        while True:
            result_type, result_data = con.result(ldap_result_id, 0)
            if not result_data:
                break
            else:
                if result_type == ldap.RES_SEARCH_ENTRY:
                    result.append(result_data[0][1])
    con.unbind_s()

    found = set(itertools.chain.from_iterable(r['cn'] for r in result))
    not_found = set(ids) - found

    return result, not_found


def get_user_list(id_file):
    with open(id_file) as f:
        if id_file.endswith('json'):
            data = json.load(f)
            return set(p['id'] for grant in data for p in grant['people'])
        else: # Assume a simple text file with an id on each line
            return [line.strip() for line in f]


def write_csv(data, fields):
    with open(config.get('Output', 'file'), 'wb') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow([f[1] for f in fields])
        for r in data:
            csv_writer.writerow([normalize(f, r) for f in fields])


def middle_name_from_display_name(display_name):
    parts = display_name.split(' ')
    if len(parts) > 2:
        return parts[2]

def build_json_user(fields, r, organization_name):
    d = dict([[f[1], normalize(f, r)] for f in fields])
    result = dict(last_name=d['last_name'], first_name=d['first_name'])
    m = middle_name_from_display_name(d['display_name'])
    if m:
        result['middle_name'] = m
    result['organizations'] = [
        dict(id=d['user'],
             name=organization_name,
             appointment_type=d['title'],
             division=d['division'])
    ]
    result['groups'] = d['groups'].split('|')
    return result


def build_json_missing_user(user, organization_name):
    result = dict(last_name='unknown', first_name='unknown')
    result['organizations'] = [
        dict(id=user,
             name=organization_name,
             appointment_type='unknown',
             division='unknown')]
    return result


def write_json(data, not_found, fields):
    org_name = config.get('Organization', 'name')
    user_list = [build_json_user(fields, r, org_name) for r in data]
    user_list.extend(build_json_missing_user(r, org_name) for r in not_found)
    with open(config.get('Output', 'file'), 'wb') as jsonfile:
        json.dump(user_list, jsonfile, indent=4)


def main():
    fields = config.items('Fields')
    data, not_found = load_users(fields)
    output_format = config.get('Output', 'format')
    if output_format == 'csv':
        write_csv(data, fields)
    elif output_format == 'json':
        write_json(data, not_found, fields)


if __name__ == '__main__':
    config = ConfigParser.SafeConfigParser()
    config.optionxform = str  # Make parser case-sensitive
    config.read('ldap.cfg')

    parser = argparse.ArgumentParser()
    parser.add_argument("id_file")
    parser.add_argument("--user", help="AD user")
    parser.add_argument("--password", help="AD password")

    args = parser.parse_args()

    user_name = get_user()
    pw = get_password(user_name)

    main()
