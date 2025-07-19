/**
 * ColorPicker Component
 * 
 * Simple color picker for selecting colors
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const presetColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export const ColorPicker = ({ value, onChange, className }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className={cn('relative', className)} ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  'w-8 h-8 rounded border-2 hover:scale-110 transition-transform',
                  value === color ? 'border-blue-500' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="border-t pt-3">
            <label className="text-xs text-gray-600 font-medium">Custom Color</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-full h-8 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const color = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                    handleCustomColorChange(e);
                  } else {
                    setCustomColor(color);
                  }
                }}
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};