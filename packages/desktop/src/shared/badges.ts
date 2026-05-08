import type { DailyBadge } from './types.js';

const DEFAULT_BADGE: Omit<DailyBadge, 'date'> = {
  icon: '☕',
  label: 'Café & Código'
};

/** Devuelve la insignia fija de la app. */
export function badgeForDate(date: Date = new Date()): DailyBadge {
  const iso = date.toISOString().slice(0, 10);
  return { date: iso, icon: DEFAULT_BADGE.icon, label: DEFAULT_BADGE.label };
}
