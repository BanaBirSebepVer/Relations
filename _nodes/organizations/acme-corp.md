---
id: "acme-corp"
title: "Acme Corp"
type: "organization"
lang: "en"

relations:
  - targets:
      - "example-fund"
      - "launch-event"
    type: "sponsor"
    label: "sponsors"
    weight: 3
    evidence: "official_record"
    edge_color: "#3b82f6"
---

## Overview
Acme Corp is a fictional organization. One relation can point to several targets with `targets`.
