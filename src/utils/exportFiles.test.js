import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { exportToPDF } from './exportFiles.js';

vi.mock('jspdf-autotable', () => ({ autoTable: vi.fn() }));
vi.mock('jspdf', () => {
  const doc = {
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    save: vi.fn()
  };
  return { jsPDF: vi.fn(() => doc) };
});

describe('exportToPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads jsPDF lazily and builds the report from the supplied table arguments', async () => {
    await exportToPDF(
      'AITEST01 — ESG Hesabatı',
      ['Ay', 'CO₂'],
      [['Yan', 45]],
      'AITEST01'
    );

    expect(jsPDF).toHaveBeenCalledWith({ orientation: 'landscape' });
    const doc = vi.mocked(jsPDF).mock.results[0].value;
    expect(doc.text).toHaveBeenCalledWith('AITEST01 — ESG Hesabatı', 14, 20);
    expect(autoTable).toHaveBeenCalledWith(doc, expect.objectContaining({
      head: [['Ay', 'CO₂']],
      body: [['Yan', 45]]
    }));
    expect(doc.save).toHaveBeenCalledWith(expect.stringContaining('AITEST01'));
  });
});
