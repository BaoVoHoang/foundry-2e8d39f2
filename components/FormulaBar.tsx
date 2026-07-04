interface FormulaBarProps {
  selectedCellId: string | null;
  rawValue: string;
}

export default function FormulaBar({ selectedCellId, rawValue }: FormulaBarProps) {
  return (
    <div className="w-full flex items-center gap-3 border border-gray-300 bg-gray-50 px-3 py-2 rounded-md shadow-sm mb-4">
      {selectedCellId && (
        <span className="w-16 shrink-0 text-center font-semibold text-sm text-gray-700 bg-gray-200 rounded px-2 py-1">
          {selectedCellId}
        </span>
      )}
      <input
        type="text"
        readOnly
        value={selectedCellId ? rawValue : ''}
        placeholder=""
        aria-label="Formula bar"
        className="flex-1 font-mono text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-0 cursor-default"
      />
    </div>
  );
}
