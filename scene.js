const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  noiseLayer: null,
  dust: [],
  leaves: [],
  codeSeeds: [0.33, 0.61, 0.46, 0.74, 0.57, 0.29, 0.67, 0.42, 0.53],
  layout: null
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fillRoundedRect(x, y, w, h, r, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function createNoiseLayer(width, height) {
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerCtx = layer.getContext("2d");
  const imageData = layerCtx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const tone = 186 + Math.floor(Math.random() * 58);
    data[i] = tone;
    data[i + 1] = tone - 3;
    data[i + 2] = tone - 7;
    data[i + 3] = Math.random() < 0.9 ? 0 : 12;
  }

  layerCtx.putImageData(imageData, 0, 0);
  return layer;
}

function rebuildAtmosphere(width, height) {
  state.dust = [];
  for (let i = 0; i < 90; i += 1) {
    state.dust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.8,
      speed: 0.16 + Math.random() * 0.55,
      drift: Math.random() * Math.PI * 2
    });
  }

  state.leaves = [];
  const leafCount = clamp(Math.floor(width / 16), 45, 120);
  for (let i = 0; i < leafCount; i += 1) {
    state.leaves.push({
      x: Math.random(),
      y: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.28 + Math.random() * 0.86,
      size: 1 + Math.random() * 2.4
    });
  }
}

function resize() {
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;

  state.width = width;
  state.height = height;
  state.dpr = dpr;
  state.noiseLayer = createNoiseLayer(width, height);
  rebuildAtmosphere(width, height);

  const windowW = width * 0.48;
  const windowH = height * 0.36;
  const windowX = (width - windowW) * 0.5;
  const windowY = height * 0.12;

  state.layout = {
    wallY: height * 0.63,
    windowX,
    windowY,
    windowW,
    windowH,
    sillY: windowY + windowH + 12,
    deskX: width * 0.1,
    deskY: height * 0.67,
    deskW: width * 0.8,
    deskH: height * 0.16
  };
}

function drawWallAndFloor() {
  const { width, height } = state;
  const { wallY } = state.layout;

  const wallGrad = ctx.createLinearGradient(0, 0, 0, wallY);
  wallGrad.addColorStop(0, "#ac7f5c");
  wallGrad.addColorStop(0.57, "#93684d");
  wallGrad.addColorStop(1, "#725241");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, wallY);

  const floorGrad = ctx.createLinearGradient(0, wallY, 0, height);
  floorGrad.addColorStop(0, "#53392d");
  floorGrad.addColorStop(1, "#2e211b");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, wallY, width, height - wallY);

  fillRoundedRect(0, wallY - 7, width, 11, 0, "rgba(77, 52, 39, 0.85)");

  for (let i = 0; i < 13; i += 1) {
    const y = wallY + 14 + i * 20;
    ctx.strokeStyle = i % 2 ? "rgba(45, 30, 23, 0.32)" : "rgba(87, 59, 46, 0.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.drawImage(state.noiseLayer, 0, 0, width, height);
  ctx.restore();

  const cornerShade = ctx.createLinearGradient(0, 0, width, 0);
  cornerShade.addColorStop(0, "rgba(0,0,0,0.12)");
  cornerShade.addColorStop(0.08, "rgba(0,0,0,0)");
  cornerShade.addColorStop(0.92, "rgba(0,0,0,0)");
  cornerShade.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = cornerShade;
  ctx.fillRect(0, 0, width, height);
}

