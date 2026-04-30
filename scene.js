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

  const windowW = width * 0.56;
  const windowH = height * 0.42;
  const windowX = (width - windowW) * 0.5;
  const windowY = height * 0.1;

  state.layout = {
    wallY: height * 0.68,
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
  wallGrad.addColorStop(0, "#1a2445");
  wallGrad.addColorStop(0.42, "#26325d");
  wallGrad.addColorStop(0.72, "#382944");
  wallGrad.addColorStop(1, "#251d32");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, width, wallY);

  const warmLight = ctx.createRadialGradient(
    width * 0.18,
    height * 0.6,
    10,
    width * 0.18,
    height * 0.6,
    width * 0.46
  );
  warmLight.addColorStop(0, "rgba(255, 187, 86, 0.34)");
  warmLight.addColorStop(0.5, "rgba(226, 92, 62, 0.12)");
  warmLight.addColorStop(1, "rgba(255, 187, 86, 0)");
  ctx.fillStyle = warmLight;
  ctx.fillRect(0, 0, width, wallY);

  const coolBalance = ctx.createRadialGradient(
    width * 0.82,
    height * 0.22,
    10,
    width * 0.82,
    height * 0.22,
    width * 0.42
  );
  coolBalance.addColorStop(0, "rgba(70, 177, 216, 0.26)");
  coolBalance.addColorStop(1, "rgba(70, 177, 216, 0)");
  ctx.fillStyle = coolBalance;
  ctx.fillRect(0, 0, width, wallY);

  const floorGrad = ctx.createLinearGradient(0, wallY, 0, height);
  floorGrad.addColorStop(0, "#493447");
  floorGrad.addColorStop(0.42, "#251a2c");
  floorGrad.addColorStop(1, "#11111d");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, wallY, width, height - wallY);

  fillRoundedRect(0, wallY - 8, width, 14, 0, "rgba(12, 15, 31, 0.82)");

  for (let i = 0; i < 13; i += 1) {
    const y = wallY + 14 + i * 20;
    ctx.strokeStyle = i % 2 ? "rgba(15, 16, 29, 0.35)" : "rgba(92, 72, 101, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.drawImage(state.noiseLayer, 0, 0, width, height);
  ctx.restore();

  const cornerShade = ctx.createLinearGradient(0, 0, width, 0);
  cornerShade.addColorStop(0, "rgba(0,0,0,0.22)");
  cornerShade.addColorStop(0.08, "rgba(0,0,0,0)");
  cornerShade.addColorStop(0.92, "rgba(0,0,0,0)");
  cornerShade.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = cornerShade;
  ctx.fillRect(0, 0, width, height);
}

