const API_BASE_URL = "/backend";
const $ = (id) => document.getElementById(id);

let canvas;


function initCanvas() {
  const c = $("editorCanvas");
  const wrapper = c.parentElement.getBoundingClientRect();
  c.width = Math.max(320, wrapper.width - 40);
  c.height = Math.max(260, wrapper.height - 40);

  canvas = new fabric.Canvas("editorCanvas", {
    selection: true,
    preserveObjectStacking: true,
  });

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = "#a855f7";
  fabric.Object.prototype.cornerStyle = "circle";
  fabric.Object.prototype.borderColor = "#38bdf8";

  canvas.setBackgroundColor("#020617", canvas.renderAll.bind(canvas));

  canvas.on("selection:created", onSelectChange);
  canvas.on("selection:updated", onSelectChange);
  canvas.on("selection:cleared", () => showLayerInfo(null));
}

function getActive() {
  return canvas ? canvas.getActiveObject() : null;
}

// -------- Elements ----------

function addHeading() {
  const obj = new fabric.Textbox("Communicate with space using AI & ML", {
    left: 40,
    top: 40,
    width: 350,
    fontSize: 26,
    fontWeight: 700,
    fill: "#f9fafb",
  });
  obj.kind = "heading";
  canvas.add(obj).setActiveObject(obj);
}

function addParagraph() {
  const obj = new fabric.Textbox(
    "We help teams design intelligent dashboards for modern products.",
    {
      left: 40,
      top: 100,
      width: 350,
      fontSize: 15,
      fill: "#e5e7eb",
    }
  );
  obj.kind = "paragraph";
  canvas.add(obj).setActiveObject(obj);
}

function addCard() {
  const rect = new fabric.Rect({
    left: canvas.width * 0.55,
    top: 60,
    width: 260,
    height: 160,
    rx: 20,
    ry: 20,
    fill: new fabric.Gradient({
      type: "linear",
      gradientUnits: "percentage",
      coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
      colorStops: [
        { offset: 0, color: "#4f46e5" },
        { offset: 0.6, color: "#ec4899" },
        { offset: 1, color: "#f97316" },
      ],
    }),
  });
  rect.kind = "card";
  canvas.add(rect).setActiveObject(rect);
}

