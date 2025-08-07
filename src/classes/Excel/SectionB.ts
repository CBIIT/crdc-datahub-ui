import type ExcelJS from "exceljs";

import { IF, STR_EQ, REQUIRED, TEXT_MAX, AND, LIST_FORMULA } from "@/utils";

import { CharacterLimitsMap, ColumnDef, SectionBase, SectionCtxBase } from "./SectionBase";

type SectionBDeps = {
  data: {
    program?: QuestionnaireData["program"];
    study?: QuestionnaireData["study"];
  } | null;
  programSheet: ExcelJS.Worksheet;
};

type BKeys =
  | "program._id"
  | "program.name"
  | "program.abbreviation"
  | "program.description"
  | "study.name"
  | "study.abbreviation"
  | "study.description";

const DEFAULT_CHARACTER_LIMITS: CharacterLimitsMap<BKeys> = {
  "program.name": 100,
  "program.abbreviation": 100,
  "program.description": 500,
  "study.name": 100,
  "study.abbreviation": 20,
  "study.description": 2500,
};

const columns: ColumnDef<BKeys>[] = [
  {
    header: "Program",
    key: "program._id",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Program Title",
    key: "program.name",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Program Abbreviation",
    key: "program.abbreviation",
    width: 20,
    protection: { locked: true },
  },
  {
    header: "Program Description",
    key: "program.description",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Study Title",
    key: "study.name",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Study Abbreviation",
    key: "study.abbreviation",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Study Description",
    key: "study.description",
    width: 30,
    protection: { locked: true },
  },
];

export class SectionB extends SectionBase<BKeys, SectionBDeps> {
  constructor(deps: SectionBDeps) {
    super({
      id: "B",
      sheetName: "Program and Study",
      columns,
      headerColor: "D9EAD3",
      characterLimits: DEFAULT_CHARACTER_LIMITS,
      deps,
    });
  }

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row {
    const r2 = ws.getRow(2);
    r2.values = {
      "program._id": this.deps.data?.program?._id || "",
      "program.name": this.deps.data?.program?.name || "",
      "program.abbreviation": this.deps.data?.program?.abbreviation || "",
      "program.description": this.deps.data?.program?.description || "",
      "study.name": this.deps.data?.study?.name || "",
      "study.abbreviation": this.deps.data?.study?.abbreviation || "",
      "study.description": this.deps.data?.study?.description || "",
    };

    return r2;
  }

  protected async validate(
    _ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    row2: ExcelJS.Row
  ): Promise<void> {
    const [A2, B2, C2, D2, E2, F2, G2] = [
      row2.getCell("program._id"),
      row2.getCell("program.name"),
      row2.getCell("program.abbreviation"),
      row2.getCell("program.description"),
      row2.getCell("study.name"),
      row2.getCell("study.abbreviation"),
      row2.getCell("study.description"),
    ];

    A2.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: false,
      formulae: [
        LIST_FORMULA(this.deps.programSheet.name, "B", 1, this.deps.programSheet.rowCount || 0),
      ],
    };

    B2.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: 'Required (max 100) unless Program is "Not Applicable".',
      formulae: [
        IF(
          STR_EQ(A2, "Not Applicable"),
          "TRUE",
          AND(REQUIRED(B2), TEXT_MAX(B2, this.CHARACTER_LIMITS["program.name"]))
        ),
      ],
    };

    C2.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: 'Required (max 100) unless Program is "Not Applicable".',
      formulae: [
        IF(
          STR_EQ(A2, "Not Applicable"),
          "TRUE",
          AND(REQUIRED(C2), TEXT_MAX(C2, this.CHARACTER_LIMITS["program.abbreviation"]))
        ),
      ],
    };

    D2.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: 'Required (max 500) unless Program is "Not Applicable".',
      formulae: [
        IF(
          STR_EQ(A2, "Not Applicable"),
          "TRUE",
          AND(REQUIRED(D2), TEXT_MAX(D2, this.CHARACTER_LIMITS["program.description"]))
        ),
      ],
    };

    E2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Required. Max 100 characters.",
      formulae: [this.CHARACTER_LIMITS["study.name"]],
    };

    F2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: true,
      showErrorMessage: true,
      error: "Max 20 characters.",
      formulae: [this.CHARACTER_LIMITS["study.abbreviation"]],
    };

    G2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 2500 characters.",
      formulae: [this.CHARACTER_LIMITS["study.description"]],
    };
  }
}
