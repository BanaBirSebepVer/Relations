/*
 * Resolves the visual options of a relation (edge) declared in a node's front matter
 * into Cytoscape.js edge data. Every option is optional; invalid values fall back
 * to the defaults with a console warning.
 *
 * The supported values mirror the Cytoscape.js edge style reference:
 * https://js.cytoscape.org/#style/edge-line, /edge-arrow, /labels
 * and are documented for contributors in CONTRIBUTING.md.
 */
(function () {
  const CURVE_STYLES = [
    "bezier", "unbundled-bezier", "haystack", "straight", "straight-triangle",
    "segments", "taxi", "round-taxi"
  ];
  const LINE_STYLES = ["solid", "dashed", "dotted"];
  const LINE_CAPS = ["butt", "round", "square"];
  const ARROW_SHAPES = [
    "none", "triangle", "triangle-tee", "circle-triangle", "triangle-cross",
    "triangle-backcurve", "vee", "tee", "square", "circle", "diamond", "chevron"
  ];
  const ARROW_FILLS = ["filled", "hollow"];
  const TAXI_DIRECTIONS = [
    "auto", "vertical", "horizontal", "upward", "downward", "leftward", "rightward"
  ];
  const LABEL_ROTATIONS = ["none", "autorotate"];

  const pickEnum = (value, allowed, fallback, field) => {
    if (value === undefined || value === null || value === "") return fallback;
    if (allowed.includes(value)) return value;
    console.warn(`Invalid value "${value}" for "${field}". Allowed: ${allowed.join(", ")}. Using "${fallback}".`);
    return fallback;
  };

  const pickNumber = (value, fallback) => {
    const n = Number(value);
    return value === undefined || value === null || value === "" || Number.isNaN(n) ? fallback : n;
  };

  /**
   * @param {object} rel       Relation object from the front matter.
   * @param {object} ctx       { edgeDefaults, isReciprocal }
   * @returns {object}         Data fields consumed by the Cytoscape stylesheet.
   */
  function resolve(rel, ctx) {
    const d = (ctx && ctx.edgeDefaults) || {};
    const color = rel.edge_color || d.default_color || "#64748b";

    // Direction decides the default arrows; explicit arrow options override it.
    const direction = rel.direction || "auto";
    const isDirected = direction === "directed" || (direction === "auto" && !(ctx && ctx.isReciprocal));
    const defaultTarget = isDirected ? "triangle" : "none";

    const lineStyleDefault = rel.evidence === "alleged" ? "dashed" : (d.default_line_style || "solid");

    let labelRotation = rel.label_rotation;
    if (labelRotation !== undefined && labelRotation !== "" && !LABEL_ROTATIONS.includes(labelRotation)) {
      const deg = Number(labelRotation);
      labelRotation = Number.isNaN(deg) ? "none" : `${deg}deg`;
      if (labelRotation === "none") console.warn(`Invalid "label_rotation" value. Using "none".`);
    }

    return {
      label: rel.label !== undefined && rel.label !== null ? String(rel.label) : "",
      sourceLabel: rel.source_label ? String(rel.source_label) : "",
      targetLabel: rel.target_label ? String(rel.target_label) : "",
      weight: pickNumber(rel.weight, 1),
      color: color,
      opacity: pickNumber(rel.opacity, d.default_opacity !== undefined ? d.default_opacity : 0.8),

      lineStyle: pickEnum(rel.line_style, LINE_STYLES, lineStyleDefault, "line_style"),
      lineCap: pickEnum(rel.line_cap, LINE_CAPS, "butt", "line_cap"),
      curveStyle: pickEnum(rel.curve_style, CURVE_STYLES, d.default_curve_style || "bezier", "curve_style"),

      sourceArrow: pickEnum(rel.source_arrow, ARROW_SHAPES, "none", "source_arrow"),
      targetArrow: pickEnum(rel.target_arrow, ARROW_SHAPES, defaultTarget, "target_arrow"),
      midSourceArrow: pickEnum(rel.mid_source_arrow, ARROW_SHAPES, "none", "mid_source_arrow"),
      midTargetArrow: pickEnum(rel.mid_target_arrow, ARROW_SHAPES, "none", "mid_target_arrow"),
      arrowFill: pickEnum(rel.arrow_fill, ARROW_FILLS, "filled", "arrow_fill"),
      arrowScale: pickNumber(rel.arrow_scale, 1),

      labelColor: rel.label_color || "#e2e8f0",
      labelSize: pickNumber(rel.label_size, 10),
      labelRotation: labelRotation || "autorotate",
      labelBackground: rel.label_background || "#090d16",

      controlPointStepSize: pickNumber(rel.control_point_step_size, 40),
      controlPointDistance: pickNumber(rel.control_point_distance, 20),
      controlPointWeight: pickNumber(rel.control_point_weight, 0.5),
      segmentDistance: pickNumber(rel.segment_distance, 20),
      segmentWeight: pickNumber(rel.segment_weight, 0.5),
      taxiDirection: pickEnum(rel.taxi_direction, TAXI_DIRECTIONS, "auto", "taxi_direction"),
      taxiTurn: pickNumber(rel.taxi_turn, 50)
    };
  }

  /** Cytoscape stylesheet entry for edges (everything is read from the resolved data). */
  const edgeStyle = {
    "label": "data(label)",
    "source-label": "data(sourceLabel)",
    "target-label": "data(targetLabel)",
    "font-size": "data(labelSize)",
    "color": "data(labelColor)",
    "text-rotation": "data(labelRotation)",
    "text-background-color": "data(labelBackground)",
    "text-background-opacity": 1,
    "text-background-padding": 2,
    "source-text-offset": 18,
    "target-text-offset": 18,

    "width": "data(weight)",
    "line-color": "data(color)",
    "line-style": "data(lineStyle)",
    "line-cap": "data(lineCap)",
    "line-opacity": "data(opacity)",
    "curve-style": "data(curveStyle)",

    "source-arrow-shape": "data(sourceArrow)",
    "target-arrow-shape": "data(targetArrow)",
    "mid-source-arrow-shape": "data(midSourceArrow)",
    "mid-target-arrow-shape": "data(midTargetArrow)",
    "source-arrow-color": "data(color)",
    "target-arrow-color": "data(color)",
    "mid-source-arrow-color": "data(color)",
    "mid-target-arrow-color": "data(color)",
    "source-arrow-fill": "data(arrowFill)",
    "target-arrow-fill": "data(arrowFill)",
    "mid-source-arrow-fill": "data(arrowFill)",
    "mid-target-arrow-fill": "data(arrowFill)",
    "arrow-scale": "data(arrowScale)",

    "control-point-step-size": "data(controlPointStepSize)",
    "control-point-distances": "data(controlPointDistance)",
    "control-point-weights": "data(controlPointWeight)",
    "segment-distances": "data(segmentDistance)",
    "segment-weights": "data(segmentWeight)",
    "taxi-direction": "data(taxiDirection)",
    "taxi-turn": "data(taxiTurn)"
  };

  window.EdgeOptions = {
    resolve, edgeStyle, pickEnum, pickNumber,
    CURVE_STYLES, LINE_STYLES, LINE_CAPS, ARROW_SHAPES, ARROW_FILLS, TAXI_DIRECTIONS, LABEL_ROTATIONS
  };
})();
