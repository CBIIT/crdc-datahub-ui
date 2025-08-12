import type ExcelJS from "exceljs";

import { SectionBase, SectionCtxBase } from "../SectionBase";

import { CKeys, COLUMNS, DEFAULT_CHARACTER_LIMITS } from "./Columns";

type SectionCDeps = {
  data: QuestionnaireData | null;
  cancerTypes: string[];
  species: string[];
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

    ws.getRow(2).values = {
      "accessTypes.openAccess": data?.accessTypes?.includes("Open Access") ? "Yes" : "No",
      "accessTypes.controlledAccess": data?.accessTypes?.includes("Controlled Access")
        ? "Yes"
        : "No",
    };

    // TODO: Autofill the rest of the row

    return []; // TODO: Return all written rows
  }

  protected async applyValidation(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const [A2] = this.getRowCells(ws);

    // NOTE: This is just a random assignment to avoid unused deps.
    A2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 25 characters.",
      allowBlank: false,
      formulae: [25],
    };

    // TODO: Add the rest of the validations
    // Dropdown options for cancer types, species, etc
  }
}
