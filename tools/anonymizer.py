import json
import random
import random_data
import string
import re

random.seed(99)


def get_groups(users):
    groups = set()
    for u in users:
        groups.update('-'.join(s.split('-')[-2:]) for s in u['groups'])
    return groups


def generate_unique_id(gn, sn):
    s1 = sn[:8]
    new_id = (gn[:(9 - len(s1))] + s1).lower()
    i = 2
    try:
        while new_id in generate_unique_id.current_ids:
            new_id += str(i)
            i += 1
        generate_unique_id.current_ids.add(new_id)
    except AttributeError:
        generate_unique_id.current_ids = {new_id}

    return new_id


def scramble(c):
    if c.isalpha():
        return random.choice(string.ascii_letters)
    if c.isdigit():
        return random.choice(string.digits)
    return c


def replace_grant_description(desc):
    try:
        i = replace_grant_description.word_index
    except AttributeError:
        i = replace_grant_description.word_index = 0

    word_list = re.sub("[^\w]", " ", random_data.words).split()
    words_to_replace = re.sub("[^\w]", " ", desc).split()
    for word in words_to_replace:
        desc = desc.replace(word, word_list[i])
        i = (i + 1) % len(word_list)
    replace_grant_description.word_index = i
    return desc


def anonymize_users(users, user_dict):
    groups = list(get_groups(users))
    for u in users:
        sn = random.choice(random_data.surnames)
        gn = random.choice(random_data.given)
        unique_id = generate_unique_id(gn, sn)
        u['last_name'] = sn
        u['first_name'] = gn
        for org in u['organizations']:
            user_dict[org['id']] = unique_id
            org['id'] = unique_id
        group_count = len(u['groups'])
        u['groups'] = list(set(random.choice(groups) for _ in range(group_count)))


def anonymize_grants(grants, user_dict):
    for g in grants:
        g['organization_grant_id'] = ''.join(scramble(c) for c in g['organization_grant_id'])
        if g['agency_grant_id']:
            g['agency_grant_id'] = ''.join(scramble(c) for c in g['agency_grant_id'])
        g['title'] = replace_grant_description(g['title'])
        g['agency'] = random.choice(random_data.agencies)
        for p in g['people']:
            p['id'] = user_dict[p['id']]


def main():
    user_dict = dict()
    with open('users.json', 'rb') as jsonfile:
        users = json.load(jsonfile)
    anonymize_users(users, user_dict)
    with open('grants.json', 'rb') as jsonfile:
        grants = json.load(jsonfile)
    anonymize_grants(grants, user_dict)
    with open('users_anon.json', 'wb') as jsonfile:
        json.dump(users, jsonfile, indent=4)
    with open('grants_anon.json', 'wb') as jsonfile:
        json.dump(grants, jsonfile, indent=4)


if __name__ == '__main__':
    main()