function drawWorkspaceDecor(time) {
  const { width } = state;
  const { wallY } = state.layout;

  const shelfY = wallY * 0.42;
  fillRoundedRect(width * 0.09, shelfY, width * 0.22, 14, 4, "#1b1630");
  fillRoundedRect(width * 0.09, shelfY - 2, width * 0.22, 3, 2, "rgba(255, 188, 84, 0.35)");

  for (let i = 0; i < 8; i += 1) {
    const bx = width * 0.12 + i * (width * 0.021);
    const h = 26 + (i % 3) * 12;
    const bookColors = ["#ef6f5e", "#f5b84d", "#55b8c8", "#7f7bd8"];
    fillRoundedRect(bx, shelfY - h, width * 0.016, h, 2, bookColors[i % bookColors.length]);
    fillRoundedRect(bx + 3, shelfY - h + 5, width * 0.006, h - 10, 1, "rgba(255, 255, 255, 0.18)");
  }

  fillRoundedRect(width * 0.19, shelfY - 60, width * 0.035, 36, 6, "#dd7751");
  fillRoundedRect(width * 0.19 - 2, shelfY - 62, width * 0.039, 6, 3, "#ffad70");
  ctx.strokeStyle = "#4bc07a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.206, shelfY - 60);
  ctx.quadraticCurveTo(width * 0.198, shelfY - 82, width * 0.214, shelfY - 104);
  ctx.stroke();
  fillRoundedRect(width * 0.196, shelfY - 108, 8, 20, 4, "#62d58b");
  fillRoundedRect(width * 0.21, shelfY - 102, 8, 16, 4, "#76e099");

  fillRoundedRect(width * 0.075, wallY * 0.14, width * 0.13, wallY * 0.22, 6, "#10182d");
  fillRoundedRect(width * 0.083, wallY * 0.155, width * 0.114, wallY * 0.19, 4, "#d35d72");
  fillRoundedRect(width * 0.09, wallY * 0.17, width * 0.1, wallY * 0.06, 4, "#f4b45c");
  fillRoundedRect(width * 0.09, wallY * 0.245, width * 0.075, wallY * 0.038, 4, "#4cb4d8");

  fillRoundedRect(width * 0.785, wallY * 0.14, width * 0.13, wallY * 0.22, 6, "#111a30");
  fillRoundedRect(width * 0.795, wallY * 0.155, width * 0.11, wallY * 0.19, 4, "#233f68");
  ctx.save();
  ctx.shadowColor = "rgba(95, 222, 235, 0.75)";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "#7ce7ed";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.812, wallY * 0.255);
  ctx.lineTo(width * 0.84, wallY * 0.2);
  ctx.lineTo(width * 0.875, wallY * 0.255);
  ctx.lineTo(width * 0.895, wallY * 0.215);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 9; i += 1) {
    const lx = width * 0.32 + i * width * 0.045;
    const ly = wallY * 0.16 + Math.sin(i * 0.85) * 12;
    ctx.strokeStyle = "rgba(21, 18, 34, 0.68)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx - width * 0.023, ly - 8);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = i % 3 === 0 ? "#ffd36e" : i % 3 === 1 ? "#6ee8ff" : "#ff7b78";
    ctx.shadowBlur = 12;
    fillRoundedRect(lx - 3, ly, 7, 10, 4, ctx.shadowColor);
    ctx.restore();
  }

  const hangX = width * 0.8;
  const hangY = wallY * 0.12;
  ctx.strokeStyle = "#4f3a2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hangX, hangY);
  ctx.lineTo(hangX, hangY + 44);
  ctx.stroke();
  fillRoundedRect(hangX - 26, hangY + 44, 52, 20, 5, "#d46b4f");
  fillRoundedRect(hangX - 30, hangY + 40, 60, 6, 3, "#ffad78");
  fillRoundedRect(hangX - 22, hangY + 26, 10, 28, 5, "#4dc47d");
  fillRoundedRect(hangX - 8, hangY + 28, 10, 24, 5, "#65d590");
  fillRoundedRect(hangX + 8, hangY + 24, 10, 30, 5, "#43b870");

  const floorPlantX = width * 0.86;
  const floorPlantY = wallY + 22;
  fillRoundedRect(floorPlantX, floorPlantY, 46, 34, 5, "#d36f53");
  fillRoundedRect(floorPlantX - 3, floorPlantY - 3, 52, 8, 4, "#ffad78");
  for (let i = 0; i < 7; i += 1) {
    const sway = Math.sin(time * 1.2 + i) * 4;
    ctx.strokeStyle = i % 2 ? "#3ec276" : "#5ed890";
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
  skyGrad.addColorStop(0, "#07122d");
  skyGrad.addColorStop(0.45, "#17224e");
  skyGrad.addColorStop(0.78, "#35264d");
  skyGrad.addColorStop(1, "#1b2038");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h);

  const moonGlow = ctx.createRadialGradient(
    x + w * 0.76,
    y + h * 0.18,
    8,
    x + w * 0.76,
    y + h * 0.18,
    w * 0.28
  );
  moonGlow.addColorStop(0, "rgba(233, 244, 255, 0.52)");
  moonGlow.addColorStop(0.18, "rgba(153, 206, 255, 0.24)");
  moonGlow.addColorStop(1, "rgba(153, 206, 255, 0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.shadowColor = "rgba(193, 224, 255, 0.8)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#dcecff";
  ctx.beginPath();
  ctx.arc(x + w * 0.76, y + h * 0.18, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < 42; i += 1) {
    const sx = x + ((i * 47) % w);
    const sy = y + 12 + ((i * 31) % Math.floor(h * 0.42));
    const twinkle = 0.45 + Math.sin(time * 1.7 + i) * 0.25;
    ctx.fillStyle = `rgba(236, 244, 255, ${twinkle})`;
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
  }

  const cloudOffset = (time * 9) % (w + 160);
  for (let i = 0; i < 3; i += 1) {
    const cx = x - 150 + cloudOffset + i * 220;
    const cy = y + h * 0.2 + i * 18;
    fillRoundedRect(cx, cy, 130, 24, 12, "rgba(84, 99, 143, 0.28)");
    fillRoundedRect(cx + 24, cy - 8, 82, 18, 9, "rgba(104, 119, 165, 0.22)");
  }

  const buildingColors = ["#151a31", "#1c2340", "#202848", "#18203b", "#243052"];
  for (let i = 0; i < 13; i += 1) {
    const bw = w * (0.055 + (i % 3) * 0.012);
    const bh = h * (0.22 + (i % 5) * 0.045);
    const bx = x + i * (w / 12.2) - 10;
    const by = y + h * 0.68 - bh;
    fillRoundedRect(bx, by, bw, bh, 2, buildingColors[i % buildingColors.length]);
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        if ((row + col + i) % 3 === 0) {
          const wx = bx + 8 + col * (bw * 0.25);
          const wy = by + 10 + row * (bh * 0.15);
          ctx.fillStyle = row % 2 ? "rgba(255, 198, 82, 0.72)" : "rgba(98, 210, 232, 0.58)";
          ctx.fillRect(wx, wy, Math.max(3, bw * 0.09), 4);
        }
      }
    }
  }

  const roadY = y + h * 0.74;
  const roadH = h * 0.22;
  const roadGrad = ctx.createLinearGradient(x, roadY, x, roadY + roadH);
  roadGrad.addColorStop(0, "rgba(24, 29, 45, 0.94)");
  roadGrad.addColorStop(1, "rgba(9, 12, 22, 0.94)");
  fillRoundedRect(x, roadY, w, roadH, 3, roadGrad);

  for (let i = 0; i < 10; i += 1) {
    const stripeX = x + ((time * 46 + i * 70) % (w + 60)) - 30;
    fillRoundedRect(stripeX, roadY + roadH * 0.52, 28, 3, 1, "rgba(245, 211, 118, 0.46)");
  }
  drawCarsOutside(time, x, roadY, w, roadH);

  for (let i = 0; i < 36; i += 1) {
    const rx = x + ((i * 23 + time * 18) % w);
    const ry = y + ((i * 41 + time * 42) % h);
    ctx.strokeStyle = "rgba(174, 207, 241, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 6, ry + 18);
    ctx.stroke();
  }
}

