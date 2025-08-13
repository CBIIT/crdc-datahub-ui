import type ExcelJS from "exceljs";

import { IF, STR_EQ, AND, REQUIRED, TEXT_MAX, LIST_FORMULA, Logger } from "@/utils";

import { YesNoList } from "../D/SectionD";
import { SectionBase, SectionCtxBase } from "../SectionBase";

import { CKeys, COLUMNS, DEFAULT_CHARACTER_LIMITS } from "./Columns";

type SectionCDeps = {
  data: QuestionnaireData | null;
  cancerTypesSheet: ExcelJS.Worksheet;
  speciesSheet: ExcelJS.Worksheet;
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

    ws.addConditionalFormatting({
      ref: "D2",
      rules: [
        {
          type: "expression",
          formulae: ['IF($C$2="No",TRUE,FALSE)'],
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "000000" },
            },
          },
          priority: 1,
        },
      ],
    });

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
          LIST_FORMULA(
            this.deps.cancerTypesSheet.name,
            "A",
            1,
            this.deps.cancerTypesSheet.rowCount || 1
          ),
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
        formulae: [
          LIST_FORMULA(this.deps.speciesSheet.name, "A", 1, this.deps.speciesSheet.rowCount || 1),
        ],
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

  public static mapValues(
    data: Map<CKeys, Array<unknown>>,
    deps: Partial<SectionCDeps>
  ): RecursivePartial<QuestionnaireData> {
    const { cancerTypesSheet, speciesSheet } = deps;
    const validCancerList = new Set<string>();
    if (!cancerTypesSheet || !cancerTypesSheet?.rowCount) {
      Logger.error(`SectionC.ts: The cancer types sheet is missing or invalid.`);
    } else {
      cancerTypesSheet.eachRow((row) => {
        validCancerList.add(row.getCell("A").value.toString().trim());
      });
    }

    const validSpeciesList = new Set<string>();
    if (!speciesSheet || !speciesSheet?.rowCount) {
      Logger.error(`SectionC.ts: The species sheet is missing or invalid.`);
    } else {
      speciesSheet.eachRow((row) => {
        validSpeciesList.add(row.getCell("A").value.toString().trim());
      });
    }

    const accessTypes = [];
    if (data.get("accessTypes.openAccess")?.[0] === "Yes") {
      accessTypes.push("Open Access");
    }
    if (data.get("accessTypes.controlledAccess")?.[0] === "Yes") {
      accessTypes.push("Controlled Access");
    }

    const isDbGapRegistered = data.get("study.isDbGapRegistered")?.[0] === "Yes";
    const cancerTypes = new Set<string>();
    data.get("cancerTypes")?.forEach((c: string) => {
      if (!validCancerList.has(c?.trim())) {
        return;
      }

      cancerTypes.add(c?.trim());
    });

    const species = new Set<string>();
    data.get("species")?.forEach((s: string) => {
      if (!validSpeciesList.has(s?.trim())) {
        return;
      }

      species.add(s?.trim());
    });

    const numberOfParticipants = Number(data.get("numberOfParticipants")?.[0]) || 0;

    return {
      accessTypes,
      study: {
        isDbGapRegistered,
        dbGaPPPHSNumber: isDbGapRegistered
          ? (data.get("study.dbGaPPPHSNumber")?.[0] as string)?.trim()
          : "",
        GPAName: (data.get("study.GPAName")?.[0] as string)?.trim() || "",
      },
      cancerTypes: Array.from(cancerTypes),
      otherCancerTypesEnabled: !!(data.get("otherCancerTypes")?.[0] as string)?.trim(),
      otherCancerTypes: (data.get("otherCancerTypes")?.[0] as string) || "",
      preCancerTypes: (data.get("preCancerTypes")?.[0] as string) || "",
      species: Array.from(species),
      otherSpeciesEnabled: !!(data.get("otherSpeciesOfSubjects")?.[0] as string)?.trim(),
      otherSpeciesOfSubjects: (data.get("otherSpeciesOfSubjects")?.[0] as string) || "",
      numberOfParticipants: numberOfParticipants > 0 ? numberOfParticipants : null,
    };
  }
}

export { COLUMNS as SectionCColumns };
