# seci-dps-dashboard

## users

- admin - always exists in the system, can add users or disable them
- user - can be view only user or can edit, will have a department, name and id

## database tables

- dept_master - list of all departements in the system
  constraints:

  - pk: (dept_id)

  | dept_name | dept_id | regular_count | yp_count | contractual_count |
  | --------- | ------- | ------------- | -------- | ----------------- |

- dept_statistic - stores department statistics for each department, which is basically shown as a pie chart
  constraints:

  - pk: (dept_id, statistic_id)
  - fk: (dept_id, dept_master) -> (dept_id, dept_statistic)

  | dept_id | statistic_id | statistic_name |
  | ------- | ------------ | -------------- |

- dept_entity - contains all information regarding a particular entity inside a particular statistic of any department, which can be project names, tender names, proposals etc.
  constraints:

  - pk: (dept_id, statistic_id, entity_id)
  - fk: (dept_id, dept_master) -> (dept_id, dept_entity)
  - fk: (statistic_id, dept_statistic) -> (statistic_id, dept_entity)

    | dept_id | statistic_id | entity_id | entity_name |
    | ------- | ------------ | --------- | ----------- |

- entity_fields - the fields shown in the tooltip of a particular statistic for a particular deparment.
  constraints:

  - pk: (dept_id, statistic_id, entity_id, field_id)
  - fk: (dept_id, dept_master) -> (dept_id, entity_fields)
  - fk: (statistic_id, dept_statistic) -> (statistic_id, entity_fields)
  - fk: (entity_id, dept_entity) -> (entity_id, entity_fields)

    | dept_id | statistic_id | entity_id | field_id | field_name | field_value | field_unit |
    | ------- | ------------ | --------- | -------- | ---------- | ----------- | ---------- |

- entity_docs - stores information about the contract documents for each entity.
  constraints:

  - pk: (dept_id, statistic_id, entity_id, doc_id)
  - fk: (dept_id, dept_master) -> (dept_id, contract_documents)
  - fk: (statistic_id, dept_statistic) -> (statistic_id, contract_documents)
  - fk: (entity_id, dept_entity) -> (entity_id, contract_documents)

  | dept_id | statistic_id | entity_id | doc_id | doc_name | doc_path | created_at | doc_type |
  | ------- | ------------ | --------- | ------ | -------- | -------- | ---------- | mpr/dpr/cdoc |

- entity_correspondence - stores info about correspondences with contractor and other stake holders
  constraints:

  - pk: (dept_id, statistic_id, entity_id, correspondence_id)
  - fk: (dept_id, dept_master) -> (dept_id, entity_correspondence_contractor)
  - fk: (statistic_id, dept_statistic) -> (statistic_id, entity_correspondence_contractor)
  - fk: (entity_id, dept_entity) -> (entity_id, entity_correspondence_contractor)

| dept_id | statistic_id | entity_id | subject | from | to | created_at | correspondence_date | doc_path | correspondence_id | correspondence_type |
| ------- | ------------ | --------- | ------- | ---- | --- | ---------- | ------------------- | -------- | ----------------- | contractor/other |

- tariff_petition - yet to be decided.
