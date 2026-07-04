import { GridState } from '@/types/grid';

export const COLUMNS: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const ROWS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Builds a cell identifier from a column letter and row number.
 * e.g. getCellId('B', 3) => 'B3'
 */
export function getCellId(col: string, row: number): string {
  return `${col}${row}`;
}

/**
 * Returns the list of cell IDs in the grid whose raw value is a formula
 * (i.e. starts with '='), so that dependents can be recomputed in sequence.
 */
export function buildDependencyOrder(grid: GridState): string[] {
  return Object.keys(grid).filter((cellId) => {
    const value = grid[cellId];
    return typeof value === 'string' && value.startsWith('=');
  });
}
