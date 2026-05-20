/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HarmonyMode } from './types';

// O'zbekcha rang nomlari ro'yxati (uzb color names mapped to hex)
const UZBEK_COLOR_NAMES: { [hex: string]: string } = {
  '#ffffff': 'Sadaf (Oq)',
  '#000000': 'Smola (Qora)',
  '#808080': 'Kulrang',
  '#c0c0c0': 'Kumushrang',
  '#ffd700': 'Oltinrang',
  '#ff0000': 'Yoqut (Qizil)',
  '#00ff00': 'Maysa yashili',
  '#0000ff': 'Lojuvard (Ko\'k)',
  '#ffff00': 'Sariq',
  '#00ffff': 'Firuza',
  '#ff00ff': 'Nilufar (Och siyohrang)',
  '#ffa500': 'Zarg\'aldoq (Olovrang)',
  '#800080': 'Siyohrang',
  '#a52a2a': 'Jigarrang',
  '#800000': 'To\'q qizil (Bordo)',
  '#808000': 'Zaytun',
  '#008080': 'Dengiz to\'lqini',
  '#000080': 'Safsar (To\'q ko\'k)',
  '#ffc0cb': 'Och pushti',
  '#ff7f50': 'Marjonrang (Koral)',
  '#fa8072': 'Tarvuzrang',
  '#e6e6fa': 'Siren',
  '#ffdab9': 'Shaftolirang',
  '#00fa9a': 'Yalpiz yashili',
  '#40e0d0': 'Turkuaz',
  '#4b0082': 'Indigo',
  '#da70d6': 'Orxideya',
  '#fff8dc': 'Qaymoqrang',
  '#f5f5dc': 'Sariq-oqish (Bej)',
  '#d2b48c': 'Qumrang',
  '#ff4500': 'Olovli qizil',
  '#708090': 'Slate kulrang',
  '#008000': 'Zumrad (To\'q yashil)',
  '#228b22': 'O\'rmon yashili',
  '#87ceeb': 'Havorang',
  '#b8860b': 'Kahrabo',
  '#ff1493': 'Neon pushti',
  '#4a0e17': 'Chernika yashil',
};

// RGB values helper
interface RGB {
  r: number;
  g: number;
  b: number;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): RGB {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1).toLowerCase();
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Get brightness of hex color (0-255) to determine contrast requirements
export function getBrightness(hex: string): number {
  const rgb = hexToRgb(hex);
  // HSP color model brightness formula
  return Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b));
}

