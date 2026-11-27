import type { ScanSession } from '../../domain/scan-session';

/** Local persistence of the current session (ADR 003). */
export interface SessionStoragePort {
  load(): Promise<ScanSession | undefined>;
  save(session: ScanSession): Promise<void>;
  clear(): Promise<void>;
}
