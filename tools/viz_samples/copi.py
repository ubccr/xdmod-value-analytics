"""Script to convert a list of NIH projects into a Co-PI graph. For relevance to the XDMoD-VA module, the list of
projects should be pre-filtered to only include HPC users and/or grant awardees"""
import itertools
import json
from collections import defaultdict
import csv


def load_project_data():
    print("Loading NIH data")
    with open('NIH_Projects.csv') as f:
        reader = csv.DictReader(f)
        projects = [line for line in reader]

    return projects


def projects_of_hpc_users(nih_projects):
    """Creates a list of projects in a standardized format
    Also splits out the semicolon-separated list of Co-PI's into an actual list"""
    print("Matching projects")
    result = []

    for project in nih_projects:
        copis = project['Other PI or Project Leader(s)']
        pi = project['Contact PI / Project Leader']
        proj = dict(GrantID=project['Serial Number'],
                     GrantSource='NIH',
                     GrantSize=int(project['FY Total Cost ']),
                     CoPIS=[pi.strip()] + [c.strip() for c in copis.split(';')]
                     )
        result.append(proj)
    return result


def get_pi_projects(pi, pi_pairs):
    pi_projects = []
    for pair, projects in pi_pairs.items():
        if pi in pair:
            pi_projects += projects
    return pi_projects


def write_schema(pi_ids, pi_pairs):
    # Write out the JSON data in the format that the CoPI visualization expects
    node_schema = [dict(name='name', type='string'), dict(name='id', type='numeric'),
                   dict(name='total_amount', type='numeric'), dict(name='number_of_grants', type='numeric')]
    edge_schema = [dict(name='source', type='numeric'), dict(name='target', type='numeric'),
                   dict(name='total_amount', type='numeric'), dict(name='number_of_grants', type='numeric')]
    result = dict(edges=dict(schema=edge_schema), nodes=dict(schema=node_schema))

    result['nodes']['data'] = list()
    for pi, id in pi_ids.items():
        pi_projects = get_pi_projects(id, pi_pairs)

        if pi_projects:
            result['nodes']['data'].append(dict(id=id,
                                    name=pi,
                                    number_of_grants=len(pi_projects),
                                    total_amount=sum(p['GrantSize'] for p in pi_projects)
                                    ))

    edges = []
    for pair, projects in pi_pairs.items():
        a = list(pair)
        edges.append(dict(source=a[0],
                          target=a[1],
                          number_of_grants=len(projects),
                          total_amount=sum(p['GrantSize'] for p in projects))
                     )

    result['edges']['data'] = edges

    print(json.dumps(result))


def main():
    projects = load_project_data()

    project_list = projects_of_hpc_users(projects)

    # Give an identifier to each PI
    pis = list(itertools.chain.from_iterable(r['CoPIS'] for r in project_list))
    pi_ids = dict([author, index] for index, author in enumerate(pis))

    # Find all pairs of PI's that worked on the same project
    pi_pairs = defaultdict(list)
    for project in project_list:
        pairs = list(itertools.product(project['CoPIS'], project['CoPIS']))
        for pair in pairs:
            if pair[0] != pair[1]:
                key = frozenset([pi_ids[pair[0]], pi_ids[pair[1]]])
                pi_pairs[key].append(project)

    write_schema(pi_ids, pi_pairs)
    # print(json.dumps(result))


if __name__ == '__main__':
    main()
