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

interface GridProps {
  gridRaw: GridState;
  setGridRaw: (grid: GridState) => void;
  selectedCell: string | null;
  setSelectedCell: (cellId: string | null) => void;
}

export default function Grid({ gridRaw, setGridRaw, selectedCell, setSelectedCell }: GridProps) {
  const [gridDisplay, setGridDisplay] = useState<GridState>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadGrid();
    setGridRaw(data.grid);
    setGridDisplay(recomputeDisplay(data.grid));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommit = (cellId: string, value: string) => {
    const nextRaw: GridState = { ...gridRaw };
    if (value === '') {
      delete nextRaw[cellId];
    } else {
      nextRaw[cellId] = value;
    }

    const nextDisplay = recomputeDisplay(nextRaw);
    setGridDisplay(nextDisplay);
    saveGrid({ grid: nextRaw, lastModified: Date.now() });
    setGridRaw(nextRaw);
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
