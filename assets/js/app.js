document.addEventListener("DOMContentLoaded", async () => {
  // Wait for translations so the first render already uses the right language
  await window.I18n.ready;
  const I18n = window.I18n;

  // Register the fcose plugin safely
  if (typeof cytoscape !== "undefined" && typeof fcose !== "undefined") {
    cytoscape.use(fcose);
  }

  const cyContainer = document.getElementById("cy");
  if (!cyContainer) {
    console.error("Error: the '#cy' container was not found in the DOM.");
    return;
  }

  try {
    console.log("Fetching data:", window.GRAPH_DATA_URL);
    const response = await fetch(window.GRAPH_DATA_URL);
    if (!response.ok) {
      throw new Error(`graph.json could not be loaded! HTTP status: ${response.status} (${response.statusText})`);
    }

    const rawData = await response.json();
    console.log("Raw data:", rawData);

    const cfg = rawData.settings || {};
    const typeColors = cfg.type_colors || {};
    const nodeDefaults = cfg.nodes || {};
    const layoutCfg = cfg.layout || {};

    const nodeSet = new Map();
    const registeredTypes = new Set();
    const rawEdges = rawData.edges || [];

    // 1. Register nodes. Translation files share the id of the original,
    //    so each id collects a list of language variants.
    const variantMap = new Map();
    (rawData.nodes || []).forEach(n => {
      if (!n || !n.data || !n.data.id) return;
      const id = String(n.data.id).trim();
      if (!variantMap.has(id)) variantMap.set(id, []);
      variantMap.get(id).push(n.data);
      if (n.data.type) registeredTypes.add(n.data.type);
    });

    variantMap.forEach((variants, id) => {
      const base = variants.find(v => !v.is_translation) || variants[0];
      const initial = I18n.pick(variants);
      nodeSet.set(id, {
        id: id,
        label: initial.label,
        type: initial.type,
        content: initial.content,
        url: initial.url,
        // Language-independent fields come from the original file
        color: base.color,
        image: base.image,
        size_mode: base.size_mode,
        isGhost: false,
        news: base.news || []
      });
    });

    // 2. Detect missing (ghost) nodes
    rawEdges.forEach(e => {
      if (!e || !e.data) return;
      const src = String(e.data.source || "").trim();
      const tgt = String(e.data.target || "").trim();

      [src, tgt].forEach(nodeId => {
        if (nodeId && !nodeSet.has(nodeId)) {
          nodeSet.set(nodeId, {
            id: nodeId,
            label: nodeId,
            type: "ghost",
            color: nodeDefaults.ghost_color || "#475569",
            image: "",
            size_mode: "fixed",
            isGhost: true
          });
          registeredTypes.add("ghost");
        }
      });
    });

    // 3. Reciprocal relation map (A->B and B->A both declared)
    const relationKeys = new Set();
    rawEdges.forEach(e => {
      if (e && e.data) {
        relationKeys.add(`${String(e.data.source).trim()}->${String(e.data.target).trim()}`);
      }
    });

    // 4. Process edges. Visual options are resolved in edge-options.js
    let edgeCounter = 0;
    const finalEdges = [];
    rawEdges.forEach(e => {
      if (!e || !e.data || !e.data.source || !e.data.target) return;
      edgeCounter++;
      const src = String(e.data.source).trim();
      const tgt = String(e.data.target).trim();
      const rel = e.data.rel || {};

      finalEdges.push({
        data: {
          id: `e_${edgeCounter}_${src}_${tgt}`,
          source: src,
          target: tgt,
          ...window.EdgeOptions.resolve(rel, {
            edgeDefaults: cfg.edges,
            isReciprocal: relationKeys.has(`${tgt}->${src}`)
          })
        }
      });
    });

    // 5. Degree and size calculation
    const degreeMap = new Map();
    finalEdges.forEach(e => {
      degreeMap.set(e.data.source, (degreeMap.get(e.data.source) || 0) + 1);
      degreeMap.set(e.data.target, (degreeMap.get(e.data.target) || 0) + 1);
    });

    const finalNodes = Array.from(nodeSet.values()).map(n => {
      const deg = degreeMap.get(n.id) || 1;
      const minS = nodeDefaults.min_size || 32;
      const maxS = nodeDefaults.max_size || 84;
      const fixedS = nodeDefaults.fixed_size || 36;
      
      const computedSize = n.size_mode === "fixed" ? fixedS : Math.min(maxS, Math.max(minS, minS + deg * 7));

      let resolvedColor = nodeDefaults.default_color || "#0284c7";
      if (n.color && n.color.trim() !== "") {
        resolvedColor = n.color;
      } else if (typeColors[n.type]) {
        resolvedColor = typeColors[n.type];
      }

      return {
        data: {
          ...n,
          computedSize: computedSize,
          bgColor: resolvedColor
        }
      };
    });

    if (finalNodes.length === 0) {
      console.warn("Warning: no nodes to display. Check the files under _nodes/.");
    }

    // 6. Initialize Cytoscape
    const activeLayout = (typeof cytoscape('core', 'fcose') === 'function') ? 'fcose' : 'cose';

    const cy = cytoscape({
      container: cyContainer,
      elements: {
        nodes: finalNodes,
        edges: finalEdges
      },
      style: [
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "color": "#f8fafc",
            "font-size": "11px",
            "text-valign": "bottom",
            "text-margin-y": 6,
            "width": "data(computedSize)",
            "height": "data(computedSize)",
            "background-color": "data(bgColor)",
            "border-width": 2,
            "border-color": nodeDefaults.border_color || "#0f172a"
          }
        },
        {
          selector: 'node[image][image != ""]',
          style: {
            "background-image": "data(image)",
            "background-fit": "cover",
            "border-color": "#38bdf8",
            "border-width": 2
          }
        },
        {
          selector: "edge",
          style: window.EdgeOptions.edgeStyle
        },
        {
          selector: ".dimmed",
          style: { "opacity": 0.12 }
        },
        {
          selector: ".highlighted",
          style: {
            "opacity": 1,
            "border-width": 4,
            "border-color": "#38bdf8"
          }
        }
      ],
      layout: {
        name: activeLayout,
        animate: false,
        randomize: true,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: layoutCfg.node_repulsion || 4500,
        idealEdgeLength: layoutCfg.ideal_edge_length || 100
      }
    });

    // 7. Language-dependent content (labels, type names, node texts)
    const typeFilter = document.getElementById("type-filter");
    const typeLabel = (t) => I18n.t(`type.${t}`, null, t);
    let selectedNodeId = null;

    const applyNodeLanguage = () => {
      cy.nodes().forEach(node => {
        const id = node.id();
        const variants = variantMap.get(id);
        if (variants) {
          const v = I18n.pick(variants);
          node.data({ label: v.label, type: v.type, content: v.content, url: v.url, lang: v.lang });
        } else {
          node.data({
            label: id,
            content: I18n.t("ghost_content", { id: id })
          });
        }
      });
    };

    const rebuildTypeFilter = () => {
      const previous = typeFilter.value || "ALL";
      typeFilter.innerHTML = "";
      const all = document.createElement("option");
      all.value = "ALL";
      all.textContent = I18n.t("all_types");
      typeFilter.appendChild(all);
      registeredTypes.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = typeLabel(t).toUpperCase();
        typeFilter.appendChild(opt);
      });
      typeFilter.value = Array.from(typeFilter.options).some(o => o.value === previous) ? previous : "ALL";
    };

    typeFilter.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "ALL") {
        cy.elements().removeClass("dimmed highlighted");
      } else {
        cy.elements().addClass("dimmed").removeClass("highlighted");
        const matched = cy.nodes(`[type = "${val}"]`);
        matched.removeClass("dimmed");
        matched.neighborhood().removeClass("dimmed");
      }
    });

    // 8. Search
    document.getElementById("search-input").addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        cy.elements().removeClass("dimmed highlighted");
        return;
      }
      cy.elements().addClass("dimmed").removeClass("highlighted");
      const matched = cy.nodes().filter(n => {
        const lbl = (n.data("label") || "").toLowerCase();
        const id = (n.data("id") || "").toLowerCase();
        return lbl.includes(query) || id.includes(query);
      });
      matched.removeClass("dimmed");
      matched.neighborhood().removeClass("dimmed");
    });

    // 9. Sidebar and focus mode
    const sidebar = document.getElementById("sidebar");
    const sidebarHero = document.getElementById("sidebar-hero");
    const sidebarMeta = document.getElementById("sidebar-meta");
    const sidebarContent = document.getElementById("sidebar-content");
    const sidebarSourceLink = document.getElementById("sidebar-source-link");

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    // News entries are grouped by `ref` (translations of one post share it)
    const renderNews = (news) => {
      const groups = new Map();
      (news || []).forEach(item => {
        if (!groups.has(item.ref)) groups.set(item.ref, []);
        groups.get(item.ref).push(item);
      });
      if (groups.size === 0) return "";
      const items = Array.from(groups.values()).map(variants => {
        const post = I18n.pick(variants);
        return `<li style="margin-bottom: 8px;"><a href="${escapeHtml(post.url)}" target="_blank" style="color: #38bdf8; text-decoration: none;">${escapeHtml(post.title)}</a></li>`;
      }).join("");
      return `<br><hr><h4>${I18n.t("related_news")}</h4><ul style="margin-left:20px; font-size:14px; padding-left: 10px;">${items}</ul>`;
    };

    const renderSidebar = (node) => {
      const data = node.data();
      sidebarHero.innerHTML = data.image ? `<img src="${escapeHtml(data.image)}" class="featured" alt="${escapeHtml(data.label)}">` : "";
      sidebarMeta.innerHTML = `<h1>${escapeHtml(data.label)}</h1><span class="badge">${escapeHtml(typeLabel(data.type))}</span>`;
      sidebarContent.innerHTML = (data.content || I18n.t("no_details")) + renderNews(data.news);
      sidebarSourceLink.innerHTML = data.isGhost
        ? `<span>${I18n.t("ghost_status")}</span>`
        : `<a href="${escapeHtml(data.url)}" target="_blank">${I18n.t("open_page")} &rarr;</a>`;
    };

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      selectedNodeId = node.id();

      cy.elements().addClass("dimmed").removeClass("highlighted");
      node.removeClass("dimmed").addClass("highlighted");
      node.neighborhood().removeClass("dimmed");

      renderSidebar(node);
      sidebar.classList.remove("hidden");
    });

    // Re-render everything that depends on the selected language
    const onLanguageChange = () => {
      applyNodeLanguage();
      rebuildTypeFilter();
      if (selectedNodeId) {
        const selected = cy.getElementById(selectedNodeId);
        if (selected.nonempty()) renderSidebar(selected);
      }
    };
    document.addEventListener("i18n:change", onLanguageChange);
    onLanguageChange();

    document.getElementById("close-sidebar-btn").addEventListener("click", () => {
      selectedNodeId = null;
      sidebar.classList.add("hidden");
      cy.elements().removeClass("dimmed highlighted");
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        selectedNodeId = null;
        sidebar.classList.add("hidden");
        cy.elements().removeClass("dimmed highlighted");
      }
    });

    document.getElementById("reset-view-btn").addEventListener("click", () => {
      cy.animate({ fit: { padding: 40 } }, { duration: 400 });
    });

  } catch (err) {
    console.error("An error occurred while initializing the network map:", err);
  }
});