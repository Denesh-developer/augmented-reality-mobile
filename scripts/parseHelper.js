import fs from 'fs';
import path from 'path';

// Helper to determine camera layout based on brand & model
function getCameraLayout(brand, model) {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();

  if (b.includes('apple')) return 'apple_triangle';
  if (b.includes('google')) return 'pixel_visor';
  if (b.includes('oneplus')) {
    if (m.includes('nord')) return 'samsung_matrix';
    return 'oneplus_circle';
  }
  if (b.includes('samsung')) return 'samsung_matrix';
  if (b.includes('vivo') && (m.includes('x100') || m.includes('x90') || m.includes('x200') || m.includes('x300') || m.includes('x80'))) {
    return 'oneplus_circle';
  }
  if (b.includes('oppo') && m.includes('find x')) return 'oneplus_circle';
  if (b.includes('tecno') && (m.includes('phantom') || m.includes('camon 30 premier') || m.includes('camon 40'))) return 'oneplus_circle';
  if (b.includes('xiaomi') && m.includes('ultra')) return 'oneplus_circle';
  if (b.includes('realme') && (m.includes('12 pro') || m.includes('13 pro') || m.includes('14 pro') || m.includes('gt 5 pro'))) return 'oneplus_circle';
  if (b.includes('honor') && (m.includes('magic') || m.includes('x50'))) return 'oneplus_circle';
  if (b.includes('huawei') && (m.includes('mate') || m.includes('pura'))) return 'oneplus_circle';

  return 'xiaomi_square';
}

function getChassisColor(brand, model, segment) {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();

  if (b.includes('apple')) {
    if (m.includes('desert') || m.includes('gold')) return { color: '#38322c', accent: '#d4b38a' };
    if (m.includes('blue')) return { color: '#252e3d', accent: '#60a5fa' };
    return { color: '#2d2d30', accent: '#a1a1aa' };
  }
  if (b.includes('oneplus') && (m.includes('emerald') || m.includes('green'))) return { color: '#162b22', accent: '#34d399' };
  if (b.includes('samsung') && m.includes('ultra')) return { color: '#36383e', accent: '#94a3b8' };
  if (b.includes('lava')) return { color: '#182026', accent: '#f59e0b' };
  if (b.includes('infinix') && m.includes('gt')) return { color: '#1c1e24', accent: '#00f0ff' };
  if (b.includes('iqoo') && m.includes('12')) return { color: '#f8fafc', accent: '#ef4444' };
  if (b.includes('poco')) return { color: '#1c1e22', accent: '#facc15' };

  return { color: '#22252c', accent: '#38bdf8' };
}

export function parseCSVToPhones(csvContent) {
  const lines = csvContent.split('\n');
  const phones = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Brand,') || line.startsWith('Total,') || line.startsWith('About this')) continue;

    // Handle quoted fields
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 6) {
      const no = parts[0];
      const brand = parts[1];
      const model = parts[2];
      const series = parts[3];
      const segment = parts[4];
      const year = parseInt(parts[5], 10);

      if (!brand || !model || isNaN(year)) continue;

      const id = `${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const layout = getCameraLayout(brand, model);
      const { color, accent } = getChassisColor(brand, model, segment);

      const isLarge = model.toLowerCase().includes('max') || model.toLowerCase().includes('ultra') || model.toLowerCase().includes('plus') || model.toLowerCase().includes('xl') || model.toLowerCase().includes('pro+');
      const isFold = model.toLowerCase().includes('fold') || model.toLowerCase().includes('flip');

      const width = isFold ? 68.5 : isLarge ? 77.2 : 74.5;
      const height = isLarge ? 163.5 : 158.0;
      const thickness = isFold ? 11.5 : isLarge ? 8.4 : 7.9;
      const cornerRadius = layout === 'samsung_matrix' ? 4.0 : layout === 'apple_triangle' ? 12.0 : 8.5;

      const keywords = [
        brand.toLowerCase(),
        model.toLowerCase(),
        ...model.toLowerCase().split(/[\s\-+/]+/).filter(w => w.length > 1),
      ];

      phones.push({
        id,
        brand,
        model,
        year,
        width,
        height,
        thickness,
        cornerRadius,
        cameraLayout: layout,
        color,
        accentColor: accent,
        backMaterial: 'matte_glass',
        frameMaterial: 'aluminum',
        screenSize: isLarge ? '6.78 inch AMOLED 120Hz' : '6.55 inch FHD+ AMOLED',
        resolution: isLarge ? '2780 x 1264 px' : '2400 x 1080 px',
        batteryCapacity: isLarge ? '5400 mAh' : '5000 mAh',
        soc: segment === 'Flagship' ? 'Flagship AI Processor' : segment === 'Gaming' ? 'High-Performance Gaming SoC' : 'Octa-core 5G SoC',
        cameraSpecs: isLarge ? '50MP OIS + Periscope Telephoto + UW' : '50MP AI Dual Camera',
        keywords: Array.from(new Set(keywords)),
      });
    }
  }

  return phones;
}
