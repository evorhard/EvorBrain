/**
 * ColorPicker Component
 * 
 * Simple color picker for life area colors
 */

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
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
  '#6b7280', // gray
];

export const ColorPicker = ({ value, onChange, className }: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              'h-8 w-8 rounded-md border-2 transition-all',
              value === color
                ? 'border-gray-900 scale-110'
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(e.target.value);
          }}
          className="h-8 w-16 cursor-pointer rounded border border-gray-300"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
              setCustomColor(color);
              onChange(color);
            }
          }}
          placeholder="#000000"
          className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};