// Get closest Uzbek color name by calculating Euclidean distance of RGB
export function getUzbekColorName(hex: string): string {
  const current = hexToRgb(hex);
  let minDistance = Infinity;
  let closestName = 'Noma\'lum rang';

  for (const [key, name] of Object.entries(UZBEK_COLOR_NAMES)) {
    const check = hexToRgb(key);
    const distance = Math.sqrt(
      Math.pow(current.r - check.r, 2) +
      Math.pow(current.g - check.g, 2) +
      Math.pow(current.b - check.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestName = name;
    }
  }

  return closestName;
}

// Generate random Hex color
export function generateRandomHex(): string {
  const randomValue = Math.floor(Math.random() * 16777215);
  return '#' + randomValue.toString(16).padStart(6, '0').toLowerCase();
}

// Generate Color Harmonies
export function generateHarmony(baseHex: string, mode: HarmonyMode, count: number = 5): string[] {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [baseHex.toLowerCase()];

  switch (mode) {
    case 'analogous': {
      // Shifting Hue by small increments
      const step = 25;
      for (let i = 1; i < count; i++) {
        const direction = i % 2 === 0 ? 1 : -1;
        const multiplier = Math.ceil(i / 2);
        const newH = (hsl.h + direction * multiplier * step + 360) % 360;
        const newRgb = hslToRgb(newH, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
    }
    case 'monochromatic': {
      // Keep hue, change saturation or lightness
      const stepL = 12;
      for (let i = 1; i < count; i++) {
        let newL = hsl.l;
        if (hsl.l > 50) {
          newL = hsl.l - i * stepL;
        } else {
          newL = hsl.l + i * stepL;
        }
        newL = Math.max(10, Math.min(90, newL));
        
        let newS = hsl.s;
        if (i % 2 === 0) {
          newS = Math.max(10, hsl.s - 15);
        }

        const newRgb = hslToRgb(hsl.h, newS, newL);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
    }
    case 'triadic': {
      // Hue offsets of 120 and 240, rest can be lightness/saturation shifts
      const offsets = [120, 240, 15, 135];
      for (let i = 1; i < count; i++) {
        const offset = offsets[(i - 1) % offsets.length];
        const newH = (hsl.h + offset) % 360;
        // Introduce tiny variation in lightness too
        const newL = Math.max(15, Math.min(85, hsl.l + (i % 2 === 0 ? 10 : -10)));
        const newRgb = hslToRgb(newH, hsl.s, newL);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
    }
    case 'tetradic': {
      // Four colors around the circle: 0, 90, 180, 270 (and 30 for 5th)
      const offsets = [90, 180, 270, 30];
      for (let i = 1; i < count; i++) {
        const offset = offsets[(i - 1) % offsets.length];
        const newH = (hsl.h + offset) % 360;
        const newRgb = hslToRgb(newH, hsl.s, hsl.l);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
    }
    case 'complementary': {
      // Opposite side (180 deg) and variations
      const offsets = [180, 15, 195, -15];
      for (let i = 1; i < count; i++) {
        const offset = offsets[(i - 1) % offsets.length];
        const newH = (hsl.h + offset + 360) % 360;
        // Make opposite colors pop slightly differently
        const newL = i === 1 ? Math.max(30, Math.min(70, 100 - hsl.l)) : hsl.l;
        const newRgb = hslToRgb(newH, hsl.s, newL);
        colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      }
      break;
    }
    case 'random':
    default: {
      for (let i = 1; i < count; i++) {
        colors.push(generateRandomHex());
      }
      break;
    }
  }

  return colors.map((col) => col.toLowerCase());
}

// Generate an entire palette
export function generateFullPalette(lockedColors: (string | null)[], mode: HarmonyMode): string[] {
  // First, find a base color (the first locked color or a random one)
  let baseColor = generateRandomHex();
  for (const color of lockedColors) {
    if (color) {
      baseColor = color;
      break;
    }
  }

  // Generate harmonized list
  const count = lockedColors.length;
  const rawColors = generateHarmony(baseColor, mode, count);

  // Blend with locked colors
  const finalColors: string[] = [];
  for (let i = 0; i < count; i++) {
    const locked = lockedColors[i];
    if (locked) {
      finalColors.push(locked);
    } else {
      finalColors.push(rawColors[i]);
    }
  }

  return finalColors;
}

// Prest list of creative pre-made palettes (Uzbek descriptors)
export const PRESET_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Yozgi Tong (Sunrise)", colors: ["#FF5F6D", "#FFC371", "#FFD200", "#FFD1DE", "#8E2DE2"] },
  { name: "Sokin Ummon (Ocean Serene)", colors: ["#4ca1af", "#c4e0e5", "#0f2027", "#203a43", "#2c5364"] },
  { name: "Zumrad O'rmon (Forest Emerald)", colors: ["#11998e", "#38ef7d", "#1b4d3e", "#a3e4d7", "#0e3a2f"] },
  { name: "Kuzgi Barglar (Autumn Leaf)", colors: ["#f12711", "#f5af19", "#e65c00", "#f9d423", "#4d1c1c"] },
  { name: "Lojuvard Kecha (Midnight Lapis)", colors: ["#0575E6", "#00F260", "#00c6ff", "#0072ff", "#130CB7"] },
  { name: "Shirin Shaftoli (Sweet Peach)", colors: ["#ED4264", "#FFEDBC", "#fbc531", "#ff7675", "#6c5ce7"] },
  { name: "Neon Orzular (Neon Dreams)", colors: ["#f107a3", "#7b2ff7", "#00f0ff", "#100a26", "#ffffff"] },
  { name: "Minimalist Pastel", colors: ["#f9ebde", "#8fa89b", "#c8d step", "#a2a8d3", "#e0ece4"].map(c => c === "#c8d step" ? "#c8d6e5" : c) },
  { name: "Oltin Cho'l (Golden Desert)", colors: ["#e65c00", "#f5d061", "#36220f", "#8a5822", "#fcd9cf"] },
  { name: "Safsar Kamalak (Indigo Violet)", colors: ["#642B73", "#C13584", "#F77737", "#833AB4", "#E1306C"] },
];

export const PRESET_GRADIENTS: { name: string; colors: string[]; angle: number }[] = [
  { name: "Pushti Kamalak", colors: ["#FF3366", "#BA26FC"], angle: 45 },
  { name: "Kosmik Kecha", colors: ["#0F2027", "#203A43", "#2C5364"], angle: 135 },
  { name: "Mavjli Turkuaz", colors: ["#00F2FE", "#4FACFE"], angle: 90 },
  { name: "Qirollik Safsari", colors: ["#F54EA2", "#FF7676"], angle: 60 },
  { name: "Kislotali Yalpiz", colors: ["#11998E", "#38EF7D"], angle: 120 },
  { name: "Pechka Olovi", colors: ["#F12711", "#F5AF19"], angle: 225 },
  { name: "Binafsha Tush", colors: ["#833AB4", "#FD1D1D", "#FCB045"], angle: 180 },
  { name: "Tillo Qora", colors: ["#000000", "#a8ff78", "#11998e"].slice(0, 2), angle: 315 }, // Fallbacks
];
