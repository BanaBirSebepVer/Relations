---
id: "alice-example"
title: "Alice Example"
type: "person"
image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
size_mode: "auto"
lang: "en"

relations:
  - target: "acme-corp"
    type: "founder"
    label: "founded"
    weight: 4
    evidence: "official_record"
    direction: "directed"
    start_date: "2018-05"

  - target: "bob-example"
    type: "colleague"
    label: "works with"
    weight: 2
    evidence: "documented"
    direction: "mutual"

  - target: "carol-draft"            # No file exists for this id: it is shown as a ghost node
    type: "acquaintance"
    weight: 1
    evidence: "alleged"             # "alleged" is drawn as a dashed line by default
---

## Biography
Alice is a fictional person used to demonstrate the template. Replace this text with your own research.

## Sources
- Add links to documents and sources here.