function drawWindowFrame() {
  const { windowX: x, windowY: y, windowW: w, windowH: h } = state.layout;

  const curtainGrad = ctx.createLinearGradient(x, y, x, y + h);
  curtainGrad.addColorStop(0, "#a93f63");
  curtainGrad.addColorStop(0.55, "#722b55");
  curtainGrad.addColorStop(1, "#3a2140");
  fillRoundedRect(x - 64, y - 20, 62, h + 60, 18, curtainGrad);
  fillRoundedRect(x + w + 2, y - 20, 62, h + 60, 18, curtainGrad);
  for (let i = 0; i < 4; i += 1) {
    const foldX = x - 52 + i * 13;
    ctx.strokeStyle = "rgba(255, 160, 150, 0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(foldX, y - 6);
    ctx.quadraticCurveTo(foldX + 8, y + h * 0.45, foldX, y + h + 32);
    ctx.stroke();

    const rightFoldX = x + w + 14 + i * 13;
    ctx.beginPath();
    ctx.moveTo(rightFoldX, y - 6);
    ctx.quadraticCurveTo(rightFoldX - 8, y + h * 0.45, rightFoldX, y + h + 32);
    ctx.stroke();
  }

  ctx.fillStyle = "#171125";
  ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
  ctx.fillStyle = "#312141";
  ctx.fillRect(x - 8, y - 8, w + 16, h + 16);

  ctx.fillStyle = "#1a142b";
  ctx.fillRect(x + w * 0.5 - 3, y, 6, h);
  ctx.fillRect(x, y + h * 0.52, w, 5);

  ctx.fillStyle = "#151024";
  ctx.fillRect(x - 30, y + h + 9, w + 60, 14);
  fillRoundedRect(x - 44, y - 26, w + 88, 12, 6, "#241a34");

  ctx.strokeStyle = "rgba(174, 220, 255, 0.13)";
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
  ctx.shadowColor = "rgba(93, 190, 255, 0.28)";
  ctx.shadowBlur = 20;
  ctx.strokeStyle = "rgba(141, 216, 255, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);
  ctx.restore();
}

