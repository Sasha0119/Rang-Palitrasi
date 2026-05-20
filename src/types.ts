/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HarmonyMode = 'random' | 'analogous' | 'monochromatic' | 'triadic' | 'tetradic' | 'complementary';

export interface PaletteColor {
  hex: string;
  locked: boolean;
  name?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // HEX list
  isFavorite: boolean;
  createdAt: number;
}

export interface CustomGradient {
  id: string;
  name: string;
  colors: string[]; // CSS properties or hex list
  angle: number; // in degrees (0 - 360)
  type: 'linear' | 'radial' | 'conic';
  isFavorite: boolean;
  createdAt: number;
}

export interface ColorDetails {
  hex: string;
  rgb: string;
  hsl: string;
  contrastWhite: boolean; // Is it readable with white text?
  contrastBlack: boolean; // Is it readable with black text?
  name: string;
}
