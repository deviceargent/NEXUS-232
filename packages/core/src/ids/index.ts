/**
 * NEXUS-232 Core ID and Alias Generation
 * 
 * Rules:
 * - Stable, unique internal IDs (UUID format)
 * - Human-readable scientific aliases (e.g. H-01, E-01, D-01) for UI / notation
 * - Aliases are NEVER used as primary keys
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type AliasPrefix = 'H' | 'E' | 'D' | 'Q' | 'B' | 'R' | 'EQ' | 'EXP' | 'SIM' | 'P' | 'DOC' | 'FRAG';

export class ScientificAliasRegistry {
  private counters = new Map<string, number>();

  constructor(initialCounters?: Record<string, number>) {
    if (initialCounters) {
      for (const [key, val] of Object.entries(initialCounters)) {
        this.counters.set(key, val);
      }
    }
  }

  nextAlias(prefix: AliasPrefix): string {
    const current = this.counters.get(prefix) ?? 0;
    const next = current + 1;
    this.counters.set(prefix, next);
    const padded = next.toString().padStart(2, '0');
    return `${prefix}-${padded}`;
  }

  getCounters(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, val] of this.counters.entries()) {
      result[key] = val;
    }
    return result;
  }
}
