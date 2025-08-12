import type ExcelJS from "exceljs";

import { IF, STR_EQ, AND, REQUIRED, TEXT_MAX, LIST_FORMULA } from "@/utils";

import { YesNoList } from "../D/SectionD";
import { SectionBase, SectionCtxBase } from "../SectionBase";

import { CKeys, COLUMNS, DEFAULT_CHARACTER_LIMITS } from "./Columns";

type SectionCDeps = {
  data: QuestionnaireData | null;
  cancerTypes: ExcelJS.Worksheet;
  species: ExcelJS.Worksheet;
};

export class SectionC extends SectionBase<CKeys, SectionCDeps> {
  static SHEET_NAME = "Data Access and Disease";

  constructor(deps: SectionCDeps) {
    super({
      id: "C",
      sheetName: SectionC.SHEET_NAME,
      columns: COLUMNS,
      headerColor: "D9EAD3",
      characterLimits: DEFAULT_CHARACTER_LIMITS,
      deps,
    });
  }

  protected write(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row[] {
    const { data } = this.deps;
    if (!data) {
      return null;
    }

    const startRow = 2;
    const rows = new Set<ExcelJS.Row>();

    const row = ws.getRow(startRow);
    this.setRowValues(ws, startRow, {
      "accessTypes.openAccess": data?.accessTypes?.includes("Open Access") ? "Yes" : "No",
      "accessTypes.controlledAccess": data?.accessTypes?.includes("Controlled Access")
        ? "Yes"
        : "No",
      "study.isDbGapRegistered": data?.study?.isDbGapRegistered ? "Yes" : "No",
      "study.dbGaPPPHSNumber": data?.study?.dbGaPPPHSNumber || "",
      "study.GPAName": data?.study?.GPAName || "",
      otherCancerTypes: data?.otherCancerTypes || "",
      preCancerTypes: data?.preCancerTypes || "",
      otherSpeciesOfSubjects: data?.otherSpeciesOfSubjects || "",
      numberOfParticipants: data?.numberOfParticipants || 0,
    });
    rows.add(row);

    data?.cancerTypes?.forEach((c, idx) => {
      this.setRowValues(ws, idx + startRow, {
        cancerTypes: c || "",
      });
      rows.add(ws.getRow(idx + startRow));
    });

    data?.species?.forEach((s, idx) => {
      this.setRowValues(ws, idx + startRow, {
        species: s || "",
      });
      rows.add(ws.getRow(idx + startRow));
    });

    return [...rows];
  }

  protected async applyValidation(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const [A, B, C, D, , , G, H, I, , K] = this.getRowCells(ws);

    A.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    B.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    C.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    D.dataValidation = {
      type: "custom",
      allowBlank: true,
      showErrorMessage: true,
      error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["study.dbGaPPPHSNumber"]} characters.`,
      formulae: [
        IF(
          STR_EQ(C, "Yes"),
          "TRUE",
          AND(REQUIRED(D), TEXT_MAX(D, DEFAULT_CHARACTER_LIMITS["study.dbGaPPPHSNumber"]))
        ),
      ],
    };
    this.forEachCellInColumn(ws, "cancerTypes", (cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        showErrorMessage: true,
        formulae: [
          LIST_FORMULA(this.deps.cancerTypes.name, "A", 1, this.deps.cancerTypes.rowCount || 1),
        ],
      };
    });
    this.applyTextLengthValidation(G, DEFAULT_CHARACTER_LIMITS.otherCancerTypes);
    this.applyTextLengthValidation(H, DEFAULT_CHARACTER_LIMITS.preCancerTypes);
    this.applyTextLengthValidation(I, DEFAULT_CHARACTER_LIMITS.otherSpeciesOfSubjects);
    this.forEachCellInColumn(ws, "species", (cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        showErrorMessage: true,
        formulae: [LIST_FORMULA(this.deps.species.name, "A", 1, this.deps.species.rowCount || 1)],
      };
    });
    K.dataValidation = {
      type: "decimal",
      allowBlank: true,
      showErrorMessage: true,
      error: `Must be between 1 and 2,000,000,000.`,
      formulae: [1, 2000000000],
    };
  }
}