function drawWorkspaceDecor(time) {
  const { width } = state;
  const { wallY } = state.layout;

  const shelfY = wallY * 0.42;
  fillRoundedRect(width * 0.11, shelfY, width * 0.2, 12, 4, "#5a3a29");

  for (let i = 0; i < 8; i += 1) {
    const bx = width * 0.12 + i * (width * 0.021);
    const h = 26 + (i % 3) * 12;
    fillRoundedRect(bx, shelfY - h, width * 0.016, h, 2, i % 2 ? "#8f6f5c" : "#b68b73");
  }

  fillRoundedRect(width * 0.19, shelfY - 60, width * 0.035, 36, 6, "#835740");
  fillRoundedRect(width * 0.19 - 2, shelfY - 62, width * 0.039, 6, 3, "#9c7256");
  ctx.strokeStyle = "#2f6941";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.206, shelfY - 60);
  ctx.quadraticCurveTo(width * 0.198, shelfY - 82, width * 0.214, shelfY - 104);
  ctx.stroke();
  fillRoundedRect(width * 0.196, shelfY - 108, 8, 20, 4, "#4f8f58");
  fillRoundedRect(width * 0.21, shelfY - 102, 8, 16, 4, "#5ea063");

  const hangX = width * 0.8;
  const hangY = wallY * 0.12;
  ctx.strokeStyle = "#4f3a2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hangX, hangY);
  ctx.lineTo(hangX, hangY + 44);
  ctx.stroke();
  fillRoundedRect(hangX - 26, hangY + 44, 52, 20, 5, "#855a41");
  fillRoundedRect(hangX - 30, hangY + 40, 60, 6, 3, "#9b7357");
  fillRoundedRect(hangX - 22, hangY + 26, 10, 28, 5, "#4f8653");
  fillRoundedRect(hangX - 8, hangY + 28, 10, 24, 5, "#5a955f");
  fillRoundedRect(hangX + 8, hangY + 24, 10, 30, 5, "#4b824f");

  const floorPlantX = width * 0.86;
  const floorPlantY = wallY + 22;
  fillRoundedRect(floorPlantX, floorPlantY, 46, 34, 5, "#7d543e");
  fillRoundedRect(floorPlantX - 3, floorPlantY - 3, 52, 8, 4, "#93664c");
  for (let i = 0; i < 7; i += 1) {
    const sway = Math.sin(time * 1.2 + i) * 4;
    ctx.strokeStyle = i % 2 ? "#3f7a47" : "#4f9158";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(floorPlantX + 22, floorPlantY);
    ctx.quadraticCurveTo(
      floorPlantX + sway + (i - 3) * 7,
      floorPlantY - 35,
      floorPlantX + sway + (i - 3) * 10,
      floorPlantY - 80 - (i % 2) * 15
    );
    ctx.stroke();
  }
}

function drawCarsOutside(time, roadX, roadY, roadW, roadH) {
  const carConfigs = [
    { duration: 3.4, cycle: 21.5, phase: 2.2, dir: 1, color: "#c64f42", lane: 0, scale: 1 },
    { duration: 3.1, cycle: 26.2, phase: 8.4, dir: -1, color: "#4d84c7", lane: 1, scale: 0.9 },
    { duration: 3.7, cycle: 31.8, phase: 14.5, dir: 1, color: "#d0a14a", lane: 0, scale: 1.05 }
  ];

  for (let i = 0; i < carConfigs.length; i += 1) {
    const car = carConfigs[i];
    const stage = (time + car.phase) % car.cycle;
    if (stage > car.duration) {
      continue;
    }

    const progress = stage / car.duration;
    const carW = 42 * car.scale;
    const carH = 13 * car.scale;
    const laneY = roadY + 4 + car.lane * (roadH * 0.45);
    const x = car.dir > 0
      ? roadX - carW + progress * (roadW + carW * 2)
      : roadX + roadW + carW - progress * (roadW + carW * 2);

    fillRoundedRect(x, laneY, carW, carH, 4, car.color);
    fillRoundedRect(x + 10, laneY - 7, 24 * car.scale, 9 * car.scale, 4, "rgba(215, 230, 240, 0.7)");
    fillRoundedRect(x + 4, laneY + carH - 2, 10, 4, 2, "#2f2f34");
    fillRoundedRect(x + carW - 14, laneY + carH - 2, 10, 4, 2, "#2f2f34");

    if (car.dir > 0) {
      ctx.fillStyle = "rgba(255, 250, 205, 0.7)";
      ctx.fillRect(x + carW, laneY + 4, 2, 3 * car.scale);
    } else {
      ctx.fillStyle = "rgba(255, 120, 110, 0.7)";
      ctx.fillRect(x - 2, laneY + 4, 2, 3 * car.scale);
    }
  }
}

