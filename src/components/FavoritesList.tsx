/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Copy, Check, ExternalLink, Heart, FolderHeart, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { ColorPalette, CustomGradient } from '../types';

interface FavoritesListProps {
  favorites: ColorPalette[];
  favoriteGradients: CustomGradient[];
  onDeleteFavorite: (id: string) => void;
  onDeleteFavoriteGradient: (id: string) => void;
  onRestorePalette: (colors: string[]) => void;
  onRestoreGradient: (colors: string[], type: 'linear' | 'radial' | 'conic', angle: number) => void;
}

export default function FavoritesList({
  favorites,
  favoriteGradients,
  onDeleteFavorite,
  onDeleteFavoriteGradient,
  onRestorePalette,
  onRestoreGradient,
}: FavoritesListProps) {
  const [activeSubTab, setActiveSubTab] = useState<'palettes' | 'gradients'>('palettes');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPaletteHex = (id: string, colors: string[]) => {
    navigator.clipboard.writeText(colors.join(', '));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyGradientCSS = (id: string, colors: string[], type: string, angle: number) => {
    let css = '';
    if (type === 'linear') {
      css = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    } else if (type === 'radial') {
      css = `radial-gradient(circle, ${colors.join(', ')})`;
    } else {
      css = `conic-gradient(from ${angle}deg, ${colors.join(', ')})`;
    }
    navigator.clipboard.writeText(`background: ${css};`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopySingleColor = (e: React.MouseEvent, colorHex: string) => {
    e.stopPropagation(); // Stop parent click events
    navigator.clipboard.writeText(colorHex.toUpperCase());
    // Flash message could be managed locally or visually
  };

  return (
    <div className="section-container" id="favorites-section">
      <div className="favorites-heading-wrap">
        <div>
          <h2 className="section-title">Saralangan To'plamlar</h2>
          <p className="section-description-text">
            Siz saqlagan barcha rang garmoniyalari va murakkab gradient dizaynlari bu yerda mustahkam saqlanadi.
          </p>
        </div>

        {/* Sub tabs to toggle between palette and gradients */}
        <div className="favorites-sub-tabs">
          <button
            onClick={() => setActiveSubTab('palettes')}
            className={`sub-tab-btn ${activeSubTab === 'palettes' ? 'active' : ''}`}
          >
            <Palette size={16} />
            <span>Palitralar ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('gradients')}
            className={`sub-tab-btn ${activeSubTab === 'gradients' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>Gradientlar ({favoriteGradients.length})</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'palettes' ? (
          <motion.div
            key="palettes-fav"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="favorites-grid-wrapper"
          >
            {favorites.length === 0 ? (
              <div className="empty-favorites-placeholder">
                <div className="placeholder-art-icon">
                  <Heart className="heart-empty-anim" size={48} />
                </div>
                <h3>Sizda hali saqlangan palitralar mavjud emas</h3>
                <p>
                  Generatorda o'zingizga yoqqan garmoniyalarni yarating va uning ustidagi "Kolleksiyaga qo'shish" tugmasini bosing.
                </p>
              </div>
            ) : (
              <div className="fav-cards-layout">
                {favorites.map((palette) => (
                  <motion.div
                    key={palette.id}
                    className="favorite-item-card"
                    whileHover={{ y: -4 }}
                  >
                    <div className="fav-card-header">
                      <span className="fav-card-title">{palette.name}</span>
                      <span className="fav-card-date">
                        {new Date(palette.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>

                    {/* Color bar row */}
                    <div className="fav-colors-bar">
                      {palette.colors.map((color, idx) => (
                        <div
                          key={`${palette.id}-c-${idx}`}
                          className="fav-color-block-segment group"
                          style={{ backgroundColor: color }}
                          onClick={(e) => handleCopySingleColor(e, color)}
                          title={`${color.toUpperCase()} (Nusxa olish uchun bosing)`}
                        >
                          <span className="color-tooltip-text">{color.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="fav-card-footer">
                      <button
                        onClick={() => onRestorePalette(palette.colors)}
                        className="btn-text-action btn-restore"
                        title="Generatorga yuklash"
                      >
                        <ExternalLink size={14} className="inline-icon" />
                        <span>Yuklash</span>
                      </button>

                      <div className="footer-right-actions">
                        <button
                          onClick={() => handleCopyPaletteHex(palette.id, palette.colors)}
                          className="btn-icon-footer"
                          title="Barcha HEX ranglarni nusxalash"
                        >
                          {copiedId === palette.id ? <Check size={16} className="txt-success" /> : <Copy size={15} />}
                        </button>
                        <button
                          onClick={() => onDeleteFavorite(palette.id)}
                          className="btn-icon-footer text-danger-hover"
                          title="O'chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="gradients-fav"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="favorites-grid-wrapper"
          >
            {favoriteGradients.length === 0 ? (
              <div className="empty-favorites-placeholder">
                <div className="placeholder-art-icon">
                  <FolderHeart className="heart-empty-anim" size={48} />
                </div>
                <h3>Sizda hali saqlangan gradientlar mavjud emas</h3>
                <p>
                  Gradient bo'limida chiroyli silliq rang to'plamlarini moslashtiring va "Katalogga saqlash" tugmasini bosing.
                </p>
              </div>
            ) : (
              <div className="fav-cards-layout">
                {favoriteGradients.map((grad) => {
                  let previewCSS = '';
                  if (grad.type === 'linear') {
                    previewCSS = `linear-gradient(${grad.angle}deg, ${grad.colors.join(', ')})`;
                  } else if (grad.type === 'radial') {
                    previewCSS = `radial-gradient(circle, ${grad.colors.join(', ')})`;
                  } else {
                    previewCSS = `conic-gradient(from ${grad.angle}deg, ${grad.colors.join(', ')})`;
                  }

                  return (
                    <motion.div
                      key={grad.id}
                      className="favorite-item-card"
                      whileHover={{ y: -4 }}
                    >
                      <div className="fav-card-header">
                        <span className="fav-card-title">{grad.name}</span>
                        <span className="fav-card-type-badge text-xs">
                          {grad.type === 'linear' ? `${grad.angle}° chiziqli` : grad.type === 'radial' ? 'radial' : 'konus'}
                        </span>
                      </div>

                      {/* Small gradient bar preview */}
                      <div className="fav-gradient-preview-strip" style={{ background: previewCSS }} />

                      {/* Footer Actions */}
                      <div className="fav-card-footer">
                        <button
                          onClick={() => onRestoreGradient(grad.colors, grad.type, grad.angle)}
                          className="btn-text-action btn-restore"
                          title="Gradient generatoriga yuklash"
                        >
                          <ExternalLink size={14} className="inline-icon" />
                          <span>Yuklash</span>
                        </button>

                        <div className="footer-right-actions">
                          <button
                            onClick={() => handleCopyGradientCSS(grad.id, grad.colors, grad.type, grad.angle)}
                            className="btn-icon-footer"
                            title="CSS kodini olish"
                          >
                            {copiedId === grad.id ? <Check size={16} className="txt-success" /> : <Copy size={15} />}
                          </button>
                          <button
                            onClick={() => onDeleteFavoriteGradient(grad.id)}
                            className="btn-icon-footer text-danger-hover"
                            title="O'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
