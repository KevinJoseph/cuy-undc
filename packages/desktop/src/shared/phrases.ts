/**
 * Frases motivacionales / random para estudiantes de Sistemas UNDC.
 * Lista plana sin dependencias externas — fácil de extender.
 */
export const phrases: readonly string[] = [
  '¿Ya commiteaste hoy? 🐹',
  'Recuerda: en producción nunca es viernes.',
  'Un bug menos, un café más ☕',
  'Estudia ahora, debugea después.',
  'Sistemas UNDC: del aula al deploy 🚀',
  'Si compila, es magia. Si no, es aprendizaje.',
  '¿Probaste apagar y encender otra vez?',
  'Cada error es una línea menos hacia el éxito.',
  'TypeScript te ama, dale type seguro.',
  'No olvides hacer git pull antes de codear.',
  'Hoy es buen día para aprender algo nuevo.',
  'Pequeños pasos, grandes proyectos.',
  '¿Documentaste? El Cuy del futuro lo agradecerá.',
  'Algoritmos hoy, soluciones mañana.',
  'Mantente hidratado, futuro/a ingeniero/a 💧'
] as const;

/** Devuelve una frase aleatoria. */
export function randomPhrase(): string {
  const i = Math.floor(Math.random() * phrases.length);
  return phrases[i] ?? phrases[0]!;
}
