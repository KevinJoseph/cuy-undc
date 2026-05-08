import type { DailyBadge } from './types.js';

/**
 * Catálogo fijo de insignias. La insignia del día se elige de forma
 * determinista a partir de la fecha local — así el mismo día siempre
 * muestra la misma sin necesidad de persistirla.
 */
const catalog: readonly Omit<DailyBadge, 'date'>[] = [
  { icon: '🧠', label: 'Modo Algoritmo' },
  { icon: '☕', label: 'Café & Código' },
  { icon: '🐛', label: 'Cazador de Bugs' },
  { icon: '🚀', label: 'Deploy Day' },
  { icon: '📚', label: 'Lectura Técnica' },
  { icon: '🛠️', label: 'Refactor Master' },
  { icon: '🌙', label: 'Programador Nocturno' }
] as const;

/** Devuelve la insignia correspondiente a una fecha (por defecto, hoy). */
export function badgeForDate(date: Date = new Date()): DailyBadge {
  const iso = date.toISOString().slice(0, 10);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const pick = catalog[dayOfYear % catalog.length] ?? catalog[0]!;
  return { date: iso, icon: pick.icon, label: pick.label };
}
