import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '~/lib/theme/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-toggle-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentOption = themeOptions.find((opt) => opt.value === theme) || themeOptions[2];
  const Icon = currentOption.icon;

  return (
    <div className="theme-toggle-container relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border transition-colors"
        aria-label="Toggle theme"
        title={`Current theme: ${currentOption.label}`}
      >
        <Icon size={18} className="text-text-secondary" />
        <span className="text-sm text-text-secondary hidden sm:inline">
          {currentOption.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  isSelected
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'text-text-primary hover:bg-surface-hover'
                }`}
              >
                <OptionIcon size={18} />
                <span className="text-sm font-medium">{option.label}</span>
                {isSelected && (
                  <span className="ml-auto text-brand-500">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
