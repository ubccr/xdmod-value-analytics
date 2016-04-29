#!/usr/bin/env python

"""Load fields of interest over an LDAP cnnection given a list of users"""

import argparse
import ConfigParser
import csv
import getpass
import ldap.sasl


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
    with open(args.id_file) as f:
        ids = [line.strip() for line in f]
    con = ldap.initialize(config.get('LDAP', 'connectstring'))
    con.simple_bind_s("ads\\" + user_name, pw)
    print "Connected! Identity %s" % con.whoami_s()
    baseDN = config.get('LDAP', 'baseDN')
    id_field = config.get('LDAP', 'idfield')
    searchScope = '(|%s)' % "".join(('(%s=%s)' % (id_field, id)) for id in ids)
    ldap_result_id = con.search(baseDN, ldap.SCOPE_SUBTREE, searchScope, [f[0] for f in fields])
    result = []
    while True:
        result_type, result_data = con.result(ldap_result_id, 0)
        if not result_data:
            break
        else:
            if result_type == ldap.RES_SEARCH_ENTRY:
                result.append(result_data[0][1])
    con.unbind_s()
    return result


def write_output(data, fields):
    with open(config.get('Output', 'file'), 'wb') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow([f[1] for f in fields])
        for r in data:
            csv_writer.writerow([normalize(f, r) for f in fields])


def main():
    fields = config.items('Fields')
    data = load_users(fields)
    write_output(data, fields)


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
