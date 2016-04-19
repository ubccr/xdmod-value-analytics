XDMoD Value Analytics (XDMoD-VA) Data Interchange Format Specifications
=======================================================================

Introduction
------------

XDMoD Value Analytics currently utilizes three entities to provide ROI metrics:
1. Organizations,
2. People, and
3. Grants

Schema definitions and examples are found in their respective subdirectories.

Organizations
-------------

An organization is defined simply as a name and abbreviation and an XDMoD-VA installation at a
single institution will typically define a single organization to represent the
institution. However, to support cases where a person may be affiliated with multiple
organizations as part of their institutional obligations, we allow the definition of multiple
organizations. It is assumed that each organization name and abbreviation will be unique.

    {
        "name": "University at Buffalo",
        "abbrev": "UB"
    }

People
------

Each person is uniquely defined by their name and a primary organization that they are affiliated
with. Each organization provides an identifier for that person that *must be unqiue within that
organization*. A person may be affiliated with more than one organization, each providing a unique
organizational identifier for the person but only one organization may be specified as the user's
primary organization.

In addition, a person may have a list of identifiers used to link them to other entities such as
funding agencies or citation clearinghouses. A person may also me a member of one or more groups,
which are generic tags allowing multiple users to be grouped together.\

It is assumed that the list of organization names, person appointment types, and identifier types
has normalized prior to providing that information to XDMoD. *Organization names must match a
defined organization.* XDMoD does not automatially identify and normalize this data.


    {
        "first_name": "Steven",
        "middle_name": "M",
        "last_name": "Gallo",
        "organizations": [
            {
                "id": "smgallo@buffalo.edu",
                "name": "University at Buffalo",
                "title": "Lead Software Engineer",
                "appointment_type": "staff",
                "division": "CCR",
                "primary": true
            },
            {
                "id": "sgallo",
                "name": "Buffalo Bio-Blower",
                "appointment_type": "staff",
                "division": "General"
            }
        ],
        "identifiers": [
            {
                "type": "orchid",
                "id": "0000-0002-1825-0097"
            },{
                "type": "nsf",
                "id": "000160359"
            }
        ],
        "groups": [
            "xms",
            "ccrstaff",
            "caringguidance",
            "redfly"
        ]
    }

Grants
------

A grant is a financial award from a funding agency over a specified performance period.  All
grants must include metadata such as the title, funding agency, grant identifiers for both the
agency and organization, a start and end data, as well as a dollar amount. In addition. a grant
contains a list of one or more people and their roles on the grant. At a minimum, this list must
contain the PI.

People affiliated with a grant are identified by their unique organizational ID and their role on
the grant. If a single organization is defined, the person's organization does not need to be
specified. However, if more than one organization is defined it is necessary to specific the
organization name as well as the organization id to uniquely identify the user because it is
possible for the same identifier to be used my more than one organization. If a person associated
with a grant is not a member of an organization defined within XDMoD Value Analytics (e.g., a
Co-PI on the grant from another institution) then that person may be defined using their name and
their organization name in addition to their role.

It is assumed that the list of funding agencies and organizations is normalized prior to providing
that information to XDMoD. *Organization names must match a defined organization and organization
ids must be defined prior to ingesting grant data.* XDMoD does not automatially identify and
normalize this data.


    {
        "title": "XD Metrics Service (XMS)",
        "agency": "National Science Foundation (NSF)",
        "agency_grant_id": "1445806",
        "organization_grant_id": "12345-67890",
        "type": "New",
        "start_date": "2015-07-01",
        "end_date": "2020-06-30",
        "total_dollars": 9079701,
        "people": [
            {
                "id": "furlani@buffalo.edu",
                "role": "PI"
            },
            {
                "first_name": "Gregor",
                "last_name": "von Laszewski",
                "organization": "Indiana University",
                "role": "Co-PI"
            }
        ],
        "last_modified": "2016-04-19T06:50:00Z"
    }
