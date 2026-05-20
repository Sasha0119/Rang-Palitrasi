/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Copy, History, RefreshCw, Check, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';

interface HistoryListProps {
  history: string[][];
  onClearHistory: () => void;
  onRestorePalette: (colors: string[]) => void;
  onSaveFavorite: (colors: string[], name?: string) => void;
}

export default function HistoryList({ history, onClearHistory, onRestorePalette, onSaveFavorite }: HistoryListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyHistory = (index: number, colors: string[]) => {
    navigator.clipboard.writeText(colors.join(', '));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleQuickAddFavorite = (colors: string[]) => {
    onSaveFavorite(colors, `Tarixiy #${Math.floor(Math.random() * 1000)}`);
  };

  return (
    <div className="section-container" id="history-section">
      <div className="history-header">
        <div className="history-text-left">
          <h2 className="section-title flex-align">
            <History className="inline-icon" size={24} />
            <span>Generatsiyalar Tarixi</span>
          </h2>
          <p className="section-description-text">
            Siz har safar kosmos yoki garmoniya tugmasini bosganingizda, yaralgan ohanglar shu yerda muhrlanib boradi.
          </p>
        </div>

        {history.length > 0 && (
          <button onClick={onClearHistory} className="btn-action btn-danger" title="Tarixni batamom o'chirish">
            <Trash2 size={16} />
            <span>Tarixni tozalash</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {history.length === 0 ? (
          <motion.div
            key="empty-hist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="empty-history-placeholder"
          >
            <div className="placeholder-art-circle">
              <History size={40} className="pulse-history-icon" />
            </div>
            <h3>Yaratilishlar tarixi hali bo'sh</h3>
            <p>
              Birinchi bo'limga o'ting va turli ranglar to'lqinini ko'rish uchun "Generatsiya" tugmasini yoki klaviaturadagi Space (Bo'shliq) tugmasini bosing!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="has-hist"
            className="history-list-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {history.map((paletteColors, index) => (
              <motion.div
                key={`history-item-${index}-${paletteColors.join('-')}`}
                className="history-item-row"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <div className="history-row-number">
                  <span>#{history.length - index}</span>
                </div>

                {/* Inline color representation */}
                <div className="history-row-capsules">
                  {paletteColors.map((color, idx) => (
                    <div
                      key={`hist-color-${index}-${idx}`}
                      className="history-color-capsule"
                      style={{ backgroundColor: color }}
                      title={`${color.toUpperCase()}`}
                    >
                      <span className="history-color-hex-tag">{color.toUpperCase()}</span>
                    </div>
                  ))}
                </div>

                {/* Inline row actions */}
                <div className="history-row-actions">
                  <button
                    onClick={() => onRestorePalette(paletteColors)}
                    className="history-action-btn active-restore-btn"
                    title="Bu palitrani tahrirlagichga qaytarish"
                  >
                    <ExternalLink size={14} />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    onClick={() => handleQuickAddFavorite(paletteColors)}
                    className="history-action-btn"
                    title="Tezda sevimlilarga saqlash"
                  >
                    <span>Saqlash</span>
                  </button>

                  <button
                    onClick={() => handleCopyHistory(index, paletteColors)}
                    className="history-icon-action-btn"
                    title="Nusxalash"
                  >
                    {copiedIndex === index ? (
                      <Check size={16} className="txt-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
