/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Plus, Trash2, RefreshCw, Bookmark, BookmarkCheck, Check, CornerRightUp } from 'lucide-react';
import { CustomGradient } from '../types';
import { PRESET_GRADIENTS, generateRandomHex } from '../utils';

interface GradientGeneratorProps {
  onSaveFavoriteGradient: (gradient: Omit<CustomGradient, 'id' | 'createdAt' | 'isFavorite'>) => void;
  favoriteGradients: CustomGradient[];
}

export default function GradientGenerator({ onSaveFavoriteGradient, favoriteGradients }: GradientGeneratorProps) {
  const [gradientColors, setGradientColors] = useState<string[]>(['#ff5f6d', '#ffc371']);
  const [angle, setAngle] = useState<number>(45);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Generate CSS string for styling and code copy
  const getGradientCSS = (colors: string[], type: string, deg: number) => {
    if (type === 'linear') {
      return `linear-gradient(${deg}deg, ${colors.join(', ')})`;
    } else if (type === 'radial') {
      return `radial-gradient(circle, ${colors.join(', ')})`;
    } else {
      return `conic-gradient(from ${deg}deg, ${colors.join(', ')})`;
    }
  };

  const currentCSS = getGradientCSS(gradientColors, gradientType, angle);

  // Check if current gradient is already saved
  useEffect(() => {
    const isAlreadySaved = favoriteGradients.some(
      (grad) =>
        grad.type === gradientType &&
        grad.angle === angle &&
        grad.colors.map(c => c.toLowerCase()).join(',') === gradientColors.map(c => c.toLowerCase()).join(',')
    );
    setIsSaved(isAlreadySaved);
  }, [gradientColors, gradientType, angle, favoriteGradients]);

  // Restore cached gradient on mount
  useEffect(() => {
    const cached = sessionStorage.getItem('temp_restore_gradient');
    if (cached) {
      try {
        const obj = JSON.parse(cached);
        if (obj.colors) setGradientColors(obj.colors);
        if (obj.type) setGradientType(obj.type);
        if (obj.angle !== undefined) setAngle(obj.angle);
        sessionStorage.removeItem('temp_restore_gradient');
      } catch (err) {}
    }
  }, []);

  // Sync restoring events dynamically
  useEffect(() => {
    const handleRestoreEvent = (e: Event) => {
      const data = (e as CustomEvent).detail;
      if (data) {
        if (data.colors) setGradientColors(data.colors);
        if (data.type) setGradientType(data.type);
        if (data.angle !== undefined) setAngle(data.angle);
      }
    };
    window.addEventListener('restore_canvas_gradient', handleRestoreEvent);
    return () => {
      window.removeEventListener('restore_canvas_gradient', handleRestoreEvent);
    };
  }, []);

  const handleRandomize = () => {
    const stopsCount = gradientColors.length;
    const newColors = Array.from({ length: stopsCount }, () => generateRandomHex());
    setGradientColors(newColors);
    setAngle(Math.floor(Math.random() * 36) * 10); // Standard increments
  };

  const handleColorChange = (index: number, val: string) => {
    setGradientColors((prev) => prev.map((c, i) => (i === index ? val : c)));
  };

  const addStop = () => {
    if (gradientColors.length >= 5) return;
    setGradientColors([...gradientColors, generateRandomHex()]);
  };

  const removeStop = (index: number) => {
    if (gradientColors.length <= 2) return;
    setGradientColors(gradientColors.filter((_, i) => i !== index));
  };

  const handleCopyCSS = () => {
    const cssCode = `background: ${currentCSS};`;
    navigator.clipboard.writeText(cssCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveGradient = () => {
    const resolvedName = customName.trim() || `Gradient #${Math.floor(Math.random() * 1000)}`;
    onSaveFavoriteGradient({
      name: resolvedName,
      colors: gradientColors,
      angle,
      type: gradientType,
    });
    setCustomName('');
  };

  const applyPreset = (preset: { colors: string[]; angle: number }) => {
    setGradientColors(preset.colors);
    setAngle(preset.angle);
    setGradientType('linear');
  };

  return (
    <div className="section-container" id="gradient-generator-section">
      <div className="grid-responsive-2col">
        {/* Vizual Ko'rinish (Chap tomon) */}
        <div className="designer-column left-preview">
          <div className="preview-header">
            <h3 className="section-subtitle">Jonli Ko'rinish va Demo</h3>
          </div>

          <motion.div
            className="gradient-canvas-preview"
            style={{ background: currentCSS }}
            layoutId="gradient-preview-screen"
            transition={{ duration: 0.4 }}
          >
            {/* Visual Glassmorphism overlay card on top of the gradient to show styling capacity */}
            <div className="demo-overlay-card">
              <span className="demo-tag">Rang Dizayni</span>
              <h4 className="demo-title">Salom, Dunyo!</h4>
              <p className="demo-desc">
                Ushbu gradient yorqin elementlar va zamonaviy veb-interfeyslarni mukammal bezash uchun mo'ljallangan.
              </p>
              <div className="demo-button" style={{ background: gradientColors[0] }}>
                Tekshirish
              </div>
            </div>
          </motion.div>

          <div className="copy-code-container">
            <pre className="css-code-block">
              <code>{`background: ${currentCSS};`}</code>
            </pre>
            <button onClick={handleCopyCSS} className="btn-action btn-primary w-full-mobile">
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
              <span>{isCopied ? "CSS Nusxalandi" : "CSS Kodini nusxalash"}</span>
            </button>
          </div>
        </div>

        {/* Boshqaruv elementlari (O'ng tomon) */}
        <div className="designer-column right-controls">
          <h3 className="section-subtitle">Gradient Parametrlari</h3>

          <div className="gradient-type-selector">
            <label className="input-label">Yo'nalish Turi</label>
            <div className="flex-row gap-mini">
              {(['linear', 'radial', 'conic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGradientType(t)}
                  className={`tab-toggle-btn capitalize ${gradientType === t ? 'active' : ''}`}
                >
                  {t === 'linear' ? 'Chiziqli (Linear)' : t === 'radial' ? 'Radial' : 'Konus (Conic)'}
                </button>
              ))}
            </div>
          </div>

          {/* Burchak burchagi faqat linear va conic uchun */}
          {(gradientType === 'linear' || gradientType === 'conic') && (
            <div className="degree-control-box">
              <div className="degree-header-labels">
                <label className="input-label" htmlFor="angle-slider">Aylanish Burchagi</label>
                <span className="degree-indicator-badge">{angle}°</span>
              </div>
              <input
                id="angle-slider"
                type="range"
                min="0"
                max="360"
                step="1"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="gradient-slider-range"
              />
              <div className="quick-degree-grid">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
                  <button
                    key={d}
                    onClick={() => setAngle(d)}
                    className={`degree-quick-btn ${angle === d ? 'active' : ''}`}
                  >
                    {d}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color stops section */}
          <div className="color-stops-section-box">
            <label className="input-label">Stop Nuqtalari ({gradientColors.length})</label>
            <div className="stops-container-list">
              <AnimatePresence mode="popLayout">
                {gradientColors.map((color, index) => (
                  <motion.div
                    layout
                    key={`stop-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="stop-input-row"
                  >
                    <span className="stop-index-indicator">{index + 1}</span>
                    <div className="color-picker-input-combined">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="picker-native-stop"
                        id={`stop-picker-${index}`}
                      />
                      <label htmlFor={`stop-picker-${index}`} className="color-text-box-label">
                        <span className="color-box-dot" style={{ backgroundColor: color }} />
                        <span className="hex-caps">{color.toUpperCase()}</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      className="styled-input stop-hex-typing"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      maxLength={7}
                    />

                    {gradientColors.length > 2 && (
                      <button
                        onClick={() => removeStop(index)}
                        className="mini-trash-bin-btn"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {gradientColors.length < 5 && (
              <button
                onClick={addStop}
                className="btn-action btn-add-stop"
                style={{ marginTop: '0.8rem' }}
              >
                <Plus size={16} />
                <span>Stop-nuqta qo'shish</span>
              </button>
            )}
          </div>

          {/* Save panel */}
          <div className="save-form-row">
            <input
              type="text"
              placeholder="Gradient nomi (masalan, Kosmik dengiz)..."
              value={customName}
              maxLength={20}
              onChange={(e) => setCustomName(e.target.value)}
              className="styled-input w-full-input"
            />
            <div className="flex-row gap-mini">
              <button
                onClick={handleSaveGradient}
                disabled={isSaved}
                className={`btn-action flex-one ${isSaved ? 'btn-saved' : 'btn-primary'}`}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                <span>{isSaved ? "Katalogda bor" : "Katalogga saqlash"}</span>
              </button>
              <button onClick={handleRandomize} className="btn-action btn-secondary" title="Tasodifiy o'zgartirish">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Preset gradients shortcuts */}
          <div className="gradient-presets-section">
            <h4 className="nano-title">Premium Gradient Shablonlari</h4>
            <div className="preset-gradients-grid">
              {PRESET_GRADIENTS.map((p, index) => {
                const preCSS = getGradientCSS(p.colors, 'linear', p.angle);
                return (
                  <button
                    key={`preset-${index}`}
                    onClick={() => applyPreset(p)}
                    className="preset-gradient-card-btn"
                    title={p.name}
                  >
                    <div className="mini-preset-preview" style={{ background: preCSS }} />
                    <span className="preset-name-lbl">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
