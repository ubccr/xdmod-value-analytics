import os
import json
from collections import defaultdict, Counter
import random
import csv
import re

TAG_RE = re.compile(r'<[^>]+>')
PAREN_RE = re.compile(r'\([^\)]+\)')

def remove_tags(text):
    return TAG_RE.sub('', text)


def load_disciplines():
    with open('mapping_discipline.csv', encoding="Latin-1") as f:
        reader = csv.DictReader(f)
        return dict([d['formal_name'].lower().replace("'",''), d['disc_name']] for d in reader)


def load_project_data():
    print("Loading NIH data")
    with open('NIH_Projects.csv') as f:
        reader = csv.DictReader(f)
        projects = [line for line in reader]

    with open('NIH_Publications.csv') as f:
        reader = csv.DictReader(f)
        pubs = [line for line in reader]

    return projects, pubs



def load_grant_data():
    print("Loading grant data")
    with open('Grants.csv') as f:
        reader = csv.DictReader(f)
        grants = [line for line in reader]

    return grants


def load_storage_data():
    """SQL query: select user, gb gigabytes, system from
((select user, sum(gigabytes) gb, 'SDA' system
from user_storages where system = 'hpss' and date = '2017-08-30' group by user)
union
(select user, sum(gigabytes) gb, 'DC2' system from user_storages where system = 'DC2' and date = '2017-05-14'
group by user)) c
where gb >= 1
order by gb"""
    with open(os.path.join(dir, 'storage.csv'), encoding="Latin-1") as f:
        reader = csv.DictReader(f)
        return [line for line in reader]


def load_job_data():
    print("Loading job data")
    with open('Jobs.csv') as f:
        reader = csv.DictReader(f)
        grants = [line for line in reader]

    return grants


def matching(pub, projects):
    for project_id in projects.keys():
        if pub in project_id:
            return projects[project_id]


def normalize_journal(j):
    result = j.split(':')[0]
    result = result.lstrip('The ')
    result = result.replace('.', '').lower()
    result = result.replace('&', 'and')
    result = PAREN_RE.sub('', result)
    result = result.replace(chr(39), '')    # ??
    result = result.strip()
    return result


def match_pub_data(iu_grants, nih_projects, nih_pubs):
    print("Matching publications")
    papers = defaultdict(list)

    project_dict = dict([p['Project Number'],p] for p in nih_projects)
    grant_dict = dict([g['AGENCY_AWARD_NUMBER'], g] for g in iu_grants)
    for pub in nih_pubs:
        core_project_number = pub['Core Project Number']
        project = matching(core_project_number, project_dict)
        grant = matching(core_project_number, grant_dict)
        if project and grant:
            title = remove_tags(pub['Title (Link to full-text in PubMed Central) '])
            journal = pub['Journal (Link to PubMed abstract) ']
            paper = dict(AuthorID=grant['USER_ID'],
                         PublicationTitle=title,
                         PublicationJournal=journal,
                         Date=pub['PUB Year'],
                         PubID=pub['PMID'],
                         GrantID=grant['AGENCY_AWARD_NUMBER'],
                         GrantSource=grant['AGENCY'],
                         GrantSize=grant['AMOUNT']
                         )
            papers[grant['USER_ID']].append(paper)
    return papers

def add_resource(user, resource, type, units, papers):
    # find all pubs by job user and assign hours randomly to one of them
    p1 = papers[user]
    p2 = [p for p in p1 if p['ResourceID'] == resource]
    selections = p2 if p2 else p1
    if selections:
        c = random.choice(selections)
        c['ResourceID'] = resource
        c['ResourceType'] = type
        c['ResourceUnitsUsed'] += units


def add_discipline(item, disciplines):
    normal_journal = normalize_journal(item['PublicationJournal'])
    item['Discipline'] = disciplines[normal_journal] if normal_journal in disciplines else 'Other'
    if not item['Discipline']:
        print("No discipline found for", item['PublicationJournal'])


def get_schema():
    fields = [("GrantSize","numeric"),("ResourceID","string"),("PubID","numeric"),("GrantSource","string"),
("GrantID","string"),("ResourceUnitsUsed","numeric"),("AuthorID","string"),("PublicationTitle","string"),
("Date","string"),("PublicationJournal","string")]
    return [dict(name=x,type=y) for x, y in fields]


