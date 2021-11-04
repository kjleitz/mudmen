// Inspired by the `Grid` class described here:
// https://medium.com/@zandaqo/structurae-data-structures-for-high-performance-javascript-9b7da4c73f8

import { c } from "@/utilities/math";

type TypedArray = Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export default class Grid<T extends TypedArray = TypedArray> {
  public readonly rowCount: number;
  public readonly colCount: number;
  public readonly paddedColCount: number;

  private cells: T;
  private colPower: number;

  constructor(rowCount: number, colCount: number, TypedArrayConstructor: { new (...args: any[]): T }) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    // Snapping the "real" column count to powers of 2 so we can do bitwise
    // shift operations... so, e.g., a `colCount` of 100 would make the _actual_
    // column count 128.
    this.colPower = c(Math.log2(colCount));
    this.paddedColCount = 1 << this.colPower;
    const cellCount = rowCount << this.colPower;

    this.cells = new TypedArrayConstructor(cellCount);
  }

  rowAtIndex(index: number): number {
    return index >> this.colPower;
  }

  colAtIndex(index: number): number {
    return index & (this.paddedColCount - 1);
  }

  indexAt(row: number, col: number): number {
    return (row << this.colPower) + col;
  }

  valueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return this.cells[index];
  }

  setValueAt(row: number, col: number, val: number): void {
    const index = this.indexAt(row, col);
    this.cells[index] = val;
  }

  delValueAt(row: number, col: number): void {
    this.setValueAt(row, col, 0);
  }

  clearValues(): void {
    this.cells.fill(0);
  }

  incValueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return ++this.cells[index];
  }

  decValueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return --this.cells[index];
  }

  each(mapper: (row: number, col: number, val: number) => void): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        mapper(row, col, this.valueAt(row, col));
      }
    }
  }

  fill(mapper: (row: number, col: number, val: number) => number): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        const index = this.indexAt(row, col);
        this.cells[index] = mapper(row, col, this.cells[index]);
      }
    }
  }
}
