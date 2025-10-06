import { useState, useEffect } from 'react';
import { calculatorThemes, type CalculatorTheme } from '@/components/CalculatorThemeSelector';

interface UseCalculatorThemeReturn {
  currentTheme: CalculatorTheme;
  setTheme: (themeId: string) => void;
  applyTheme: (theme: CalculatorTheme) => void;
  resetTheme: () => void;
}

export function useCalculatorTheme(initialTheme: string = 'classic-elegance'): UseCalculatorThemeReturn {
  const [currentThemeId, setCurrentThemeId] = useState<string>(initialTheme);
  
  const currentTheme = calculatorThemes.find(theme => theme.id === currentThemeId) || calculatorThemes[0];

  const applyTheme = (theme: CalculatorTheme) => {
    // Create a temporary element to apply theme styles
    const calculatorElement = document.querySelector('[data-calculator-theme]');
    if (!calculatorElement) return;

    // Apply CSS custom properties directly to the calculator container
    const element = calculatorElement as HTMLElement;
    element.style.setProperty('--calc-primary', theme.colors.primary);
    element.style.setProperty('--calc-secondary', theme.colors.secondary);
    element.style.setProperty('--calc-accent', theme.colors.accent);
    element.style.setProperty('--calc-background', theme.colors.background);
    element.style.setProperty('--calc-card', theme.colors.card);
    element.style.setProperty('--calc-border', theme.colors.border);
    element.style.setProperty('--calc-gradient', theme.colors.gradient);
    
    // Set theme ID for CSS targeting
    element.setAttribute('data-calculator-theme', theme.id);
  };

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    const theme = calculatorThemes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
      
      // Save to localStorage for persistence
      localStorage.setItem('calculator-theme', themeId);
    }
  };

  const resetTheme = () => {
    setCurrentThemeId('classic-elegance');
    localStorage.removeItem('calculator-theme');
    applyTheme(calculatorThemes[0]);
  };

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme && calculatorThemes.find(t => t.id === savedTheme)) {
      setCurrentThemeId(savedTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return {
    currentTheme,
    setTheme,
    applyTheme,
    resetTheme
  };
}