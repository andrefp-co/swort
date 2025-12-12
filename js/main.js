// Canvas Setup
const canvas = document.getElementById('pathway');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Pathway State
let nodes = JSON.parse(localStorage.getItem("swort-nodes") || "[]");
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

// Node Template
function createNode(x, y, text) {
    return { id: Date.now(), x, y, text };
}

// Draw Nodes
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    nodes.forEach(node => {
        ctx.fillStyle = "#2c2c2c";
        ctx.fillRect(node.x - 60, node.y - 30, 120, 60);

        ctx.strokeStyle = "#555";
        ctx.strokeRect(node.x - 60, node.y - 30, 120, 60);

        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(node.text.slice(0, 40), node.x - 50, node.y);
    });

    ctx.restore();
}
draw();

// Dragging for panning
canvas.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
});
canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mousemove", e => {
    if (isDragging) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        draw();
    }
});

// Zoom
canvas.addEventListener("wheel", e => {
    const zoomFactor = 0.1;
    scale += e.deltaY > 0 ? -zoomFactor : zoomFactor;
    scale = Math.max(0.3, Math.min(3, scale));
    draw();
});

// ========================================================
// SHAPE STATES
// ========================================================
function applyState(state) {
    if (state === "grid") {
        nodes.forEach((n, i) => {
            n.x = (i % 5) * 180 + 100;
            n.y = Math.floor(i / 5) * 150 + 120;
        });
    }

    if (state === "monolith") {
        nodes.forEach((n, i) => {
            n.x = canvas.width / 2;
            n.y = i * 120 + 100;
        });
    }

    if (state === "timeline") {
        nodes.forEach((n, i) => {
            n.x = i * 200 + 100;
            n.y = canvas.height / 2;
        });
    }

    draw();
}

document.querySelectorAll(".state-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        applyState(btn.dataset.state);
        localStorage.setItem("swort-nodes", JSON.stringify(nodes));
    });
});

// ========================================================
// NODE CREATOR
// ========================================================
const modal = document.getElementById("editorModal");
const saveBtn = document.getElementById("saveNode");

document.getElementById("createNodeBtn").onclick = () => {
    modal.classList.remove("hidden");
};

document.getElementById("closeEditor").onclick = () => {
    modal.classList.add("hidden");
};

saveBtn.onclick = () => {
    const text = document.getElementById("nodeText").value;
    if (!text.length) return;

    const node = createNode(
        (offsetX * -1 + canvas.width / 2) / scale,
        (offsetY * -1 + canvas.height / 2) / scale,
        text
    );
    nodes.push(node);
    localStorage.setItem("swort-nodes", JSON.stringify(nodes));

    document.getElementById("nodeText").value = "";
    modal.classList.add("hidden");
    draw();
};
