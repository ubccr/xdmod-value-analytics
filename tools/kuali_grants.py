import argparse
from collections import defaultdict
import ConfigParser
import csv
import cx_Oracle
import datetime
import getpass
import json
from datetime import date


class UTC(datetime.tzinfo):
    """Simple class to export last_modified field in UTC"""
    def utcoffset(self, dt):
        return datetime.timedelta(0)

    def tzname(self, dt):
        return "UTC"

    def dst(self, dt):
        return datetime.timedelta(0)


def get_user():
    """Get database username, either passed on command line or read from the config file. As a last
    resort, prompt the user to enter the username"""
    if args.user: return args.user
    cfg_user = config.get('Credentials', 'user')
    if cfg_user: return cfg_user
    return getpass.getuser()


def get_password(user):
    """Get database password, either passed on command line or read from the config file. As a last
    resort, prompt the user to enter the password"""
    if args.password: return args.password
    try:
        cfg_pw = config.get('Credentials', 'password')
        if cfg_pw: return cfg_pw
    except ConfigParser.NoOptionError:
        pass
    return getpass.getpass("Password for %s: " % user)


def load_grants(fields):
    """Connect to an Oracle Kuali database and query for grant data over a given time period. Return
    an array of dict with the data. The query is assumed to return the fields defined in the
    config file in order, and each key-value pair consists of the field name and its value in the data."""
    query = """select lower(a.PERSON_USER_ID),
            CAST(a.CGAWD_TOT_AMT AS INT),
            TO_CHAR(a.CGAWD_BEG_DT, 'YYYY-MM-DD'),
            TO_CHAR(a.CGAWD_END_DT, 'YYYY-MM-DD'),
            PRSN_ROLE_ID_DESC, CG_AGENCY_RPT_NM, COALESCE(CG_AGENCY_AWD_NBR, 'None'),
            CGAWD_PROJ_TTL, a.KC_AWD_NBR,
             (case a.cgprpsl_awd_typ_cd when '2' then 'Renew' else 'New' end)
        from DSS_KC.KC_AWD_ALL_PRSN_V a
        where a.CGAWD_BEG_DT < :1 and a.CGAWD_END_DT > :2 and a.kc_awd_node = 'B'
        and a.PERSON_USER_ID is not null
        """
    conn = cx_Oracle.connect(user_name, pw, config.get('Database', 'connectstring'))
    cursor = conn.cursor()
    end_date = args.end_date if args.end_date else date.today()
    start_date = args.start_date if args.start_date else date(end_date.year-1, end_date.month, end_date.day)
    cursor.execute(query, (end_date, start_date))
    data_set = cursor.fetchall()
    conn.close()
    field_names = [f[0] for f in fields]
    return [dict(zip(field_names, row)) for row in data_set]


def write_csv(data, fields):
    """Write grant data to a csv file, with a header"""
    with open('grants.csv', 'w') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow([f[0] for f in fields])
        for row in data:
            csv_writer.writerow(row)


def build_json_grant(grant_fields, user_fields, grant, users):
    """Create a dict in the appropriate format for writing to XDMoD-VA compliant JSON"""
    grant_dict = dict(zip(grant_fields, grant))
    people = (dict(zip(user_fields, u)) for u in users)
    grant_dict['last_modified'] = datetime.datetime.now(UTC()).isoformat()
    grant_dict['people'] = normalize_people(people)
    if grant_dict['type'] == 'Renew':
        grant_dict['type'] = 'Renewal'
    return grant_dict


def normalize_people(people):
    """Modify any Kuali field values that do not match XDMoD-VA enumerated field values"""
    unique_people = [dict(s) for s in set(frozenset(d.items()) for d in people)]
    d = {'Principal Investigator': 'PI',
         'Co-Principal Investigator': 'Co-PI',
         'Key Person': 'Key Personnel'}
    for p in unique_people:
        if p['role'] in d:
            p['role'] = d[p['role']]
    return unique_people


def write_json(data, fields):
    """Write grant data to a JSON file, with the appropriate field names"""
    grant_fields = [f[0] for f in fields if f[1] == 'grant']
    user_fields = [f[0] for f in fields if f[1] == 'user']
    grant_list = defaultdict(list)
    for d in data: # Normalize the unique grants into dictionary keys, with the users as values
        grant = tuple(d[g] for g in grant_fields)
        user = tuple(d[u] for u in user_fields)
        grant_list[grant].append(user)
    with open(config.get('Output', 'file'), 'wb') as jsonfile:
        grant_list = [build_json_grant(grant_fields, user_fields, grant, user) for grant, user in grant_list.iteritems()]
        json.dump(grant_list, jsonfile, indent=4)


def main():
    """Load grant data and write it"""
    fields = config.items('Fields')
    data = load_grants(fields)

    output_format = config.get('Output', 'format')
    if output_format == 'csv':
        write_csv(data, fields)
    elif output_format == 'json':
        write_json(data, fields)


if __name__ == '__main__':
    config = ConfigParser.SafeConfigParser()
    config.optionxform = str  # Make parser case-sensitive
    config.read('kuali.cfg')

    parser = argparse.ArgumentParser()
    parser.add_argument("--user", help="DB user")
    parser.add_argument("--password", help="DB password")
    parser.add_argument('-s', '--start', help='First day for which to gather statistics', dest='start_date')
    parser.add_argument('-e', '--end', help='Last day for which to gather statistics', dest='end_date')

    args = parser.parse_args()

    user_name = get_user()
    pw = get_password(user_name)

    main()
