import type Dexie from 'dexie'

/**
 * Migration plan.
 *
 * v1 — initial schema (see db.ts).
 *
 * Future migrations must be additive and backward compatible: add new fields
 * with sensible defaults in upgrade callbacks, never drop user data. Bump the
 * Dexie version and register the upgrade here.
 */
export function registerMigrations(db: Dexie): void {
  void db
}