function addImage() {
  const input = $("image-input");
  input.value = "";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, (img) => {
        img.scaleToWidth(260);
        img.set({ left: 40, top: 200 });
        img.kind = "image";
        canvas.add(img).setActiveObject(img);
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// -------- Chart ----------

function readChartInputs() {
  const labelsText = $("chart-labels").value;
  const valuesText = $("chart-values").value;

  const fallback = {
    labels: ["Design", "API", "DB", "Deploy"],
    values: [80, 60, 45, 70],
  };

  if (!labelsText.trim() || !valuesText.trim()) return fallback;

  const labels = labelsText
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const valueStrings = valuesText
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const values = valueStrings.map((v) => Number(v));

  if (
    labels.length === 0 ||
    values.length === 0 ||
    labels.length !== values.length ||
    values.some((v) => Number.isNaN(v))
  ) {
    alert("Chart: labels & values count same hona chahiye, aur values number honi chahiye.");
    return fallback;
  }

  return { labels, values };
}

function buildChart(labels, values) {
  const cardWidth = Math.min(canvas.width - 80, 420);
  const cardHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const maxValue = Math.max(...values, 10);
  const innerWidth = cardWidth - paddingX * 2;
  const innerHeight = cardHeight - paddingY * 2;
  const count = labels.length;
  const barWidth = Math.max(12, innerWidth / (count * 2));
  const gap = count > 1 ? (innerWidth - barWidth * count) / (count - 1) : 0;
  const baseY = cardHeight - paddingY;

  const items = [];

  items.push(
    new fabric.Rect({
      left: 0,
      top: 0,
      width: cardWidth,
      height: cardHeight,
      rx: 18,
      ry: 18,
      fill: "#020617",
      stroke: "#1f2937",
      strokeWidth: 1,
    })
  );

  items.push(
    new fabric.Text("", {
      left: paddingX,
      top: paddingY - 18,
      fontSize: 14,
      fill: "#e5e7eb",
      fontWeight: 600,
    })
  );

  items.push(
    new fabric.Line([paddingX, baseY, cardWidth - paddingX, baseY], {
      stroke: "#1f2937",
      strokeWidth: 1,
    })
  );

  labels.forEach((label, index) => {
    const value = Math.max(0, values[index]);
    const h = (value / maxValue) * innerHeight;
    const x = paddingX + index * (barWidth + gap);
    const y = baseY - h;

    items.push(
      new fabric.Rect({
        left: x,
        top: y,
        width: barWidth,
        height: h,
        rx: 8,
        ry: 8,
        fill: new fabric.Gradient({
          type: "linear",
          gradientUnits: "percentage",
          coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
          colorStops: [
            { offset: 0, color: "#4f46e5" },
            { offset: 1, color: "#22c55e" },
          ],
        }),
      })
    );

    items.push(
      new fabric.Text(String(value), {
        left: x + barWidth / 2,
        top: y - 16,
        fontSize: 11,
        fill: "#f9fafb",
        fontWeight: 500,
        originX: "center",
      })
    );

    items.push(
      new fabric.Text(label, {
        left: x + barWidth / 2,
        top: baseY + 4,
        fontSize: 10,
        fill: "#9ca3af",
        originX: "center",
      })
    );
  });

  const group = new fabric.Group(items, { left: 80, top: 220 });
  group.kind = "chart";
  group.chartData = { labels, values };
  return group;
}

function handleCreateChart() {
  const { labels, values } = readChartInputs();
  const chart = buildChart(labels, values);
  canvas.add(chart).setActiveObject(chart);
}

function handleUpdateChart() {
  const obj = getActive();
  if (!obj || obj.kind !== "chart") {
    alert("Please select a chart on canvas first.");
    return;
  }
  const { labels, values } = readChartInputs();
  const oldLeft = obj.left;
  const oldTop = obj.top;
  canvas.remove(obj);
  const newChart = buildChart(labels, values);
  newChart.left = oldLeft;
  newChart.top = oldTop;
  canvas.add(newChart).setActiveObject(newChart);
}

// -------- Inspector ----------

function showLayerInfo(obj) {
  const nameBox = $("current-layer");
  if (!obj) {
    nameBox.textContent = "None";
    ["field-x", "field-y", "field-w", "field-h", "field-font-size"].forEach(
      (id) => {
        const el = $(id);
        if (el) el.value = "";
      }
    );
    return;
  }
  nameBox.textContent = obj.kind || obj.type;
  const bounds = obj.getBoundingRect(true, true);
  $("field-x").value = Math.round(obj.left || 0);
  $("field-y").value = Math.round(obj.top || 0);
  $("field-w").value = Math.round(bounds.width || 0);
  $("field-h").value = Math.round(bounds.height || 0);

  if (obj.type === "textbox") {
    $("field-font-size").value = obj.fontSize || 16;
    $("field-fill").value =
      typeof obj.fill === "string" ? obj.fill : "#ffffff";
  } else {
    $("field-font-size").value = "";
  }

  if (obj.kind === "chart" && obj.chartData) {
    $("chart-labels").value = obj.chartData.labels.join(", ");
    $("chart-values").value = obj.chartData.values.join(", ");
  }
}

function onSelectChange() {
  showLayerInfo(getActive());
}

function bindInspector() {
  $("field-x").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj) return;
    obj.left = parseInt(e.target.value || "0", 10);
    canvas.renderAll();
  });
  $("field-y").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj) return;
    obj.top = parseInt(e.target.value || "0", 10);
    canvas.renderAll();
  });
  $("field-w").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj) return;
    const bounds = obj.getBoundingRect();
    const newW = parseInt(e.target.value || bounds.width, 10);
    const scaleX = newW / bounds.width;
    obj.scaleX *= scaleX;
    canvas.renderAll();
  });
  $("field-h").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj) return;
    const bounds = obj.getBoundingRect();
    const newH = parseInt(e.target.value || bounds.height, 10);
    const scaleY = newH / bounds.height;
    obj.scaleY *= scaleY;
    canvas.renderAll();
  });
  $("field-font-size").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj || obj.type !== "textbox") return;
    obj.fontSize = parseInt(e.target.value || obj.fontSize, 10);
    canvas.renderAll();
  });
  $("field-fill").addEventListener("change", (e) => {
    const obj = getActive();
    if (!obj) return;
    if (obj.type === "textbox" || obj.type === "rect") {
      obj.set("fill", e.target.value);
      canvas.renderAll();
    }
  });

  $("btn-bring-front").onclick = () => {
    const obj = getActive();
    if (!obj) return;
    obj.bringToFront();
    canvas.renderAll();
  };
  $("btn-send-back").onclick = () => {
    const obj = getActive();
    if (!obj) return;
    obj.sendToBack();
    canvas.renderAll();
  };
  $("btn-delete").onclick = () => {
    const obj = getActive();
    if (!obj) return;
    canvas.remove(obj);
    showLayerInfo(null);
    canvas.renderAll();
  };
}

// -------- Zoom ----------

function bindZoom() {
  const range = $("zoom-range");
  const label = $("zoom-value");
  range.addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    canvas.setZoom(v / 100);
    label.textContent = v + "%";
  });
}

// -------- Fetch Helpers ----------

async function safeJsonFetch(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Invalid JSON from", url, text);
    throw new Error("Invalid JSON from server");
  }
}

// -------- Save / Load ----------

