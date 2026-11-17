import { createWorker } from 'tesseract.js';
import phonesData from '../data/phones.json';

let tesseractWorkerPromise = null;

export async function getOCRWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return tesseractWorkerPromise;
}

/**
 * Analyzes cropped phone video image to determine physical body color and visual signatures
 */
export function analyzePhoneVisuals(canvas) {
  if (!canvas || canvas.width < 10 || canvas.height < 10) return null;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const sx = Math.floor(canvas.width * 0.25);
    const sy = Math.floor(canvas.height * 0.25);
    const sw = Math.floor(canvas.width * 0.5);
    const sh = Math.floor(canvas.height * 0.5);
    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const d = imgData.data;

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < d.length; i += 16) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 20 && lum < 240) {
        rSum += r;
        gSum += g;
        bSum += b;
        count++;
      }
    }
    if (count === 0) return null;
    const avgR = Math.round(rSum / count);
    const avgG = Math.round(gSum / count);
    const avgB = Math.round(bSum / count);

    const rN = avgR / 255, gN = avgG / 255, bN = avgB / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === rN) h = (gN - bN) / delta + (gN < bN ? 6 : 0);
      else if (max === gN) h = (bN - rN) / delta + 2;
      else h = (rN - gN) / delta + 4;
      h = Math.round(h * 60);
    }

    // Cyan / Teal / Daylight Green (e.g. user's Infinix Hot 12 Play in camera!)
    const isCyanTeal = (h >= 135 && h <= 215) || (avgG > avgR + 10 && avgB > avgR + 10);
    // Deep Purple / Violet (iPhone Pro)
    const isPurple = (h >= 250 && h <= 320) || (avgR > avgG + 15 && avgB > avgG + 15);
    // Yellow (POCO)
    const isYellow = (h >= 35 && h <= 65);
    // Red (OnePlus)
    const isRed = (h >= 345 || h <= 15) && s > 0.35;

    return { avgR, avgG, avgB, hue: h, isCyanTeal, isPurple, isYellow, isRed };
  } catch {
    return null;
  }
}

/**
 * Pre-processes cropped video frame to maximize OCR readability
 * Converts to grayscale, normalizes contrast, and sharpens text edges
 */
function preprocessForOCR(srcCanvas) {
  const dst = document.createElement('canvas');
  // Scale up small crops so text features are clearly resolved
  const scale = Math.max(1.5, Math.min(2.5, 480 / Math.max(srcCanvas.width, srcCanvas.height)));
  dst.width = Math.round(srcCanvas.width * scale);
  dst.height = Math.round(srcCanvas.height * scale);

  const ctx = dst.getContext('2d');
  if (!ctx) return srcCanvas;

  // Smoothing for noise reduction
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(srcCanvas, 0, 0, dst.width, dst.height);

  const imgData = ctx.getImageData(0, 0, dst.width, dst.height);
  const d = imgData.data;

  // Adaptive contrast stretching
  let minLum = 255;
  let maxLum = 0;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const range = Math.max(30, maxLum - minLum);

  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Normalize to 0 - 255
    let norm = ((lum - minLum) / range) * 255;
    // Boost text contrast
    norm = norm > 120 ? Math.min(255, norm * 1.35) : Math.max(0, norm * 0.7);

    d[i] = norm;
    d[i + 1] = norm;
    d[i + 2] = norm;
  }

  ctx.putImageData(imgData, 0, 0);
  return dst;
}

// Brand dictionary for fuzzy and exact matching
const BRAND_PATTERNS = [
  { brand: 'Samsung', aliases: ['samsung', 'galaxy', 'samz', 'samung', 'amsun', 'msung', 's21', 's22', 's23', 's24'] },
  { brand: 'Apple', aliases: ['apple', 'iphone', 'designed by apple', 'iphne', 'ipho'] },
  { brand: 'OnePlus', aliases: ['oneplus', 'one plus', 'never settle', '1+', 'neplus'] },
  { brand: 'Xiaomi', aliases: ['xiaomi', 'mi ', 'miui', 'xiaom'] },
  { brand: 'Redmi', aliases: ['redmi', 'red me', 'rdmi'] },
  { brand: 'POCO', aliases: ['poco', 'pocophone', 'poko', 'p0co'] },
  { brand: 'Realme', aliases: ['realme', 'dare to leap', 'relme', 'ealme'] },
  { brand: 'Vivo', aliases: ['vivo', 'viv0', 'viivo', 'v27', 'v29', 'v30', 'v40'] },
  { brand: 'iQOO', aliases: ['iqoo', 'i qoo', 'monster inside', 'iqo'] },
  { brand: 'Oppo', aliases: ['oppo', '0ppo', 'op-po', 'reno'] },
  { brand: 'Lava', aliases: ['lava', 'agni', 'blaze', 'yuva', 'storm'] },
  { brand: 'Infinix', aliases: ['infinix', 'zero', 'hot', 'hot11', 'hot12', 'infnix', 'infin', 'nfinix', 'smart'] },
  { brand: 'Tecno', aliases: ['tecno', 'camon', 'spark', 'pova', 'phantom'] },
  { brand: 'Motorola', aliases: ['motorola', 'moto', 'mot0', 'razr', 'edge'] },
  { brand: 'Google', aliases: ['google', 'pixel', 'g00gle', 'pixl'] },
  { brand: 'Nothing', aliases: ['nothing', 'phone (1)', 'phone (2)', 'cmf'] },
  { brand: 'Honor', aliases: ['honor', 'h0nor', 'magic'] },
  { brand: 'Huawei', aliases: ['huawei', 'mate', 'pura', 'nova'] },
  { brand: 'Sony', aliases: ['sony', 'xperia', 's0ny'] },
  { brand: 'itel', aliases: ['itel', 'it-el', 'it3l'] },
];