function drawSunbeams(time) {
  const { deskX, deskY, deskW, wallY } = state.layout;
  const lampX = deskX + deskW * 0.17;
  const lampY = deskY - 54;
  ctx.save();
  const glow = ctx.createRadialGradient(lampX, lampY, 8, lampX, lampY, state.width * 0.34);
  glow.addColorStop(0, "rgba(255, 205, 104, 0.34)");
  glow.addColorStop(0.38, "rgba(255, 142, 72, 0.16)");
  glow.addColorStop(1, "rgba(255, 142, 72, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.globalAlpha = 0.24 + Math.sin(time * 1.4) * 0.035;
  ctx.fillStyle = "#ffd77a";
  ctx.beginPath();
  ctx.moveTo(lampX - 42, lampY + 12);
  ctx.lineTo(lampX + 114, wallY + 64);
  ctx.lineTo(lampX - 8, wallY + 76);
  ctx.closePath();
  ctx.fill();
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
  topGrad.addColorStop(0, "#6a4a47");
  topGrad.addColorStop(0.5, "#3d2c3f");
  topGrad.addColorStop(1, "#201829");
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - 34, y + 34);
  ctx.lineTo(x + 34, y + 34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#171222";
  ctx.fillRect(x + 18, y + 34, 22, h + 26);
  ctx.fillRect(x + w - 40, y + 34, 22, h + 26);
  ctx.fillRect(x, y + 30, w, 7);

  const lampX = x + w * 0.17;
  const lampY = y - 54;
  ctx.save();
  ctx.shadowColor = "rgba(255, 202, 90, 0.75)";
  ctx.shadowBlur = 22;
  fillRoundedRect(lampX - 25, lampY - 2, 54, 24, 8, "#f2b84a");
  ctx.restore();
  fillRoundedRect(lampX - 31, lampY + 14, 66, 10, 5, "#c96f42");
  ctx.strokeStyle = "#d89856";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(lampX, lampY + 24);
  ctx.lineTo(lampX - 26, y + 20);
  ctx.stroke();
  fillRoundedRect(lampX - 42, y + 18, 42, 8, 4, "#e0a05a");
  fillRoundedRect(lampX - 55, y + 24, 70, 10, 5, "#2a2031");

  const mugX = x + 80;
  const mugY = y + 6;
  fillRoundedRect(mugX, mugY, 28, 24, 5, "#f1c37a");
  fillRoundedRect(mugX + 24, mugY + 7, 8, 11, 3, "#f1c37a");
  fillRoundedRect(mugX + 5, mugY + 4, 18, 3, 2, "#f2d6bc");

  for (let i = 0; i < 4; i += 1) {
    const rise = (time * 17 + i * 11) % 36;
    const sway = Math.sin(time * 1.8 + i) * 3;
    fillRoundedRect(mugX + 12 + sway, mugY - rise, 3, 10, 2, "rgba(229, 236, 240, 0.52)");
  }

  const secondCupX = x + 156;
  fillRoundedRect(secondCupX, y + 10, 24, 18, 4, "#e66f5d");
  fillRoundedRect(secondCupX + 20, y + 15, 6, 8, 3, "#e66f5d");

  fillRoundedRect(x + w * 0.28, y + 8, 64, 18, 4, "#4f9fbd");
  fillRoundedRect(x + w * 0.28 + 4, y + 12, 56, 4, 2, "rgba(233, 241, 255, 0.35)");

  fillRoundedRect(x + w * 0.74, y + 10, 20, 26, 4, "#d66f55");
  fillRoundedRect(x + w * 0.74 - 1, y + 8, 22, 5, 3, "#ffb176");
  fillRoundedRect(x + w * 0.74 + 3, y - 10, 6, 18, 3, "#59d083");
  fillRoundedRect(x + w * 0.74 + 10, y - 8, 6, 16, 3, "#7ee39a");
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

  const dvdBg = ctx.createLinearGradient(x, y, x + w, y + h);
  dvdBg.addColorStop(0, "#05030d");
  dvdBg.addColorStop(0.5, "#080f22");
  dvdBg.addColorStop(1, "#130620");
  ctx.fillStyle = dvdBg;
  ctx.fillRect(x, y, w, h);

  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i % 2 ? "rgba(69, 218, 255, 0.035)" : "rgba(255, 91, 140, 0.028)";
    ctx.fillRect(x, y + i * 17, w, 8);
  }

  const logoW = 84;
  const logoH = 46;
  const pad = 17;
  const travelX = w - logoW - pad * 2;
  const travelY = h - logoH - pad * 2;
  const bounceX = Math.abs(((time * 24) % (travelX * 2)) - travelX);
  const bounceY = Math.abs(((time * 17) % (travelY * 2)) - travelY);
  const logoX = x + pad + bounceX;
  const logoY = y + pad + bounceY;
  const logoColors = ["#58e6ff", "#ffcf5d", "#ff6f82", "#78f29b", "#b28cff"];
  const logoColor = logoColors[Math.floor(time * 0.55) % logoColors.length];

  ctx.save();
  ctx.shadowColor = logoColor;
  ctx.shadowBlur = 20;
  fillRoundedRect(logoX - 8, logoY - 6, logoW + 16, logoH + 12, 8, "rgba(255, 255, 255, 0.038)");
  ctx.fillStyle = logoColor;
  ctx.font = "italic 900 32px Source Sans 3, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DVD", logoX + logoW * 0.5, logoY + 16);

  ctx.strokeStyle = logoColor;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(logoX + logoW * 0.5, logoY + 29, logoW * 0.38, 6.5, -0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = logoColor;
  ctx.beginPath();
  ctx.moveTo(logoX + logoW * 0.78, logoY + 27);
  ctx.lineTo(logoX + logoW * 0.95, logoY + 24);
  ctx.lineTo(logoX + logoW * 0.83, logoY + 32);
  ctx.closePath();
  ctx.fill();

  ctx.font = "900 9px Source Sans 3, sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("VIDEO", logoX + logoW * 0.5, logoY + 42);
  ctx.letterSpacing = "0px";
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);

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
  const underglow = ctx.createLinearGradient(keyboardX, keyboardY, keyboardX + 142, keyboardY);
  underglow.addColorStop(0, "rgba(255, 93, 120, 0.36)");
  underglow.addColorStop(0.5, "rgba(83, 231, 255, 0.3)");
  underglow.addColorStop(1, "rgba(134, 255, 162, 0.28)");
  fillRoundedRect(keyboardX - 12, keyboardY + 15, 166, 18, 9, underglow);
  fillRoundedRect(keyboardX, keyboardY, 142, 22, 6, "#262d33");
  for (let i = 0; i < 15; i += 1) {
    const keyX = keyboardX + 7 + i * 8.6;
    const hue = (time * 90 + i * 22) % 360;
    ctx.fillStyle = `hsl(${hue}, 84%, 66%)`;
    ctx.fillRect(keyX, keyboardY + 6, 6, 3);
    ctx.fillStyle = i % 2 ? "#3a464e" : "#2f3941";
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

  const colorWash = ctx.createLinearGradient(0, 0, width, height);
  colorWash.addColorStop(0, "rgba(255, 165, 112, 0.08)");
  colorWash.addColorStop(0.45, "rgba(0, 0, 0, 0)");
  colorWash.addColorStop(1, "rgba(102, 147, 210, 0.07)");
  ctx.fillStyle = colorWash;
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
