document.addEventListener("DOMContentLoaded", async () => {
  // fcose eklentisini güvenli bir şekilde kaydet
  if (typeof cytoscape !== "undefined" && typeof fcose !== "undefined") {
    cytoscape.use(fcose);
  }

  const cyContainer = document.getElementById("cy");
  if (!cyContainer) {
    console.error("Hata: '#cy' kapsayıcısı DOM üzerinde bulunamadı.");
    return;
  }

  try {
    console.log("Veri çekiliyor:", window.GRAPH_DATA_URL);
    const response = await fetch(window.GRAPH_DATA_URL);
    if (!response.ok) {
      throw new Error(`graph.json dosyası yüklenemedi! HTTP Kodu: ${response.status} (${response.statusText})`);
    }

    const rawData = await response.json();
    console.log("Çekilen Ham Veri:", rawData);

    const cfg = rawData.settings || {};
    const typeColors = cfg.type_colors || {};
    const nodeDefaults = cfg.nodes || {};
    const layoutCfg = cfg.layout || {};

    const nodeSet = new Map();
    const registeredTypes = new Set();
    const rawEdges = rawData.edges || [];

    // 1. Düğümleri Kaydet
    (rawData.nodes || []).forEach(n => {
      if (!n || !n.data || !n.data.id) return;
      const id = String(n.data.id).trim();
      nodeSet.set(id, {
        ...n.data,
        id: id,
        isGhost: false
      });
      if (n.data.type) registeredTypes.add(n.data.type);
    });

    // 2. Eksik (Hayalet) Düğümleri Tespit Et
    rawEdges.forEach(e => {
      if (!e || !e.data) return;
      const src = String(e.data.source || "").trim();
      const tgt = String(e.data.target || "").trim();

      [src, tgt].forEach(nodeId => {
        if (nodeId && !nodeSet.has(nodeId)) {
          nodeSet.set(nodeId, {
            id: nodeId,
            label: nodeId,
            type: "taslak",
            color: nodeDefaults.ghost_color || "#475569",
            image: "",
            size_mode: "fixed",
            isGhost: true,
            content: `Bu düğüm henüz detaylandırılmamıştır.<br><br>Katkıda bulunmak için <code>_nodes/</code> dizinine <strong>${nodeId}.md</strong> ekleyebilirsiniz.`
          });
          registeredTypes.add("taslak");
        }
      });
    });

    // 3. Karşılıklı İlişki (Mutual) Haritası
    const relationKeys = new Set();
    rawEdges.forEach(e => {
      if (e && e.data) {
        relationKeys.add(`${String(e.data.source).trim()}->${String(e.data.target).trim()}`);
      }
    });

    // 4. Kenarları İşle
    let edgeCounter = 0;
    const finalEdges = [];
    rawEdges.forEach(e => {
      if (!e || !e.data || !e.data.source || !e.data.target) return;
      edgeCounter++;
      const src = String(e.data.source).trim();
      const tgt = String(e.data.target).trim();
      const dir = e.data.direction;

      let arrowShape = "triangle";
      if (dir === "directed") {
        arrowShape = "triangle";
      } else if (dir === "none") {
        arrowShape = "none";
      } else if (dir === "mutual" || (dir === "auto" && relationKeys.has(`${tgt}->${src}`))) {
        arrowShape = "none";
      }

      let lineStyle = (e.data.evidence === "iddia") ? "dashed" : "solid";

      finalEdges.push({
        data: {
          id: `e_${edgeCounter}_${src}_${tgt}`,
          source: src,
          target: tgt,
          label: e.data.label || "",
          weight: Number(e.data.weight) || 1,
          color: e.data.edge_color || (cfg.edges && cfg.edges.default_color) || "#64748b",
          targetArrowShape: arrowShape,
          lineStyle: lineStyle
        }
      });
    });

    // 5. Derece ve Boyut Hesaplama
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
      console.warn("Uyarı: Gösterilecek hiçbir düğüm (node) bulunamadı. _nodes/ altındaki dosyaları kontrol edin.");
    }

    // 6. Cytoscape Başlatma
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
          style: {
            "width": "data(weight)",
            "line-color": "data(color)",
            "target-arrow-color": "data(color)",
            "target-arrow-shape": "data(targetArrowShape)",
            "curve-style": "bezier",
            "line-style": "data(lineStyle)",
            "opacity": 0.8
          }
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

    // 7. Filtre Menüsü Doldurma
    const typeFilter = document.getElementById("type-filter");
    registeredTypes.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t.toUpperCase();
      typeFilter.appendChild(opt);
    });

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

    // 8. Arama
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

    // 9. Sidebar ve Focus Modu
    const sidebar = document.getElementById("sidebar");
    const sidebarHero = document.getElementById("sidebar-hero");
    const sidebarMeta = document.getElementById("sidebar-meta");
    const sidebarContent = document.getElementById("sidebar-content");
    const sidebarSourceLink = document.getElementById("sidebar-source-link");

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      const data = node.data();

      cy.elements().addClass("dimmed").removeClass("highlighted");
      node.removeClass("dimmed").addClass("highlighted");
      node.neighborhood().removeClass("dimmed");

      sidebarHero.innerHTML = data.image ? `<img src="${data.image}" class="featured" alt="${data.label}">` : "";
      sidebarMeta.innerHTML = `<h1>${data.label}</h1><span class="badge">${data.type}</span>`;
      sidebarContent.innerHTML = data.content || "Detay bulunamadı.";
      sidebarSourceLink.innerHTML = data.isGhost
        ? `<span>Durum: Henüz dosyası açılmamış taslak düğüm</span>`
        : `<a href="${data.url}" target="_blank">Ayrı Sayfada Aç / Kaynağı İncele &rarr;</a>`;

      sidebar.classList.remove("hidden");
    });

    document.getElementById("close-sidebar-btn").addEventListener("click", () => {
      sidebar.classList.add("hidden");
      cy.elements().removeClass("dimmed highlighted");
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        sidebar.classList.add("hidden");
        cy.elements().removeClass("dimmed highlighted");
      }
    });

    document.getElementById("reset-view-btn").addEventListener("click", () => {
      cy.animate({ fit: { padding: 40 } }, { duration: 400 });
    });

  } catch (err) {
    console.error("Ağ haritası başlatılırken hata oluştu:", err);
  }
});