# Contributing Guide

This project follows the principles of investigative journalism and open source data archiving. To add a new person, organization, event or relation, follow the steps below. Code, comments and documentation in this repository are written in English.

## 1. Create a New File
- Add your nodes under a topic subdirectory of `_nodes/` (e.g. `_nodes/people/first-last.md`).
- File names must consist of lowercase letters and hyphens (`-`) only.

## 2. Required Fields
Every file must start with the following YAML block:

```yaml
---
id: "same-id-as-the-file-name"
title: "Full Display Name"
type: "person" # or organization, fund, event
lang: "en"     # language of this file (optional, defaults to default_lang)
color: "#HEXCODE" # Optional
relations:
  - target: "target-id"
    type: "partner"
    weight: 4 # 1-5
    evidence: "official_record" # alleged, documented, official_record
---
```

See [template.md](template.md) for every available field, [Edge options](#5-edge-options) for relation styling and [Node options](#6-node-options) for node styling.

## 3. Translating Content
To translate a node or a post, add a file next to the original named `<original-name>.<lang>.md` and declare the original with `translation_of`:

```yaml
---
translation_of: "first-last"   # slug (file name without extension) of the original
lang: "tr"
title: "Translated title"
type: "person"
---
Translated body text...
```

- Relations, colors and images are read from the original file only.
- Translated **posts** must repeat `related_nodes` and use the original post's slug (file name without the date and extension) in `translation_of`.

## 4. Adding a New Interface Language
1. Copy `_data/i18n/en.yml` to `_data/i18n/<code>.yml` (use an ISO 639-1 code, e.g. `fr`).
2. Translate the values; keep the keys and `{placeholders}` unchanged. Set `language_name`, `dir` (`ltr` or `rtl`) and `date_format`.
3. Open a pull request. The language appears in the switcher automatically, no code change is needed.

## 5. Edge Options

Each item in `relations` describes one edge (a line) from the current node to one or more targets. Every option except `target`/`targets` is optional, and every value below is passed to Cytoscape.js ([edge style reference](https://js.cytoscape.org/#style/edges)). An invalid value is ignored with a warning in the browser console.

```yaml
relations:
  - target: "other-node"        # or: targets: ["a", "b", "c"]
    type: "partner"             # semantic category (data only, never drawn)
    label: "works with"         # text drawn on the line
    weight: 3                   # line width
    curve_style: "taxi"
    target_arrow: "vee"
```

### 5.1 Core options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `target` / `targets` | node id / list of ids | required | Node(s) the edge points to. Ids without a file become draft ("ghost") nodes. |
| `type` | any text | none | Semantic category of the relation. Not drawn; use `label` for visible text. |
| `weight` | number (1-5 suggested) | `1` | Line width in pixels. |
| `evidence` | `alleged`, `documented`, `official_record`, any text | `documented` | Evidence level. `alleged` draws a dashed line unless `line_style` is set. |
| `direction` | `directed`, `mutual`, `none`, `auto` | `auto` | Default arrows. `directed`: arrow at the target. `mutual` / `none`: plain line. `auto`: arrow, unless the target node also declares a link back (then a plain line). |
| `edge_color` | HEX / CSS color | `edges.default_color` | Color of the line and its arrows. |
| `opacity` | `0` - `1` | `0.8` | Line opacity. |
| `start_date`, `end_date` | `YYYY` or `YYYY-MM` | none | Optional time span (data only). |

### 5.2 Line options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `line_style` | `solid`, `dashed`, `dotted` | `solid` (`dashed` for `alleged`) | Stroke pattern. |
| `line_cap` | `butt`, `round`, `square` | `butt` | Shape of the line ends. Visible on thick or dotted lines. |
| `curve_style` | see below | `bezier` | How the line is routed between the nodes. |

`curve_style` values:

| Value | Definition | Extra options |
| --- | --- | --- |
| `bezier` | Curved line; several edges between the same nodes are spread automatically. | `control_point_step_size` (spacing, default `40`) |
| `unbundled-bezier` | Bezier with one custom control point. | `control_point_distance` (default `20`), `control_point_weight` (`0`-`1`, default `0.5`) |
| `haystack` | Fast straight line that does not end at the node center. Best for very dense graphs. | none |
| `straight` | Straight line between node centers. | none |
| `straight-triangle` | Straight line that ends in a triangle (use with `target_arrow`). | none |
| `segments` | Polyline with a custom bend. | `segment_distance` (default `20`), `segment_weight` (`0`-`1`, default `0.5`) |
| `taxi` | Right-angled (orthogonal) line. | `taxi_direction`: `auto`, `vertical`, `horizontal`, `upward`, `downward`, `leftward`, `rightward` (default `auto`); `taxi_turn` (distance of the bend in px, default `50`) |
| `round-taxi` | `taxi` with rounded corners. | same as `taxi` |

### 5.3 Arrow options

An edge has four arrow positions: `source_arrow` (start of the line), `target_arrow` (end of the line), `mid_source_arrow` and `mid_target_arrow` (middle of the line, pointing towards the source/target). If you set none of them, `direction` decides the default (`target_arrow: triangle` or `none`).

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `source_arrow`, `target_arrow`, `mid_source_arrow`, `mid_target_arrow` | `none`, `triangle`, `triangle-tee`, `circle-triangle`, `triangle-cross`, `triangle-backcurve`, `vee`, `tee`, `square`, `circle`, `diamond`, `chevron` | `none` (`target_arrow` follows `direction`) | Arrow shape at that position. |
| `arrow_fill` | `filled`, `hollow` | `filled` | Fill of all arrows of the edge. |
| `arrow_scale` | number | `1` | Arrow size multiplier. |

### 5.4 Label options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `label` | text | none | Text drawn at the middle of the line. |
| `source_label` | text | none | Text drawn near the source end. |
| `target_label` | text | none | Text drawn near the target end. |
| `label_color` | HEX / CSS color | `#e2e8f0` | Text color. |
| `label_size` | number (px) | `10` | Font size. |
| `label_background` | HEX / CSS color | `#090d16` | Background behind the text (keeps it readable over lines). |
| `label_rotation` | `autorotate`, `none`, or a number of degrees | `autorotate` | `autorotate` follows the line, `none` keeps the text horizontal, a number rotates it by that angle. |

### 5.5 Global defaults

Defaults for every edge can be changed under `edges:` in [_data/settings.yml](_data/settings.yml): `default_color`, `default_curve_style`, `default_line_style` and `default_opacity`.

### 5.6 Examples

The repository ships working examples of every option above. Run the site and open the teal "Edge Showcase" nodes, or read their source:

| Capability | Example file |
| --- | --- |
| All 8 `curve_style` values and their extra options | [_nodes/examples/curve-styles-demo.md](_nodes/examples/curve-styles-demo.md) |
| All 12 arrow shapes, source/target arrows, `arrow_fill`, `arrow_scale`, middle arrows | [_nodes/examples/arrow-shapes-demo.md](_nodes/examples/arrow-shapes-demo.md) |
| `line_style`, `line_cap`, `weight`, `edge_color`, `opacity`, and every label option | [_nodes/examples/line-and-label-demo.md](_nodes/examples/line-and-label-demo.md) |
| `direction`, `evidence`, `targets`, ghost nodes, dates | [_nodes/people/alice-example.md](_nodes/people/alice-example.md), [_nodes/organizations/acme-corp.md](_nodes/organizations/acme-corp.md), [_nodes/funds/example-fund.md](_nodes/funds/example-fund.md) |
| Node translations (`translation_of`) | [_nodes/people/alice-example.tr.md](_nodes/people/alice-example.tr.md) |

## 6. Node Options

Nodes are styled with optional front matter fields, placed next to `title` and `type`. Values are passed to Cytoscape.js ([node style reference](https://js.cytoscape.org/#style/node-body)). Invalid values are ignored with a warning in the browser console. Visual options are always read from the original file, not from translation files.

```yaml
---
id: "acme-corp"
title: "Acme Corp"
type: "organization"
shape: "round-hexagon"
color: "#7c3aed"
border_style: "dashed"
border_width: 4
label_position: "top"
parent: "holding-group"
---
```

### 6.1 Shape, size and color

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `shape` | `ellipse`, `triangle`, `round-triangle`, `rectangle`, `round-rectangle`, `bottom-round-rectangle`, `cut-rectangle`, `barrel`, `rhomboid`, `diamond`, `round-diamond`, `pentagon`, `round-pentagon`, `hexagon`, `round-hexagon`, `concave-hexagon`, `heptagon`, `round-heptagon`, `octagon`, `round-octagon`, `star`, `tag`, `round-tag`, `vee` | per type in `type_shapes`, else `nodes.default_shape` (`ellipse`) | Outline of the node. |
| `color` | HEX / CSS color | per type in `type_colors`, else `nodes.default_color` | Fill color. |
| `size_mode` | `auto`, `fixed` | `auto` | `auto` sizes the node by its number of connections, `fixed` uses `nodes.fixed_size`. |
| `width`, `height` | number (px) | automatic size | Override the automatic size. Use different values for non-square nodes. |
| `opacity` | `0` - `1` | `1` | Opacity of the whole node. |

### 6.2 Border options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `border_width` | number (px) | `2` | Border thickness. |
| `border_color` | HEX / CSS color | `nodes.border_color` (`#38bdf8` when the node has an image) | Border color. |
| `border_style` | `solid`, `dotted`, `dashed`, `double` | `solid` | Border pattern. `double` needs a `border_width` of about 6 or more to be visible. |

### 6.3 Label options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `label_position` | `top`, `center`, `bottom` | `bottom` | Where the title is drawn relative to the node. |
| `label_color` | HEX / CSS color | `#f8fafc` | Text color. |
| `label_size` | number (px) | `11` | Font size. |

### 6.4 Image options

| Option | Values | Default | Definition |
| --- | --- | --- | --- |
| `image` | URL or site path | none | Picture drawn inside the node and used as the sidebar cover. |
| `image_fit` | `cover`, `contain`, `none` | `cover` | `cover` fills the node and crops, `contain` shows the whole image, `none` keeps the original size. |
| `image_opacity` | `0` - `1` | `1` | Opacity of the image over the fill color. |

### 6.5 Compound (group) nodes

Set `parent` to the id of another node to draw the node inside it. The parent becomes a group box that is drawn around its children and labelled with its title. The parent can be a normal node file (it keeps its own relations and content) or an id without a file, which becomes a draft node. Do not make nodes parents of each other in a loop. Children without relations are arranged compactly inside the group.

```yaml
# _nodes/organizations/holding-group.md
id: "holding-group"
title: "Holding Group"
type: "organization"

# _nodes/organizations/subsidiary-a.md
id: "subsidiary-a"
title: "Subsidiary A"
type: "organization"
parent: "holding-group"
```

### 6.6 Global defaults

In [_data/settings.yml](_data/settings.yml): `nodes.default_color`, `nodes.border_color`, `nodes.default_shape`, `nodes.min_size`, `nodes.max_size`, `nodes.fixed_size`, `type_colors` (color per `type`) and `type_shapes` (shape per `type`). A value set in a node's own front matter always wins.

### 6.7 Examples

| Capability | Example files |
| --- | --- |
| All 24 `shape` values and a compound (group) node with `parent` | [_nodes/examples/node-shapes-group.md](_nodes/examples/node-shapes-group.md) and its children in [_nodes/examples/shapes/](_nodes/examples/shapes/) |
| `border_*`, `opacity`, `color`, `width`/`height`, `label_*`, `image_fit`, `image_opacity` | [_nodes/examples/node-styling-group.md](_nodes/examples/node-styling-group.md) and its children in [_nodes/examples/styling/](_nodes/examples/styling/) |
| Per-type shapes and colors (`type_shapes`, `type_colors`) | Alice, Bob, Acme Corp, Example Fund and Launch Event in `_nodes/` |

## 7. Starting Your Own Project from This Template
1. Fork or use this repository as a template and set `baseurl` (and `title`) in [_config.yml](_config.yml).
2. Delete the sample content: `_nodes/examples/`, `_nodes/people/*-example*`, `_nodes/organizations/acme-corp.md`, `_nodes/funds/example-fund.md`, `_nodes/events/launch-event.md` and the posts in `_posts/`.
3. Add your own nodes as described above.
