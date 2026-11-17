import * as THREE from 'three';
import {
  createScreenTexture,
  createBatteryTexture,
  createPCBTexture,
  createBackPanelTexture,
} from './textureGenerators';

/**
 * Creates a rounded rectangle 2D shape for extrusions
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Creates an L-shaped 2D shape for Apple iPhone dual-cell batteries
 */
function createLShapeBattery(width, height) {
  const shape = new THREE.Shape();
  const x0 = -width / 2;
  const y0 = -height / 2;
  const wBot = width;
  const hBot = height * 0.52;
  const wTop = width * 0.52;
  const hTop = height * 0.48;

  shape.moveTo(x0, y0);
  shape.lineTo(x0 + wBot, y0);
  shape.lineTo(x0 + wBot, y0 + hBot);
  shape.lineTo(x0 + wTop, y0 + hBot);
  shape.lineTo(x0 + wTop, y0 + hBot + hTop);
  shape.lineTo(x0, y0 + hBot + hTop);
  shape.closePath();
  return shape;
}

/**
 * Procedural Phone Builder with Era-Authentic Topologies
 */
export function createPhone(config) {
  const root = new THREE.Group();
  root.name = `phone_${config.id}`;

  const partsMap = new Map();
  const disposables = [];

  // Proportional dimensions reflecting authentic physical size variations
  const normScale = 3.2 / 160; // 0.02 unit per mm
  const w = (config.width || 75) * normScale;
  const h = (config.height || 160) * normScale;
  const t = Math.max((config.thickness || 8.2) * normScale, 0.15);

  // Corner radius
  let cornerRadius = config.cornerRadius || 7.5;
  if (config.chassisForm === 'box_ultra') cornerRadius = 1.8;
  else if (config.chassisForm === 'qwerty_keypad') cornerRadius = 10.0;
  else if (config.chassisForm === 'vintage_compact') cornerRadius = 10.0;
  const r = Math.max(cornerRadius * normScale, 0.035);

  const phoneColor = new THREE.Color(config.color || '#26282e');
  const accentColor = new THREE.Color(config.accentColor || '#64748b');

  // Load procedural textures
  const screenTex = createScreenTexture(config);
  const batteryTex = createBatteryTexture(config);
  const pcbTex = createPCBTexture(config);
  const backTex = createBackPanelTexture(config);
  disposables.push(screenTex, batteryTex, pcbTex.map, pcbTex.bump, backTex);

  const brandLower = (config.brand || '').toLowerCase();
  const isApple = brandLower === 'apple';
  const isSamsung = brandLower === 'samsung';
  const isOnePlus = brandLower.includes('oneplus') || brandLower.includes('oppo');
  const isPOCO = brandLower.includes('poco');
  const isInfinix = brandLower.includes('infinix') || brandLower.includes('tecno');
  const isPixel = brandLower.includes('google');
  const isGaming = config.segment === 'Gaming' || config.chassisForm === 'gaming_mecha';

  const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
  disposables.push(goldPinMat);

  function registerPart(id, obj, explodeOffset) {
    obj.name = id;
    obj.userData = {
      partId: id,
      defaultPos: obj.position.clone(),
      explodeOffset: new THREE.Vector3(...explodeOffset),
      baseRotation: obj.rotation.clone(),
    };
    root.add(obj);
    partsMap.set(id, obj);
  }

  // ==========================================
  // 1. FRAME (Chassis Backbone & Side Rails)
  // ==========================================
  const frameGroup = new THREE.Group();
  const frameShape = createRoundedRectShape(w, h, r);
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: t * 0.92,
    bevelEnabled: true,
    bevelSegments: config.chassisForm === 'modern_flat' ? 6 : 4,
    steps: 1,
    bevelSize: config.chassisForm === 'box_ultra' ? 0.008 : 0.015,
    bevelThickness: config.chassisForm === 'box_ultra' ? 0.008 : 0.015,
  });
  frameGeo.center();
  disposables.push(frameGeo);

  // Material: Polycarbonate (Lumia) / Stainless Steel (Vintage iPhone) / Titanium (Modern Pro) / Aluminum
  let frameMat;
  if (config.chassisForm === 'lumia_polycarbonate') {
    frameMat = new THREE.MeshStandardMaterial({
      color: phoneColor,
      roughness: 0.2,
      metalness: 0.1,
      envMapIntensity: 1.0,
    });
  } else if (config.frameMaterial === 'stainless_steel') {
    frameMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 1.5,
    });
  } else {
    frameMat = new THREE.MeshStandardMaterial({
      color: phoneColor.clone().offsetHSL(0, -0.05, 0.12),
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.2,
    });
  }
  disposables.push(frameMat);

  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  frameGroup.add(frameMesh);

  // Buttons
  const btnMat = new THREE.MeshStandardMaterial({
    color: phoneColor.clone().offsetHSL(0, 0, 0.25),
    metalness: 0.95,
    roughness: 0.15,
  });
  disposables.push(btnMat);

  // Power Button (right)
  const powerBtnGeo = new THREE.BoxGeometry(0.02, 0.28, 0.04);
  disposables.push(powerBtnGeo);
  const powerBtn = new THREE.Mesh(powerBtnGeo, btnMat);
  powerBtn.position.set(w / 2 + 0.015, 0.35, 0);
  frameGroup.add(powerBtn);

  // Volume Rocker (left)
  const volBtnGeo = new THREE.BoxGeometry(0.02, 0.52, 0.04);
  disposables.push(volBtnGeo);
  const volBtn = new THREE.Mesh(volBtnGeo, btnMat);
  volBtn.position.set(-w / 2 - 0.015, 0.45, 0);
  frameGroup.add(volBtn);

  // Action Button / Camera Control Button for Apple 15/16
  if (config.brand.toLowerCase() === 'apple' && (config.year || 2024) >= 2023) {
    const actionBtnGeo = new THREE.BoxGeometry(0.02, 0.14, 0.04);
    disposables.push(actionBtnGeo);
    const actionBtn = new THREE.Mesh(actionBtnGeo, btnMat);
    actionBtn.position.set(-w / 2 - 0.015, 0.75, 0);
    frameGroup.add(actionBtn);

    if ((config.year || 2024) >= 2024) {
      const camCtrlGeo = new THREE.BoxGeometry(0.012, 0.22, 0.035);
      disposables.push(camCtrlGeo);
      const camCtrl = new THREE.Mesh(camCtrlGeo, btnMat);
      camCtrl.position.set(w / 2 + 0.01, -0.45, 0);
      frameGroup.add(camCtrl);
    }
  }

  // Gaming Shoulder Capacitive Air Triggers
  if (config.chassisForm === 'gaming_mecha') {
    const triggerGeo = new THREE.BoxGeometry(0.02, 0.38, 0.04);
    disposables.push(triggerGeo);
    const trigL = new THREE.Mesh(triggerGeo, btnMat);
    trigL.position.set(w / 2 + 0.012, 0.9, 0);
    const trigR = new THREE.Mesh(triggerGeo, btnMat);
    trigR.position.set(w / 2 + 0.012, -0.9, 0);
    frameGroup.add(trigL, trigR);
  }

  // Foldable Central Spine Hinge Cylinder
  if (config.chassisForm === 'foldable_book' || config.chassisForm === 'foldable_flip') {
    const isBook = config.chassisForm === 'foldable_book';
    const hingeGeo = new THREE.CylinderGeometry(0.035, 0.035, isBook ? h * 0.98 : w * 0.98, 24);
    if (!isBook) hingeGeo.rotateZ(Math.PI / 2);
    disposables.push(hingeGeo);
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.2 });
    disposables.push(hingeMat);
    const hinge = new THREE.Mesh(hingeGeo, hingeMat);
    hinge.position.set(0, 0, 0);
    frameGroup.add(hinge);
  }

  // Samsung Galaxy Ultra: S-Pen Silo Cap
  if (config.chassisForm === 'box_ultra') {
    const spenCapGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.04, 16);
    spenCapGeo.rotateZ(Math.PI / 2);
    disposables.push(spenCapGeo);
    const spenCapMat = new THREE.MeshStandardMaterial({ color: 0x111317, metalness: 0.9, roughness: 0.2 });
    disposables.push(spenCapMat);
    const spenCap = new THREE.Mesh(spenCapGeo, spenCapMat);
    spenCap.position.set(-w / 2 + 0.16, -h / 2 - 0.012, 0);
    frameGroup.add(spenCap);
  }

  // Bottom Port (USB-C / 30-pin Dock for vintage iPhone 4)
  const portMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  disposables.push(portMat);
  if (config.brand.toLowerCase() === 'apple' && (config.year || 2024) <= 2011) {
    // 30-pin wide dock
    const dockGeo = new THREE.BoxGeometry(0.42, 0.03, 0.06);
    disposables.push(dockGeo);
    const dock = new THREE.Mesh(dockGeo, portMat);
    dock.position.set(0, -h / 2 - 0.01, 0);
    frameGroup.add(dock);
  } else {
    // USB-C / Lightning Port
    const portGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.14, 16);
    portGeo.rotateZ(Math.PI / 2);
    disposables.push(portGeo);
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.set(0, -h / 2 - 0.01, 0);
    frameGroup.add(port);
  }

  registerPart('frame', frameGroup, [0, 0, 0]);

  // ==========================================
  // 2. SCREEN (Front Display, Glass & Controls)
  // ==========================================
  const screenGroup = new THREE.Group();

  // If QWERTY keypad, screen is positioned on top 45% of phone
  const isQWERTY = config.hasQwerty || config.chassisForm === 'qwerty_keypad';
  const screenH = isQWERTY ? h * 0.44 : h * 0.96;
  const screenY = isQWERTY ? h * 0.24 : 0;
  const screenW = w * 0.95;

  const screenShape = createRoundedRectShape(screenW, screenH, isQWERTY ? 0.04 : r * 0.85);
  const screenGeo = new THREE.ShapeGeometry(screenShape);
  screenGeo.center();
  disposables.push(screenGeo);

  // Normalize UV coordinates on screen geometry so the 1080x2400 lockscreen maps with 100% pixel perfection
  const screenPos = screenGeo.attributes.position;
  const screenUVs = new Float32Array(screenPos.count * 2);
  for (let i = 0; i < screenPos.count; i++) {
    screenUVs[i * 2] = (screenPos.getX(i) + screenW / 2) / screenW;
    screenUVs[i * 2 + 1] = (screenPos.getY(i) + screenH / 2) / screenH;
  }
  screenGeo.setAttribute('uv', new THREE.BufferAttribute(screenUVs, 2));

  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    roughness: 0.12,
    metalness: 0.02,
    emissive: new THREE.Color(0x222222),
    emissiveMap: screenTex,
    emissiveIntensity: 0.45,
  });
  disposables.push(screenMat);

  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, screenY, t / 2 + 0.014);
  screenGroup.add(screenMesh);

  // Front glass bevel
  const frontGlassShape = createRoundedRectShape(w, h, r);
  const frontGlassGeo = new THREE.ExtrudeGeometry(frontGlassShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });
  frontGlassGeo.center();
  disposables.push(frontGlassGeo);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.03,
    metalness: 0.05,
    clearcoat: 1.0,
  });
  disposables.push(glassMat);

  const frontGlass = new THREE.Mesh(frontGlassGeo, glassMat);
  frontGlass.position.set(0, 0, t / 2 + 0.018);
  screenGroup.add(frontGlass);

  // 3D Physical QWERTY Keyboard Array (for BlackBerry & QWERTY phones)
  if (isQWERTY) {
    const keyGroup = new THREE.Group();
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.15,
    });
    disposables.push(keyMat);

    const fretMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    disposables.push(fretMat);

    const keyStartY = -0.15;
    const rowH = 0.24;
    for (let row = 0; row < 4; row++) {
      const yPos = keyStartY - row * rowH;
      const numKeys = row === 3 ? 5 : 9;
      const keyW = (w * 0.88) / numKeys - 0.015;

      for (let k = 0; k < numKeys; k++) {
        const xPos = -w * 0.44 + (k + 0.5) * (keyW + 0.015);
        const kGeo = new THREE.BoxGeometry(keyW, 0.16, 0.02);
        disposables.push(kGeo);
        const kMesh = new THREE.Mesh(kGeo, keyMat);
        kMesh.position.set(xPos, yPos, t / 2 + 0.025);
        keyGroup.add(kMesh);
      }

      // Silver fret separator
      const fretGeo = new THREE.BoxGeometry(w * 0.9, 0.012, 0.022);
      disposables.push(fretGeo);
      const fret = new THREE.Mesh(fretGeo, fretMat);
      fret.position.set(0, yPos + 0.1, t / 2 + 0.024);
      keyGroup.add(fret);
    }

    // Central optical trackpad button
    const trackpadGeo = new THREE.BoxGeometry(0.18, 0.18, 0.025);
    disposables.push(trackpadGeo);
    const trackpad = new THREE.Mesh(trackpadGeo, fretMat);
    trackpad.position.set(0, 0.05, t / 2 + 0.025);
    keyGroup.add(trackpad);

    screenGroup.add(keyGroup);
  }

  // Physical Home Button (iPhone 4-8 round button vs Samsung oval button)
  if (config.hasHomeButton && !isQWERTY) {
    if (config.homeButtonType === 'round_apple') {
      const btnGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.015, 32);
      btnGeo.rotateX(Math.PI / 2);
      const btnMatHb = new THREE.MeshStandardMaterial({
        color: phoneColor.clone().offsetHSL(0, 0, 0.05),
        metalness: 0.8,
        roughness: 0.2,
      });
      disposables.push(btnGeo, btnMatHb);
      const homeBtn = new THREE.Mesh(btnGeo, btnMatHb);
      homeBtn.position.set(0, -h / 2 + 0.22, t / 2 + 0.022);
      screenGroup.add(homeBtn);
    } else if (config.homeButtonType === 'oval_samsung') {
      const btnGeo = new THREE.CapsuleGeometry(0.055, 0.18, 8, 16);
      btnGeo.rotateZ(Math.PI / 2);
      const btnMatHb = new THREE.MeshStandardMaterial({
        color: phoneColor.clone().offsetHSL(0, 0, 0.08),
        metalness: 0.85,
        roughness: 0.2,
      });
      disposables.push(btnGeo, btnMatHb);
      const homeBtn = new THREE.Mesh(btnGeo, btnMatHb);
      homeBtn.position.set(0, -h / 2 + 0.2, t / 2 + 0.022);
      screenGroup.add(homeBtn);
    }
  }

  // HTC Stereo BoomSound Dual Front Speaker Grilles
  if (config.chassisForm === 'aluminum_unibody' && config.brand.toLowerCase() === 'htc') {
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0c });
    disposables.push(grilleMat);
    for (let side of [1, -1]) {
      const gGeo = new THREE.BoxGeometry(w * 0.75, 0.12, 0.015);
      disposables.push(gGeo);
      const grille = new THREE.Mesh(gGeo, grilleMat);
      grille.position.set(0, side * (h / 2 - 0.12), t / 2 + 0.02);
      screenGroup.add(grille);
    }
  }

  // Screen Cutout / Punch hole / Dynamic Island
  if (!isQWERTY && !config.hasHomeButton) {
    if (config.notchStyle === 'dynamic_island') {
      const pillGeo = new THREE.CapsuleGeometry(0.042, 0.16, 8, 16);
      pillGeo.rotateZ(Math.PI / 2);
      disposables.push(pillGeo);
      const pill = new THREE.Mesh(pillGeo, portMat);
      pill.position.set(0, h / 2 - 0.18, t / 2 + 0.025);
      screenGroup.add(pill);
    } else if (config.notchStyle === 'classic_notch') {
      const notchGeo = new THREE.BoxGeometry(0.55, 0.12, 0.02);
      disposables.push(notchGeo);
      const notch = new THREE.Mesh(notchGeo, portMat);
      notch.position.set(0, h / 2 - 0.08, t / 2 + 0.025);
      screenGroup.add(notch);
    } else if (config.notchStyle === 'punch_hole_left') {
      const punchGeo = new THREE.CircleGeometry(0.035, 24);
      disposables.push(punchGeo);
      const punch = new THREE.Mesh(punchGeo, portMat);
      punch.position.set(-w / 2 + 0.25, h / 2 - 0.18, t / 2 + 0.025);
      screenGroup.add(punch);
    } else if (config.notchStyle === 'punch_hole_center') {
      const punchGeo = new THREE.CircleGeometry(0.035, 24);
      disposables.push(punchGeo);
      const punch = new THREE.Mesh(punchGeo, portMat);
      punch.position.set(0, h / 2 - 0.18, t / 2 + 0.025);
      screenGroup.add(punch);
    }
  }

  // OLED Display Rear Metal Backing & Folded COP Flex (Visible in teardown)
  const oledBackGeo = new THREE.ShapeGeometry(screenShape);
  oledBackGeo.center();
  disposables.push(oledBackGeo);
  const oledBackMat = new THREE.MeshStandardMaterial({
    color: 0x1e2024,
    metalness: 0.85,
    roughness: 0.25,
  });
  disposables.push(oledBackMat);
  const oledBackMesh = new THREE.Mesh(oledBackGeo, oledBackMat);
  oledBackMesh.rotation.y = Math.PI;
  oledBackMesh.position.set(0, screenY, t / 2 + 0.002);
  screenGroup.add(oledBackMesh);

  // Under-display fingerprint sensor module on rear of OLED (Android)
  if (!isApple && (config.year || 2024) >= 2019) {
    const fpGeo = new THREE.BoxGeometry(0.18, 0.18, 0.015);
    disposables.push(fpGeo);
    const fpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    disposables.push(fpMat);
    const fpMesh = new THREE.Mesh(fpGeo, fpMat);
    fpMesh.position.set(0, -h * 0.24, t / 2 - 0.005);
    screenGroup.add(fpMesh);
  }

  // COP Display Ribbon Tail curling downwards
  const copGeo = new THREE.BoxGeometry(w * 0.38, 0.18, 0.008);
  disposables.push(copGeo);
  const copMat = new THREE.MeshStandardMaterial({ color: isApple ? 0x18181b : 0xd97706, roughness: 0.4 });
  disposables.push(copMat);
  const copMesh = new THREE.Mesh(copGeo, copMat);
  copMesh.position.set(0, -h / 2 + 0.12, t / 2 - 0.004);
  screenGroup.add(copMesh);

  registerPart('screen', screenGroup, [0, 0, 2.2]);

  // ==========================================
  // 2. FRONT CAMERA MODULE & SENSORS (Layer 2)
  // ==========================================
  const frontCamGroup = new THREE.Group();
  const frontCamBracketMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.25,
  });
  const selfieLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x111322,
    metalness: 0.3,
    roughness: 0.05,
    transmission: 0.5,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.25,
  });
  disposables.push(frontCamBracketMat, selfieLensMat);

  if (isApple) {
    // Dynamic Island TrueDepth Array: 12MP Selfie + 940nm VCSEL IR Dot Projector + Flood Illuminator
    const bracketGeo = new THREE.BoxGeometry(0.52, 0.18, 0.04);
    disposables.push(bracketGeo);
    const bracket = new THREE.Mesh(bracketGeo, frontCamBracketMat);
    frontCamGroup.add(bracket);

    // Selfie Camera Lens
    const camRingGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.045, 24);
    camRingGeo.rotateX(Math.PI / 2);
    disposables.push(camRingGeo);
    const camRing = new THREE.Mesh(camRingGeo, frontCamBracketMat);
    camRing.position.set(-0.13, 0, 0.008);
    const camGlassGeo = new THREE.SphereGeometry(0.045, 16, 16);
    disposables.push(camGlassGeo);
    const camGlass = new THREE.Mesh(camGlassGeo, selfieLensMat);
    camGlass.position.set(-0.13, 0, 0.022);
    frontCamGroup.add(camRing, camGlass);

    // VCSEL IR Dot Projector
    const irGeo = new THREE.BoxGeometry(0.08, 0.08, 0.042);
    disposables.push(irGeo);
    const irMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 });
    disposables.push(irMat);
    const irEmitter = new THREE.Mesh(irGeo, irMat);
    irEmitter.position.set(0.12, 0, 0.008);
    frontCamGroup.add(irEmitter);

    // Flood Illuminator sensor
    const floodGeo = new THREE.CircleGeometry(0.035, 16);
    disposables.push(floodGeo);
    const floodMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    disposables.push(floodMat);
    const flood = new THREE.Mesh(floodGeo, floodMat);
    flood.position.set(0.01, 0, 0.022);
    frontCamGroup.add(flood);

    // Gold flex tail connecting to motherboard
    const tailGeo = new THREE.BoxGeometry(0.12, 0.22, 0.008);
    disposables.push(tailGeo);
    const tail = new THREE.Mesh(tailGeo, goldPinMat);
    tail.position.set(-0.08, -0.16, -0.01);
    frontCamGroup.add(tail);

  } else {
    // Android Precision Punch-Hole Sensor Module
    const bracketGeo = new THREE.BoxGeometry(0.26, 0.26, 0.04);
    disposables.push(bracketGeo);
    const bracket = new THREE.Mesh(bracketGeo, frontCamBracketMat);
    frontCamGroup.add(bracket);

    const camRingGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.045, 24);
    camRingGeo.rotateX(Math.PI / 2);
    disposables.push(camRingGeo);
    const camRing = new THREE.Mesh(camRingGeo, frontCamBracketMat);
    camRing.position.set(0, 0, 0.008);

    const camGlassGeo = new THREE.SphereGeometry(0.052, 16, 16);
    disposables.push(camGlassGeo);
    const camGlass = new THREE.Mesh(camGlassGeo, selfieLensMat);
    camGlass.position.set(0, 0, 0.022);
    frontCamGroup.add(camRing, camGlass);

    // Gold flex ribbon connector
    const fpcGeo = new THREE.BoxGeometry(0.08, 0.2, 0.008);
    disposables.push(fpcGeo);
    const fpc = new THREE.Mesh(fpcGeo, goldPinMat);
    fpc.position.set(0, -0.18, -0.01);
    frontCamGroup.add(fpc);
  }

  frontCamGroup.position.set(0, h * 0.38, t / 2 - 0.01);
  registerPart('front_camera_module', frontCamGroup, [0, 0.65, 1.6]);

  // ==========================================
  // 3. INTERCONNECT FLEX CABLES (FPC) (Layer 3)
  // ==========================================
  const flexGroup = new THREE.Group();
  const flexMat = new THREE.MeshStandardMaterial({
    color: isApple ? 0x18181b : 0xd97706, // Stealth black for Apple, amber polyimide for Android
    roughness: 0.35,
    metalness: 0.25,
  });
  const b2bMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.3,
  });
  disposables.push(flexMat, b2bMat);

  const flexLength = h * 0.62;
  // Cable 1: Main Data & Display Bus (right side)
  const ribbon1Geo = new THREE.BoxGeometry(0.12, flexLength, 0.008);
  disposables.push(ribbon1Geo);
  const ribbon1 = new THREE.Mesh(ribbon1Geo, flexMat);
  ribbon1.position.set(w * 0.22, -0.08, 0.035);
  flexGroup.add(ribbon1);

  // Cable 2: Fast-Charging VBUS Power Bus (left side)
  const ribbon2Geo = new THREE.BoxGeometry(0.14, flexLength, 0.008);
  disposables.push(ribbon2Geo);
  const ribbon2 = new THREE.Mesh(ribbon2Geo, flexMat);
  ribbon2.position.set(-w * 0.24, -0.08, 0.035);
  flexGroup.add(ribbon2);

  // Board-to-board (B2B) Gold micro-connectors at top and bottom ends
  const b2bGeo = new THREE.BoxGeometry(0.16, 0.08, 0.02);
  disposables.push(b2bGeo);
  [-w * 0.24, w * 0.22].forEach((xPos) => {
    // Top B2B snap connector (connects to motherboard)
    const topB2B = new THREE.Mesh(b2bGeo, b2bMat);
    topB2B.position.set(xPos, -0.08 + flexLength / 2, 0.04);
    const pinsGeo = new THREE.BoxGeometry(0.13, 0.03, 0.024);
    disposables.push(pinsGeo);
    const pins = new THREE.Mesh(pinsGeo, goldPinMat);
    pins.position.set(xPos, -0.08 + flexLength / 2, 0.042);

    // Bottom B2B snap connector (connects to sub-board)
    const botB2B = new THREE.Mesh(b2bGeo, b2bMat);
    botB2B.position.set(xPos, -0.08 - flexLength / 2, 0.04);
    const botPins = new THREE.Mesh(pinsGeo, goldPinMat);
    botPins.position.set(xPos, -0.08 - flexLength / 2, 0.042);

    flexGroup.add(topB2B, pins, botB2B, botPins);
  });

  registerPart('interconnect_flex', flexGroup, [0, 0, 1.2]);

  // ==========================================
  // 3. BACK PANEL (Glass / Polycarbonate / Glyph)
  // ==========================================
  const backGroup = new THREE.Group();
  const backShape = createRoundedRectShape(w, h, r);
  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  });
  backGeo.center();
  disposables.push(backGeo);

  let backMat;
  if (config.chassisForm === 'nothing_glyph') {
    backMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 0.32,
      transparent: true,
      roughness: 0.06,
      metalness: 0.1,
      clearcoat: 1.0,
    });
  } else if (config.chassisForm === 'lumia_polycarbonate') {
    backMat = new THREE.MeshStandardMaterial({
      color: phoneColor,
      roughness: 0.3,
      metalness: 0.05,
    });
  } else {
    backMat = new THREE.MeshPhysicalMaterial({
      color: phoneColor,
      roughness: config.brand.toLowerCase() === 'apple' ? 0.35 : 0.25,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.7,
    });
  }
  disposables.push(backMat);

  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.castShadow = true;
  backMesh.receiveShadow = true;
  backMesh.position.set(0, 0, -t / 2 - 0.015);
  backGroup.add(backMesh);

  // High-Resolution Procedural Graphic Decal covering entire back face
  const backDecalGeo = new THREE.PlaneGeometry(w * 0.99, h * 0.99);
  disposables.push(backDecalGeo);

  // Correct texture orientation so text and logos read properly on rear face
  backTex.center.set(0.5, 0.5);
  backTex.repeat.set(-1, 1);

  const backDecalMat = new THREE.MeshBasicMaterial({
    map: backTex,
    transparent: true,
    opacity: 0.99,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  disposables.push(backDecalMat);
  const backDecal = new THREE.Mesh(backDecalGeo, backDecalMat);
  backDecal.rotation.y = Math.PI; // Face outwards to the back
  backDecal.position.set(0, 0, -t / 2 - 0.043);
  backGroup.add(backDecal);

  // Direct Backpanel Image URL Loader (from Excel Column K or JSON)
  if (config.backPanelImageUrl && typeof config.backPanelImageUrl === 'string' && config.backPanelImageUrl.trim().startsWith('http')) {
    const texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = 'anonymous';
    texLoader.load(
      config.backPanelImageUrl.trim(),
      (customTex) => {
        customTex.generateMipmaps = true;
        customTex.minFilter = THREE.LinearMipmapLinearFilter;
        customTex.center.set(0.5, 0.5);
        customTex.repeat.set(-1, 1);
        backDecalMat.map = customTex;
        backDecalMat.needsUpdate = true;
        disposables.push(customTex);
      },
      undefined,
      (err) => {
        console.warn('Could not load custom back panel image URL, fallback to procedural:', err);
      }
    );
  }

  // Physical 3D Chamfered Rear Fingerprint Sensor (Hot 11S offset squircle / Hot 12 Play center circular / Budget models)
  const hasRearFingerprint = Boolean(
    config.hasRearFingerprint !== undefined
      ? config.hasRearFingerprint
      : (isInfinix && (config.year <= 2022))
  );

  if (hasRearFingerprint) {
    const isOffsetRight = config.rearFingerprintPos === 'offset_right' || config.cameraLayout === 'infinix_dual_circle_owl';
    const fpX = isOffsetRight ? (w / 2 - 0.52) - 0.44 : 0;
    const fpY = isOffsetRight ? (h / 2 - 0.76) : (h / 2 - 0.72);

    if (isOffsetRight) {
      // Rounded Squircle Bezel (Infinix Hot 11S / 10S exact Google specs)
      const fpShape = createRoundedRectShape(0.28, 0.28, 0.07);
      const fpBezelGeo = new THREE.ExtrudeGeometry(fpShape, { depth: 0.016, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.012 });
      fpBezelGeo.center();
      const fpBezelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.96, roughness: 0.15 });
      disposables.push(fpBezelGeo, fpBezelMat);
      const fpBezel = new THREE.Mesh(fpBezelGeo, fpBezelMat);
      fpBezel.position.set(fpX, fpY, -t / 2 - 0.045);

      const fpSensorShape = createRoundedRectShape(0.24, 0.24, 0.06);
      const fpSensorGeo = new THREE.ExtrudeGeometry(fpSensorShape, { depth: 0.020, bevelEnabled: false });
      fpSensorGeo.center();
      const fpSensorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.4 });
      disposables.push(fpSensorGeo, fpSensorMat);
      const fpSensor = new THREE.Mesh(fpSensorGeo, fpSensorMat);
      fpSensor.position.set(fpX, fpY, -t / 2 - 0.047);

      backGroup.add(fpBezel, fpSensor);
    } else {
      // Circular / Rounded Bezel (Hot 12 Play / Budget Center sensor)
      const fpBezelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.016, 32);
      fpBezelGeo.rotateX(Math.PI / 2);
      const fpBezelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.15 });
      disposables.push(fpBezelGeo, fpBezelMat);
      const fpBezel = new THREE.Mesh(fpBezelGeo, fpBezelMat);
      fpBezel.position.set(fpX, fpY, -t / 2 - 0.045);

      const fpSensorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.020, 32);
      fpSensorGeo.rotateX(Math.PI / 2);
      const fpSensorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.4 });
      disposables.push(fpSensorGeo, fpSensorMat);
      const fpSensor = new THREE.Mesh(fpSensorGeo, fpSensorMat);
      fpSensor.position.set(fpX, fpY, -t / 2 - 0.047);

      backGroup.add(fpBezel, fpSensor);
    }
  }

  // Nothing Phone Glowing 3D Glyph Lightguides
  if (config.chassisForm === 'nothing_glyph') {
    const glyphMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.9,
      roughness: 0.1,
    });
    disposables.push(glyphMat);

    const glyphCoilGeo = new THREE.RingGeometry(0.48, 0.54, 32, 1, 0.4, Math.PI * 1.55);
    disposables.push(glyphCoilGeo);
    const glyphCoil = new THREE.Mesh(glyphCoilGeo, glyphMat);
    glyphCoil.rotation.y = Math.PI;
    glyphCoil.position.set(0, -0.15, -t / 2 - 0.034);
    backGroup.add(glyphCoil);

    const glyphDiagGeo = new THREE.BoxGeometry(0.42, 0.04, 0.01);
    disposables.push(glyphDiagGeo);
    const glyphDiag = new THREE.Mesh(glyphDiagGeo, glyphMat);
    glyphDiag.rotation.set(0, Math.PI, Math.PI / 4);
    glyphDiag.position.set(w / 2 - 0.45, h / 2 - 0.45, -t / 2 - 0.034);
    backGroup.add(glyphDiag);

    const glyphExclGeo = new THREE.BoxGeometry(0.04, 0.38, 0.01);
    disposables.push(glyphExclGeo);
    const glyphExcl = new THREE.Mesh(glyphExclGeo, glyphMat);
    glyphExcl.position.set(0, -h / 2 + 0.55, -t / 2 - 0.034);
    backGroup.add(glyphExcl);

    const redDotGeo = new THREE.CircleGeometry(0.022, 16);
    const redDotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    disposables.push(redDotGeo, redDotMat);
    const redDot = new THREE.Mesh(redDotGeo, redDotMat);
    redDot.rotation.y = Math.PI;
    redDot.position.set(w / 2 - 0.35, h / 2 - 0.75, -t / 2 - 0.035);
    backGroup.add(redDot);
  }

  registerPart('back_panel', backGroup, [0, 0, -1.9]);

  // ==========================================
  // 4. CAMERA MODULE (Authentic Layouts)
  // ==========================================
  const camGroup = new THREE.Group();

  function createOpticalLens(radius, pos) {
    const lensSubgroup = new THREE.Group();
    lensSubgroup.position.copy(pos);

    const outerRingGeo = new THREE.CylinderGeometry(radius, radius, 0.045, 32);
    outerRingGeo.rotateX(Math.PI / 2);
    const outerRingMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.96, roughness: 0.15 });
    disposables.push(outerRingGeo, outerRingMat);
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    lensSubgroup.add(outerRing);

    const innerRingGeo = new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, 0.048, 32);
    innerRingGeo.rotateX(Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x08090b });
    disposables.push(innerRingGeo, innerRingMat);
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    lensSubgroup.add(innerRing);

    const lensGlassGeo = new THREE.SphereGeometry(radius * 0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    lensGlassGeo.rotateX(-Math.PI / 2);
    const lensGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x221144,
      metalness: 0.2,
      roughness: 0.04,
      transmission: 0.4,
      ior: 1.8,
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 0.12,
    });
    disposables.push(lensGlassGeo, lensGlassMat);
    const lensGlass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
    lensGlass.position.set(0, 0, -0.015);
    lensSubgroup.add(lensGlass);

    return lensSubgroup;
  }

  const camLayout = config.cameraLayout || 'samsung_vertical_traffic';

  if (camLayout === 'infinix_dual_circle_owl') {
    // 1A. Infinix Hot 11S / 10S: Dual-Circle "Owl-Eye" 50MP Camera Design (Exact Google Reference Specs)
    const camShape = createRoundedRectShape(0.82, 1.52, 0.28);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x090b10, metalness: 0.92, roughness: 0.12, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.52, h / 2 - 0.82, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;

    // Top Circle: Giant 50MP Primary Aperture with wide polished chrome silver ring
    const topCircleOuterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.035, 36);
    topCircleOuterGeo.rotateX(Math.PI / 2);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.12 });
    disposables.push(topCircleOuterGeo, chromeMat);
    const topChromeRing = new THREE.Mesh(topCircleOuterGeo, chromeMat);
    topChromeRing.position.set(ip.x, ip.y + 0.38, ip.z - 0.042);
    camGroup.add(topChromeRing);

    const lMain = createOpticalLens(0.18, new THREE.Vector3(ip.x, ip.y + 0.38, ip.z - 0.052));
    camGroup.add(lMain);

    // Bottom Circle: Secondary housing with 2 auxiliary lenses + quad-LED flash unit
    const btmCircleOuterGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.03, 36);
    btmCircleOuterGeo.rotateX(Math.PI / 2);
    const darkRingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    disposables.push(btmCircleOuterGeo, darkRingMat);
    const btmRing = new THREE.Mesh(btmCircleOuterGeo, darkRingMat);
    btmRing.position.set(ip.x, ip.y - 0.38, ip.z - 0.042);
    camGroup.add(btmRing);

    // Two smaller auxiliary lenses inside bottom circle
    const lAux1 = createOpticalLens(0.075, new THREE.Vector3(ip.x - 0.08, ip.y - 0.32, ip.z - 0.05));
    const lAux2 = createOpticalLens(0.075, new THREE.Vector3(ip.x - 0.08, ip.y - 0.44, ip.z - 0.05));
    camGroup.add(lAux1, lAux2);

    // Quad-LED Flash Bar inside bottom circle (right side)
    const flashGeo = new THREE.CapsuleGeometry(0.035, 0.14, 8, 16);
    const flashMat = new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffd269, emissiveIntensity: 0.75, roughness: 0.3 });
    disposables.push(flashGeo, flashMat);
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(ip.x + 0.09, ip.y - 0.38, ip.z - 0.05);
    camGroup.add(flashMesh);

  } else if (camLayout === 'infinix_triple_column' || camLayout === 'infinix_cyber_matrix') {
    // 1B. Infinix Hot 12 Play: 3 Vertically Stacked Lenses with Rectangular Plateau & Right Flash Capsule
    const camShape = createRoundedRectShape(0.78, 1.45, 0.22);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.88, roughness: 0.15, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.50, h / 2 - 0.80, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const lMain = createOpticalLens(0.18, new THREE.Vector3(ip.x + 0.14, ip.y + 0.36, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.14, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.11, new THREE.Vector3(ip.x + 0.14, ip.y - 0.36, ip.z - 0.045));
    camGroup.add(lMain, l2, l3);

    const flashGeo = new THREE.CapsuleGeometry(0.045, 0.22, 8, 16);
    const flashMat = new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffd269, emissiveIntensity: 0.7, roughness: 0.3 });
    disposables.push(flashGeo, flashMat);
    const flashBar = new THREE.Mesh(flashGeo, flashMat);
    flashBar.position.set(ip.x - 0.16, ip.y + 0.18, ip.z - 0.042);
    camGroup.add(flashBar);

  } else if (camLayout === 'infinix_mecha_gaming') {
    // 1C. Infinix GT 10 Pro / GT 20 Pro: Cyber Mecha Asymmetrical Armor Plateau
    const camShape = new THREE.Shape();
    camShape.moveTo(-0.48, -0.62);
    camShape.lineTo(0.48, -0.62);
    camShape.lineTo(0.48, 0.38);
    camShape.lineTo(0.22, 0.62);
    camShape.lineTo(-0.48, 0.62);
    camShape.closePath();

    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.085, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111318, metalness: 0.95, roughness: 0.18, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.54, h / 2 - 0.75, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // Cyber LED indicator strip
    const ledGeo = new THREE.BoxGeometry(0.55, 0.03, 0.015);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.8 });
    disposables.push(ledGeo, ledMat);
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(islandMesh.position.x, islandMesh.position.y - 0.45, islandMesh.position.z - 0.045);
    camGroup.add(ledMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.18, new THREE.Vector3(ip.x - 0.16, ip.y + 0.22, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.16, ip.y + 0.22, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y - 0.16, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'infinix_diamond_rhombus') {
    // 1D. Infinix Zero 8: World-First Centered Diamond Rhombus 4-Camera Module
    const diamondShape = new THREE.Shape();
    diamondShape.moveTo(0, 0.62);
    diamondShape.lineTo(0.62, 0);
    diamondShape.lineTo(0, -0.62);
    diamondShape.lineTo(-0.62, 0);
    diamondShape.closePath();

    const islandGeo = new THREE.ExtrudeGeometry(diamondShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.78, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y + 0.32, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.32, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.32, ip.y, ip.z - 0.045));
    const l4 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y - 0.32, ip.z - 0.045));
    camGroup.add(l1, l2, l3, l4);

  } else if (camLayout === 'infinix_squircle_matrix') {
    // 1E. Modern Infinix Squircle Trio with Halo Ring Light (Hot 40 Pro / Note 30 / Smart 8)
    const camShape = createRoundedRectShape(0.88, 0.88, 0.24);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.05), metalness: 0.88, roughness: 0.2, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.54, h / 2 - 0.62, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.18, new THREE.Vector3(ip.x - 0.20, ip.y + 0.20, ip.z - 0.045));
    const l2 = createOpticalLens(0.18, new THREE.Vector3(ip.x - 0.20, ip.y - 0.20, ip.z - 0.045));
    const l3 = createOpticalLens(0.18, new THREE.Vector3(ip.x + 0.20, ip.y + 0.20, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

    // Halo Ring Flash on bottom right
    const haloRingGeo = new THREE.RingGeometry(0.10, 0.16, 24);
    const haloRingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
    disposables.push(haloRingGeo, haloRingMat);
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRing.position.set(ip.x + 0.20, ip.y - 0.20, ip.z - 0.042);
    camGroup.add(haloRing);

  } else if (camLayout === 'poco_yellow_banner') {
    // 2. POCO Signature Full-Width Cyber Yellow & Black Banner
    const bannerGeo = new THREE.BoxGeometry(w * 0.94, 0.88, 0.075);
    disposables.push(bannerGeo);
    const bannerMat = new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.85, roughness: 0.15, clearcoat: 0.95 });
    disposables.push(bannerMat);
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, h / 2 - 0.58, -t / 2 - 0.048);
    camGroup.add(banner);

    // POCO Yellow Contrast Bar on Right
    const pocoYellowGeo = new THREE.BoxGeometry(0.48, 0.76, 0.015);
    const pocoYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.25, metalness: 0.1 });
    disposables.push(pocoYellowGeo, pocoYellowMat);
    const pocoYellowMesh = new THREE.Mesh(pocoYellowGeo, pocoYellowMat);
    pocoYellowMesh.position.set(w / 2 - 0.35, banner.position.y, banner.position.z - 0.04);
    camGroup.add(pocoYellowMesh);

    // Quad Camera Matrix on Left
    const bp = banner.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(-0.45, bp.y + 0.20, bp.z - 0.04));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(-0.15, bp.y + 0.20, bp.z - 0.04));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(-0.45, bp.y - 0.20, bp.z - 0.04));
    const l4 = createOpticalLens(0.14, new THREE.Vector3(-0.15, bp.y - 0.20, bp.z - 0.04));
    camGroup.add(l1, l2, l3, l4);

  } else if (camLayout === 'poco_deco_rectangle') {
    // 2B. POCO F-series Sleek Glass Deco Rectangle (F3, F4, F5, F6, X6 Pro)
    const camShape = createRoundedRectShape(0.72, 1.30, 0.22);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0d11, metalness: 0.9, roughness: 0.15, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.72, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.19, new THREE.Vector3(ip.x, ip.y + 0.35, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.12, ip.y - 0.18, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.12, ip.y - 0.18, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'motorola_batwing_pod') {
    // 3. Motorola Squircle Curved Edge Camera Pod
    const camShape = createRoundedRectShape(0.74, 0.82, 0.26);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.07, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.02, bevelThickness: 0.02 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.06), metalness: 0.85, roughness: 0.22, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.52, h / 2 - 0.58, -t / 2 - 0.048);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.16, ip.y + 0.18, ip.z - 0.04));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x + 0.16, ip.y + 0.18, ip.z - 0.04));
    const l3 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y - 0.18, ip.z - 0.04));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'realme_luxury_dial') {
    // 4. Realme Luxury Watch Fluted Circular Camera Dial
    const islandGeo = new THREE.CylinderGeometry(0.58, 0.62, 0.08, 48);
    islandGeo.rotateX(Math.PI / 2);
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, metalness: 0.92, roughness: 0.18, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.72, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // Fluted Gold Bezel Ring
    const goldRingGeo = new THREE.RingGeometry(0.54, 0.60, 48);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    disposables.push(goldRingGeo, goldRingMat);
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.position.set(0, islandMesh.position.y, islandMesh.position.z - 0.042);
    camGroup.add(goldRing);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.20, ip.y + 0.18, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.20, ip.y + 0.18, ip.z - 0.045));
    const l3 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y - 0.18, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'realme_gt_racing') {
    // 4B. Realme GT Racing Series Glass Window Plateau with Pulse Light
    const camShape = createRoundedRectShape(0.72, 1.25, 0.20);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f1115, metalness: 0.9, roughness: 0.15, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.46, h / 2 - 0.70, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.18, new THREE.Vector3(ip.x, ip.y + 0.35, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.12, ip.y - 0.20, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.12, ip.y - 0.20, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'realme_dual_circle') {
    // 4C. Realme Dual Giant Floating Lens Rings (C53, C55, Realme 10)
    const ip = new THREE.Vector3(w / 2 - 0.44, h / 2 - 0.65, -t / 2 - 0.05);
    const l1 = createOpticalLens(0.22, new THREE.Vector3(ip.x, ip.y + 0.32, ip.z));
    const l2 = createOpticalLens(0.22, new THREE.Vector3(ip.x, ip.y - 0.32, ip.z));
    camGroup.add(l1, l2);

  } else if (camLayout === 'apple_vertical_pill') {
    // 5. Apple iPhone 16 Spatial Video Vertical Capsule
    const camShape = createRoundedRectShape(0.56, 1.12, 0.28);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.05), metalness: 0.85, roughness: 0.22, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.44, h / 2 - 0.68, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y + 0.28, ip.z - 0.045));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y - 0.28, ip.z - 0.045));
    camGroup.add(l1, l2);

  } else if (camLayout === 'xiaomi_leica_square') {
    // 6. Xiaomi / Redmi Leica Square Island with Crosshair Grid
    const camShape = createRoundedRectShape(0.88, 0.90, 0.20);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.9, roughness: 0.18, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.54, h / 2 - 0.62, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.16, new THREE.Vector3(ip.x - 0.20, ip.y + 0.20, ip.z - 0.045));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x + 0.20, ip.y + 0.20, ip.z - 0.045));
    const l3 = createOpticalLens(0.16, new THREE.Vector3(ip.x - 0.20, ip.y - 0.20, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'xiaomi_ultra_disc') {
    // 6B. Xiaomi Ultra Giant Centered Circular Camera Dial with Knurled Gold Ring (13 Ultra, 14 Ultra)
    const islandGeo = new THREE.CylinderGeometry(0.68, 0.72, 0.09, 48);
    islandGeo.rotateX(Math.PI / 2);
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.92, roughness: 0.15, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.78, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // Gold Knurled Bezel Ring
    const goldRingGeo = new THREE.RingGeometry(0.66, 0.72, 48);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.96, roughness: 0.2 });
    disposables.push(goldRingGeo, goldRingMat);
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.position.set(0, islandMesh.position.y, islandMesh.position.z - 0.048);
    camGroup.add(goldRing);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.18, new THREE.Vector3(ip.x, ip.y + 0.24, ip.z - 0.045));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x - 0.24, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.16, new THREE.Vector3(ip.x + 0.24, ip.y, ip.z - 0.045));
    const l4 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y - 0.24, ip.z - 0.045));
    camGroup.add(l1, l2, l3, l4);

  } else if (camLayout === 'redmi_deco_column') {
    // 6C. Redmi Note Series Stepped Camera Plateau with Silver Accent Halo
    const camShape = createRoundedRectShape(0.72, 1.35, 0.22);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.06), metalness: 0.88, roughness: 0.2, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.74, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.20, new THREE.Vector3(ip.x, ip.y + 0.38, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.12, ip.y - 0.18, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.12, ip.y - 0.18, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'vivo_zeiss_sunburst') {
    // 7. Vivo / iQOO Zeiss Circular Sunburst Dial
    const islandGeo = new THREE.CylinderGeometry(0.58, 0.62, 0.08, 48);
    islandGeo.rotateX(Math.PI / 2);
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f1115, metalness: 0.92, roughness: 0.16, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.72, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // ZEISS Blue Dot Badge
    const zeissDotGeo = new THREE.CircleGeometry(0.04, 16);
    const zeissDotMat = new THREE.MeshBasicMaterial({ color: 0x0066cc });
    disposables.push(zeissDotGeo, zeissDotMat);
    const zeissDot = new THREE.Mesh(zeissDotGeo, zeissDotMat);
    zeissDot.position.set(islandMesh.position.x + 0.36, islandMesh.position.y + 0.36, islandMesh.position.z - 0.042);
    camGroup.add(zeissDot);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.18, ip.y + 0.16, ip.z - 0.045));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x + 0.18, ip.y + 0.16, ip.z - 0.045));
    const l3 = createOpticalLens(0.18, new THREE.Vector3(ip.x, ip.y - 0.18, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'vivo_aura_light') {
    // 7B. Vivo V-Series with Glowing Circular / Squircle Aura Light Ring (V27, V29, V30, V40)
    const camShape = createRoundedRectShape(0.72, 1.45, 0.24);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0e14, metalness: 0.9, roughness: 0.18, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.78, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y + 0.44, ip.z - 0.045));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y + 0.12, ip.z - 0.045));
    camGroup.add(l1, l2);

    // Glowing Aura Light Ring
    const auraRingGeo = new THREE.RingGeometry(0.16, 0.24, 36);
    const auraRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff0dd,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    disposables.push(auraRingGeo, auraRingMat);
    const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
    auraRing.position.set(ip.x, ip.y - 0.38, ip.z - 0.042);
    camGroup.add(auraRing);

  } else if (camLayout === 'tecno_cyber_rings') {
    // 8. Tecno Camon / Pova Cyber Dual Rings
    const ip = new THREE.Vector3(w / 2 - 0.48, h / 2 - 0.68, -t / 2 - 0.05);
    const l1 = createOpticalLens(0.20, new THREE.Vector3(ip.x, ip.y + 0.30, ip.z));
    const l2 = createOpticalLens(0.20, new THREE.Vector3(ip.x, ip.y - 0.30, ip.z));
    camGroup.add(l1, l2);

  } else if (camLayout === 'flush_single') {
    // Single Camera Lens Flush with Back Glass (Vintage)
    const l1 = createOpticalLens(0.12, new THREE.Vector3(w / 2 - 0.35, h / 2 - 0.35, -t / 2 - 0.016));
    camGroup.add(l1);

    const flashGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    flashGeo.rotateX(Math.PI / 2);
    const flashMat = new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffd269, emissiveIntensity: 0.8 });
    disposables.push(flashGeo, flashMat);
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(w / 2 - 0.55, h / 2 - 0.35, -t / 2 - 0.016);
    camGroup.add(flash);

  } else if (camLayout === 'samsung_floating_rings') {
    // Standalone Floating Camera Rings (Samsung Galaxy S22/S23/S24 Ultra) - NO PLATE!
    const cX = w / 2 - 0.38;
    const topY = h / 2 - 0.42;
    const l1 = createOpticalLens(0.17, new THREE.Vector3(cX, topY, -t / 2 - 0.06));
    const l2 = createOpticalLens(0.17, new THREE.Vector3(cX, topY - 0.42, -t / 2 - 0.06));
    const l3 = createOpticalLens(0.17, new THREE.Vector3(cX, topY - 0.84, -t / 2 - 0.06));

    const cX2 = cX - 0.34;
    const l4 = createOpticalLens(0.11, new THREE.Vector3(cX2, topY, -t / 2 - 0.05));
    const l5 = createOpticalLens(0.14, new THREE.Vector3(cX2, topY - 0.42, -t / 2 - 0.05));
    camGroup.add(l1, l2, l3, l4, l5);

  } else if (camLayout === 'samsung_contour_cut') {
    // Samsung Contour-Cut Camera Housing (Galaxy S21/S22 wrapping directly into frame)
    const camShape = createRoundedRectShape(0.68, 1.40, 0.24);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.95, roughness: 0.18 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.36, h / 2 - 0.74, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.17, new THREE.Vector3(ip.x, ip.y + 0.42, ip.z - 0.045));
    const l2 = createOpticalLens(0.17, new THREE.Vector3(ip.x, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.17, new THREE.Vector3(ip.x, ip.y - 0.42, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'samsung_rectangle_island') {
    // Samsung Rectangular Camera Plateau (Galaxy S20 / Note 20 / A-series / M-series)
    const camShape = createRoundedRectShape(0.72, 1.25, 0.20);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.88, roughness: 0.18, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.46, h / 2 - 0.70, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.14, ip.y + 0.35, ip.z - 0.045));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.14, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.14, ip.y - 0.35, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

    const flashGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    flashGeo.rotateX(Math.PI / 2);
    const flashMat = new THREE.MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffd269, emissiveIntensity: 0.8 });
    disposables.push(flashGeo, flashMat);
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(ip.x + 0.16, ip.y + 0.20, ip.z - 0.042);
    camGroup.add(flash);

  } else if (camLayout === 'samsung_classic_center') {
    // Samsung Classic Centered Camera Block (S8, S9, S10, Note 8, Note 9)
    const camShape = createRoundedRectShape(1.10, 0.52, 0.16);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.065, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.012, bevelThickness: 0.012 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.65, -t / 2 - 0.045);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.28, ip.y, ip.z - 0.04));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x + 0.08, ip.y, ip.z - 0.04));
    camGroup.add(l1, l2);

    const hrSensorGeo = new THREE.BoxGeometry(0.08, 0.14, 0.01);
    const hrSensorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 });
    disposables.push(hrSensorGeo, hrSensorMat);
    const hrSensor = new THREE.Mesh(hrSensorGeo, hrSensorMat);
    hrSensor.position.set(ip.x + 0.36, ip.y, ip.z - 0.04);
    camGroup.add(hrSensor);

  } else if (camLayout === 'pixel_visor_bar') {
    // Edge-to-Edge Visor Bar (Google Pixel 6–8)
    const visorGeo = new THREE.BoxGeometry(w * 0.99, 0.48, 0.09);
    disposables.push(visorGeo);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: phoneColor.clone().offsetHSL(0, 0, 0.08),
      metalness: 0.95,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    disposables.push(visorMat);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, h / 2 - 0.65, -t / 2 - 0.05);
    camGroup.add(visor);

    const l1 = createOpticalLens(0.13, new THREE.Vector3(-0.48, h / 2 - 0.65, -t / 2 - 0.07));
    const l2 = createOpticalLens(0.13, new THREE.Vector3(-0.15, h / 2 - 0.65, -t / 2 - 0.07));
    const l3 = createOpticalLens(0.11, new THREE.Vector3(0.12, h / 2 - 0.65, -t / 2 - 0.07));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'pixel_oval_island') {
    // Google Pixel 9 Series Floating Pill Visor Island
    const camShape = createRoundedRectShape(w * 0.82, 0.46, 0.23);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.085, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, 0.05), metalness: 0.95, roughness: 0.18, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.65, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const l1 = createOpticalLens(0.14, new THREE.Vector3(-0.35, h / 2 - 0.65, -t / 2 - 0.075));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(-0.05, h / 2 - 0.65, -t / 2 - 0.075));
    const l3 = createOpticalLens(0.11, new THREE.Vector3(0.22, h / 2 - 0.65, -t / 2 - 0.075));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'pixel_square_corner') {
    // Google Pixel 4 / 4a / 5: Rounded Square Camera Plateau on Top-Left
    const camShape = createRoundedRectShape(0.64, 0.64, 0.18);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.07, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x090a0f, metalness: 0.85, roughness: 0.25 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.44, h / 2 - 0.52, -t / 2 - 0.048);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.14, ip.y + 0.12, ip.z - 0.04));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.14, ip.y - 0.12, ip.z - 0.04));
    camGroup.add(l1, l2);

  } else if (camLayout === 'oneplus_circular_dial' || camLayout === 'circular_hasselblad_dial') {
    // Circular Watch-Dial Camera Bump on left spine (OnePlus Hasselblad)
    const islandGeo = new THREE.CylinderGeometry(0.56, 0.60, 0.08, 48);
    islandGeo.rotateX(Math.PI / 2);
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({
      color: phoneColor.clone().offsetHSL(0, 0, -0.06),
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.9,
    });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(-w / 2 + 0.60, h / 2 - 0.75, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.18, ip.y + 0.18, ip.z - 0.04));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.18, ip.y + 0.18, ip.z - 0.04));
    const l3 = createOpticalLens(0.17, new THREE.Vector3(ip.x - 0.18, ip.y - 0.18, ip.z - 0.04));
    const l4 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.18, ip.y - 0.18, ip.z - 0.04));
    camGroup.add(l1, l2, l3, l4);

  } else if (camLayout === 'oneplus_vertical_pill') {
    // OnePlus Nord / 8 / 9 Vertical Pill Island on Top-Left
    const camShape = createRoundedRectShape(0.58, 1.35, 0.28);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111318, metalness: 0.88, roughness: 0.18, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.42, h / 2 - 0.72, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y + 0.38, ip.z - 0.045));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x, ip.y, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y - 0.38, ip.z - 0.045));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'apple_pro_triangle') {
    // Apple Pro Triangle Camera Island (iPhone 11 Pro to 16 Pro)
    const camShape = createRoundedRectShape(0.85, 0.85, 0.22);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({
      color: phoneColor.clone().offsetHSL(0, 0, -0.04),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.9,
    });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.55, h / 2 - 0.6, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.16, new THREE.Vector3(ip.x - 0.18, ip.y + 0.18, ip.z - 0.04));
    const l2 = createOpticalLens(0.16, new THREE.Vector3(ip.x - 0.18, ip.y - 0.18, ip.z - 0.04));
    const l3 = createOpticalLens(0.16, new THREE.Vector3(ip.x + 0.18, ip.y, ip.z - 0.04));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'apple_square_dual' || camLayout === 'apple_square_diagonal') {
    // Apple Diagonal Dual Lens (iPhone 13, 14, 15)
    const camShape = createRoundedRectShape(0.72, 0.72, 0.2);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.05), metalness: 0.85, roughness: 0.25, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.52, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x - 0.14, ip.y + 0.14, ip.z - 0.04));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x + 0.14, ip.y - 0.14, ip.z - 0.04));
    camGroup.add(l1, l2);

  } else if (camLayout === 'nothing_glyph_matrix') {
    // Nothing Phone (1 / 2 / 2a) Dual Optical Capsule + Glowing Glyph LED Tracks
    const pillShape = createRoundedRectShape(0.48, 0.88, 0.22);
    const islandGeo = new THREE.ExtrudeGeometry(pillShape, { depth: 0.065, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x111317, metalness: 0.9, roughness: 0.15, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.44, h / 2 - 0.58, -t / 2 - 0.045);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y + 0.20, ip.z - 0.035));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y - 0.20, ip.z - 0.035));
    camGroup.add(l1, l2);

    // Glowing White Glyph LED Ring around Center Coil
    const glyphRingGeo = new THREE.RingGeometry(0.46, 0.52, 48);
    const glyphMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.2, side: THREE.DoubleSide });
    disposables.push(glyphRingGeo, glyphMat);
    const glyphRing = new THREE.Mesh(glyphRingGeo, glyphMat);
    glyphRing.position.set(0, 0, -t / 2 - 0.022);
    camGroup.add(glyphRing);

    // Diagonal Slash Glyph at top-right
    const glyphSlashGeo = new THREE.PlaneGeometry(0.36, 0.05);
    disposables.push(glyphSlashGeo);
    const glyphSlash = new THREE.Mesh(glyphSlashGeo, glyphMat);
    glyphSlash.rotation.z = Math.PI / 4;
    glyphSlash.position.set(-w / 2 + 0.38, h / 2 - 0.48, -t / 2 - 0.022);
    camGroup.add(glyphSlash);

    // Bottom Exclamation Glyph Bar
    const glyphBottomGeo = new THREE.PlaneGeometry(0.05, 0.42);
    disposables.push(glyphBottomGeo);
    const glyphBottom = new THREE.Mesh(glyphBottomGeo, glyphMat);
    glyphBottom.position.set(0, -h / 2 + 0.52, -t / 2 - 0.022);
    camGroup.add(glyphBottom);

  } else if (camLayout === 'sony_xperia_pill') {
    // Sony Xperia Ultra-Slim Vertical Camera Capsule
    const pillShape = createRoundedRectShape(0.36, 1.35, 0.17);
    const islandGeo = new THREE.ExtrudeGeometry(pillShape, { depth: 0.065, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, metalness: 0.92, roughness: 0.15, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.38, h / 2 - 0.72, -t / 2 - 0.045);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.12, new THREE.Vector3(ip.x, ip.y + 0.40, ip.z - 0.035));
    const l2 = createOpticalLens(0.12, new THREE.Vector3(ip.x, ip.y, ip.z - 0.035));
    const l3 = createOpticalLens(0.12, new THREE.Vector3(ip.x, ip.y - 0.40, ip.z - 0.035));
    camGroup.add(l1, l2, l3);

    // ZEISS T* Red Badge
    const tStarGeo = new THREE.PlaneGeometry(0.08, 0.04);
    const tStarMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    disposables.push(tStarGeo, tStarMat);
    const tStar = new THREE.Mesh(tStarGeo, tStarMat);
    tStar.position.set(ip.x, ip.y + 0.56, ip.z - 0.04);
    camGroup.add(tStar);

  } else if (camLayout === 'honor_magic_ring') {
    // Honor Magic / Huawei Star-Ring Centered Camera Halo
    const islandGeo = new THREE.CylinderGeometry(0.64, 0.68, 0.085, 48);
    islandGeo.rotateX(Math.PI / 2);
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.92, roughness: 0.18, clearcoat: 1.0 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.76, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // Concentric Gold/Silver Accent Halo Ring
    const haloRingGeo = new THREE.RingGeometry(0.56, 0.63, 48);
    const haloRingMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.18 });
    disposables.push(haloRingGeo, haloRingMat);
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRing.position.set(0, islandMesh.position.y, islandMesh.position.z - 0.045);
    camGroup.add(haloRing);

    // 4 Symmetrical Lenses in Cardinal Compass Points
    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y + 0.30, ip.z - 0.045));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y - 0.30, ip.z - 0.045));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.30, ip.y, ip.z - 0.045));
    const l4 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.30, ip.y, ip.z - 0.045));
    camGroup.add(l1, l2, l3, l4);

  } else if (camLayout === 'oppo_reno_glow') {
    // Oppo Reno / Find X Curved Streamlined Camera Volcano
    const camShape = createRoundedRectShape(0.72, 1.25, 0.30);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.025, bevelThickness: 0.025 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.05), metalness: 0.88, roughness: 0.22, clearcoat: 0.95 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.68, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    // Two Oversized Primary Eyes (Sony IMX flagship)
    const l1 = createOpticalLens(0.19, new THREE.Vector3(ip.x, ip.y + 0.32, ip.z - 0.045));
    const l2 = createOpticalLens(0.19, new THREE.Vector3(ip.x, ip.y - 0.16, ip.z - 0.045));
    const l3 = createOpticalLens(0.09, new THREE.Vector3(ip.x, ip.y - 0.46, ip.z - 0.04));
    camGroup.add(l1, l2, l3);

  } else if (camLayout === 'asus_rog_cyber') {
    // Asus ROG / RedMagic Gaming Cyber Armor Island with 45-degree Angled Chamfers
    const camShape = new THREE.Shape();
    camShape.moveTo(-0.46, -0.38);
    camShape.lineTo(0.46, -0.38);
    camShape.lineTo(0.46, 0.18);
    camShape.lineTo(0.24, 0.38);
    camShape.lineTo(-0.46, 0.38);
    camShape.closePath();

    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: 0x090a0f, metalness: 0.95, roughness: 0.2, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, h / 2 - 0.62, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    // Glowing Cyber Matrix LED Strip
    const ledGeo = new THREE.BoxGeometry(0.82, 0.03, 0.015);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 2.0 });
    disposables.push(ledGeo, ledMat);
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0, islandMesh.position.y - 0.34, islandMesh.position.z - 0.04);
    camGroup.add(ledMesh);

    // Triple Tactical Lenses
    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.14, new THREE.Vector3(ip.x - 0.26, ip.y + 0.08, ip.z - 0.04));
    const l2 = createOpticalLens(0.14, new THREE.Vector3(ip.x, ip.y + 0.08, ip.z - 0.04));
    const l3 = createOpticalLens(0.14, new THREE.Vector3(ip.x + 0.26, ip.y + 0.08, ip.z - 0.04));
    camGroup.add(l1, l2, l3);

  } else {
    // Standard Vertical Pill (Traffic Light / Samsung A-series)
    const camShape = createRoundedRectShape(0.65, 1.15, 0.2);
    const islandGeo = new THREE.ExtrudeGeometry(camShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.015, bevelThickness: 0.015 });
    islandGeo.center();
    disposables.push(islandGeo);
    const islandMat = new THREE.MeshPhysicalMaterial({ color: phoneColor.clone().offsetHSL(0, 0, -0.06), metalness: 0.85, roughness: 0.22, clearcoat: 0.9 });
    disposables.push(islandMat);
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(w / 2 - 0.48, h / 2 - 0.72, -t / 2 - 0.05);
    camGroup.add(islandMesh);

    const ip = islandMesh.position;
    const l1 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y + 0.35, ip.z - 0.04));
    const l2 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y, ip.z - 0.04));
    const l3 = createOpticalLens(0.15, new THREE.Vector3(ip.x, ip.y - 0.35, ip.z - 0.04));
    camGroup.add(l1, l2, l3);
  }

  registerPart('camera_module', camGroup, [0.25, 0.45, -1.3]);

  // ==========================================
  // 5. WIRELESS COIL / MAGSAFE / THERMAL SHIELD
  // ==========================================
  const coilGroup = new THREE.Group();

  const chargingStr = (config.charging || '').toLowerCase();
  const hasWirelessCharging = Boolean(
    chargingStr.includes('wireless') ||
    chargingStr.includes('magsafe') ||
    chargingStr.includes('qi') ||
    isApple ||
    (isSamsung && config.segment === 'Flagship') ||
    (isPixel && !config.model.toLowerCase().includes('a'))
  );

  if (isApple && (config.year || 2024) >= 2020) {
    // Apple MagSafe 18 Neodymium Magnets Array & Center Induction Coil
    const magRadius = 0.52;
    const magnetGeo = new THREE.BoxGeometry(0.045, 0.085, 0.015);
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.98, roughness: 0.15 });
    disposables.push(magnetGeo, magnetMat);

    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const mag = new THREE.Mesh(magnetGeo, magnetMat);
      mag.position.set(Math.cos(angle) * magRadius, Math.sin(angle) * magRadius - 0.15, -0.038);
      mag.rotation.z = angle + Math.PI / 2;
      coilGroup.add(mag);
    }
    const alignGeo = new THREE.BoxGeometry(0.045, 0.14, 0.015);
    disposables.push(alignGeo);
    const alignMag = new THREE.Mesh(alignGeo, magnetMat);
    alignMag.position.set(0, -0.15 - magRadius - 0.11, -0.038);
    coilGroup.add(alignMag);

    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.28 });
    disposables.push(copperMat);
    for (let rIdx = 0.22; rIdx <= 0.44; rIdx += 0.04) {
      const ringGeo = new THREE.RingGeometry(rIdx, rIdx + 0.025, 36);
      disposables.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, copperMat);
      ring.position.set(0, -0.15, -0.04);
      coilGroup.add(ring);
    }
  } else if (hasWirelessCharging) {
    // Android Flagship Qi Planar Wireless Charging & Reverse Charge Coil
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.92, roughness: 0.28 });
    disposables.push(copperMat);
    for (let rIdx = 0.25; rIdx <= 0.65; rIdx += 0.04) {
      const ringGeo = new THREE.RingGeometry(rIdx, rIdx + 0.025, 36);
      disposables.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, copperMat);
      ring.position.set(0, -0.15, -0.04);
      coilGroup.add(ring);
    }
    // Ferrite backing disc
    const ferriteGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.012, 36);
    ferriteGeo.rotateX(Math.PI / 2);
    const ferriteMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.4 });
    disposables.push(ferriteGeo, ferriteMat);
    const ferrite = new THREE.Mesh(ferriteGeo, ferriteMat);
    ferrite.position.set(0, -0.15, -0.032);
    coilGroup.add(ferrite);
  } else {
    // Budget & Lower Mid-Range Models (Infinix Hot 12 Play, Poco M, etc.):
    // Polycarbonate Internal Mid-Frame Reinforcement Bracket & Graphite Shield (NO WIRELESS COIL)
    const bracketGeo = new THREE.BoxGeometry(w * 0.88, h * 0.62, 0.02);
    disposables.push(bracketGeo);
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.45,
      metalness: 0.2,
    });
    disposables.push(bracketMat);
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(0, -0.08, -0.038);
    coilGroup.add(bracket);

    // Die-cut Graphite thermal transfer patch over battery area
    const patchGeo = new THREE.BoxGeometry(w * 0.72, h * 0.44, 0.008);
    disposables.push(patchGeo);
    const patchMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      roughness: 0.65,
      metalness: 0.75,
    });
    disposables.push(patchMat);
    const patch = new THREE.Mesh(patchGeo, patchMat);
    patch.position.set(0, -0.08, -0.048);
    coilGroup.add(patch);

    // Structural stiffener cross-ribs
    for (let rIdx = -2; rIdx <= 2; rIdx++) {
      const ribGeo = new THREE.BoxGeometry(w * 0.82, 0.016, 0.01);
      disposables.push(ribGeo);
      const rib = new THREE.Mesh(ribGeo, bracketMat);
      rib.position.set(0, -0.08 + rIdx * 0.18, -0.048);
      coilGroup.add(rib);
    }
  }

  registerPart('wireless_coil', coilGroup, [0, 0, -0.8]);

  // ==========================================
  // 4. MOTHERBOARD & APPLICATION SOC (Layer 4)
  // ==========================================
  const mbGroup = new THREE.Group();
  const mbW = w * 0.88;
  const mbH = h * 0.38;

  const mbShape = createRoundedRectShape(mbW, mbH, 0.04);
  const mbGeo = new THREE.ExtrudeGeometry(mbShape, { depth: 0.025, bevelEnabled: false });
  mbGeo.center();
  disposables.push(mbGeo);

  const mbMat = new THREE.MeshStandardMaterial({
    map: pcbTex.map,
    bumpMap: pcbTex.bump,
    bumpScale: 0.02,
    roughness: 0.35,
    metalness: 0.4,
  });
  disposables.push(mbMat);

  const mbMesh = new THREE.Mesh(mbGeo, mbMat);
  mbMesh.position.set(0, 0.75, 0.015);
  mbGroup.add(mbMesh);

  // Stacked Secondary Daughterboard layer for Apple (Double-Decker sandwich PCB)
  if (isApple) {
    const sandwichShape = createRoundedRectShape(mbW * 0.65, mbH * 0.72, 0.03);
    const sandwichGeo = new THREE.ExtrudeGeometry(sandwichShape, { depth: 0.02, bevelEnabled: false });
    sandwichGeo.center();
    disposables.push(sandwichGeo);
    const sandwichMesh = new THREE.Mesh(sandwichGeo, mbMat);
    sandwichMesh.position.set(-mbW * 0.12, 0.75, 0.038);
    mbGroup.add(sandwichMesh);
  }

  // Application Processor SoC with Laser Etched Silicon Markings
  const socSize = isApple ? 0.36 : 0.33;
  const socGeo = new THREE.BoxGeometry(socSize, socSize, 0.028);
  disposables.push(socGeo);
  const socColor = isApple ? 0x090a0d : isSamsung ? 0x07111e : isPOCO ? 0x18181b : 0x111317;
  const socMat = new THREE.MeshStandardMaterial({
    color: socColor,
    roughness: 0.25,
    metalness: 0.7,
  });
  disposables.push(socMat);
  const soc = new THREE.Mesh(socGeo, socMat);
  soc.position.set(-0.22, 0.78, 0.048);
  mbGroup.add(soc);

  // Metallic SoC Heat Spreader Bezel
  const socRimGeo = new THREE.RingGeometry(0.12, 0.16, 4);
  socRimGeo.rotateZ(Math.PI / 4);
  const socRimMat = new THREE.MeshStandardMaterial({
    color: isApple ? 0xd4d4d8 : 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15,
  });
  disposables.push(socRimGeo, socRimMat);
  const socRim = new THREE.Mesh(socRimGeo, socRimMat);
  socRim.position.set(-0.22, 0.78, 0.063);
  mbGroup.add(socRim);

  // LPDDR5X RAM / UFS Storage Memory Package stacked beside SoC
  const memGeo = new THREE.BoxGeometry(0.32, 0.26, 0.024);
  disposables.push(memGeo);
  const memMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 });
  disposables.push(memMat);
  const memChip = new THREE.Mesh(memGeo, memMat);
  memChip.position.set(0.2, 0.82, 0.042);
  mbGroup.add(memChip);

  // Stamped Perforated EMI Radio-Frequency Shielding Cans
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.95, roughness: 0.18 });
  disposables.push(shieldMat);
  const can1Geo = new THREE.BoxGeometry(mbW * 0.42, 0.32, 0.035);
  disposables.push(can1Geo);
  const can1 = new THREE.Mesh(can1Geo, shieldMat);
  can1.position.set(-0.2, 0.62, 0.03);
  mbGroup.add(can1);

  const can2Geo = new THREE.BoxGeometry(mbW * 0.36, 0.28, 0.035);
  disposables.push(can2Geo);
  const can2 = new THREE.Mesh(can2Geo, shieldMat);
  can2.position.set(0.22, 0.58, 0.03);
  mbGroup.add(can2);

  // SIM Card Tray Socket with Gold Internal Spring Contacts
  const simGeo = new THREE.BoxGeometry(0.24, 0.32, 0.03);
  disposables.push(simGeo);
  const simMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  disposables.push(simMat);
  const simSocket = new THREE.Mesh(simGeo, simMat);
  simSocket.position.set(-mbW / 2 + 0.18, 0.88, 0.028);
  mbGroup.add(simSocket);

  // Active Cooling Turbo Fan for Gaming Phones
  if (config.chassisForm === 'gaming_mecha') {
    const fanGroup = new THREE.Group();
    const fanCenterGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
    fanCenterGeo.rotateX(Math.PI / 2);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    disposables.push(fanCenterGeo, fanMat);
    const fanCenter = new THREE.Mesh(fanCenterGeo, fanMat);
    fanGroup.add(fanCenter);

    for (let b = 0; b < 10; b++) {
      const bAngle = (b / 10) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.14, 0.02, 0.015);
      disposables.push(bladeGeo);
      const blade = new THREE.Mesh(bladeGeo, fanMat);
      blade.position.set(Math.cos(bAngle) * 0.12, Math.sin(bAngle) * 0.12, 0);
      blade.rotation.z = bAngle + 0.3;
      fanGroup.add(blade);
    }
    fanGroup.position.set(0.28, 0.75, 0.04);
    mbGroup.add(fanGroup);
  }

  // Infrared (IR) Blaster Diode (Xiaomi, POCO, Vivo, OnePlus)
  if (isPOCO || isOnePlus || brandLower.includes('xiaomi') || brandLower.includes('redmi') || brandLower.includes('vivo') || brandLower.includes('iqoo')) {
    const irDiodeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 16);
    irDiodeGeo.rotateX(Math.PI / 2);
    const irDiodeMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.1, metalness: 0.8 });
    disposables.push(irDiodeGeo, irDiodeMat);
    const irDiode = new THREE.Mesh(irDiodeGeo, irDiodeMat);
    irDiode.position.set(0.12, 0.75 + mbH / 2 + 0.02, 0.02);
    mbGroup.add(irDiode);
  }

  // Rear Fingerprint Sensor FPC Connector & Ribbon (Infinix Hot 12 Play / budget models)
  if (isInfinix || config.segment === 'Budget') {
    const fpConnGeo = new THREE.BoxGeometry(0.12, 0.08, 0.025);
    disposables.push(fpConnGeo);
    const fpConnMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    disposables.push(fpConnMat);
    const fpConn = new THREE.Mesh(fpConnGeo, fpConnMat);
    fpConn.position.set(-0.24, 0.75 - mbH * 0.28, 0.028);

    const fpRibbonGeo = new THREE.BoxGeometry(0.06, 0.32, 0.008);
    disposables.push(fpRibbonGeo);
    const fpRibbonMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
    disposables.push(fpRibbonMat);
    const fpRibbon = new THREE.Mesh(fpRibbonGeo, fpRibbonMat);
    fpRibbon.position.set(-0.24, 0.75 - mbH * 0.44, 0.03);
    mbGroup.add(fpConn, fpRibbon);
  }

  registerPart('motherboard', mbGroup, [0, 0.45, 0.8]);

  // ==========================================
  // 5. VAPOR CHAMBER COOLING PLATE (Layer 5)
  // ==========================================
  const vcGroup = new THREE.Group();
  const hasCopperVC = isGaming || config.segment === 'Flagship' || config.chassisForm === 'box_ultra';

  if (isApple) {
    // Apple Multi-Layer Graphite & Titanium Thermal Dissipation Sheet
    const sheetGeo = new THREE.BoxGeometry(w * 0.84, h * 0.58, 0.012);
    disposables.push(sheetGeo);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.88,
      roughness: 0.35,
    });
    disposables.push(sheetMat);
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.position.set(0, 0.12, -0.01);
    vcGroup.add(sheet);

    // Titanium frame perimeter
    const rimGeo = new THREE.BoxGeometry(w * 0.86, 0.03, 0.015);
    disposables.push(rimGeo);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    disposables.push(rimMat);
    const rimTop = new THREE.Mesh(rimGeo, rimMat);
    rimTop.position.set(0, 0.12 + (h * 0.28), -0.008);
    const rimBot = new THREE.Mesh(rimGeo, rimMat);
    rimBot.position.set(0, 0.12 - (h * 0.28), -0.008);
    vcGroup.add(rimTop, rimBot);

  } else if (hasCopperVC) {
    // Android Flagship / Gaming Bionic Copper Vapor Chamber Plate
    const vcShape = createRoundedRectShape(w * 0.84, h * 0.58, 0.05);
    const vcGeo = new THREE.ExtrudeGeometry(vcShape, { depth: 0.014, bevelEnabled: false });
    vcGeo.center();
    disposables.push(vcGeo);

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.96,
      roughness: 0.22,
    });
    disposables.push(copperMat);

    const vcMesh = new THREE.Mesh(vcGeo, copperMat);
    vcMesh.position.set(0, 0.12, -0.01);
    vcGroup.add(vcMesh);

    // Stamped heat pipe branching downwards alongside battery
    const pipeGeo = new THREE.BoxGeometry(0.18, h * 0.46, 0.018);
    disposables.push(pipeGeo);
    const pipe = new THREE.Mesh(pipeGeo, copperMat);
    pipe.position.set(-w * 0.3, -h * 0.12, -0.008);
    vcGroup.add(pipe);

    // Capillary cooling veins embossed on plate
    const veinMat = new THREE.MeshStandardMaterial({ color: 0xa16207, metalness: 0.9, roughness: 0.3 });
    disposables.push(veinMat);
    for (let v = -2; v <= 2; v++) {
      const veinGeo = new THREE.BoxGeometry(w * 0.68, 0.018, 0.016);
      disposables.push(veinGeo);
      const vein = new THREE.Mesh(veinGeo, veinMat);
      vein.position.set(0, 0.12 + v * 0.18, -0.004);
      vcGroup.add(vein);
    }
  } else {
    // Budget & Lower Mid-Range Models (Infinix Hot 12 Play, budget Redmi/Galaxy A):
    // Die-Cut Flexible Pyrolytic Carbon Graphite Thermal Sheet with Gold Grounding Tabs
    const sheetGeo = new THREE.BoxGeometry(w * 0.82, h * 0.54, 0.008);
    disposables.push(sheetGeo);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      metalness: 0.78,
      roughness: 0.55,
    });
    disposables.push(sheetMat);
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.position.set(0, 0.12, -0.008);
    vcGroup.add(sheet);

    // Gold conductive grounding tape tabs
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    disposables.push(tapeMat);
    const tape1Geo = new THREE.BoxGeometry(0.14, 0.22, 0.012);
    disposables.push(tape1Geo);
    const tape1 = new THREE.Mesh(tape1Geo, tapeMat);
    tape1.position.set(w * 0.32, 0.12 + h * 0.22, -0.006);
    const tape2 = new THREE.Mesh(tape1Geo, tapeMat);
    tape2.position.set(-w * 0.32, 0.12 - h * 0.22, -0.006);
    vcGroup.add(tape1, tape2);
  }

  registerPart('vapor_chamber', vcGroup, [0, 0.1, 0.4]);

  // ==========================================
  // 6. BATTERY PACK & BMS CIRCUIT (Layer 6)
  // ==========================================
  const batteryGroup = new THREE.Group();
  const batteryW = w * 0.72;
  const batteryH = h * 0.48;
  const batteryD = t * 0.42;

  const batteryMat = new THREE.MeshStandardMaterial({
    map: batteryTex,
    roughness: isSamsung ? 0.3 : 0.45,
    metalness: isSamsung ? 0.6 : 0.25,
  });
  disposables.push(batteryMat);

  const useLShape = isApple && (config.model.includes('Pro') || config.model.includes('Max') || config.batteryStyle === 'l_shaped' || (config.year || 2024) >= 2018);
  const useDualCell = isOnePlus || config.batteryStyle === 'dual_cell';

  if (useLShape) {
    // Apple L-Shaped Dual Battery Pack
    const lShape = createLShapeBattery(batteryW, batteryH);
    const lGeo = new THREE.ExtrudeGeometry(lShape, { depth: batteryD, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.01, bevelThickness: 0.01 });
    lGeo.center();
    disposables.push(lGeo);
    const lMesh = new THREE.Mesh(lGeo, batteryMat);
    lMesh.position.set(-0.04, -0.32, 0.01);
    batteryGroup.add(lMesh);

    // Apple Pull Tabs with directional arrow markings
    const tabMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    disposables.push(tabMat);
    const tabGeo = new THREE.BoxGeometry(0.12, 0.08, 0.01);
    disposables.push(tabGeo);
    const topTab = new THREE.Mesh(tabGeo, tabMat);
    topTab.position.set(-0.12, -0.32 + batteryH / 2 + 0.03, 0.015);
    const botTab = new THREE.Mesh(tabGeo, tabMat);
    botTab.position.set(0.08, -0.32 - batteryH / 2 - 0.03, 0.015);
    batteryGroup.add(topTab, botTab);

  } else if (useDualCell) {
    // OnePlus / Oppo: Dual-Cell Split Fast-Charging Battery
    const cellW = batteryW * 0.47;
    const cellShape = createRoundedRectShape(cellW, batteryH, 0.04);
    const cellGeo = new THREE.ExtrudeGeometry(cellShape, { depth: batteryD, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.01, bevelThickness: 0.01 });
    cellGeo.center();
    disposables.push(cellGeo);

    const cell1 = new THREE.Mesh(cellGeo, batteryMat);
    cell1.position.set(-batteryW * 0.25, -0.32, 0.01);
    const cell2 = new THREE.Mesh(cellGeo, batteryMat);
    cell2.position.set(batteryW * 0.25, -0.32, 0.01);
    batteryGroup.add(cell1, cell2);

    // Central interconnect copper bridge between dual cells
    const bridgeGeo = new THREE.BoxGeometry(batteryW * 0.16, 0.12, 0.015);
    disposables.push(bridgeGeo);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xeb0028, roughness: 0.3 });
    disposables.push(bridgeMat);
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, -0.32, 0.015);
    batteryGroup.add(bridge);

  } else {
    // Standard High-Density Pack
    const batteryShape = createRoundedRectShape(batteryW, batteryH, 0.06);
    const batteryGeo = new THREE.ExtrudeGeometry(batteryShape, { depth: batteryD, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.01, bevelThickness: 0.01 });
    batteryGeo.center();
    disposables.push(batteryGeo);

    const batteryMesh = new THREE.Mesh(batteryGeo, batteryMat);
    batteryMesh.position.set(0, -0.32, 0.01);
    batteryGroup.add(batteryMesh);
  }

  // Integrated Battery Management System (BMS) PCB on top edge
  const bmsGeo = new THREE.BoxGeometry(batteryW * 0.88, 0.08, 0.02);
  disposables.push(bmsGeo);
  const bmsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 });
  disposables.push(bmsMat);
  const bms = new THREE.Mesh(bmsGeo, bmsMat);
  bms.position.set(0, -0.32 + batteryH / 2 + 0.04, 0.012);
  batteryGroup.add(bms);

  // Gold Battery Connector Flex Cable curling upwards towards motherboard
  const battConnGeo = new THREE.BoxGeometry(0.12, 0.16, 0.01);
  disposables.push(battConnGeo);
  const battConn = new THREE.Mesh(battConnGeo, goldPinMat);
  battConn.position.set(batteryW * 0.28, -0.32 + batteryH / 2 + 0.1, 0.02);
  batteryGroup.add(battConn);

  registerPart('battery', batteryGroup, [0, -0.25, 0.6]);

  // ==========================================
  // 7. LOUDSPEAKER (Acoustic Box) (Layer 7)
  // ==========================================
  const speakerGroup = new THREE.Group();
  const speakerBoxW = w * 0.42;
  const speakerBoxH = 0.34;
  const speakerBoxD = t * 0.38;

  const speakerBoxShape = createRoundedRectShape(speakerBoxW, speakerBoxH, 0.03);
  const speakerBoxGeo = new THREE.ExtrudeGeometry(speakerBoxShape, { depth: speakerBoxD, bevelEnabled: false });
  speakerBoxGeo.center();
  disposables.push(speakerBoxGeo);

  const speakerMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.4,
    metalness: 0.2,
  });
  disposables.push(speakerMat);

  const speakerMesh = new THREE.Mesh(speakerBoxGeo, speakerMat);
  speakerGroup.add(speakerMesh);

  // Neodymium magnet core & copper voice coil ring
  const magGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.025, 24);
  magGeo.rotateX(Math.PI / 2);
  const magMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.92, roughness: 0.2 });
  disposables.push(magGeo, magMat);
  const mag = new THREE.Mesh(magGeo, magMat);
  mag.position.set(0, 0, speakerBoxD / 2 + 0.005);

  const coilRingGeo = new THREE.RingGeometry(0.045, 0.075, 24);
  const coilRingMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.3 });
  disposables.push(coilRingGeo, coilRingMat);
  const coilRing = new THREE.Mesh(coilRingGeo, coilRingMat);
  coilRing.position.set(0, 0, speakerBoxD / 2 + 0.019);

  // Gold spring contact pins
  const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), goldPinMat);
  pin1.position.set(-0.08, speakerBoxH / 2 + 0.02, 0.02);
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), goldPinMat);
  pin2.position.set(0.08, speakerBoxH / 2 + 0.02, 0.02);
  disposables.push(pin1.geometry, pin2.geometry);

  speakerGroup.add(mag, coilRing, pin1, pin2);
  speakerGroup.position.set(w * 0.22, -h / 2 + 0.35, 0.015);

  registerPart('loudspeaker', speakerGroup, [0.22, -0.75, 0.4]);

  // ==========================================
  // 8. HAPTIC ENGINE (Taptic Engine / LRA) (Layer 8)
  // ==========================================
  const hapticGroup = new THREE.Group();
  const hapticW = w * 0.42;
  const hapticH = 0.32;
  const hapticD = t * 0.32;

  const hapticCaseMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.22,
  });
  disposables.push(hapticCaseMat);

  if (config.segment === 'Budget' || isInfinix) {
    // Budget & Infinix Models: Coin-Type ERM (Eccentric Rotating Mass) Vibration Motor
    const coinGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.038, 24);
    coinGeo.rotateX(Math.PI / 2);
    disposables.push(coinGeo);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.2 });
    disposables.push(coinMat);
    const coinMotor = new THREE.Mesh(coinGeo, coinMat);
    hapticGroup.add(coinMotor);

    // Red & blue lead wires
    const wireMatRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const wireMatBlue = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    disposables.push(wireMatRed, wireMatBlue);
    const wireGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8);
    disposables.push(wireGeo);
    const wireRed = new THREE.Mesh(wireGeo, wireMatRed);
    wireRed.position.set(-0.04, -0.10, 0);
    const wireBlue = new THREE.Mesh(wireGeo, wireMatBlue);
    wireBlue.position.set(0.04, -0.10, 0);
    hapticGroup.add(wireRed, wireBlue);

  } else if (isApple) {
    // Apple Taptic Engine: Brushed aluminum enclosure with visible oscillating tungsten mass
    const caseGeo = new THREE.BoxGeometry(hapticW, hapticH, hapticD);
    disposables.push(caseGeo);
    const casing = new THREE.Mesh(caseGeo, hapticCaseMat);
    hapticGroup.add(casing);

    // Standoff screw mounting tabs
    const tabGeo = new THREE.BoxGeometry(0.08, 0.08, 0.015);
    disposables.push(tabGeo);
    const tab1 = new THREE.Mesh(tabGeo, hapticCaseMat);
    tab1.position.set(-hapticW / 2 - 0.03, hapticH / 2 - 0.04, 0);
    const tab2 = new THREE.Mesh(tabGeo, hapticCaseMat);
    tab2.position.set(hapticW / 2 + 0.03, -hapticH / 2 + 0.04, 0);

    const screwGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16);
    screwGeo.rotateX(Math.PI / 2);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.1 });
    disposables.push(screwGeo, screwMat);
    const screw1 = new THREE.Mesh(screwGeo, screwMat);
    screw1.position.set(-hapticW / 2 - 0.03, hapticH / 2 - 0.04, 0.01);
    const screw2 = new THREE.Mesh(screwGeo, screwMat);
    screw2.position.set(hapticW / 2 + 0.03, -hapticH / 2 + 0.04, 0.01);

    // Window showing tungsten oscillating counterweight
    const weightGeo = new THREE.BoxGeometry(hapticW * 0.55, hapticH * 0.45, 0.02);
    disposables.push(weightGeo);
    const weightMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.98, roughness: 0.15 });
    disposables.push(weightMat);
    const weight = new THREE.Mesh(weightGeo, weightMat);
    weight.position.set(0, 0, hapticD / 2 + 0.005);

    hapticGroup.add(tab1, tab2, screw1, screw2, weight);

  } else {
    // Android X-Axis Linear Resonant Actuator (LRA)
    const lraGeo = new THREE.CylinderGeometry(0.12, 0.12, hapticD, 32);
    lraGeo.rotateX(Math.PI / 2);
    disposables.push(lraGeo);
    const lraMesh = new THREE.Mesh(lraGeo, hapticCaseMat);
    hapticGroup.add(lraMesh);

    // Copper suspension coil ring
    const coilGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 24);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.25 });
    disposables.push(coilGeo, coilMat);
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.position.set(0, 0, hapticD / 2 + 0.005);
    hapticGroup.add(coil);
  }

  hapticGroup.position.set(-w * 0.22, -h / 2 + 0.35, 0.015);
  registerPart('haptic_engine', hapticGroup, [-0.22, -0.75, 0.4]);

  // ==========================================
  // 9. SUB-BOARD & USB-C (Layer 9)
  // ==========================================
  const subGroup = new THREE.Group();
  const subGeo = new THREE.BoxGeometry(w * 0.82, 0.32, 0.02);
  disposables.push(subGeo);
  const subMesh = new THREE.Mesh(subGeo, mbMat);
  subMesh.position.set(0, -h / 2 + 0.28, 0.012);
  subGroup.add(subMesh);

  // USB-C Receptacle with red waterproof silicone gasket
  const usbcGeo = new THREE.BoxGeometry(0.24, 0.1, 0.035);
  disposables.push(usbcGeo);
  const usbcMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 });
  disposables.push(usbcMat);
  const usbc = new THREE.Mesh(usbcGeo, usbcMat);
  usbc.position.set(0, -h / 2 + 0.16, 0.02);

  const gasketGeo = new THREE.BoxGeometry(0.26, 0.04, 0.038);
  disposables.push(gasketGeo);
  const gasketMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
  disposables.push(gasketMat);
  const gasket = new THREE.Mesh(gasketGeo, gasketMat);
  gasket.position.set(0, -h / 2 + 0.14, 0.02);
  subGroup.add(usbc, gasket);

  // 3.5mm Analog Audio Headphone Jack (Budget & selected Mid-Range models like Infinix Hot 12 Play)
  const has35mmJack = config.segment === 'Budget' || isInfinix || (config.segment === 'Mid-Range' && !isApple && !isSamsung && !isPixel);
  if (has35mmJack) {
    const jackBoxGeo = new THREE.BoxGeometry(0.24, 0.22, 0.045);
    disposables.push(jackBoxGeo);
    const jackBoxMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.94, roughness: 0.18 });
    disposables.push(jackBoxMat);
    const jackBox = new THREE.Mesh(jackBoxGeo, jackBoxMat);
    jackBox.position.set(w * 0.28, -h / 2 + 0.16, 0.022);

    const jackHoleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 16);
    jackHoleGeo.rotateX(Math.PI / 2);
    const jackHoleMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    disposables.push(jackHoleGeo, jackHoleMat);
    const jackHole = new THREE.Mesh(jackHoleGeo, jackHoleMat);
    jackHole.position.set(w * 0.28, -h / 2 + 0.16, 0.035);

    const jackPinsGeo = new THREE.BoxGeometry(0.18, 0.04, 0.012);
    disposables.push(jackPinsGeo);
    const jackPins = new THREE.Mesh(jackPinsGeo, goldPinMat);
    jackPins.position.set(w * 0.28, -h / 2 + 0.25, 0.02);

    subGroup.add(jackBox, jackHole, jackPins);
  }

  // Dual MEMS Microphones with acoustic mesh
  const micGeo = new THREE.BoxGeometry(0.06, 0.06, 0.025);
  disposables.push(micGeo);
  const micMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  disposables.push(micMat);
  const mic1 = new THREE.Mesh(micGeo, micMat);
  mic1.position.set(-w * 0.28, -h / 2 + 0.25, 0.02);
  const mic2 = new THREE.Mesh(micGeo, micMat);
  mic2.position.set(w * 0.28, -h / 2 + 0.25, 0.02);
  subGroup.add(mic1, mic2);

  // Miniature Coaxial RF Antenna Gold Sockets
  const rfGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.025, 16);
  rfGeo.rotateX(Math.PI / 2);
  disposables.push(rfGeo);
  const rf1 = new THREE.Mesh(rfGeo, goldPinMat);
  rf1.position.set(-w * 0.35, -h / 2 + 0.35, 0.02);
  const rf2 = new THREE.Mesh(rfGeo, goldPinMat);
  rf2.position.set(w * 0.35, -h / 2 + 0.35, 0.02);
  subGroup.add(rf1, rf2);

  // Samsung Galaxy Ultra: Visible S-Pen Stylus Unit in lower silo
  if (config.chassisForm === 'box_ultra') {
    const spenRodGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 16);
    disposables.push(spenRodGeo);
    const spenMat = new THREE.MeshStandardMaterial({ color: 0x111317, metalness: 0.85, roughness: 0.2 });
    disposables.push(spenMat);
    const spenRod = new THREE.Mesh(spenRodGeo, spenMat);
    spenRod.position.set(-w / 2 + 0.18, -h / 2 + 0.75, 0.02);
    subGroup.add(spenRod);
  }

  registerPart('sub_board', subGroup, [0, -0.85, 0.3]);

  root.position.set(0, 0, 0);

  return {
    group: root,
    partsMap,
    config,
    dispose: () => {
      disposables.forEach((item) => {
        if ('dispose' in item) {
          item.dispose();
        }
      });
    },
  };
}
