import json
import jsonschema

schema_path = '..\\specs\\schemas\\'

def grant_validate(grants):
    with open(schema_path + 'grant.schema.json', 'rb') as jsonfile:
        schema = json.load(jsonfile)
    for grant in grants:
        try:
            jsonschema.validate(grant, schema)
            yield grant
        except jsonschema.ValidationError as e:
            print e


def user_validate(users):
    with open(schema_path + 'person.schema.json', 'rb') as jsonfile:
        schema = json.load(jsonfile)
    for user in users:
        try:
            jsonschema.validate(user, schema)
            yield user
        except jsonschema.ValidationError as e:
            print e