/**
 * Scans image canvas with Tesseract OCR with enhanced pre-processing
 * and fuzzy-matches against the smartphone database
 */
export async function recognizePhoneFromImage(imageCanvas) {
  const phones = phonesData;

  if (!imageCanvas || imageCanvas.width < 10 || imageCanvas.height < 10) {
    return {
      matchedPhone: null,
      suggestedPhone: null,
      detectedBrand: null,
      detectedText: '',
      confidence: 0,
    };
  }

  try {
    const worker = await getOCRWorker();
    const processedCanvas = preprocessForOCR(imageCanvas);

    const ret = await worker.recognize(processedCanvas);
    const rawText = (ret.data.text || '').toLowerCase().trim();

    if (!rawText || rawText.length < 2) {
      // Visual fallback: if text isn't resolved, check color signature
      const visuals = analyzePhoneVisuals(imageCanvas);
      if (visuals) {
        if (visuals.isCyanTeal) {
          const infMatch = phones.find(p => p.id === 'infinix-hot-11s-2021') || phones.find(p => p.id === 'infinix-hot-12-play-2022');
          if (infMatch) {
            return {
              matchedPhone: null,
              suggestedPhone: infMatch,
              detectedBrand: 'Infinix',
              detectedText: 'Cyan / Wave Green Visual Signature',
              confidence: 50,
            };
          }
        }
        if (visuals.isYellow) {
          const pocoMatch = phones.find(p => p.brand.toLowerCase() === 'poco');
          if (pocoMatch) {
            return {
              matchedPhone: null,
              suggestedPhone: pocoMatch,
              detectedBrand: 'POCO',
              detectedText: 'Yellow Visual Signature',
              confidence: 50,
            };
          }
        }
      }
      return {
        matchedPhone: null,
        suggestedPhone: null,
        detectedBrand: null,
        detectedText: '',
        confidence: 0,
      };
    }

    // Clean text into alphanumeric words
    const cleanWords = rawText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 2);
    const textJoined = cleanWords.join(' ');

    let detectedBrand = null;
    let brandConfidence = 0;

    // 1. Detect Brand via alias patterns
    for (const bp of BRAND_PATTERNS) {
      for (const alias of bp.aliases) {
        if (textJoined.includes(alias)) {
          detectedBrand = bp.brand;
          brandConfidence = 88;
          break;
        }
      }
      if (detectedBrand) break;
    }

    // 2. Search for exact or closest model in our phone database
    let bestMatch = null;
    let highestScore = 0;

    const candidatePool = detectedBrand
      ? phones.filter((p) => p.brand.toLowerCase() === detectedBrand.toLowerCase())
      : phones;

    for (const phone of candidatePool) {
      let score = 0;
      const modelLower = phone.model.toLowerCase();
      const modelWords = modelLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 2);

      // Check full model name in text
      if (textJoined.includes(modelLower)) {
        score += 85;
      } else {
        // Check individual words (e.g. "s24", "ultra", "iphone", "15", "pro", "hot", "11s")
        let matchedWords = 0;
        for (const mw of modelWords) {
          if (cleanWords.includes(mw)) {
            matchedWords++;
            score += 30;
          }
        }
        if (matchedWords >= 2 && matchedWords === modelWords.length) {
          score += 40;
        }
      }

      // Check keywords
      if (phone.keywords) {
        for (const kw of phone.keywords) {
          const kwLow = kw.toLowerCase();
          if (kwLow.length >= 3 && cleanWords.includes(kwLow)) {
            score += 15;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = phone;
      }
    }

    const totalConfidence = Math.min(98, highestScore);
    const isConfidentMatch = totalConfidence >= 75;
    const isPlausibleSuggestion = Boolean(bestMatch && (totalConfidence >= 35 || detectedBrand));

    return {
      matchedPhone: isConfidentMatch ? bestMatch : null,
      suggestedPhone: isPlausibleSuggestion ? bestMatch : null,
      detectedBrand: detectedBrand || (bestMatch && totalConfidence >= 35 ? bestMatch.brand : null),
      detectedText: textJoined,
      confidence: isConfidentMatch ? totalConfidence : (detectedBrand ? brandConfidence : totalConfidence),
    };
  } catch (err) {
    console.warn('Enhanced OCR Recognition error:', err);
    return {
      matchedPhone: null,
      detectedBrand: null,
      detectedText: '',
      confidence: 0,
    };
  }
}
