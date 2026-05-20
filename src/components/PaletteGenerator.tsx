/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Copy, Trash2, Plus, RefreshCw, Bookmark, BookmarkCheck, LayoutGrid, Check, Settings, Sparkles } from 'lucide-react';
import { HarmonyMode, PaletteColor, ColorPalette } from '../types';
import { generateFullPalette, getBrightness, getUzbekColorName, generateRandomHex } from '../utils';

interface PaletteGeneratorProps {
  onSaveFavorite: (colors: string[], name?: string) => void;
  favorites: ColorPalette[];
  onAddHistory: (colors: string[]) => void;
  isDarkMode: boolean;
}

export default function PaletteGenerator({ onSaveFavorite, favorites, onAddHistory, isDarkMode }: PaletteGeneratorProps) {
  const [colors, setColors] = useState<PaletteColor[]>([
    { hex: '#4f46e5', locked: false },
    { hex: '#ea580c', locked: false },
    { hex: '#16a34a', locked: false },
    { hex: '#2563eb', locked: false },
    { hex: '#db2777', locked: false },
  ]);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('random');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSavedMap, setIsSavedMap] = useState<{ [key: string]: boolean }>({});
  const [customName, setCustomName] = useState<string>('');
  const [showExporter, setShowExporter] = useState<boolean>(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  // Sync saved status with favorites list
  useEffect(() => {
    const map: { [key: string]: boolean } = {};
    const currentColorsString = colors.map(c => c.hex.toLowerCase()).sort().join(',');
    favorites.forEach(fav => {
      const favString = fav.colors.map(col => col.toLowerCase()).sort().join(',');
      if (currentColorsString === favString) {
        map[currentColorsString] = true;
      }
    });
    setIsSavedMap(map);
  }, [colors, favorites]);

  // Generate a random palette on load or restore from cache/events
  useEffect(() => {
    const cached = sessionStorage.getItem('temp_restore_colors');
    if (cached) {
      try {
        const hexList = JSON.parse(cached) as string[];
        setColors(hexList.map(h => ({ hex: h, locked: false })));
        sessionStorage.removeItem('temp_restore_colors');
        return;
      } catch (err) {
        // Fallback
      }
    }
    handleGenerate();
  }, []);

  // Sync dynmic restoring events
  useEffect(() => {
    const handleRestoreEvent = (e: Event) => {
      const hexList = (e as CustomEvent).detail as string[];
      if (hexList && hexList.length > 0) {
        setColors(hexList.map(h => ({ hex: h, locked: false })));
      }
    };
    window.addEventListener('restore_canvas_colors', handleRestoreEvent);
    return () => {
      window.removeEventListener('restore_canvas_colors', handleRestoreEvent);
    };
  }, []);

  // Global keydown event for Spacebar to trigger generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is highlighting inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [colors, harmonyMode]);

  const handleGenerate = () => {
    const lockedStates = colors.map(c => (c.locked ? c.hex : null));
    const newHexes = generateFullPalette(lockedStates, harmonyMode);
    
    const updatedColors = colors.map((c, index) => ({
      ...c,
      hex: newHexes[index] || c.hex,
    }));
    
    setColors(updatedColors);
    onAddHistory(updatedColors.map(c => c.hex));
  };

  const toggleLock = (index: number) => {
    setColors(prev => prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)));
  };

  const handleColorChange = (index: number, newHex: string) => {
    if (!newHex.startsWith('#')) {
      newHex = '#' + newHex;
    }
    // Limit to hex length
    if (newHex.length > 7) return;

    setColors(prev => prev.map((c, i) => (i === index ? { ...c, hex: newHex } : c)));
  };

  const handleColorPickerChange = (index: number, val: string) => {
    setColors(prev => prev.map((c, i) => (i === index ? { ...c, hex: val } : c)));
  };

  const addColor = () => {
    if (colors.length >= 8) return; // Limit to max 8 colors
    setColors([...colors, { hex: generateRandomHex(), locked: false }]);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 2) return; // Minimum 2 colors
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleCopyColor = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleSavePalette = () => {
    const hexList = colors.map(c => c.hex);
    const resolvedName = customName.trim() || `Palitra #${Math.floor(Math.random() * 1000)}`;
    onSaveFavorite(hexList, resolvedName);
    setCustomName('');
  };

  const currentColorsString = colors.map(c => c.hex.toLowerCase()).sort().join(',');
  const isCurrentSaved = !!isSavedMap[currentColorsString];

  const exportAsCSS = () => {
    const cssText = colors.map((c, idx) => `--rang-${idx + 1}: ${c.hex};`).join('\n');
    navigator.clipboard.writeText(cssText);
    setExportedFormat('CSS o\'zgaruvchilari nusxalandi!');
    setTimeout(() => setExportedFormat(null), 3000);
  };

  const exportAsJSON = () => {
    const jsonText = JSON.stringify(colors.map(c => c.hex), null, 2);
    navigator.clipboard.writeText(jsonText);
    setExportedFormat('JSON nusxalandi!');
    setTimeout(() => setExportedFormat(null), 3000);
  };

  return (
    <div className="section-container" id="palette-generator-section">
      {/* Kontroller va Sozlamalar */}
      <div className="control-bar">
        <div className="bar-left">
          <label className="input-label" htmlFor="harmony-select">
            Ranglar Uyg'onishi (Garmoniya)
          </label>
          <div className="select-container">
            <select
              id="harmony-select"
              value={harmonyMode}
              onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
              className="styled-select"
            >
              <option value="random">Tasodifiy (Random)</option>
              <option value="analogous">Analogik (Yaqin ranglar)</option>
              <option value="monochromatic">Monoxromatik (Bir tusli)</option>
              <option value="triadic">Triada (Uchburchak uyg'unlik)</option>
              <option value="tetradic">Tetrada (To'rtburchak)</option>
              <option value="complementary">Komplementar (Qarama-qarshi)</option>
            </select>
          </div>
        </div>

        <div className="bar-right gap-button-group">
          <input
            type="text"
            className="styled-input name-input"
            placeholder="Kolleksiya nomi..."
            value={customName}
            maxLength={25}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <button
            onClick={handleSavePalette}
            disabled={isCurrentSaved}
            className={`btn-action ${isCurrentSaved ? 'btn-saved' : 'btn-primary'}`}
            title="Sevimli palitralarga saqlash"
          >
            {isCurrentSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            <span>{isCurrentSaved ? "Saqlandi" : "Kolleksiyaga qo'shish"}</span>
          </button>

          <button
            onClick={() => setShowExporter(!showExporter)}
            className="btn-action btn-secondary"
            title="Eksport qilish"
          >
            <Settings size={18} />
            <span>Formatlar</span>
          </button>
        </div>
      </div>

      {/* Eksport modal/dropdown kabi paneli */}
      <AnimatePresence>
        {showExporter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="export-panel"
            id="export-panel-menu"
          >
            <div className="export-grid">
              <button onClick={exportAsCSS} className="export-item-btn">
                <code>CSS Variables</code>
              </button>
              <button onClick={exportAsJSON} className="export-item-btn">
                <code>JSON Array</code>
              </button>
              <button
                onClick={() => {
                  const tailwindColors = colors.map((c, idx) => `color${idx + 1}: "${c.hex}"`).join(',\n  ');
                  navigator.clipboard.writeText(`colors: {\n  ${tailwindColors}\n}`);
                  setExportedFormat('Tailwind qatori nusxalandi!');
                  setTimeout(() => setExportedFormat(null), 3000);
                }}
                className="export-item-btn"
              >
                <code>Tailwind Config</code>
              </button>
            </div>
            {exportedFormat && (
              <p className="export-success-msg">
                <Check size={14} className="inline-icon" /> {exportedFormat}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ranglar Kartalari */}
      <div className="palette-grid">
        <AnimatePresence mode="popLayout">
          {colors.map((color, index) => {
            const isDark = getBrightness(color.hex) < 130;
            const darkTextStyle = { color: '#090d16' };
            const lightTextStyle = { color: '#ffffff' };
            const activeTextStyle = isDark ? lightTextStyle : darkTextStyle;
            
            const uzName = getUzbekColorName(color.hex);

            return (
              <motion.div
                layout
                key={`color-${index}-${color.hex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                className="color-card"
                style={{ backgroundColor: color.hex }}
              >
                {/* Kartochka ustidagi barcha ma'lumotlar custom rang bilan mos kontrastda */}
                <div className="card-top" style={activeTextStyle}>
                  <div className="color-actions flex-col">
                    <button
                      onClick={() => toggleLock(index)}
                      className="card-icon-button"
                      style={{ color: activeTextStyle.color }}
                      title={color.locked ? "Ochish" : "Qulflash"}
                    >
                      {color.locked ? <Lock size={20} /> : <Unlock size={20} />}
                    </button>
                    
                    {colors.length > 2 && (
                      <button
                        onClick={() => removeColor(index)}
                        className="card-icon-button hover-danger"
                        style={{ color: activeTextStyle.color }}
                        title="Rangni o'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-center" style={activeTextStyle}>
                  {/* Bosganda HEX nusxa ko'chirish */}
                  <button
                    onClick={() => handleCopyColor(color.hex, index)}
                    className="hex-copy-trigger"
                    style={{ color: activeTextStyle.color }}
                  >
                    <span className="hex-val-txt">{color.hex.toUpperCase()}</span>
                    <span className="copy-notif-float">
                      {copiedIndex === index ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={14} className="copy-icon-hover" />
                      )}
                    </span>
                  </button>
                  <p className="color-traditional-name">{uzName}</p>
                </div>

                <div className="card-bottom" style={activeTextStyle}>
                  {/* Rang tanlagich (Customized colorpicker overlay) */}
                  <div className="custom-picker-wrapper">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorPickerChange(index, e.target.value)}
                      className="hidden-native-picker"
                      id={`picker-${index}`}
                    />
                    <label
                      htmlFor={`picker-${index}`}
                      className="picker-button-label"
                      style={{
                        borderColor: activeTextStyle.color,
                        color: activeTextStyle.color,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <span>Tanlash</span>
                    </label>
                  </div>

                  {/* Manual yozib kiritish qutisi */}
                  <input
                    type="text"
                    value={color.hex}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="card-hex-input"
                    maxLength={7}
                    style={{
                      borderBottomColor: activeTextStyle.color,
                      color: activeTextStyle.color,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Agar max limitga (8) yetmagan bo'lsa yangi rang qo'shish tugmasi */}
        {colors.length < 8 && (
          <button
            onClick={addColor}
            className="add-color-slot-btn"
            title="Yangi rang qo'shish"
          >
            <div className="pulse-circle">
              <Plus size={28} />
            </div>
            <span>Rang qo'shish</span>
          </button>
        )}
      </div>

      <div className="generator-flow-footer">
        <button onClick={handleGenerate} className="big-generate-btn">
          <RefreshCw size={22} className="旋转-icon" />
          <span>BO'SH JOY (SPACE) ni bosing yoki buni tanlang</span>
          <Sparkles size={18} className="sparkle-anim" />
        </button>
        <p className="helper-text-gen">
          Har bir rangni alohida qulflash (<Lock size={12} className="inline-icon" />) orqali kutilgan tuslarni saqlab qolishingiz mumkin
        </p>
      </div>
    </div>
  );
}
