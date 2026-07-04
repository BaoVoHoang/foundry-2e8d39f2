'use client';

import { useEffect, useRef, useState } from 'react';

interface CellProps {
  cellId: string;
  rawValue: string;
  displayValue: string;
  isSelected: boolean;
  onClick: () => void;
  onCommit: (value: string) => void;
}

export default function Cell({
  cellId,
  rawValue,
  displayValue,
  isSelected,
  onClick,
  onCommit,
}: CellProps) {
  const [editValue, setEditValue] = useState(rawValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(rawValue);
    }
  }, [rawValue, isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
    setEditValue(rawValue);
  };

  const commit = () => {
    setIsEditing(false);
    onCommit(editValue);
  };

  const handleBlur = () => {
    commit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditValue(rawValue);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      data-cell-id={cellId}
      className={`h-8 w-full border border-gray-300 px-1 text-sm text-center focus:outline-none ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 z-10' : 'bg-white'
      }`}
      value={isEditing ? editValue : displayValue}
      onChange={(e) => setEditValue(e.target.value)}
      onFocus={handleFocus}
      onClick={onClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
