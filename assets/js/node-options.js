/*
 * Resolves the visual options of a node declared in its front matter into
 * Cytoscape.js node data. Every option is optional; invalid values fall back
 * to the defaults with a console warning. Documented for contributors in
 * CONTRIBUTING.md ("Node Options").
 *
 * Requires edge-options.js (shared value helpers).
 */
(function () {
  const { pickEnum, pickNumber } = window.EdgeOptions;

  const SHAPES = [
    "ellipse", "triangle", "round-triangle", "rectangle", "round-rectangle",
    "bottom-round-rectangle", "cut-rectangle", "barrel", "rhomboid", "diamond",
    "round-diamond", "pentagon", "round-pentagon", "hexagon", "round-hexagon",
    "concave-hexagon", "heptagon", "round-heptagon", "octagon", "round-octagon",
    "star", "tag", "round-tag", "vee"
  ];
  const BORDER_STYLES = ["solid", "dotted", "dashed", "double"];
  const LABEL_POSITIONS = ["top", "center", "bottom"];
  const IMAGE_FITS = ["cover", "contain", "none"];

  /**
   * @param {object} node  Language-independent node fields from graph.json.
   * @param {object} ctx   { nodeDefaults, typeShapes, type, computedSize, bgColor, hasImage }
   */
  function resolve(node, ctx) {
    const d = ctx.nodeDefaults || {};
    const typeShape = (ctx.typeShapes || {})[ctx.type];
    const size = ctx.computedSize;
    const hasImage = !!ctx.hasImage;

    return {
      shape: pickEnum(node.shape, SHAPES, typeShape || d.default_shape || "ellipse", "shape"),
      width: pickNumber(node.width, size),
      height: pickNumber(node.height, size),
      nodeOpacity: pickNumber(node.opacity, 1),
      borderWidth: pickNumber(node.border_width, 2),
      borderColor: node.border_color || (hasImage ? "#38bdf8" : (d.border_color || "#0f172a")),
      borderStyle: pickEnum(node.border_style, BORDER_STYLES, "solid", "border_style"),
      labelColor: node.label_color || "#f8fafc",
      labelSize: pickNumber(node.label_size, 11),
      labelPosition: pickEnum(node.label_position, LABEL_POSITIONS, "bottom", "label_position"),
      imageFit: pickEnum(node.image_fit, IMAGE_FITS, "cover", "image_fit"),
      imageOpacity: pickNumber(node.image_opacity, 1)
    };
  }

  /** Cytoscape stylesheet entries for nodes (everything is read from the resolved data). */
  const nodeStyles = [
    {
      selector: "node",
      style: {
        "label": "data(label)",
        "color": "data(labelColor)",
        "font-size": "data(labelSize)",
        "text-valign": "data(labelPosition)",
        "text-margin-y": 6,
        "shape": "data(shape)",
        "width": "data(width)",
        "height": "data(height)",
        "background-color": "data(bgColor)",
        "opacity": "data(nodeOpacity)",
        "border-width": "data(borderWidth)",
        "border-color": "data(borderColor)",
        "border-style": "data(borderStyle)"
      }
    },
    {
      selector: 'node[image][image != ""]',
      style: {
        "background-image": "data(image)",
        "background-fit": "data(imageFit)",
        "background-image-opacity": "data(imageOpacity)"
      }
    },
    {
      // Compound nodes: a node that other nodes name in `parent`
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-margin-y": -6,
        "shape": "round-rectangle",
        "background-opacity": 0.08,
        "border-style": "dashed",
        "padding": 24
      }
    }
  ];

  window.NodeOptions = { resolve, nodeStyles, SHAPES, BORDER_STYLES, LABEL_POSITIONS, IMAGE_FITS };
})();
