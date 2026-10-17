---
id: "line-and-label-demo"
title: "Edge Showcase: Lines and Labels"
type: "example"
lang: "en"

relations:
  - target: "line-solid"
    label: "line_style: solid"
    line_style: "solid"
    weight: 2
  - target: "line-dashed"
    label: "line_style: dashed"
    line_style: "dashed"
    weight: 2
  - target: "line-dotted"
    label: "line_style: dotted"
    line_style: "dotted"
    weight: 3
    line_cap: "round"
  - target: "line-thick-colored"
    label: "weight: 6 + edge_color"
    weight: 6
    edge_color: "#ef4444"
    opacity: 0.5
  - target: "label-colored"
    label: "Custom label"
    label_color: "#facc15"
    label_size: 14
    label_background: "#1e293b"
    weight: 2
  - target: "label-no-rotate"
    label: "label_rotation: none"
    label_rotation: "none"
    weight: 2
  - target: "label-angle"
    label: "label_rotation: -30"
    label_rotation: -30
    weight: 2
  - target: "label-ends"
    source_label: "source end"
    target_label: "target end"
    weight: 2
  - target: "alice-example"
    weight: 1
---

Line styles, caps, colors, opacity and label options.
