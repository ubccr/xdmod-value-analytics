import argparse
from collections import defaultdict
import ConfigParser
import csv
import cx_Oracle
import datetime
import getpass
import json


class UTC(datetime.tzinfo):
    """Simple class to export last_modified field in UTC"""
    def utcoffset(self, dt):
        return datetime.timedelta(0)

    def tzname(self, dt):
        return "UTC"

    def dst(self, dt):
        return datetime.timedelta(0)


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


def load_grants(fields):
    query = """select lower(a.PERSON_USER_ID),
            CAST(a.CGAWD_TOT_AMT AS INT),
            TO_CHAR(a.CGAWD_BEG_DT, 'YYYY-MM-DD'),
            TO_CHAR(a.CGAWD_END_DT, 'YYYY-MM-DD'),
            PRSN_ROLE_ID_DESC, CG_AGENCY_RPT_NM, CG_AGENCY_AWD_NBR,
            CGAWD_PROJ_TTL, a.KC_AWD_NBR,
             (case a.cgprpsl_awd_typ_cd when '2' then 'Renew' else 'New' end)
        from DSS_KC.KC_AWD_ALL_PRSN_V a
        where a.CGAWD_BEG_DT < :1 and a.CGAWD_END_DT > :2 and a.kc_awd_node = 'B' and ROWNUM < 100"""
    conn = cx_Oracle.connect(user_name, pw, config.get('Database', 'connectstring'))
    cursor = conn.cursor()
    cursor.execute(query, (datetime.date(2016, 1, 1), datetime.date(2015, 1, 1)))
    data_set = cursor.fetchall()
    conn.close()
    field_names = [f[0] for f in fields]
    return [dict(zip(field_names, row)) for row in data_set]


def write_csv(data, fields):
    with open('grants.csv', 'w') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow([f[0] for f in fields])
        for row in data:
            csv_writer.writerow(row)


def build_json_grant(grant_fields, user_fields, grant, users):
    grant_dict = dict(zip(grant_fields, grant))
    grant_dict['people'] = [dict(zip(user_fields, u)) for u in users]
    grant_dict['last_modified'] = datetime.datetime.now(UTC()).isoformat()
    return grant_dict


def write_json(data, fields):
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

    args = parser.parse_args()

    user_name = get_user()
    pw = get_password(user_name)

    main()