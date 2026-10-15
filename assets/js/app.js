document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(window.GRAPH_DATA_URL);
  const rawData = await response.json();

  const nodeSet = new Map();
  const edges = [];
  const registeredTypes = new Set();

  // 1. Düğümleri Kaydet
  rawData.nodes.forEach(n => {
    nodeSet.set(n.data.id, {
      ...n.data,
      isGhost: false
    });
    if (n.data.type) registeredTypes.add(n.data.type);
  });

  // 2. Çift Yön / Yönlülük Haritası
  const relationKeys = new Set();
  rawData.edges.forEach(e => {
    relationKeys.add(`${e.data.source}->${e.data.target}`);
  });

  // 3. Kenarları İşle ve Hayalet Düğümleri Yakala
  rawData.edges.forEach(e => {
    const src = e.data.source;
    const tgt = e.data.target;

    // Hedef düğüm dosyası yoksa Hayalet Düğüm oluştur
    if (!nodeSet.has(tgt)) {
      nodeSet.set(tgt, {
        id: tgt,
        label: tgt,
        type: "taslak",
        color: "#475569",
        image: null,
        size_mode: "fixed",
        isGhost: true,
        content: `Bu düğüm henüz detaylandırılmamıştır. <br><br> Katkıda bulunmak için <code>_nodes/</code> klasörü altında <strong>${tgt}.md</strong> dosyasını oluşturabilirsiniz.`
      });
    }

    // Yön Kuralı
    let targetArrow = "triangle";
    if (e.data.direction === "directed") {
      targetArrow = "triangle";
    } else if (e.data.direction === "none") {
      targetArrow = "none";
    } else if (e.data.direction === "mutual" || (e.data.direction === "auto" && relationKeys.has(`${tgt}->${src}`))) {
      targetArrow = "none"; // Karşılıklı bildirim varsa düz bağ
    }

    // Çizgi Stili (evidence)
    let lineStyle = "solid";
    if (e.data.evidence === "iddia") lineStyle = "dashed";
    if (e.data.evidence === "resmi_tutanak") lineStyle = "solid";

    edges.push({
      data: {
        ...e.data,
        targetArrowShape: targetArrow,
        lineStyle: lineStyle,
        color: e.data.edge_color || "#64748b"
      }
    });
  });

  // 4. Bağlantı Sayısına Göre Derece (Degree) Hesapla
  const degreeMap = new Map();
  edges.forEach(e => {
    degreeMap.set(e.data.source, (degreeMap.get(e.data.source) || 0) + 1);
    degreeMap.set(e.data.target, (degreeMap.get(e.data.target) || 0) + 1);
  });

  const cyNodes = Array.from(nodeSet.values()).map(n => {
    const degree = degreeMap.get(n.id) || 1;
    const size = n.size_mode === "fixed" ? 35 : Math.min(80, Math.max(30, 25 + degree * 8));

    return {
      data: {
        ...n,
        computedSize: size,
        bgColor: n.color || "#0284c7"
      }
    };
  });

  // 5. Cytoscape'i Başlat
  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: { nodes: cyNodes, edges: edges },
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
          "border-color": "#0f172a"
        }
      },
      {
        selector: "node[image]",
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
        style: {
          "opacity": 0.15
        }
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
      name: "fcose",
      quality: "proof",
      randomize: true,
      animate: false,
      nodeDimensionsIncludeLabels: true,
      nodeRepulsion: 4500,
      idealEdgeLength: 100
    }
  });

  // 6. Tip Filtresi Doldurma
  const typeFilter = document.getElementById("type-filter");
  registeredTypes.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.innerText = t.toUpperCase();
    typeFilter.appendChild(opt);
  });

  typeFilter.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "ALL") {
      cy.elements().removeClass("dimmed");
    } else {
      cy.elements().addClass("dimmed");
      cy.nodes(`[type = "${val}"]`).removeClass("dimmed").neighborhood().removeClass("dimmed");
    }
  });

  // 7. Arama Girişi
  document.getElementById("search-input").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      cy.elements().removeClass("dimmed");
      return;
    }
    cy.elements().addClass("dimmed");
    const matched = cy.nodes().filter(n => {
      const label = (n.data("label") || "").toLowerCase();
      const id = (n.data("id") || "").toLowerCase();
      return label.includes(q) || id.includes(q);
    });
    matched.removeClass("dimmed").neighborhood().removeClass("dimmed");
  });

  // 8. Tıklama, Sidebar (%80) ve Focus Mode
  const sidebar = document.getElementById("sidebar");
  const sidebarHero = document.getElementById("sidebar-hero");
  const sidebarMeta = document.getElementById("sidebar-meta");
  const sidebarContent = document.getElementById("sidebar-content");
  const sidebarSourceLink = document.getElementById("sidebar-source-link");

  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    const data = node.data();

    // Focus Modu: Diğerlerini soluklaştır
    cy.elements().addClass("dimmed");
    node.removeClass("dimmed").addClass("highlighted");
    node.neighborhood().removeClass("dimmed");

    // Sidebar Doldurma
    sidebarHero.innerHTML = data.image ? `<img src="${data.image}" class="featured" alt="${data.label}">` : "";
    sidebarMeta.innerHTML = `<h1>${data.label}</h1><span class="badge">${data.type}</span>`;
    sidebarContent.innerHTML = data.content || "Detay bulunamadı.";
    sidebarSourceLink.innerHTML = data.isGhost 
      ? `<span>Durum: Taslak Düğüm</span>` 
      : `<a href="${data.url}" target="_blank">Markdown Kaynağını Görüntüle &rarr;</a>`;

    sidebar.classList.remove("hidden");
  });

  // Kapatma Tuşu & Boşluğa Tıklama
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
    cy.animate({ fit: { padding: 40 } }, { duration: 500 });
  });
});