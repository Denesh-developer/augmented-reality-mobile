import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generator
 * Creates photorealistic 2D textures tailored dynamically to each brand, model, and era.
 */

function getPhoneContext(config) {
  const brand = (config.brand || '').toLowerCase();
  const model = (config.model || '').toLowerCase();
  const year = config.year || 2024;
  const form = config.chassisForm || 'modern_flat';

  const isApple = brand.includes('apple');
  const isSamsung = brand.includes('samsung');
  const isPixel = brand.includes('google');
  const isNothing = brand.includes('nothing');
  const isInfinix = brand.includes('infinix') || brand.includes('tecno');
  const isPOCO = brand.includes('poco');
  const isMotorola = brand.includes('motorola') || model.includes('moto');
  const isRealme = brand.includes('realme');
  const isOnePlus = brand.includes('oneplus');
  const isOppo = brand.includes('oppo');
  const isXiaomi = brand.includes('xiaomi') || brand.includes('redmi');
  const isVivo = brand.includes('vivo') || brand.includes('iqoo');
  const isSony = brand.includes('sony');
  const isHonor = brand.includes('honor') || brand.includes('huawei');
  const isGaming = form === 'gaming_mecha' || brand.includes('asus') || brand.includes('rog') || brand.includes('black shark') || brand.includes('redmagic');
  const isBlackBerry = form === 'qwerty_keypad' || brand.includes('blackberry');
  const isLumia = form === 'lumia_polycarbonate' || model.includes('lumia');
  const isVintage = year <= 2013;

  return { isApple, isSamsung, isPixel, isNothing, isInfinix, isPOCO, isMotorola, isRealme, isOnePlus, isOppo, isXiaomi, isVivo, isSony, isHonor, isGaming, isBlackBerry, isLumia, isVintage, year, brand, model, form };
}

/**
 * 1. Procedural Screen Lockscreen Texture Generator
 */
