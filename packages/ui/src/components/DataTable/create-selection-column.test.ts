import { describe, expect, it } from 'vitest';

import { createSelectionColumn } from './create-selection-column';

describe('createSelectionColumn', () => {
  it('returns a non-sortable select column with stable id', () => {
    const column = createSelectionColumn<{ id: string }>({
      selectAll: 'Select all',
      selectRow: 'Select row',
    });

    expect(column.id).toBe('select');
    expect(column.enableSorting).toBe(false);
    expect(column.enableHiding).toBe(false);
    expect(typeof column.header).toBe('function');
    expect(typeof column.cell).toBe('function');
  });
});
