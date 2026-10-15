import { useCallback, useEffect, useState } from 'react';
import { applyGrid, readGrid, writeGrid, type Grid } from './grid';

/**
 * Estado de la retícula de construcción.
 *
 * No lleva provider ni contexto a propósito: solo `SettingsBar` lo lee y lo
 * escribe, así que un provider obligaría a atravesar el árbol para nada. El
 * estado vive en el `<html>` y por eso se aplica en el efecto, igual que el
 * tema, y no durante el render.
 */
export const useGrid = () => {
  const [grid, setGridState] = useState<Grid>(readGrid);

  useEffect(() => {
    applyGrid(grid);
  }, [grid]);

  const setGrid = useCallback((next: Grid) => {
    writeGrid(next);
    setGridState(next);
  }, []);

  const toggleGrid = useCallback(() => setGrid(grid === 'on' ? 'off' : 'on'), [grid, setGrid]);

  return { grid, setGrid, toggleGrid };
};