function drawWindowOutside(time) {
  const { windowX: x, windowY: y, windowW: w, windowH: h } = state.layout;

  const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
  skyGrad.addColorStop(0, "#95bdcb");
  skyGrad.addColorStop(0.62, "#71908c");
  skyGrad.addColorStop(1, "#566f63");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h);

  const mountainGrad = ctx.createLinearGradient(x, y + h * 0.32, x, y + h * 0.67);
  mountainGrad.addColorStop(0, "rgba(77, 103, 98, 0.7)");
  mountainGrad.addColorStop(1, "rgba(62, 85, 76, 0.85)");
  ctx.fillStyle = mountainGrad;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.58);
  ctx.lineTo(x + w * 0.18, y + h * 0.44);
  ctx.lineTo(x + w * 0.36, y + h * 0.55);
  ctx.lineTo(x + w * 0.56, y + h * 0.42);
  ctx.lineTo(x + w * 0.72, y + h * 0.57);
  ctx.lineTo(x + w, y + h * 0.48);
  ctx.lineTo(x + w, y + h * 0.67);
  ctx.lineTo(x, y + h * 0.67);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 7; i += 1) {
    const hx = x + 12 + i * ((w - 24) / 7);
    const hh = 15 + (i % 3) * 6;
    fillRoundedRect(hx, y + h * 0.63 - hh, 24, hh, 2, "rgba(70, 83, 87, 0.65)");
    fillRoundedRect(hx + 4, y + h * 0.63 - hh - 8, 14, 8, 2, "rgba(82, 98, 104, 0.62)");
  }

  const cloudOffset = (time * 13) % (w + 120);
  for (let i = 0; i < 3; i += 1) {
    const cx = x - 120 + cloudOffset + i * 190;
    const cy = y + 26 + i * 15;
    fillRoundedRect(cx, cy, 95, 28, 13, "rgba(228, 236, 235, 0.36)");
    fillRoundedRect(cx + 18, cy - 8, 62, 20, 10, "rgba(229, 237, 235, 0.32)");
  }

  const roadY = y + h * 0.76;
  const roadH = h * 0.2;
  const roadGrad = ctx.createLinearGradient(x, roadY, x, roadY + roadH);
  roadGrad.addColorStop(0, "rgba(66, 72, 75, 0.78)");
  roadGrad.addColorStop(1, "rgba(47, 52, 56, 0.82)");
  fillRoundedRect(x, roadY, w, roadH, 3, roadGrad);

  ctx.strokeStyle = "rgba(35, 40, 44, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, roadY + roadH * 0.52);
  ctx.lineTo(x + w, roadY + roadH * 0.43);
  ctx.stroke();

  for (let i = 0; i < 9; i += 1) {
    const stripeX = x + ((time * 60 + i * 62) % (w + 40)) - 20;
    fillRoundedRect(stripeX, roadY + roadH * 0.5, 24, 3, 1, "rgba(226, 224, 198, 0.45)");
  }
  drawCarsOutside(time, x, roadY, w, roadH);

  for (let i = 0; i < 10; i += 1) {
    const tx = x + 22 + i * ((w - 44) / 9);
    const sway = Math.sin(time * (0.9 + i * 0.08) + i * 0.7) * 6;
    ctx.strokeStyle = "#2f3e31";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(tx, y + h);
    ctx.quadraticCurveTo(tx + sway, y + h * 0.63, tx + sway * 1.2, y + h * 0.34);
    ctx.stroke();

    fillRoundedRect(tx - 16 + sway, y + h * 0.18, 35, 24, 10, "#597f57");
    fillRoundedRect(tx - 11 + sway * 0.7, y + h * 0.24, 29, 18, 9, "#6d9563");
  }

  for (let i = 0; i < state.leaves.length; i += 1) {
    const leaf = state.leaves[i];
    const lx = x + (leaf.x * w + Math.sin(time * leaf.speed + leaf.phase) * 7 + time * 11) % w;
    const ly = y + h * 0.18 + leaf.y * (h * 0.72) + Math.cos(time * leaf.speed + leaf.phase) * 4;
    ctx.fillStyle = "rgba(175, 205, 130, 0.56)";
    ctx.fillRect(lx, ly, leaf.size, leaf.size);
  }
}

