---
id: "bob-example"
title: "Bob Example"
type: "person"
lang: "en"

relations:
  - target: "acme-corp"
    type: "employee"
    label: "CEO"
    weight: 3
    evidence: "documented"
    direction: "directed"
    start_date: "2020"

  - target: "launch-event"
    type: "speaker"
    weight: 1
    evidence: "documented"

  - target: "alice-example"
    type: "colleague"
    label: "works with"
    weight: 2
    evidence: "documented"
    direction: "mutual"
---

## Biography
Bob is a fictional person used to demonstrate the template.
