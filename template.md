---
# ==========================================
# 1. IDENTITY AND APPEARANCE
# ==========================================
id: "x-fund"                                # Must match the file name (x-fund.md -> "x-fund")
title: "X Asset Management Fund"            # Full title shown in the graph and UI
type: "fund"                                # Free category (person, organization, event, paper, ...)
color: "#1e40af"                            # Node HEX color (falls back to the category default when empty)
image: "/assets/images/nodes/x-fund.jpg"    # Featured image (inside the Cytoscape node and as sidebar cover)
size_mode: "auto"                           # "auto" (dynamic by connection count) or "fixed" (standard)
lang: "en"                                  # Language of this file (defaults to `default_lang` in _config.yml)

# Optional node styling (full list: CONTRIBUTING.md, section "Node Options"; examples: _nodes/examples/)
# shape: "round-hexagon"                    # Any Cytoscape node shape
# border_style: "dashed"                    # solid, dotted, dashed, double
# border_width: 4
# border_color: "#facc15"
# label_position: "top"                     # top, center, bottom
# opacity: 0.8
# width: 80                                 # Override the automatic size
# height: 80
# image_fit: "cover"                        # cover, contain, none
# parent: "group-id"                        # Draw this node inside another (compound) node

# ==========================================
# 2. RELATIONS
# ==========================================
relations:
  # Example A: single target with explicit direction
  - target: "jane-doe"
    type: "co_founder"
    weight: 5                               # 1-5 line thickness
    evidence: "official_record"             # alleged, documented, official_record, ... (controls the line style)
    direction: "directed"                   # "directed" (source to target), "mutual" (both ways), "none" (undirected)
    edge_color: "#ef4444"                   # Optional custom edge color (HEX)
    start_date: "2021-03"                   # Optional timestamp (YYYY or YYYY-MM)
    end_date: "2023-11"

  # Example B: multiple targets (`targets`)
  # The attributes and direction rule apply to every target in the list
  - targets:
      - "john-roe"
      - "mary-major"
      - "z-bank"
    type: "investor"
    weight: 3
    evidence: "documented"
    direction: "directed"
    edge_color: "#3b82f6"

  # Example C: smart default (no `direction`)
  # A plain line if the other file also declares the link, a one-way arrow otherwise
  - target: "audit-board"
    type: "review"
    weight: 4
    evidence: "alleged"
---

The detailed text about the entity starts here.
When the node is clicked in the graph, the sidebar (80% of the screen) renders exactly this part.

## Overview
Archive records, indictment summaries and historical background can be written freely here.

## Sources and Documents
- Financial investigation report dated 12.05.2023 (Annex: 4)
- Related Trade Registry Gazette announcement

<!--
EDGE OPTIONS
Besides the options above, every relation accepts the Cytoscape.js edge options
(label, curve_style, line_style, source_arrow, target_arrow, mid_*_arrow, arrow_fill,
arrow_scale, label_color, label_size, label_rotation, ...).
Definitions: CONTRIBUTING.md, section "Edge Options". Examples: _nodes/examples/.

TRANSLATIONS
To translate this node, create `x-fund.<lang>.md` next to this file with only:

---
translation_of: "x-fund"
lang: "tr"
title: "Translated title"
type: "fund"
---
Translated body text...

Relations, colors and images are always read from the original file.
-->
