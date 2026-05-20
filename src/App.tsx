/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  Bookmark, 
  History, 
  Sliders, 
  Moon, 
  Sun, 
  Command, 
  Heart,
  Laptop
} from 'lucide-react';

import { ColorPalette, CustomGradient } from './types';
import PaletteGenerator from './components/PaletteGenerator';
import GradientGenerator from './components/GradientGenerator';
import FavoritesList from './components/FavoritesList';
import HistoryList from './components/HistoryList';
import ColorConverter from './components/ColorConverter';
import { PRESET_PALETTES, PRESET_GRADIENTS } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'palette' | 'gradient' | 'favorites' | 'history' | 'contrast'>('palette');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Custom states
  const [favorites, setFavorites] = useState<ColorPalette[]>([]);
  const [favoriteGradients, setFavoriteGradients] = useState<CustomGradient[]>([]);
  const [history, setHistory] = useState<string[][]>([]);

  // Local storage parsing and presets seed on mount
  useEffect(() => {
    // Theme setup
    const storedTheme = localStorage.getItem('rang_generator_theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = storedTheme === null ? systemTheme : storedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Favorites setup - if empty, inject some exquisite default palettes
    const storedFavs = localStorage.getItem('color_palettes_fav');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    } else {
      const initialFavs: ColorPalette[] = PRESET_PALETTES.slice(0, 3).map((p, idx) => ({
        id: `seed-palette-${idx}`,
        name: p.name,
        colors: p.colors.slice(0, 5),
        isFavorite: true,
        createdAt: Date.now() - idx * 3600000,
      }));
      setFavorites(initialFavs);
      localStorage.setItem('color_palettes_fav', JSON.stringify(initialFavs));
    }

    // Favorite Gradients setup - if empty, seed default preset
    const storedGrads = localStorage.getItem('color_gradients_fav');
    if (storedGrads) {
      setFavoriteGradients(JSON.parse(storedGrads));
    } else {
      const initialGrads: CustomGradient[] = PRESET_GRADIENTS.slice(0, 3).map((p, idx) => ({
        id: `seed-gradient-${idx}`,
        name: p.name,
        colors: p.colors,
        angle: p.angle,
        type: 'linear',
        isFavorite: true,
        createdAt: Date.now() - idx * 3600000,
      }));
      setFavoriteGradients(initialGrads);
      localStorage.setItem('color_gradients_fav', JSON.stringify(initialGrads));
    }

    // Palette history setup
    const storedHistory = localStorage.getItem('color_palettes_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Sync theme changes
  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme ? 'dark' : 'light');
    localStorage.setItem('rang_generator_theme', nextTheme ? 'dark' : 'light');
  };

  // Add palette to favorites
  const handleSaveFavorite = (colors: string[], name?: string) => {
    const newFavorite: ColorPalette = {
      id: `fav-palette-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name || `Garmoniya #${favorites.length + 1}`,
      colors,
      isFavorite: true,
      createdAt: Date.now(),
    };
    
    const updated = [newFavorite, ...favorites];
    setFavorites(updated);
    localStorage.setItem('color_palettes_fav', JSON.stringify(updated));
  };

  // Remove palette from favorites
  const handleDeleteFavorite = (id: string) => {
    const updated = favorites.filter(fav => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem('color_palettes_fav', JSON.stringify(updated));
  };

  // Add gradient to favorites
  const handleSaveFavoriteGradient = (grad: Omit<CustomGradient, 'id' | 'createdAt' | 'isFavorite'>) => {
    const newGrad: CustomGradient = {
      ...grad,
      id: `fav-grad-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isFavorite: true,
      createdAt: Date.now(),
    };

    const updated = [newGrad, ...favoriteGradients];
    setFavoriteGradients(updated);
    localStorage.setItem('color_gradients_fav', JSON.stringify(updated));
  };

  // Remove gradient from favorites
  const handleDeleteFavoriteGradient = (id: string) => {
    const updated = favoriteGradients.filter(g => g.id !== id);
    setFavoriteGradients(updated);
    localStorage.setItem('color_gradients_fav', JSON.stringify(updated));
  };

  // Add palette to generation history
  const handleAddHistory = (colors: string[]) => {
    // Check if the exact same color list is already the latest in history to prevent duplicates
    if (history.length > 0) {
      const latest = history[0];
      if (latest.join(',').toLowerCase() === colors.join(',').toLowerCase()) {
        return;
      }
    }

    const updated = [colors, ...history].slice(0, 15); // Limit to last 15 histories
    setHistory(updated);
    localStorage.setItem('color_palettes_history', JSON.stringify(updated));
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('color_palettes_history');
  };

  // Load a palette back from favorites/history directly onto the main PaletteGenerator
  // Since we want to pass this restored value down, we can trigger active tab change, 
  // and load it inside PaletteGenerator by saving the restored value temporarily in state or letting active palette change
  const handleRestorePaletteOnCanvas = (colorsList: string[]) => {
    // Store restored colors temporarily in sessionStorage, so PaletteGenerator can fetch it on mounting
    sessionStorage.setItem('temp_restore_colors', JSON.stringify(colorsList));
    setActiveTab('palette');
    // Dispatch custom event so if the generator is already mounted, it refreshes instantly!
    window.dispatchEvent(new CustomEvent('restore_canvas_colors', { detail: colorsList }));
  };

  // Load restored gradient properties
  const handleRestoreGradientOnCanvas = (colorsTemp: string[], typeVal: 'linear' | 'radial' | 'conic', angleVal: number) => {
    sessionStorage.setItem('temp_restore_gradient', JSON.stringify({ colors: colorsTemp, type: typeVal, angle: angleVal }));
    setActiveTab('gradient');
    window.dispatchEvent(new CustomEvent('restore_canvas_gradient', { detail: { colors: colorsTemp, type: typeVal, angle: angleVal } }));
  };

  // Listen to canvas restore helper in App context to allow interactive changes
  useEffect(() => {
    const handlePaletteRestore = (e: Event) => {
      const colorsToLoad = (e as CustomEvent).detail as string[];
      // Handled inside PaletteGenerator state updates
    };
    window.addEventListener('restore_canvas_colors', handlePaletteRestore);
    return () => {
      window.removeEventListener('restore_canvas_colors', handlePaletteRestore);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Navbar segment */}
      <header className="app-navbar" id="main-navigation-header">
        <div className="max-width-wrapper nav-layout">
          <div className="brand-col-group">
            <div className="brand-icon-wrap">
              <Command size={22} />
            </div>
            <div className="brand-title-group">
              <h1>Rang Palitrasi</h1>
              <p>Ijodiy Ranglar Generator</p>
            </div>
          </div>

          <div className="navbar-right">
            <button
              onClick={toggleTheme}
              className="theme-switch-btn"
              title={isDarkMode ? "Yorqin rejimga o'tish" : "Tungi rejimga o'tish"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Primary tab-strip */}
      <nav className="sub-navigation-menu" id="navigation-subtabs">
        <div className="max-width-wrapper">
          <div className="tabs-flex">
            <button
              onClick={() => setActiveTab('palette')}
              className={`tab-link-item ${activeTab === 'palette' ? 'active' : ''}`}
            >
              <Palette size={18} />
              <span>Palitra Generatori</span>
              {activeTab === 'palette' && (
                <motion.div layoutId="active-tab-underline" className="active-bar-indicator" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('gradient')}
              className={`tab-link-item ${activeTab === 'gradient' ? 'active' : ''}`}
            >
              <Sparkles size={18} />
              <span>Gradient Generatori</span>
              {activeTab === 'gradient' && (
                <motion.div layoutId="active-tab-underline" className="active-bar-indicator" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`tab-link-item ${activeTab === 'favorites' ? 'active' : ''}`}
            >
              <Bookmark size={18} />
              <span>Saralanganlar</span>
              {(favorites.length > 0 || favoriteGradients.length > 0) && (
                <span className="badge-favorites-count">
                  {favorites.length + favoriteGradients.length}
                </span>
              )}
              {activeTab === 'favorites' && (
                <motion.div layoutId="active-tab-underline" className="active-bar-indicator" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`tab-link-item ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History size={18} />
              <span>Tarix</span>
              {activeTab === 'history' && (
                <motion.div layoutId="active-tab-underline" className="active-bar-indicator" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('contrast')}
              className={`tab-link-item ${activeTab === 'contrast' ? 'active' : ''}`}
            >
              <Sliders size={18} />
              <span>Kontrast & Matn</span>
              {activeTab === 'contrast' && (
                <motion.div layoutId="active-tab-underline" className="active-bar-indicator" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main workplace flow with animated presence transitions */}
      <main className="app-content-body">
        <div className="max-width-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {activeTab === 'palette' && (
                <PaletteGenerator
                  onSaveFavorite={handleSaveFavorite}
                  favorites={favorites}
                  onAddHistory={handleAddHistory}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeTab === 'gradient' && (
                <GradientGenerator
                  onSaveFavoriteGradient={handleSaveFavoriteGradient}
                  favoriteGradients={favoriteGradients}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesList
                  favorites={favorites}
                  favoriteGradients={favoriteGradients}
                  onDeleteFavorite={handleDeleteFavorite}
                  onDeleteFavoriteGradient={handleDeleteFavoriteGradient}
                  onRestorePalette={handleRestorePaletteOnCanvas}
                  onRestoreGradient={handleRestoreGradientOnCanvas}
                />
              )}

              {activeTab === 'history' && (
                <HistoryList
                  history={history}
                  onClearHistory={handleClearHistory}
                  onRestorePalette={handleRestorePaletteOnCanvas}
                  onSaveFavorite={handleSaveFavorite}
                />
              )}

              {activeTab === 'contrast' && (
                <ColorConverter />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Stamp / Logo Footer */}
      <footer className="design-footer-stamp">
        <div className="max-width-wrapper footer-stamp-flex">
          <div className="footer-logo-row">
            <Command size={16} />
            <span>Rang Palitrasi Generatori</span>
            <Sparkles size={14} className="sparkle-accent" />
          </div>
          <p className="footer-copyright">
            &copy; 2026 Barcha huquqlar himoyalangan. Kreativ interfeyslar uchun maxsus.
          </p>
          <p className="footer-quote">
            "Rang - bu tabiatning so\'zlashuv ohangi, har safar uning go\'zalligidan bahra oling."
          </p>
        </div>
      </footer>
    </div>
  );
}
