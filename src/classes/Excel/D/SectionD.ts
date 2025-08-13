import type ExcelJS from "exceljs";
import { union, toString, toSafeInteger } from "lodash";

import DataTypes from "@/config/DataTypesConfig";
import { fileTypeExtensions } from "@/config/FileTypeConfig";
import { DATE_NOT_BEFORE_TODAY } from "@/utils";

import { LIST_FORMULA, toYesNo } from "../../../utils/excelUtils";
import { CharacterLimitsMap, SectionBase, SectionCtxBase } from "../SectionBase";

import { COLUMNS, DKeys } from "./Columns";

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
  fileTypesSheet: ExcelJS.Worksheet;
};

export class SectionD extends SectionBase<DKeys, SectionDDeps> {
  static SHEET_NAME = "Data Types";

  constructor(deps: SectionDDeps) {
    super({
      id: "D",
      sheetName: SectionD.SHEET_NAME,
      columns: COLUMNS,
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
    const { fileTypesSheet } = this.deps || {};
    this.forEachCellInColumn(ws, "files.type", (cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        showErrorMessage: false,
        formulae: [
          LIST_FORMULA(fileTypesSheet.name, "A", 1, Object.keys(fileTypeExtensions).length || 1),
        ],
      };
    });
    const allExtensions = union(...Object.values(fileTypeExtensions));
    this.forEachCellInColumn(ws, "files.extension", (cell) => {
      cell.dataValidation = {
        type: "list",
        allowBlank: false,
        showErrorMessage: false,
        formulae: [LIST_FORMULA(fileTypesSheet.name, "B", 1, allExtensions.length || 1)],
      };
    });
    this.forEachCellInColumn(ws, "files.count", (cell) => {
      cell.dataValidation = {
        type: "whole",
        operator: "greaterThan",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be greater than 0.",
        formulae: [0],
      };
    });

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

  public static mapValues(
    data: Map<DKeys, Array<unknown>>,
    _deps: Partial<SectionDDeps>
  ): RecursivePartial<QuestionnaireData> {
    const yesNoOptions = ["Yes", "No"];

    // Extract data types
    const dataTypes = [];
    if (data.get("dataTypes.clinicalTrial")?.[0] === "Yes") {
      dataTypes.push(DataTypes.clinicalTrial.name);
    }
    if (data.get("dataTypes.genomics")?.[0] === "Yes") {
      dataTypes.push(DataTypes.genomics.name);
    }
    if (data.get("dataTypes.imaging")?.[0] === "Yes") {
      dataTypes.push(DataTypes.imaging.name);
    }
    if (data.get("dataTypes.proteomics")?.[0] === "Yes") {
      dataTypes.push(DataTypes.proteomics.name);
    }

    // Extract imaging data de-identification
    const hasImagingDataType = dataTypes.includes(DataTypes.imaging.name);

    let imagingDataDeIdentified: boolean | null = hasImagingDataType ? false : null;
    const rawImagingDataDeIdentified = toString(data.get("imagingDataDeIdentified")?.[0]);
    if (hasImagingDataType && yesNoOptions.includes(rawImagingDataDeIdentified)) {
      imagingDataDeIdentified = rawImagingDataDeIdentified === "Yes";
    }

    // Extract clinical data types
    const hasClinicalDataType = dataTypes.includes(DataTypes.clinicalTrial.name);

    const clinicalDataTypes = [];
    if (hasClinicalDataType && data.get("clinicalData.dataTypes.demographicData")?.[0] === "Yes") {
      clinicalDataTypes.push(DataTypes.demographicData.name);
    }
    if (
      hasClinicalDataType &&
      data.get("clinicalData.dataTypes.relapseRecurrenceData")?.[0] === "Yes"
    ) {
      clinicalDataTypes.push(DataTypes.relapseRecurrenceData.name);
    }
    if (hasClinicalDataType && data.get("clinicalData.dataTypes.diagnosisData")?.[0] === "Yes") {
      clinicalDataTypes.push(DataTypes.diagnosisData.name);
    }
    if (hasClinicalDataType && data.get("clinicalData.dataTypes.outcomeData")?.[0] === "Yes") {
      clinicalDataTypes.push(DataTypes.outcomeData.name);
    }
    if (hasClinicalDataType && data.get("clinicalData.dataTypes.treatmentData")?.[0] === "Yes") {
      clinicalDataTypes.push(DataTypes.treatmentData.name);
    }
    if (hasClinicalDataType && data.get("clinicalData.dataTypes.biospecimenData")?.[0] === "Yes") {
      clinicalDataTypes.push(DataTypes.biospecimenData.name);
    }

    // Extract future data types
    let futureDataTypes = false;
    const rawFutureDataTypes = toString(data.get("clinicalData.futureDataTypes")?.[0]);
    if (hasClinicalDataType && yesNoOptions.includes(rawFutureDataTypes)) {
      futureDataTypes = rawFutureDataTypes === "Yes";
    }

    // Extract files
    const files: FileInfo[] = [];
    data.get("files.type")?.forEach((fileType) => {
      if (fileType === "Other") {
        files.push({
          type: fileType,
          count: toSafeInteger(data.get("files.count")?.[0]),
          amount: toString(data.get("files.count")?.[0]).trim(),
          extension: toString(data.get("files.count")?.[0]).trim(),
        });
      }
    });

    return {
      targetedSubmissionDate: toString(data.get("targetedSubmissionDate")?.[0]).trim(),
      targetedReleaseDate: toString(data.get("targetedReleaseDate")?.[0]).trim(),
      dataTypes,
      imagingDataDeIdentified,
      clinicalData: {
        dataTypes: clinicalDataTypes,
        otherDataTypes: toString(data.get("otherDataTypes")?.[0]).trim(),
        futureDataTypes,
      },
      otherDataTypes: hasClinicalDataType
        ? toString(data.get("otherDataTypes")?.[0] as string).trim()
        : "",
      files,
      dataDeIdentified: toString(data.get("dataDeIdentified")?.[0]) === "Yes",
      submitterComment: toString(data.get("submitterComment")?.[0]).trim(),
    };
  }
}

export { COLUMNS as SectionDColumns };
