---
id: "example-fund"
title: "Example Fund"
type: "fund"
lang: "en"

relations:
  - target: "acme-corp"
    type: "investment"
    label: "invests in"
    weight: 2
    evidence: "documented"
    # `direction` is omitted ("auto"). Because acme-corp also declares a link to this
    # node, the pair is drawn as a plain line. With only one side declared, an arrow is drawn.
---

## Overview
Example Fund is a fictional fund.
