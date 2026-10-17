---
id: "curve-styles-demo"
title: "Edge Showcase: Curve Styles"
type: "example"
lang: "en"

relations:
  - target: "curve-bezier"
    label: "curve_style: bezier"
    curve_style: "bezier"
    weight: 2
    direction: "directed"
  - target: "curve-unbundled-bezier"
    label: "curve_style: unbundled-bezier"
    curve_style: "unbundled-bezier"
    weight: 2
    control_point_distance: 40
    direction: "directed"
  - target: "curve-haystack"
    label: "curve_style: haystack"
    curve_style: "haystack"
    weight: 2
    direction: "directed"
  - target: "curve-straight"
    label: "curve_style: straight"
    curve_style: "straight"
    weight: 2
    direction: "directed"
  - target: "curve-straight-triangle"
    label: "curve_style: straight-triangle"
    curve_style: "straight-triangle"
    weight: 2
    direction: "directed"
  - target: "curve-segments"
    label: "curve_style: segments"
    curve_style: "segments"
    weight: 2
    segment_distance: 40
    direction: "directed"
  - target: "curve-taxi"
    label: "curve_style: taxi"
    curve_style: "taxi"
    weight: 2
    taxi_direction: "horizontal"
    direction: "directed"
  - target: "curve-round-taxi"
    label: "curve_style: round-taxi"
    curve_style: "round-taxi"
    weight: 2
    direction: "directed"
  - target: "alice-example"
    weight: 1
---

Every `curve_style` value supported by Cytoscape.js, one edge each. The targets are ghost nodes; they do not need files.

See the "Edge options" section of CONTRIBUTING.md.
