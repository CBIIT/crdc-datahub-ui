import type ExcelJS from "exceljs";

import { DATE_NOT_BEFORE_TODAY } from "@/utils";

import { toYesNo } from "../../../utils/excelUtils";
import { CharacterLimitsMap, SectionBase, SectionCtxBase } from "../SectionBase";

import columns, { DKeys } from "./Columns";

/**
 * List of options for Yes/No validation.
 */
export const YesNoList = '"Yes,No"';

const DEFAULT_CHARACTER_LIMITS: CharacterLimitsMap<DKeys> = {
  otherDataTypes: 200,
};

type SectionDDeps = {
  data: QuestionnaireData | null;
  programSheet: ExcelJS.Worksheet;
};

export class SectionD extends SectionBase<DKeys, SectionDDeps> {
  constructor(deps: SectionDDeps) {
    super({
      id: "D",
      sheetName: "Data Types",
      columns,
      headerColor: "D9EAD3",
      characterLimits: DEFAULT_CHARACTER_LIMITS,
      deps,
    });
  }

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row[] {
    const startRow = 2;
    const rows = new Set<ExcelJS.Row>();

    const row = ws.getRow(startRow);
    this.setRowValues(ws, startRow, {
      targetedSubmissionDate: this.deps.data?.targetedSubmissionDate || "",
      targetedReleaseDate: this.deps.data?.targetedReleaseDate || "",
      "dataTypes.clinicalTrial": toYesNo(
        this.deps.data?.dataTypes?.includes("clinicalTrial") || false
      ),
      "dataTypes.genomics": toYesNo(this.deps.data?.dataTypes?.includes("genomics") || false),
      "dataTypes.imaging": toYesNo(this.deps.data?.dataTypes?.includes("imaging") || false),
      "dataTypes.proteomics": toYesNo(this.deps.data?.dataTypes?.includes("proteomics") || false),
      imagingDataDeIdentified: toYesNo(this.deps.data?.imagingDataDeIdentified || null),
      otherDataTypes: this.deps.data?.otherDataTypes || "",
      "clinicalData.dataTypes.demographicData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("demographicData") || false
      ),
      "clinicalData.dataTypes.relapseRecurrenceData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("relapseRecurrenceData") || false
      ),
      "clinicalData.dataTypes.diagnosisData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("diagnosisData") || false
      ),
      "clinicalData.dataTypes.outcomeData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("outcomeData") || false
      ),
      "clinicalData.dataTypes.treatmentData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("treatmentData") || false
      ),
      "clinicalData.dataTypes.biospecimenData": toYesNo(
        this.deps.data?.clinicalData?.dataTypes?.includes("biospecimenData") || false
      ),
      "clinicalData.otherDataTypes": this.deps.data?.clinicalData?.otherDataTypes || "",
      "clinicalData.futureDataTypes": toYesNo(
        this.deps.data?.clinicalData?.futureDataTypes || false
      ),
      dataDeIdentified: toYesNo(this.deps.data?.dataDeIdentified || null),
      cellLines: toYesNo(this.deps.data?.cellLines || false),
      modelSystems: toYesNo(this.deps.data?.modelSystems || false),
    });
    rows.add(row);

    const files = this.deps.data?.files || [];
    files.forEach((f, index) => {
      this.setRowValues(ws, index + startRow, {
        "files.type": f.type || "",
        "files.extension": f.extension || "",
        "files.count": f.count || null,
        "files.amount": f.amount || "",
      });
      rows.add(ws.getRow(index + startRow));
    });

    return [...rows];
  }

  protected async applyValidation(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const startRow = 2;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [A, B, C, D, E, F, G, H, I, J, K, L, M, N, _O, _P, _Q, _R, _S, _T, U, V, W] =
      this.getRowCells(ws, startRow);

    // Targeted Submission Date
    A.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: "Enter a valid date (MM/DD/YYYY)",
      formulae: [DATE_NOT_BEFORE_TODAY(B, { allowBlank: false })],
    };
    // Targeted Release Date
    B.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: "Enter a valid date (MM/DD/YYYY)",
      formulae: [DATE_NOT_BEFORE_TODAY(B, { allowBlank: false })],
    };

    // Data Types
    C.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    D.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    E.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    F.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };

    // Imaging Data De-identified
    G.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };

    // Other Data Type(s)
    H.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Required. Max 200 characters.",
      formulae: [this.CHARACTER_LIMITS.otherDataTypes],
    };

    // Clinical Data Types
    I.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    J.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    K.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    L.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    M.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    N.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };

    // Files
    // TODO: Implement
    //     this.forEachCellInColumn(ws, "files.type", (cell) => {
    //       cell.dataValidation = {
    //         type: "list",
    //         allowBlank: false,
    //         showErrorMessage: true,
    //         formulae: [`=${NAME_TYPES}`],
    //       };
    //     });
    //     this.forEachCellInColumn(ws, "files.extension", (cell) => {
    //       cell.dataValidation = {
    //
    //       };
    //     });

    // Data De-Identified
    U.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };

    // Cell Lines
    V.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
    // Model Systems
    W.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: true,
      error: "Please select 'Yes' or 'No' from the dropdown",
      formulae: [YesNoList],
    };
  }
}