export function createScreenTexture(config) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const ctx_info = getPhoneContext(config);
  const accent = config.accentColor || '#38bdf8';

  // ------------------------------------------
  // A. WALLPAPERS BY ERA & BRAND
  // ------------------------------------------
  if (ctx_info.isBlackBerry) {
    // BlackBerry OS Corporate Mesh / Carbon
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Carbon weave pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < canvas.width; x += 16) {
      for (let y = 0; y < canvas.height; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }
    // Silver divider line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 500);
    ctx.lineTo(canvas.width - 80, 500);
    ctx.stroke();

    // BlackBerry Header
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 70px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BlackBerry', canvas.width / 2, 350);

    ctx.font = '400 42px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('3G • EDGE • BES CONNECTED', canvas.width / 2, 430);

    // Envelope message icon
    ctx.font = '90px sans-serif';
    ctx.fillText('✉️', canvas.width / 2, 700);

    ctx.font = '700 160px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('12:45', canvas.width / 2, 950);

    ctx.font = '500 48px "Inter", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Monday, 16 November', canvas.width / 2, 1050);

    ctx.font = '700 38px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${config.model.toUpperCase()}`, canvas.width / 2, 1150);

  } else if (ctx_info.isLumia) {
    // Windows Phone Modern Live Tiles Lockscreen
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#001428');
    grad.addColorStop(0.5, '#023059');
    grad.addColorStop(1, '#001428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Large bold clean Windows Phone typography
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 240px "Segoe UI", "Space Grotesk", sans-serif';
    ctx.fillText('12:45', 100, 650);

    ctx.font = '400 64px "Segoe UI", "Inter", sans-serif';
    ctx.fillText('Monday, November 16', 110, 770);

    // Live Notification tile
    const tileY = 950;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(100, tileY, canvas.width - 200, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 44px "Segoe UI", sans-serif';
    ctx.fillText('Windows Phone 8', 140, tileY + 80);

    ctx.font = '400 32px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText('PureView Optical Image Stabilization Ready', 140, tileY + 140);
    ctx.fillText(`${config.model} • All Systems Normal`, 140, tileY + 190);

  } else if (ctx_info.isVintage && ctx_info.isApple) {
    // Classic iOS 4/5/6: Waterdrops / Linen Wallpaper with "Slide to unlock"
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0c1a2d');
    grad.addColorStop(0.5, '#1e3a5f');
    grad.addColorStop(1, '#0c1a2d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lockscreen Clock in translucent bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 150, canvas.width, 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '200 170px "Helvetica Neue", "Space Grotesk", sans-serif';
    ctx.fillText('9:41', canvas.width / 2, 330);

    ctx.font = '500 38px "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Monday, November 16', canvas.width / 2, 395);

    // Slide to unlock track at bottom
    const sliderY = 2050;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, sliderY - 60, canvas.width, 240);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(100, sliderY, canvas.width - 200, 110, 24);
    ctx.fill();

    // Slider knob
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(110, sliderY + 10, 140, 90, 18);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = '50px sans-serif';
    ctx.fillText('➔', 180, sliderY + 70);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '500 38px "Helvetica Neue", sans-serif';
    ctx.fillText('slide to unlock', canvas.width / 2 + 60, sliderY + 68);

  } else if (ctx_info.isApple) {
    // Apple iOS 18 Titanium Fluid Wallpaper
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0a0d14');
    grad.addColorStop(0.3, '#151b28');
    grad.addColorStop(0.65, '#231e34');
    grad.addColorStop(1, '#0b0c12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.filter = 'blur(70px)';
    const g1 = ctx.createRadialGradient(340, 800, 40, 340, 800, 520);
    g1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    g1.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
    g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(340, 800, 520, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Status bar
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 42px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('09:41', 110, 135);

    ctx.textAlign = 'right';
    ctx.fillText('5G', 870, 135);

    // Clock
    ctx.textAlign = 'center';
    ctx.font = '600 230px -apple-system, "Space Grotesk", sans-serif';
    ctx.fillText('09:41', canvas.width / 2, 720);

    ctx.font = '500 46px -apple-system, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Monday, 16 November', canvas.width / 2, 810);

  } else if (ctx_info.isPixel) {
    // Google Material You Dynamic Stacked Clock
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1c1b1f');
    grad.addColorStop(0.5, '#2c2a32');
    grad.addColorStop(1, '#15131a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.filter = 'blur(80px)';
    const gP = ctx.createRadialGradient(400, 1000, 60, 400, 1000, 600);
    gP.addColorStop(0, 'rgba(218, 226, 249, 0.45)');
    gP.addColorStop(0.5, 'rgba(168, 199, 250, 0.25)');
    gP.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gP;
    ctx.beginPath();
    ctx.arc(400, 1000, 600, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#f1f0f4';
    ctx.font = '600 310px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('12', canvas.width / 2, 630);
    ctx.fillText('45', canvas.width / 2, 920);

    ctx.font = '500 42px "Inter", sans-serif';
    ctx.fillStyle = '#d0bcff';
    ctx.fillText('Mon, Nov 16 • 24°C ⛅ • Google Tensor', canvas.width / 2, 1060);

  } else if (ctx_info.isNothing) {
    // Nothing OS Dot-Matrix Clock & Monochrome Widgets
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 30; x < canvas.width; x += 36) {
      for (let y = 30; y < canvas.height; y += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 450, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 210px monospace';
    ctx.fillText('12:45', canvas.width / 2, 720);

    ctx.font = '500 40px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MON, 16 NOV • NOTHING OS', canvas.width / 2, 820);

  } else if (ctx_info.isOnePlus) {
    // OnePlus Signature Clock: Red '1'
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#04121a');
    grad.addColorStop(0.5, '#073e3a');
    grad.addColorStop(1, '#031018');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '600 230px "Space Grotesk", sans-serif';
    const totalW = ctx.measureText('12:45').width;
    const startX = (canvas.width - totalW) / 2;
    ctx.textAlign = 'left';

    ctx.fillStyle = '#eb0028'; // OnePlus Red
    ctx.fillText('1', startX, 720);
    const oneW = ctx.measureText('1').width;

    ctx.fillStyle = '#ffffff';
    ctx.fillText('2:45', startX + oneW, 720);

    ctx.textAlign = 'center';
    ctx.font = '500 44px "Inter", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Monday, 16 November • Never Settle', canvas.width / 2, 810);

  } else if (ctx_info.isInfinix) {
    // Infinix XOS Cyber Mecha Lockscreen
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#020f18');
    grad.addColorStop(0.4, '#052a3d');
    grad.addColorStop(0.8, '#031722');
    grad.addColorStop(1, '#01090f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyber geometric grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1.5;
    for (let x = 60; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 120; y < canvas.height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 230px "Space Grotesk", sans-serif';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';
    ctx.shadowBlur = 25;
    ctx.fillText('12:45', canvas.width / 2, 720);
    ctx.shadowBlur = 0;

    ctx.font = '700 42px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('XOS • DAR-LINK 2.0 • 90Hz ULTRA FLUID', canvas.width / 2, 810);

  } else if (ctx_info.isPOCO) {
    // POCO Cyber Yellow & Carbon Lockscreen
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal Yellow Slash
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(canvas.width, 100);
    ctx.lineTo(canvas.width, 240);
    ctx.lineTo(0, 440);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 240px "Space Grotesk", sans-serif';
    ctx.fillText('12:45', canvas.width / 2, 720);

    ctx.font = '700 44px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#eab308';
    ctx.fillText('POCO HyperOS • TURBO CHARGE READY', canvas.width / 2, 810);

  } else if (ctx_info.isMotorola) {
    // Motorola Moto Peek Display
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Circular battery gauge ring
    ctx.strokeStyle = '#be3455';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 650, 260, 0, Math.PI * 1.6);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 210px "Space Grotesk", sans-serif';
    ctx.fillText('12:45', canvas.width / 2, 680);

    ctx.font = '500 42px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Hello Moto • 92% Charged', canvas.width / 2, 790);

  } else if (ctx_info.isRealme) {
    // Realme UI Luxury Fluid Art
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#101614');
    grad.addColorStop(0.5, '#1e3328');
    grad.addColorStop(1, '#0d1311');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 220px "Space Grotesk", sans-serif';
    ctx.fillText('12:45', canvas.width / 2, 720);

    ctx.font = '700 40px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('realme UI • DARE TO LEAP', canvas.width / 2, 810);

  } else if (ctx_info.isVivo) {
    // Vivo / iQOO OriginOS / Funtouch Aesthetic
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#130c1e');
    grad.addColorStop(0.5, '#2e183b');
    grad.addColorStop(1, '#0e0b17');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 220px "Space Grotesk", sans-serif';
    ctx.fillText('12:45', canvas.width / 2, 720);

    ctx.font = '500 42px "Inter", sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('Funtouch OS • ZEISS Natural Color', canvas.width / 2, 810);

  } else if (ctx_info.isGaming) {
    // Cyberpunk Mecha HUD
    ctx.fillStyle = '#07080c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.lineWidth = 1.5;
    for (let y = 100; y < canvas.height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 230px "Space Grotesk", sans-serif';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.shadowBlur = 30;
    ctx.fillText('12:45', canvas.width / 2, 720);
    ctx.shadowBlur = 0;

    ctx.font = '700 40px "Space Grotesk", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('TURBO OVERCLOCK • 3.2 GHz • 38°C', canvas.width / 2, 810);

  } else {
    // Samsung One UI / Standard Dynamic Wallpaper
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#060919');
    grad.addColorStop(0.35, '#0d1d3d');
    grad.addColorStop(0.7, '#241242');
    grad.addColorStop(1, '#060919');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 220px "Space Grotesk", sans-serif';
    ctx.fillText('12:45', canvas.width / 2, 720);

    ctx.font = '500 46px "Inter", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Monday, 16 November', canvas.width / 2, 810);
  }

  // Model & Chipset Subtitle
  if (!ctx_info.isBlackBerry && !ctx_info.isLumia && !(ctx_info.isVintage && ctx_info.isApple)) {
    ctx.textAlign = 'center';
    ctx.font = '700 38px "Space Grotesk", sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText(`${config.brand.toUpperCase()} ${config.model.toUpperCase()}`, canvas.width / 2, 890);

    // Interactive Diagnostic Card
    const cardY = 1040;
    const cardW = 880;
    const cardH = 210;
    const cardX = (canvas.width - cardW) / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = `${accent}66`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cardX + 85, cardY + 105, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0b1025';
    ctx.beginPath();
    ctx.moveTo(cardX + 75, cardY + 85);
    ctx.lineTo(cardX + 105, cardY + 105);
    ctx.lineTo(cardX + 75, cardY + 125);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px "Space Grotesk", sans-serif';
    ctx.fillText('AR Teardown Diagnostics', cardX + 165, cardY + 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 30px "Inter", sans-serif';
    ctx.fillText(`Chipset: ${config.soc || 'Octa-core'} • ${config.batteryCapacity || '5000 mAh'}`, cardX + 165, cardY + 140);

    // Home bar pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 170, canvas.height - 60, 340, 12, 6);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 2. Procedural Battery Skin Texture Generator
 */
export function createBatteryTexture(config) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const ctx_info = getPhoneContext(config);
  const cap = config.batteryCapacity || '5000 mAh';

  if (ctx_info.isApple) {
    ctx.fillStyle = '#111215';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '700 85px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('', canvas.width / 2, 170);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px -apple-system, sans-serif';
    ctx.fillText('Rechargeable Li-ion Polymer Battery', 80, 260);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 25px monospace';
    ctx.fillText(`Model: A-${config.year || '2024'} • Apple Inc. California`, 80, 310);
    ctx.fillText(`Rated: ${cap} • 3.89Vdc • Apple Certified Part`, 80, 350);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 22px sans-serif';
    ctx.fillText('WARNING: Potential fire or burn hazard. Authorized Service Only.', 80, 440);

  } else if (ctx_info.isSamsung) {
    // Samsung SDI Metallic Silver Pouch
    ctx.fillStyle = '#bcc2cb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle brushed metal sheen lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillRect(0, y, canvas.width, 3);
    }

    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(80, 70, canvas.width - 160, 14);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SAMSUNG SDI', 80, 160);

    ctx.fillStyle = '#1e40af';
    ctx.font = '700 28px sans-serif';
    ctx.fillText('SECONDARY LI-ION BATTERY / 규격 인증 셀', 80, 210);

    ctx.fillStyle = '#334155';
    ctx.font = '600 25px monospace';
    ctx.fillText(`MODEL: EB-B${config.year || '2024'} • NOMINAL: 3.88V`, 80, 260);
    ctx.fillText(`TYPICAL CAPACITY: ${cap} • 19.40Wh`, 80, 300);
    ctx.fillText('CAUTION: Do not disassemble or expose above 60°C', 80, 350);

    // Blue pull tab graphic at bottom
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(canvas.width / 2 - 120, canvas.height - 90, 240, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲ PULL TO RELEASE ▲', canvas.width / 2, canvas.height - 45);

  } else if (ctx_info.isOnePlus) {
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#eb0028';
    ctx.fillRect(80, 70, canvas.width - 160, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SUPERVOOC DUAL-CELL BATTERY', 80, 155);

    ctx.fillStyle = '#eb0028';
    ctx.font = '700 32px "Space Grotesk", sans-serif';
    ctx.fillText('100W FLASH CHARGE CERTIFIED', 80, 210);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 24px monospace';
    ctx.fillText(`DUAL-PACK ARCHITECTURE: 2x ${(parseInt(cap) / 2) || 2500}mAh`, 80, 260);
    ctx.fillText(`TOTAL RATED: ${cap} • 7.76V SERIES POWER`, 80, 300);
    ctx.fillText('ONEPLUS NEVER SETTLE • HIGH SPEED ANODE', 80, 350);

  } else if (ctx_info.isPOCO) {
    // POCO Cyber High-Speed Battery
    ctx.fillStyle = '#111215';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Yellow racing diagonal stripe
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 320, 0);
    ctx.lineTo(canvas.width - 200, 0);
    ctx.lineTo(canvas.width - 450, canvas.height);
    ctx.lineTo(canvas.width - 570, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('POCO HYPERCHARGE', 80, 160);

    ctx.fillStyle = '#eab308';
    ctx.font = '700 34px "Space Grotesk", sans-serif';
    ctx.fillText('TURBO-CHARGE LI-POLYMER CELL', 80, 215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 25px monospace';
    ctx.fillText(`CAPACITY: ${cap} • 67W-120W TURBO READY`, 80, 265);
    ctx.fillText('GRAPHITE ANODE • BIS / CE COMPLIANT', 80, 310);

  } else if (ctx_info.isInfinix) {
    // Infinix Cyber Neo-Tech Battery
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon cyan grid overlay
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 2;
    for (let x = 80; x < canvas.width - 80; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }

    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(80, 70, canvas.width - 160, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('INFINIX MEGA-CELL', 80, 160);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 30px "Space Grotesk", sans-serif';
    ctx.fillText('ULTRA NIGHT POWER • ALL-DAY ENDURANCE', 80, 215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 25px monospace';
    ctx.fillText(`CAPACITY: ${cap} • SAFE CHARGE CHIP`, 80, 265);
    ctx.fillText('HIGH-DENSITY LI-ION CELL • CE / BIS', 80, 310);

  } else if (ctx_info.isPixel) {
    // Google Pixel Minimalist Battery
    ctx.fillStyle = '#16171b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Google 'G' Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 70px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('G', 80, 160);

    ctx.font = '700 44px "Space Grotesk", sans-serif';
    ctx.fillText('Google Tensor Battery', 160, 155);

    ctx.fillStyle = '#a8c7fa';
    ctx.font = '600 28px sans-serif';
    ctx.fillText('Extreme Battery Saver Capable', 80, 215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 25px monospace';
    ctx.fillText(`RATED: ${cap} • NOMINAL 3.87V`, 80, 265);
    ctx.fillText('Titan M2 Hardware Security Protected', 80, 310);

  } else if (ctx_info.isXiaomi) {
    // Xiaomi Surge Battery
    ctx.fillStyle = '#141519';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(80, 70, canvas.width - 160, 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('XIAOMI SURGE P2 BATTERY', 80, 155);

    ctx.fillStyle = '#f97316';
    ctx.font = '700 30px sans-serif';
    ctx.fillText('120W HYPERCHARGE LI-ION POLYMER', 80, 210);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 24px monospace';
    ctx.fillText(`RATED: ${cap} • DUAL SILICON-CARBON ANODE`, 80, 260);

  } else {
    ctx.fillStyle = '#171920';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = config.accentColor || '#00f0ff';
    ctx.fillRect(80, 70, canvas.width - 160, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 44px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${(config.brand || 'SMARTPHONE').toUpperCase()} LI-ION BATTERY`, 80, 150);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 26px "Inter", sans-serif';
    ctx.fillText(`CAPACITY: ${cap} • Nominal 3.87V`, 80, 200);
    ctx.fillText('BIS / CE CERTIFIED RECHARGEABLE CELL', 80, 245);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 3. Procedural Motherboard PCB Texture Generator
 */
export function createPCBTexture(config = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (!ctx || !bumpCtx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return { map: dummy, bump: dummy };
  }

  const ctx_info = getPhoneContext(config);

  // PCB Substrate Color & Trace Colors tailored per brand & era
  let pcbColor = '#0b0d13';
  let traceColor = '#d4af37'; // Gold
  let traceWidth = 3.5;

  if (ctx_info.isVintage || config.internalsStyle === 'vintage_green_pcb') {
    pcbColor = '#0d2b18'; // Classic emerald green PCB
    traceColor = '#b87333'; // Copper
  } else if (ctx_info.isApple) {
    pcbColor = '#07080a'; // Stealth matte black
    traceColor = '#c4c8d0'; // High-purity silver / rhodium traces
  } else if (ctx_info.isSamsung) {
    pcbColor = '#07101e'; // Deep Samsung navy blue substrate
    traceColor = '#e5b839'; // High-conductivity gold
  } else if (ctx_info.isOnePlus) {
    pcbColor = '#0f1013'; // Carbon black substrate
    traceColor = '#d4af37'; // Gold with red test points
  } else if (ctx_info.isPOCO) {
    pcbColor = '#0a0a0c'; // Aggressive cyber black
    traceColor = '#eab308'; // Glowing yellow traces
    traceWidth = 4.0;
  } else if (ctx_info.isInfinix) {
    pcbColor = '#051910'; // High-tech emerald cyber substrate
    traceColor = '#06b6d4'; // Cyan neon traces
    traceWidth = 3.8;
  } else if (ctx_info.isPixel) {
    pcbColor = '#121316'; // Ceramic charcoal
    traceColor = '#cbd5e1'; // Platinum silver traces
  }

  ctx.fillStyle = pcbColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);

  // Multi-layer Copper / Gold Circuit Traces
  ctx.strokeStyle = traceColor;
  ctx.lineWidth = traceWidth;
  bumpCtx.strokeStyle = '#ffffff';
  bumpCtx.lineWidth = traceWidth;

  for (let i = 0; i < 54; i++) {
    const sx = 80 + Math.random() * 840;
    const sy = 80 + Math.random() * 840;
    const len = 40 + Math.random() * 160;

    ctx.beginPath();
    bumpCtx.beginPath();
    ctx.moveTo(sx, sy);
    bumpCtx.moveTo(sx, sy);

    const mx = sx + len;
    const my = sy;
    const ex = mx + (Math.random() > 0.5 ? 45 : -45);
    const ey = my + (Math.random() > 0.5 ? 45 : -45);

    ctx.lineTo(mx, my);
    ctx.lineTo(ex, ey);
    bumpCtx.lineTo(mx, my);
    bumpCtx.lineTo(ex, ey);

    ctx.stroke();
    bumpCtx.stroke();

    // Solder micro-vias / test pads
    if (i % 3 === 0) {
      ctx.fillStyle = traceColor;
      ctx.beginPath();
      ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Exact SoC Label laser etched on PCB
  const socName = (config.soc || config.chipset || 'APPLICATION PROCESSOR').toUpperCase();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '800 32px monospace';
  ctx.fillText(socName, 120, 160);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 20px monospace';
  ctx.fillText(`OEM: ${(config.brand || 'SMARTPHONE').toUpperCase()} • BOARD REV_${config.year || '2024'}.3`, 120, 205);
  ctx.fillText(`MEM: ${config.ram || '8GB'} LPDDR5X • UFS: ${config.storage || '128GB'}`, 120, 245);
  ctx.fillText('MODEM: 5G_NR_SUB6_MIMO_TRANSCEIVER', 120, 285);
  ctx.fillText('PMIC: DUAL_PHASE_SWITCHING_REGULATOR', 120, 520);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.needsUpdate = true;

  return { map, bump };
}

/**
 * 4. Procedural Smartphone Back Panel Texture Generator
 * Creates authentic, brand-specific rear panel graphics, materials,
 * camera plateau guides, rear fingerprint sensors, and luxury finishes.
 */
export function createBackPanelTexture(config) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const ctx_info = getPhoneContext(config);
  const baseColor = config.color || '#1e293b';
  const accentColor = config.accentColor || '#38bdf8';

  // Base fill with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, baseColor);
  bgGrad.addColorStop(1, baseColor);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // -------------------------------------------------------------
  // BRAND-SPECIFIC REAR GRAPHICS, PATTERNS & LOGOS
  // -------------------------------------------------------------

  if (ctx_info.isInfinix) {
    const isWaveFlow = config.backTextureStyle === 'wave_flow' || 
                       ctx_info.model.toLowerCase().includes('11s') || 
                       ctx_info.model.toLowerCase().includes('10s') || 
                       ctx_info.model.toLowerCase().includes('hot 11') ||
                       ctx_info.model.toLowerCase().includes('note 11s');
    const isGTMecha = config.backTextureStyle === 'mecha_blueprint' || 
                      ctx_info.model.toLowerCase().includes('gt 10') || 
                      ctx_info.model.toLowerCase().includes('gt 20') || 
                      ctx_info.model.toLowerCase().includes('gt 30');
    const isDiamond = config.backTextureStyle === 'geometric_facet' || 
                      ctx_info.model.toLowerCase().includes('zero 8');

    if (isWaveFlow) {
      // 1A. INFINIX HOT 11S / 10S: Authentic Holographic Wave Flow / Chevron Undulating Ribbons
      // (Google Reference Specs: distinct undulating sine waves reflecting prismatic colors)
      const numWaves = 42;
      const waveStep = canvas.width / numWaves;
      const wavelength = 140;
      const amplitude = 16;

      ctx.lineWidth = 3.5;
      for (let i = 0; i < numWaves; i++) {
        const baseX = i * waveStep;
        const isAccent = (i % 3 === 0);
        const alpha = isAccent ? 0.36 : 0.18;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 8) {
          const xOffset = Math.sin((y / wavelength) * Math.PI * 2 + (i * 0.45)) * amplitude;
          if (y === 0) ctx.moveTo(baseX + xOffset, y);
          else ctx.lineTo(baseX + xOffset, y);
        }
        ctx.stroke();

        // 3D holographic shadow groove
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 8) {
          const xOffset = Math.sin((y / wavelength) * Math.PI * 2 + (i * 0.45)) * amplitude;
          if (y === 0) ctx.moveTo(baseX + xOffset + 2, y);
          else ctx.lineTo(baseX + xOffset + 2, y);
        }
        ctx.stroke();
      }

      // Holographic wave prismatic gradient sheen
      const waveGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      waveGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      waveGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
      waveGrad.addColorStop(0.68, 'rgba(168, 85, 247, 0.18)');
      waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bottom-Left Vertical Infinix Logo
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 84px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Infinix', 90, 1860);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '600 24px "Inter", sans-serif';
      ctx.fillText('DESIGNED BY INFINIX • 50MP ULTRA NIGHT CAMERA', 90, 1915);

    } else if (isGTMecha) {
      // 1B. INFINIX GT 10 PRO / GT 20 PRO: Cyber Mecha Transparent Blueprint Back
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)'; // Orange cyber accents
      ctx.lineWidth = 2.5;
      for (let x = 80; x < canvas.width; x += 160) {
        ctx.beginPath();
        ctx.moveTo(x, 200);
        ctx.lineTo(x + 120, 400);
        ctx.lineTo(x + 120, 1400);
        ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.font = '700 28px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('GT POWER // MECHA EDITION', canvas.width - 80, 1200);
      ctx.fillText('HIGH-VOLTAGE // 120Hz ULTRA', canvas.width - 80, 1240);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 84px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Infinix GT', 90, 1860);

    } else if (isDiamond) {
      // 1C. INFINIX ZERO 8 / 8i: Diamond Rhombus Geometric Facet
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 84px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Infinix', 90, 1860);

    } else {
      // 1D. INFINIX HOT 12 PLAY / HOT 12 / NOTE / SMART: Dense Vertical Laser Pinstripes
      ctx.lineWidth = 2.5;
      for (let x = 0; x < canvas.width; x += 12) {
        const isMajor = (x % 36 === 0);
        const alpha = isMajor ? 0.38 : 0.22;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.75})`;
        ctx.beginPath();
        ctx.moveTo(x + 2, 0);
        ctx.lineTo(x + 2, canvas.height);
        ctx.stroke();
      }

      const rayGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      rayGrad.addColorStop(0, 'rgba(0, 240, 255, 0.16)');
      rayGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.25)');
      rayGrad.addColorStop(0.65, 'rgba(0, 240, 255, 0.12)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 84px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Infinix', 90, 1860);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '600 24px "Inter", sans-serif';
      ctx.fillText('DESIGNED BY INFINIX • MODEL X6817', 90, 1915);
    }

  } else if (ctx_info.isPOCO) {
    // 2. POCO (High-Contrast Cyber Racing Banner)
    // Top 30% full-width black carbon racing banner
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, canvas.width, 640);

    // Subtle carbon fiber diagonal weave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let i = -canvas.width; i < canvas.width * 2; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 640, 640);
      ctx.stroke();
    }

    // POCO Cyber Accent Line
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 634, canvas.width, 6);

    // Giant Bold POCO Logo on the right of the banner
    ctx.fillStyle = '#eab308';
    ctx.font = '900 130px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('POCO', canvas.width - 80, 410);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px monospace';
    ctx.fillText('5G • SPEED PAST LIMITS', canvas.width - 80, 465);

    // Bottom Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '600 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POCO GLOBAL COMMUNICATIONS', canvas.width / 2, 1920);

  } else if (ctx_info.isPixel) {
    // 3. GOOGLE PIXEL (Two-Tone Color Split with Edge-to-Edge Visor Shelf)
    // Upper section above visor has accent tint
    const topGrad = ctx.createLinearGradient(0, 0, 0, 500);
    topGrad.addColorStop(0, accentColor);
    topGrad.addColorStop(1, accentColor);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, 500);

    // Visor drop shadow band
    const visorShadow = ctx.createLinearGradient(0, 500, 0, 560);
    visorShadow.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    visorShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = visorShadow;
    ctx.fillRect(0, 500, canvas.width, 60);

    // Center Google "G" Emblem
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 120px -apple-system, "Product Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G', canvas.width / 2, 1180);

    // Bottom regulatory micro-text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Designed by Google • Assembled in Vietnam', canvas.width / 2, 1920);

  } else if (ctx_info.isApple) {
    // 4. APPLE iPHONE (Frosted AG Satin Velvet Glass)
    // Soft radial satin frosted glow
    const appleSatin = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 900);
    appleSatin.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    appleSatin.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = appleSatin;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mirrored Center  Apple Logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '700 160px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('', canvas.width / 2, canvas.height / 2 + 50);

    // Bottom regulatory micro-text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '500 20px -apple-system, sans-serif';
    ctx.fillText('Designed by Apple in California', canvas.width / 2, 1920);

  } else if (ctx_info.isSamsung) {
    // 5. SAMSUNG GALAXY (Minimalist Satin Frosted Glasstic Finish)
    const samGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 850);
    samGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    samGrad.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
    ctx.fillStyle = samGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Samsung Bottom Centered Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAMSUNG', canvas.width / 2, 1880);

  } else if (ctx_info.isOnePlus) {
    // 6. ONEPLUS (Sandblasted Silk AG Glass)
    const opGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 850);
    opGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    opGrad.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
    ctx.fillStyle = opGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Iconic Red & White 1+ Logo in Center
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.strokeRect(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 65px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1', canvas.width / 2 - 12, canvas.height / 2 + 22);

    ctx.fillStyle = '#ef4444';
    ctx.font = '800 48px "Space Grotesk", sans-serif';
    ctx.fillText('+', canvas.width / 2 + 25, canvas.height / 2 + 10);

    // Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 58px "Space Grotesk", sans-serif';
    ctx.fillText('ONEPLUS', canvas.width / 2, 1880);

  } else if (ctx_info.isRealme) {
    // 7. REALME (Vegan Leather Grain + Central Stitched Zipper Seam)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let x = 0; x < canvas.width; x += 8) {
      for (let y = 0; y < canvas.height; y += 8) {
        if ((x * 7 + y * 13) % 17 < 5) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Central Stitched Zipper Seam down spine
    const centerX = canvas.width / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(centerX - 18, 0, 36, canvas.height);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(centerX - 4, 0, 8, canvas.height);

    // Stitched thread dash lines
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    for (let y = 10; y < canvas.height; y += 22) {
      ctx.beginPath();
      ctx.moveTo(centerX - 12, y);
      ctx.lineTo(centerX - 12, y + 10);
      ctx.moveTo(centerX + 12, y);
      ctx.lineTo(centerX + 12, y + 10);
      ctx.stroke();
    }

    // Realme Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 56px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('realme', canvas.width / 2, 1880);

  } else if (ctx_info.isXiaomi) {
    // 8. XIAOMI / REDMI (Premium AG Glass / Ceramic Sheen)
    const miGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 850);
    miGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    miGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = miGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((config.brand || 'XIAOMI').toUpperCase(), canvas.width / 2, 1880);

  } else if (ctx_info.isVivo) {
    // 9. VIVO / iQOO (Fluorite AG Velvet Sheen)
    const vivoGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    vivoGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    vivoGrad.addColorStop(1, 'rgba(0, 0, 0, 0.16)');
    ctx.fillStyle = vivoGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((config.brand || 'VIVO').toUpperCase(), canvas.width / 2, 1880);

  } else if (ctx_info.isNothing) {
    // 10. NOTHING PHONE (Transparent Industrial Skeleton + Glyph Light Guides)
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Visible PCB circuit lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    for (let y = 300; y < canvas.height - 200; y += 80) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(240, y);
      ctx.lineTo(320, y + 40);
      ctx.lineTo(canvas.width - 120, y + 40);
      ctx.stroke();
    }

    // Glowing Glyph Light Track Overlays
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 8;

    // Center circular wireless charging glyph
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 340, 0, Math.PI * 2);
    ctx.stroke();

    // Top-left camera C-glyph
    ctx.beginPath();
    ctx.arc(280, 420, 180, -0.4 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Bottom vertical exclamation bar
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height - 350);
    ctx.lineTo(canvas.width / 2, canvas.height - 180);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot-Matrix "NOTHING" Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 48px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('(NOTHING)', 100, canvas.height - 120);

  } else if (ctx_info.isMotorola) {
    // 11. MOTOROLA (Batwing Finish + Iconic M Emblem)
    const motoGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 850);
    motoGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    motoGrad.addColorStop(1, 'rgba(0, 0, 0, 0.16)');
    ctx.fillStyle = motoGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Centered Circular Motorola "M" Batwing Emblem
    const mCenterY = canvas.height / 2 - 80;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, mCenterY, 88, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Iconic Batwing M
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 110px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M', canvas.width / 2, mCenterY + 38);

    // Bottom "motorola" Signature
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 58px "Space Grotesk", sans-serif';
    ctx.fillText('motorola', canvas.width / 2, 1880);

  } else if (ctx_info.isSony) {
    // 12. SONY XPERIA (Precision Monolithic Matte Glass)
    const sonyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sonyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    sonyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = sonyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Centered Classic SONY Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 68px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SONY', canvas.width / 2, canvas.height / 2 - 20);

    // Bottom XPERIA Emblem
    ctx.font = '700 48px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('XPERIA', canvas.width / 2, 1880);

  } else if (ctx_info.isHonor) {
    // 13. HONOR / HUAWEI (Refined Pearlescent Finish)
    const honorGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 120, canvas.width / 2, canvas.height / 2, 700);
    honorGrad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
    honorGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
    honorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = honorGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((config.brand || 'HONOR').toUpperCase(), canvas.width / 2, 1880);

  } else if (ctx_info.isOppo) {
    // 14. OPPO (Reno Glow Crystalline Shimmer)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 400; i++) {
      const rx = (i * 137) % canvas.width;
      const ry = (i * 241) % canvas.height;
      ctx.fillRect(rx, ry, 3, 3);
    }

    // Bottom OPPO Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPPO', canvas.width / 2, 1880);

  } else if (ctx_info.isGaming) {
    // 15. GAMING MECHA (Asus ROG / RedMagic Armor)
    ctx.fillStyle = '#08090d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal Cyber Stencil Armor Cuts
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, 400);
    ctx.lineTo(canvas.width / 2, 540);
    ctx.lineTo(canvas.width - 120, 400);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 800);
    ctx.lineTo(canvas.width - 80, 1200);
    ctx.moveTo(canvas.width - 80, 800);
    ctx.lineTo(80, 1200);
    ctx.stroke();

    // Centered ROG Eye Stylized Polygon
    ctx.fillStyle = '#ff0055';
    ctx.font = '900 84px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ROG ⚡', canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '700 24px monospace';
    ctx.fillText('REPUBLIC OF GAMERS • FOR THOSE WHO DARE', canvas.width / 2, canvas.height / 2 + 100);

    // Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 62px "Space Grotesk", sans-serif';
    ctx.fillText((config.brand || 'TACTICAL').toUpperCase(), canvas.width / 2, 1880);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 800);
    ctx.lineTo(canvas.width - 80, 1200);
    ctx.moveTo(canvas.width - 80, 800);
    ctx.lineTo(80, 1200);
    ctx.stroke();

    // Centered ROG Eye Stylized Polygon
    ctx.fillStyle = '#ff0055';
    ctx.font = '900 84px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ROG ⚡', canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '700 24px monospace';
    ctx.fillText('REPUBLIC OF GAMERS • FOR THOSE WHO DARE', canvas.width / 2, canvas.height / 2 + 100);

    // Bottom Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 62px "Space Grotesk", sans-serif';
    ctx.fillText((config.brand || 'TACTICAL').toUpperCase(), canvas.width / 2, 1880);

  } else {
    // 10. GENERAL MODERN SMARTPHONE BACK
    const defGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 850);
    defGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    defGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = defGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((config.brand || 'SMARTPHONE').toUpperCase(), canvas.width / 2, 1860);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '600 24px "Space Grotesk", sans-serif';
    ctx.fillText(`${(config.model || '').toUpperCase()} • 5G / AI MATRIX`, canvas.width / 2, 1915);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
