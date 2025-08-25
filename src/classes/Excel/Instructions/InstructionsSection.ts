/* eslint-disable class-methods-use-this */
import type ExcelJS from "exceljs";

import { SectionBase, SectionCtxBase, type ColumnDef } from "../SectionBase";

export type InstructionsKeys = "margin" | "left" | "right";

// eslint-disable-next-line @typescript-eslint/ban-types
export type InstructionsDeps = {};

const toARGB = (hex: string) => {
  const clean = hex.replace(/^#/, "").toUpperCase();
  return (clean.length === 8 ? clean : `FF${clean}`) as string;
};

const LAYOUT = {
  sheetName: "Instructions",
  rows: {
    title: 2,
    spacing1: 3,
    intro: 4,
    getStarted: 6,
    dependentCells: 12,
    faq: 18,
  },
} as const;

const CONTENT = {
  title: "Instructions",
  sections: {
    intro: {
      title: "Intro",
      description:
        "The following set of high-level questions are intended to provide insight to the CRDC, related to data storage, access, secondary sharing needs and other requirements of data submitters.",
    },
    getStarted: {
      title: "Get Started",
      description:
        "Consult the table below for guidance on the required entry format for each field type. It explains where and how to provide values for single entries, multiple entries, and multiple records.",
    },
    dependentCells: {
      title: "Dependent Cells",
    },
    faq: {
      title: "Frequently Asked Questions (FAQ)",
    },
  },
} as const;

export const COLUMNS: ColumnDef<InstructionsKeys>[] = [
  {
    key: "margin",
    header: "",
    protection: { locked: true },
  },
  {
    key: "left",
    header: "",
    protection: { locked: true },
  },
  {
    key: "right",
    header: "",
    protection: { locked: true },
  },
];

export class InstructionsSection extends SectionBase<InstructionsKeys, InstructionsDeps> {
  static SHEET_NAME = LAYOUT.sheetName;

  private ACCENT = toARGB("#2F5597");

  private WHITE = toARGB("#FFFFFF");

  constructor(deps: InstructionsDeps = {}) {
    super({
      id: "Instructions",
      sheetName: InstructionsSection.SHEET_NAME,
      columns: COLUMNS,
      headerColor: "#FFFFFF",
      deps,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected create(ctx: SectionCtxBase): ExcelJS.Worksheet {
    const existing = ctx.workbook.worksheets.find(
      (ws) => ws.name === InstructionsSection.SHEET_NAME
    );
    if (existing) {
      ctx.workbook.removeWorksheet(existing.id);
    }

    const ws = ctx.workbook.addWorksheet(InstructionsSection.SHEET_NAME, {
      views: [{ showGridLines: false }], // TODO: Only remove on cells with content
      pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0, orientation: "portrait" },
    });

    ws.columns = [...COLUMNS];

    const r1 = ws.getRow(1);
    r1.hidden = true;
    r1.height = 4;

    const lastColumn = ws.getColumn("M");
    lastColumn.width = COLUMNS[0].width;

    return ws;
  }

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row[] {
    this.createTitle(_ctx, ws);
    this.createSpacing(_ctx, ws, LAYOUT.rows.spacing1, 40);
    this.createIntroSection(_ctx, ws);
    this.createGetStartedSection(_ctx, ws);
    this.createDependentCellsSection(_ctx, ws);
    this.createFAQSection(_ctx, ws);

    return [ws.getRow(LAYOUT.rows.title)];
  }

  private createTitle = (_ctx: SectionCtxBase, ws: ExcelJS.Worksheet) => {
    ws.mergeCells(`B${LAYOUT.rows.title}:M${LAYOUT.rows.title}`);
    const marginCell = ws.getCell(`A${LAYOUT.rows.title}`);
    const title = ws.getCell(`B${LAYOUT.rows.title}`);
    title.value = CONTENT.title;
    title.font = { bold: true, size: 24, color: { argb: "FFFFFFFF" } };
    title.alignment = { horizontal: "left", vertical: "bottom" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
    marginCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
    ws.getRow(LAYOUT.rows.title).height = 60;
  };

  private createSectionHeader = (
    _ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    row: number,
    text: string
  ) => {
    ws.mergeCells(`B${row}:L${row}`);
    const headerCell = ws.getCell(`B${row}`);
    headerCell.value = text;
    headerCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    headerCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "627EB6" } };
    ws.getRow(row).height = 40;
  };

  private createIntroSection = (_ctx: SectionCtxBase, ws: ExcelJS.Worksheet) => {
    this.createSectionHeader(_ctx, ws, LAYOUT.rows.intro, CONTENT.sections.intro.title);

    const row = LAYOUT.rows.intro + 1;
    ws.mergeCells(`B${row}:L${row}`);
    const introCell = ws.getCell(`B${row}`);
    introCell.value = CONTENT.sections.intro.description;
    introCell.font = { size: 12, color: { argb: "000000" } };
    introCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    ws.getRow(row).height = 60;
  };

  private createGetStartedSection = (_ctx: SectionCtxBase, ws: ExcelJS.Worksheet) => {
    this.createSectionHeader(_ctx, ws, LAYOUT.rows.getStarted, CONTENT.sections.getStarted.title);

    const row = LAYOUT.rows.getStarted + 1;
    ws.mergeCells(`B${row}:L${row}`);
    const introCell = ws.getCell(`B${row}`);
    introCell.value = CONTENT.sections.getStarted.description;
    introCell.font = { size: 12, color: { argb: "000000" } };
    introCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    ws.getRow(row).height = 60;

    this.createGetStartedTable(_ctx, ws, row + 1);
  };

  private createDependentCellsSection = (_ctx: SectionCtxBase, ws: ExcelJS.Worksheet) => {
    this.createSectionHeader(
      _ctx,
      ws,
      LAYOUT.rows.dependentCells,
      CONTENT.sections.dependentCells.title
    );

    const row = LAYOUT.rows.dependentCells + 2;
    ws.mergeCells(`D${row}:L${row}`);
    const blockedCell = ws.getCell(`C${row}`);
    const textCell = ws.getCell(`L${row}`);
    textCell.value = "- Indicates a derived or dependent field. You do not need to fill it out.";
    textCell.font = { size: 12, color: { argb: "000000" } };
    textCell.alignment = { horizontal: "left", vertical: "top", wrapText: true, indent: 1 };
    blockedCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };

    ws.mergeCells(`D${row + 1}:L${row + 1}`);
    const textCell2 = ws.getCell(`D${row + 1}`);
    textCell2.value = "If you type in a blocked cell, your input will be ignored.";
    textCell2.font = { size: 12, color: { argb: "000000" } };
    textCell2.alignment = { horizontal: "left", vertical: "top", wrapText: true, indent: 2 };

    ws.mergeCells(`D${row + 2}:L${row + 2}`);
    const textCell3 = ws.getCell(`D${row + 2}`);
    textCell3.value = "To unblock a blocked cell, update the field(s) it depends on.";
    textCell3.font = { size: 12, color: { argb: "000000" } };
    textCell3.alignment = { horizontal: "left", vertical: "top", wrapText: true, indent: 2 };
  };

  private createFAQSection = (_ctx: SectionCtxBase, ws: ExcelJS.Worksheet) => {
    this.createSectionHeader(_ctx, ws, LAYOUT.rows.faq, CONTENT.sections.faq.title);

    const row = LAYOUT.rows.faq + 2;
    this.createQuestion(
      ws,
      "Q: What gets ignored?",
      "- Stray values that don't match the column's entry type.\n- For Single Entry or Multiple Entry columns, anything typed outside of the second row.\n- Values within blocked cells.",
      row
    );

    this.createQuestion(
      ws,
      "Q: How do I unblock a cell?",
      "To unblock a cell, you need to update the field(s) it depends on. This will refresh the cell's status and make it editable.",
      row + 3
    );

    this.createQuestion(
      ws,
      "Q: What is the Date format?",
      "Dates should be entered in the format MM/DD/YYYY.",
      row + 6
    );
  };

  private createQuestion = (
    ws: ExcelJS.Worksheet,
    question: string,
    answer: string,
    startRow: number
  ) => {
    ws.mergeCells(`B${startRow}:L${startRow}`);
    ws.mergeCells(`B${startRow + 1}:L${startRow + 1}`);
    const questionCell = ws.getCell(`B${startRow}`);
    const answerCell = ws.getCell(`B${startRow + 1}`);
    questionCell.value = question;
    questionCell.font = { size: 14, color: { argb: "000000" }, bold: true };
    questionCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };

    answerCell.value = answer;
    answerCell.font = { size: 12, color: { argb: "000000" } };
    answerCell.alignment = { horizontal: "left", vertical: "top", wrapText: true, indent: 2 };
    ws.getRow(startRow + 1).height = 60;
  };

  private createGetStartedTable = async (
    _ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    startRow: number
  ) => {
    const rows = [
      ["Single Entry", "Enter exactly one value in a single row."],
      [
        "Multiple Entries",
        'Enter multiple values in a single row, separated by a | delimiter.\n(e.g. "value1 | value2 | value3")',
      ],
      [
        "Multiple Records",
        "Enter multiple records by using a new row for each record. This does not affect adjacent columns; Single Entry fields will remain as a single row.",
      ],
    ];
    const cols = 2;

    rows.forEach((row, rowIndex) => {
      ws.mergeCells(`C${startRow + rowIndex}:D${startRow + rowIndex}`);
      ws.mergeCells(`E${startRow + rowIndex}:L${startRow + rowIndex}`);
      ws.getRow(startRow + rowIndex).height = 40;

      Array.from({ length: cols }).forEach((_, colIndex) => {
        const letter = colIndex === 0 ? "C" : "E";
        const cell = ws.getCell(`${letter}${startRow + rowIndex}`);
        cell.value = row[colIndex];
        cell.font = { size: 12, color: { argb: "000000" } };
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };

        const isLastRow = rowIndex === rows.length - 1;
        const isLastCol = colIndex === cols - 1;

        cell.border = {
          ...(isLastRow ? {} : { bottom: { style: "thin", color: { argb: "FFDDDDDD" } } }),
          ...(isLastCol ? {} : { right: { style: "thin", color: { argb: "FFDDDDDD" } } }),
        };
      });
    });
  };

  private createSpacing = (
    _ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    row: number,
    height: number
  ) => {
    const targetRow = ws.getRow(row);
    targetRow.height = height;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async applyValidation(_ctx: SectionCtxBase, _ws: ExcelJS.Worksheet): Promise<void> {}
}

export { COLUMNS as InstructionsColumns };