def get_resource_type_map():
    fields = [("BIGRED2","COMPUTE"),("KARST","COMPUTE"),("MASON","COMPUTE"),("SDA","STORAGE"),
("DC2","STORAGE"), ("CARBONATE","COMPUTE"), ("BIGRED","COMPUTE"), ("QUARRY","COMPUTE")]
    return [dict(ResourceID=x,ResourceType=y) for x, y in fields]


def get_grant_size_per_grant_source(data):
    grants = set((d['GrantSource'], d['GrantSize'], d['GrantID']) for d in data)
    c = Counter()
    for d in grants:
        c[d[0]] += d[1]
    return c


def get_grant_size_per_resource(data):
    grants = set((d['ResourceID'], d['GrantSize'], d['GrantID']) for d in data)
    c = Counter()
    for d in grants:
        c[d[0]] += d[1]
    return c


def get_usage_total_per_resource(data):
    grants = set((d['ResourceID'], d['ResourceUnitsUsed'], d['AuthorID']) for d in data)
    c = Counter()
    for d in grants:
        c[d[0]] += d[1]
    return c


def get_user_count_per_resource(data):
    r = defaultdict(set)
    for d in data:
        r[d['ResourceID']].add(d['AuthorID'])
    c = Counter()
    for k,v in r.items():
        c[k] = len(v)
    return c


def get_publication_count_by_discipline(data):
    r = defaultdict(set)
    for d in data:
        r[d['Discipline']].add(d['PubID'])
    c = Counter()
    for k,v in r.items():
        c[k] = len(v)
    return c


def get_compute_user_count(jobs):
    r = defaultdict(set)
    for j in jobs:
        r[j['CLUSTER_NAME']].add(j['USER_ID'])
    c = Counter()
    for k, v in r.items():
        c[k] = len(v)
    return c


def get_storage_user_count(stor):
    r = defaultdict(set)
    for j in stor:
        r[j['system']].add(j['user'])
    c = Counter()
    for k, v in r.items():
        c[k] = len(v)
    return c


def add_total(data, item):
    data[item]['total'] = sum(data[item].values())


def main():
    projects, pubs = load_project_data()
    grants = load_grant_data()

    papers = match_pub_data(grants, projects, pubs)

    resources = []
    print("Analyzing jobs")
    jobs = load_job_data()
    for job in jobs:
        resources.append(dict(user=job['USER_ID'], resource=job['CLUSTER_NAME'], type='CPUTime', units=job['CORE_SECONDS']))

    print("Building result list")
    data = []
    for resource in resources:
        for paper in papers[resource['user']]:
            datum = {**paper}
            datum['ResourceID'] = resource['resource']
            datum['ResourceType'] = resource['type']
            datum['ResourceUnitsUsed'] = resource['units']
            data.append(datum)

    print("Computing auxiliary data")
    compute_users = get_compute_user_count(jobs)
    resource_users = {**compute_users}

    result = dict(records=dict())
    result['records']['data'] = data
    result['resource_users'] = resource_users
    result['resource_users']['total'] = len(set(r['user'] for r in resources))

    disciplines = load_disciplines()
    for d in result['records']['data']:
        add_discipline(d, disciplines)


    # constant data
    result['schema'] = get_schema()
    result['resource_type_map'] = get_resource_type_map()

    # derived data
    result['grant_sizes'] = get_grant_size_per_grant_source(data)
    result['resource_grant_totals'] = get_grant_size_per_resource(data)
    result['publication_numbers_discipline'] = get_publication_count_by_discipline(data)
    result['publication_numbers_discipline']['total'] = len(set(d['PubID'] for d in data))

    result['resource_unit_totals'] = get_usage_total_per_resource(data)

    add_total(result, 'resource_grant_totals')
    add_total(result, 'resource_unit_totals')
    add_total(result, 'grant_sizes')

    with open('sankey.json', 'w') as f:
        json.dump(result, f, indent=4)


if __name__ == '__main__':
    main()
