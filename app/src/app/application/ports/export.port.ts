/** Hands a generated file to the user. CSV/JSON serialization is domain logic (ADR 007). */
export interface ExportPort {
  exportFile(
    fileName: string,
    content: string,
    mimeType: 'text/csv' | 'application/json',
  ): Promise<void>;
}
