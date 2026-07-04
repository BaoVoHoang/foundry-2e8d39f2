'use client';

import { useState } from 'react';
import Grid from '@/components/Grid';
import FormulaBar from '@/components/FormulaBar';
import { GridState } from '@/types/grid';

export default function Home() {
  const [gridRaw, setGridRaw] = useState<GridState>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-2xl font-bold text-blue-600">MiniSheet</h1>
      <div className="w-full max-w-2xl">
        <FormulaBar
          selectedCellId={selectedCell}
          rawValue={selectedCell ? gridRaw[selectedCell] ?? '' : ''}
        />
        <Grid
          gridRaw={gridRaw}
          setGridRaw={setGridRaw}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
        />
      </div>
    </main>
  );
}
