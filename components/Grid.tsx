'use client';

import { useEffect, useState } from 'react';
import Cell from './Cell';
import { COLUMNS, ROWS, getCellId, buildDependencyOrder } from '@/lib/gridUtils';
import { evaluateCell } from '@/lib/formulaParser';
import { loadGrid, saveGrid } from '@/lib/storageManager';
import { GridState } from '@/types/grid';

function recomputeDisplay(gridRaw: GridState): GridState {
  const display: GridState = {};

  Object.keys(gridRaw).forEach((cellId) => {
    const raw = gridRaw[cellId];
    if (typeof raw === 'string' && !raw.startsWith('=')) {
      display[cellId] = raw;
    }
  });

  const formulaCells = buildDependencyOrder(gridRaw);
  formulaCells.forEach((cellId) => {
    display[cellId] = evaluateCell(gridRaw[cellId], gridRaw);
  });

  return display;
}

export default function Grid() {
  const [gridRaw, setGridRaw] = useState<GridState>({});
  const [gridDisplay, setGridDisplay] = useState<GridState>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadGrid();
    setGridRaw(data.grid);
    setGridDisplay(recomputeDisplay(data.grid));
    setLoaded(true);
  }, []);

  const handleCommit = (cellId: string, value: string) => {
    setGridRaw((prev) => {
      const nextRaw: GridState = { ...prev };
      if (value === '') {
        delete nextRaw[cellId];
      } else {
        nextRaw[cellId] = value;
      }

      const nextDisplay = recomputeDisplay(nextRaw);
      setGridDisplay(nextDisplay);
      saveGrid({ grid: nextRaw, lastModified: Date.now() });
      return nextRaw;
    });
  };

  if (!loaded) {
    return null;
  }

  return (
    <div className="inline-block">
      <div className="grid grid-cols-11">
        <div className="h-8 w-16 border border-gray-300 bg-gray-100" />
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="h-8 w-16 flex items-center justify-center border border-gray-300 bg-gray-100 font-semibold text-sm"
          >
            {col}
          </div>
        ))}
      </div>
      {ROWS.map((row) => (
        <div key={row} className="grid grid-cols-11">
          <div className="h-8 w-16 flex items-center justify-center border border-gray-300 bg-gray-100 font-semibold text-sm">
            {row}
          </div>
          {COLUMNS.map((col) => {
            const cellId = getCellId(col, row);
            return (
              <div key={cellId} className="w-16">
                <Cell
                  cellId={cellId}
                  rawValue={gridRaw[cellId] ?? ''}
                  displayValue={gridDisplay[cellId] ?? ''}
                  isSelected={selectedCell === cellId}
                  onClick={() => setSelectedCell(cellId)}
                  onCommit={(value) => handleCommit(cellId, value)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