async function saveLayout() {
  try {
    const json = canvas.toJSON(["kind", "chartData"]);
    await safeJsonFetch(API_BASE_URL + "/save_layout.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: json }),
    });
    alert("Layout saved.");
    fetchSavedLayouts();
  } catch (e) {
    alert("Save failed: " + e.message);
  }
}

async function loadLatest() {
  try {
    const data = await safeJsonFetch(API_BASE_URL + "/get_layout.php");
    if (!data || !data.layout_json) {
      alert("No saved layout yet.");
      return;
    }
    canvas.loadFromJSON(JSON.parse(data.layout_json), () => canvas.renderAll());
  } catch (e) {
    alert("Load failed: " + e.message);
  }
}

async function fetchSavedLayouts() {
  try {
    const data = await safeJsonFetch(API_BASE_URL + "/list_layouts.php");
    const list = $("saved-list");
    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = "<div class='saved-item-meta'>No layouts yet.</div>";
      return;
    }
    list.innerHTML = "";
    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "saved-item";
      div.dataset.id = item.id;

      const main = document.createElement("div");
      main.className = "saved-item-main";
      const title = document.createElement("div");
      title.className = "saved-item-title";
      title.textContent = "Dashboard #" + item.id;
      const meta = document.createElement("div");
      meta.className = "saved-item-meta";
      meta.textContent = item.created_at
        ? new Date(item.created_at).toLocaleString()
        : "";
      main.appendChild(title);
      main.appendChild(meta);

      const delBtn = document.createElement("button");
      delBtn.className = "saved-item-delete";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteLayout(item.id);
      });

      div.appendChild(main);
      div.appendChild(delBtn);

      div.addEventListener("click", () => loadLayoutById(item.id));
      list.appendChild(div);
    });
  } catch (e) {
    console.error("list failed", e);
  }
}

async function loadLayoutById(id) {
  try {
    const data = await safeJsonFetch(
      API_BASE_URL + "/get_layout.php?id=" + encodeURIComponent(id)
    );
    if (!data || !data.layout_json) return;
    canvas.loadFromJSON(JSON.parse(data.layout_json), () => canvas.renderAll());
  } catch (e) {
    alert("Failed to load layout: " + e.message);
  }
}

async function deleteLayout(id) {
  const sure = confirm("Delete this saved layout? This cannot be undone.");
  if (!sure) return;
  try {
    const res = await safeJsonFetch(API_BASE_URL + "/delete_layout.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res && res.status === "ok") {
      fetchSavedLayouts();
    } else {
      alert("Failed to delete layout");
    }
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
}

// -------- Mode ----------

function bindModeToggle() {
  $("btn-design").onclick = () => setMode("design");
  $("btn-preview").onclick = () => setMode("preview");
}

function setMode(mode) {
  const design = $("btn-design");
  const preview = $("btn-preview");
  const interactive = mode === "design";

  if (interactive) {
    design.classList.add("active");
    preview.classList.remove("active");
  } else {
    preview.classList.add("active");
    design.classList.remove("active");
  }

  canvas.selection = interactive;
  canvas.forEachObject((obj) => {
    obj.selectable = interactive;
    obj.evented = interactive;
  });
  canvas.discardActiveObject();
  showLayerInfo(null);
  canvas.renderAll();
}

// -------- Sidebar / Palette / Previous Saves ----------

function bindSidebar() {
  const btn = $("btn-toggle-sidebar");
  const panel = $("left-panel");
  btn.onclick = () => panel.classList.toggle("open");
}

function bindPalette() {
  $("btn-add-heading").onclick = addHeading;
  $("btn-add-paragraph").onclick = addParagraph;
  $("btn-add-card").onclick = addCard;
  $("btn-add-image").onclick = addImage;
  $("btn-add-chart").onclick = handleCreateChart;
  $("btn-create-chart").onclick = handleCreateChart;
  $("btn-update-chart").onclick = handleUpdateChart;
}

function bindInspectorToggle() {
  const btn = $("btn-toggle-inspector");
  const panel = document.querySelector(".panel-right");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}


function bindInspectorClose() {
  const panel = document.querySelector(".panel-right");
  const closeBtn = document.getElementById("btn-close-inspector");

  if (!closeBtn) return;

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });
}







function bindPreviousSavesButton() {
  const btn = $("btn-show-saves");
  const list = $("saved-list");
  if (!btn || !list) return;
  btn.onclick = () => {
    list.scrollIntoView({ behavior: "smooth", block: "center" });
    list.classList.add("pulse");
    setTimeout(() => list.classList.remove("pulse"), 800);
  };
}

window.addEventListener("load", () => {
  initCanvas();
  bindInspector();
  bindZoom();
  bindModeToggle();
  bindSidebar();
  bindPalette();
  bindPreviousSavesButton();
  bindInspectorToggle();
  bindInspectorClose();
  $("btn-save").onclick = saveLayout;
  $("btn-load-latest").onclick = loadLatest;
  fetchSavedLayouts();

});
