export type GridState = Record<string, string>;

export interface SheetData {
  grid: GridState;
  lastModified: number;
}
