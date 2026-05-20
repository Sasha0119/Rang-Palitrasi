/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, AlertTriangle, Eye, ShieldAlert, Sliders, RefreshCw, Palette } from 'lucide-react';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, getBrightness } from '../utils';

export default function ColorConverter() {
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [textColor, setTextColor] = useState<string>('#4f46e5');

  // Convert states to metrics
  const bgRgb = hexToRgb(bgColor);
  const textRgb = hexToRgb(textColor);

  // WCAG Contrast ratio calculator
  const getRelativeLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lumBg = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const lumText = getRelativeLuminance(textRgb.r, textRgb.g, textRgb.b);

  const ratio = (Math.max(lumBg, lumText) + 0.05) / (Math.min(lumBg, lumText) + 0.05);

  const passesAA_Normal = ratio >= 4.5;
  const passesAA_Large = ratio >= 3.0;
  const passesAAA_Normal = ratio >= 7.0;
  const passesAAA_Large = ratio >= 4.5;

  const handleRandomizeTest = () => {
    // Generate lovely distinct hex values for background and text
    const colors = [
      '#1e1b4b', '#f5f5f7', '#0f172a', '#ffffff', '#dc2626', 
      '#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0d9488'
    ];
    let newBg = colors[Math.floor(Math.random() * colors.length)];
    let newText = colors[Math.floor(Math.random() * colors.length)];
    if (newBg === newText) {
      newText = newBg === '#ffffff' ? '#0f172a' : '#ffffff';
    }
    setBgColor(newBg);
    setTextColor(newText);
  };

  return (
    <div className="section-container" id="accessibility-section">
      <div className="favorites-heading-wrap">
        <div>
          <h2 className="section-title">Kontrast va Dizayner Uskunalari</h2>
          <p className="section-description-text">
            WCAG (Web Content Accessibility Guidelines) xalqaro standartlari bo'yicha matn va fon ranglari mosligini qulay tekshiring.
          </p>
        </div>
        <button onClick={handleRandomizeTest} className="btn-action btn-secondary">
          <RefreshCw size={16} />
          <span>Namuna yuklash</span>
        </button>
      </div>

      <div className="grid-responsive-2col" style={{ marginTop: '1.5rem' }}>
        {/* Canvass Check card left */}
        <div className="contrast-checker-preview-pane">
          <div className="pane-header">
            <span className="badge-acc-title">Matn Vizualizatsiyasi</span>
          </div>

          <div
            className="contrast-canvas-result-box"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            <div className="canvas-demo-text-box">
              <h3 style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.8rem 0', lineHeight: 1.1 }}>
                Ranglar go'zalligi
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                Ushbu panel ma'lumotlarning o'qilish darajasini jonli tekshiradi. Yaxshi muvozanatlangan kontrast saytga tashrif buyuruvchilarning ko'zi charchashini oldini oladi.
              </p>
              <div
                className="nested-demo-tag"
                style={{
                  borderColor: textColor,
                  color: textColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '0.8rem',
                }}
              >
                Tirgovuch
              </div>
            </div>
          </div>

          {/* Quick info color tags */}
          <div className="acc-info-indicators flex-row">
            <div className="half-pane">
              <label className="input-label">Fon Rangi (Background)</label>
              <div className="color-picker-input-combined">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="picker-native-stop"
                  id="contrast-bg-picker"
                />
                <label htmlFor="contrast-bg-picker" className="color-text-box-label font-mono">
                  {bgColor.toUpperCase()}
                </label>
              </div>
            </div>

            <div className="half-pane">
              <label className="input-label">Matn Rangi (Foreground)</label>
              <div className="color-picker-input-combined">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="picker-native-stop"
                  id="contrast-text-picker"
                />
                <label htmlFor="contrast-text-picker" className="color-text-box-label font-mono">
                  {textColor.toUpperCase()}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility results right */}
        <div className="contrast-scores-pane">
          <div className="rating-card-box">
            <span className="rating-subtitle">Kontrast Koeffitsiyenti</span>
            <div className="rating-score-huge">
              <span>{ratio.toFixed(2)}</span>
              <span className="ratio-divider"> : 1</span>
            </div>
          </div>

          <div className="checker-standards-list">
            <div className="standard-metric-row">
              <div className="metric-status-col">
                {passesAA_Normal ? (
                  <div className="badge-pass">AA PASS</div>
                ) : (
                  <div className="badge-fail">AA FAIL</div>
                )}
              </div>
              <div className="metric-descr-col">
                <strong>Oddiy Matn (AA talabi &gt;= 4.5:1)</strong>
                <p>Kichik va o'rtacha o'lchamdagi asosiy matnlar uchun o'qish qulayligi.</p>
              </div>
            </div>

            <div className="standard-metric-row">
              <div className="metric-status-col">
                {passesAA_Large ? (
                  <div className="badge-pass">AA PASS</div>
                ) : (
                  <div className="badge-fail">AA FAIL</div>
                )}
              </div>
              <div className="metric-descr-col">
                <strong>Yirik Matn (AA talabi &gt;= 3.0:1)</strong>
                <p>Nisbatan yirik sarlavhalar va qalin tahrir elementlari uchun ruxsat berilgan me'yor.</p>
              </div>
            </div>

            <div className="standard-metric-row">
              <div className="metric-status-col">
                {passesAAA_Normal ? (
                  <div className="badge-pass-premium">AAA PASS</div>
                ) : (
                  <div className="badge-fail">AAA FAIL</div>
                )}
              </div>
              <div className="metric-descr-col">
                <strong>Maksimal O'qiluvchanlik (AAA &gt;= 7.0:1)</strong>
                <p>Kuchli parhez va eng xavfsiz kontrast darajasi. Har qanday foydalanuvchiga mos tushadi.</p>
              </div>
            </div>
          </div>

          {/* Accessibility conclusion card */}
          <div className="acc-conclusion-status-block">
            {ratio >= 4.5 ? (
              <div className="flex-row gap-mini text-success-area">
                <Check className="stroke-success" size={20} />
                <p>
                  Ushbu rang birikmasi juda ajoyib va raqamli dizayn qoidalariga to'liq javob beradi. Foydalanuvchi qorachig'iga bosim tushmaydi.
                </p>
              </div>
            ) : (
              <div className="flex-row gap-mini text-alert-area">
                <ShieldAlert className="stroke-alert" size={20} />
                <p>
                  Diqqat! Ranglarning kontrasti pastroq bo'lishi mumkin. Matn o'qilishini yaxshilash uchun fonni biroz yoritishni yoki matn ohangini to'qroq qilishni tavsiya etamiz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