function drawWindowFrame() {
  const { windowX: x, windowY: y, windowW: w, windowH: h } = state.layout;

  ctx.fillStyle = "#4d2f1f";
  ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
  ctx.fillStyle = "#6f4730";
  ctx.fillRect(x - 8, y - 8, w + 16, h + 16);

  ctx.fillStyle = "#6a432d";
  ctx.fillRect(x + w * 0.5 - 3, y, 6, h);
  ctx.fillRect(x, y + h * 0.52, w, 5);

  ctx.fillStyle = "#4f3123";
  ctx.fillRect(x - 30, y + h + 9, w + 60, 14);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 12);
  ctx.lineTo(x + w * 0.42, y + h * 0.36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.56, y + 10);
  ctx.lineTo(x + w - 12, y + h * 0.32);
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 20;
  ctx.strokeStyle = "rgba(255, 220, 190, 0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);
  ctx.restore();
}

function drawSunbeams(time) {
  const { windowX: x, windowY: y, windowW: w, windowH: h, wallY } = state.layout;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#efcb8e";

  for (let i = 0; i < 5; i += 1) {
    const wobble = Math.sin(time * 0.6 + i * 0.65) * 13;
    ctx.beginPath();
    ctx.moveTo(x + w * (0.17 + i * 0.1) + wobble, y + h - 2);
    ctx.lineTo(x + w * (0.31 + i * 0.15) + wobble * 1.2, wallY + 84);
    ctx.lineTo(x + w * (0.42 + i * 0.15) + wobble * 0.8, wallY + 86);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCatAndSillPlant(time) {
  const { windowX: x, windowW: w, sillY } = state.layout;

  const potX = x + w * 0.48;
  const potY = sillY - 11;
  fillRoundedRect(potX, potY + 10, 30, 20, 4, "#8f5f42");
  fillRoundedRect(potX - 2, potY + 8, 34, 6, 3, "#a57659");
  ctx.strokeStyle = "#356c3c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(potX + 14, potY + 10);
  ctx.quadraticCurveTo(potX + 12, potY - 8, potX + 17, potY - 20);
  ctx.stroke();
  fillRoundedRect(potX + 2, potY - 12, 11, 9, 4, "#bf4a50");
  fillRoundedRect(potX + 16, potY - 9, 11, 9, 4, "#cd5d60");

  const catX = x + w * 0.68;
  const catY = sillY - 15 + Math.sin(time * 1.25) * 0.7;
  const tailSwing = Math.sin(time * 1.5) * 6;

  ctx.save();
  ctx.translate(catX, catY);

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(-26, 34, 58, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  const furGrad = ctx.createLinearGradient(-70, 0, 20, 34);
  furGrad.addColorStop(0, "#7c838d");
  furGrad.addColorStop(0.55, "#666d77");
  furGrad.addColorStop(1, "#4f565f");
  ctx.fillStyle = furGrad;
  ctx.beginPath();
  ctx.ellipse(-12, 16, 56, 24, -0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5c626c";
  ctx.beginPath();
  ctx.ellipse(-56, 15, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8f97a1";
  ctx.beginPath();
  ctx.moveTo(-70, 2);
  ctx.lineTo(-62, -14);
  ctx.lineTo(-52, -1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-52, 1);
  ctx.lineTo(-44, -14);
  ctx.lineTo(-36, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d8e4c9";
  ctx.beginPath();
  ctx.ellipse(-63, 13, 2.4, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2f3339";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(31, 18);
  ctx.quadraticCurveTo(48, 15 + tailSwing * 0.2, 55, 30 + tailSwing * 0.45);
  ctx.quadraticCurveTo(58, 42 + tailSwing * 0.35, 45, 48);
  ctx.stroke();

  ctx.strokeStyle = "rgba(43, 48, 53, 0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-20 + i * 12, 4);
    ctx.quadraticCurveTo(-16 + i * 12, 20, -10 + i * 12, 28);
    ctx.stroke();
  }

  ctx.strokeStyle = "#aab3bd";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-72, 18);
  ctx.lineTo(-86, 16);
  ctx.moveTo(-71, 22);
  ctx.lineTo(-87, 24);
  ctx.moveTo(-71, 20);
  ctx.lineTo(-86, 20);
  ctx.stroke();

  ctx.fillStyle = "#737b85";
  ctx.beginPath();
  ctx.ellipse(-22, 29, 14, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-40, 31, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawChair(time) {
  const { deskX, deskY, deskW } = state.layout;
  const x = deskX + deskW * 0.24;
  const y = deskY + 6;
  const sway = Math.sin(time * 0.9) * 1.5;

  fillRoundedRect(x + 40, y - 90 + sway, 118, 100, 18, "#30384a");
  fillRoundedRect(x + 56, y - 14 + sway, 90, 24, 12, "#3a4357");
  fillRoundedRect(x + 95, y + 8 + sway, 12, 42, 5, "#262c37");
  fillRoundedRect(x + 72, y + 44 + sway, 58, 8, 4, "#2e3441");

  ctx.strokeStyle = "#2c3038";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 101, y + 48 + sway);
  ctx.lineTo(x + 54, y + 64 + sway);
  ctx.moveTo(x + 101, y + 48 + sway);
  ctx.lineTo(x + 148, y + 64 + sway);
  ctx.moveTo(x + 101, y + 48 + sway);
  ctx.lineTo(x + 72, y + 80 + sway);
  ctx.moveTo(x + 101, y + 48 + sway);
  ctx.lineTo(x + 131, y + 80 + sway);
  ctx.stroke();

  fillRoundedRect(x + 46, y + 61 + sway, 16, 7, 3, "#1f232a");
  fillRoundedRect(x + 140, y + 61 + sway, 16, 7, 3, "#1f232a");
  fillRoundedRect(x + 63, y + 77 + sway, 16, 7, 3, "#1f232a");
  fillRoundedRect(x + 123, y + 77 + sway, 16, 7, 3, "#1f232a");
}

function drawDesk(time) {
  const { deskX: x, deskY: y, deskW: w, deskH: h } = state.layout;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h + 36, w * 0.48, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  const topGrad = ctx.createLinearGradient(x, y, x, y + h);
  topGrad.addColorStop(0, "#66452f");
  topGrad.addColorStop(1, "#3f281d");
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - 34, y + 34);
  ctx.lineTo(x + 34, y + 34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2e1f17";
  ctx.fillRect(x + 18, y + 34, 22, h + 26);
  ctx.fillRect(x + w - 40, y + 34, 22, h + 26);
  ctx.fillRect(x, y + 30, w, 7);

  const mugX = x + 80;
  const mugY = y + 6;
  fillRoundedRect(mugX, mugY, 28, 24, 5, "#d7aa79");
  fillRoundedRect(mugX + 24, mugY + 7, 8, 11, 3, "#d7aa79");
  fillRoundedRect(mugX + 5, mugY + 4, 18, 3, 2, "#f2d6bc");

  for (let i = 0; i < 4; i += 1) {
    const rise = (time * 17 + i * 11) % 36;
    const sway = Math.sin(time * 1.8 + i) * 3;
    fillRoundedRect(mugX + 12 + sway, mugY - rise, 3, 10, 2, "rgba(229, 236, 240, 0.52)");
  }

  const secondCupX = x + 156;
  fillRoundedRect(secondCupX, y + 10, 24, 18, 4, "#c89260");
  fillRoundedRect(secondCupX + 20, y + 15, 6, 8, 3, "#c89260");

  fillRoundedRect(x + w * 0.28, y + 8, 64, 18, 4, "#4a5c77");
  fillRoundedRect(x + w * 0.28 + 4, y + 12, 56, 4, 2, "rgba(233, 241, 255, 0.35)");

  fillRoundedRect(x + w * 0.74, y + 10, 20, 26, 4, "#7c533c");
  fillRoundedRect(x + w * 0.74 - 1, y + 8, 22, 5, 3, "#946a50");
  fillRoundedRect(x + w * 0.74 + 3, y - 10, 6, 18, 3, "#4f8a54");
  fillRoundedRect(x + w * 0.74 + 10, y - 8, 6, 16, 3, "#629f66");
}

function drawMonitor(time) {
  const { deskX, deskY, deskW } = state.layout;
  const x = deskX + deskW * 0.42;
  const y = deskY - 76;
  const w = 230;
  const h = 142;

  fillRoundedRect(x - 11, y - 11, w + 22, h + 22, 14, "#171b21");
  fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 10, "#252a31");

  const screenGrad = ctx.createLinearGradient(x, y, x, y + h);
  screenGrad.addColorStop(0, "#111922");
  screenGrad.addColorStop(1, "#090f17");
  fillRoundedRect(x, y, w, h, 8, screenGrad);

  ctx.save();
  ctx.beginPath();
  fillRoundedRect(x, y, w, h, 8, screenGrad);
  ctx.clip();

  fillRoundedRect(x, y, w, 20, 0, "#212c37");
  fillRoundedRect(x + 8, y + 6, 52, 8, 3, "#304153");
  fillRoundedRect(x + 66, y + 6, 36, 8, 3, "#40556b");

  fillRoundedRect(x + 6, y + 24, 24, h - 30, 2, "#1b2430");
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = "rgba(160, 175, 190, 0.45)";
    ctx.fillRect(x + 11, y + 31 + i * 11, 8, 2);
  }

  for (let i = 0; i < state.codeSeeds.length; i += 1) {
    const seed = state.codeSeeds[i];
    const rowY = y + 30 + i * 12;
    const baseW = (w - 54) * seed;
    const morph = Math.sin(time * 5 + i * 1.1) * 18;
    const lineW = clamp(baseW + morph, 36, w - 76);
    const startX = x + 36;

    ctx.fillStyle = i % 2 ? "rgba(120, 246, 166, 0.88)" : "rgba(108, 224, 255, 0.84)";
    ctx.fillRect(startX, rowY, lineW * 0.58, 3);
    ctx.fillStyle = "rgba(245, 206, 120, 0.86)";
    ctx.fillRect(startX + lineW * 0.6, rowY, lineW * 0.2, 3);
    ctx.fillStyle = "rgba(190, 146, 255, 0.84)";
    ctx.fillRect(startX + lineW * 0.82, rowY, lineW * 0.12, 3);

    const erodeBits = 3 + Math.floor((Math.sin(time * 8 + i * 0.8) + 1) * 3);
    for (let p = 0; p < erodeBits; p += 1) {
      const px = startX + lineW + p * 4 + ((time * 25 + i * 17 + p) % 6);
      const py = rowY + (p % 2 ? 1 : -1);
      ctx.fillStyle = p % 2 ? "rgba(96, 238, 146, 0.82)" : "rgba(58, 193, 113, 0.82)";
      ctx.fillRect(px, py, 2, 2);
    }
  }

  const cursorBlink = Math.sin(time * 6) > 0 ? 1 : 0;
  if (cursorBlink) {
    ctx.fillStyle = "rgba(145, 255, 191, 0.9)";
    ctx.fillRect(x + w - 32, y + h - 18, 2, 9);
  }

  const sweepX = x + ((time * 115) % (w + 90)) - 60;
  const scan = ctx.createLinearGradient(sweepX, y, sweepX + 52, y);
  scan.addColorStop(0, "rgba(130, 255, 200, 0)");
  scan.addColorStop(0.5, "rgba(130, 255, 200, 0.14)");
  scan.addColorStop(1, "rgba(130, 255, 200, 0)");
  ctx.fillStyle = scan;
  ctx.fillRect(x, y, w, h);

  const reflection = ctx.createLinearGradient(x, y, x + w, y + h);
  reflection.addColorStop(0, "rgba(255, 255, 255, 0.05)");
  reflection.addColorStop(0.4, "rgba(255, 255, 255, 0.01)");
  reflection.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = reflection;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(70, 170, 255, 0.35)";
  ctx.shadowBlur = 22;
  ctx.strokeStyle = "rgba(138, 220, 255, 0.24)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();

  fillRoundedRect(x + w * 0.47, y + h, 14, 22, 5, "#2a2f35");
  fillRoundedRect(x + w * 0.38, y + h + 20, 56, 8, 4, "#22282e");

  const keyboardX = deskX + deskW * 0.44;
  const keyboardY = deskY + 10;
  fillRoundedRect(keyboardX, keyboardY, 142, 22, 6, "#262d33");
  for (let i = 0; i < 15; i += 1) {
    const keyX = keyboardX + 7 + i * 8.6;
    ctx.fillStyle = i % 2 ? "#3a464e" : "#2f3941";
    ctx.fillRect(keyX, keyboardY + 6, 6, 3);
    ctx.fillRect(keyX, keyboardY + 13, 6, 3);
  }
}

function drawPerson(time) {
  const { deskX, deskY, deskW } = state.layout;
  const baseX = deskX + deskW * 0.31;
  const baseY = deskY - 8;
  const bob = Math.sin(time * 2.4) * 1.2;

  fillRoundedRect(baseX + 20, baseY - 62 + bob, 118, 88, 36, "#596f91");
  fillRoundedRect(baseX + 50, baseY - 42 + bob, 60, 48, 20, "#d8b89d");
  fillRoundedRect(baseX + 52, baseY - 59 + bob, 56, 18, 10, "#4f6483");

  const typing = Math.sin(time * 14);
  const armYL = typing > 0 ? 0 : 6;
  const armYR = typing < 0 ? 0 : 6;
  fillRoundedRect(baseX + 5, baseY + 16 + armYL, 62, 20, 10, "#d8b89d");
  fillRoundedRect(baseX + 94, baseY + 16 + armYR, 62, 20, 10, "#d8b89d");
  fillRoundedRect(baseX + 18, baseY + 8 + armYL, 42, 20, 10, "#596f91");
  fillRoundedRect(baseX + 101, baseY + 8 + armYR, 42, 20, 10, "#596f91");
}

function drawAtmosphere(time) {
  const { width, height } = state;

  for (let i = 0; i < state.dust.length; i += 1) {
    const d = state.dust[i];
    const x = (d.x + time * d.speed * 11 + Math.sin(time + d.drift) * 6) % width;
    const y = d.y + Math.sin(time * 0.5 + d.drift) * 5;
    ctx.fillStyle = "rgba(244, 226, 198, 0.18)";
    ctx.beginPath();
    ctx.arc(x, y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    height * 0.1,
    width * 0.5,
    height * 0.5,
    height * 0.83
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.34)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function renderFrame(timestamp) {
  const time = timestamp * 0.001;

  ctx.clearRect(0, 0, state.width, state.height);
  drawWallAndFloor();
  drawWorkspaceDecor(time);
  drawWindowOutside(time);
  drawWindowFrame();
  drawSunbeams(time);
  drawCatAndSillPlant(time);
  drawChair(time);
  drawPerson(time);
  drawDesk(time);
  drawMonitor(time);
  drawAtmosphere(time);

  requestAnimationFrame(renderFrame);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(renderFrame);
