import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    type="button"
    className="theme-toggle"
    onClick={onToggle}
    aria-pressed={theme === 'dark'}
    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  >
    {theme === 'dark' ? <Sun size={16} strokeWidth={2.2} aria-hidden="true" /> : <Moon size={16} strokeWidth={2.2} aria-hidden="true" />}
    <span className="theme-toggle__label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
  </button>
);

export default ThemeToggle;