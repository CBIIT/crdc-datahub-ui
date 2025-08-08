import type ExcelJS from "exceljs";

import { IF, STR_EQ, REQUIRED, TEXT_MAX, AND, LIST_FORMULA, DATE_NOT_BEFORE_TODAY } from "@/utils";

import { CharacterLimitsMap, ColumnDef, SectionBase, SectionCtxBase } from "./SectionBase";

type SectionBDeps = {
  data: QuestionnaireData | null;
  programSheet: ExcelJS.Worksheet;
};

type BKeys =
  | "program._id"
  | "program.name"
  | "program.abbreviation"
  | "program.description"
  | "study.name"
  | "study.abbreviation"
  | "study.description"
  | "study.funding.agency"
  | "study.funding.grantNumbers"
  | "study.funding.nciProgramOfficer"
  | "study.publications.title"
  | "study.publications.pubmedID"
  | "study.publications.DOI"
  | "study.plannedPublications.title"
  | "study.plannedPublications.expectedDate"
  | "study.repositories.name"
  | "study.repositories.studyID"
  | "study.repositories.dataTypesSubmitted"
  | "study.repositories.otherDataTypesSubmitted";

const DEFAULT_CHARACTER_LIMITS: CharacterLimitsMap<BKeys> = {
  "program.name": 100,
  "program.abbreviation": 100,
  "program.description": 500,
  "study.name": 100,
  "study.abbreviation": 20,
  "study.description": 2_500,
  // "study.funding.agency": 0,
  "study.funding.grantNumbers": 250,
  "study.funding.nciProgramOfficer": 50,
  "study.publications.title": 500,
  "study.publications.pubmedID": 20,
  "study.publications.DOI": 20,
  "study.plannedPublications.title": 500,
  // "study.plannedPublications.expectedDate": 0,
  "study.repositories.name": 50,
  "study.repositories.studyID": 50,
  // "study.repositories.dataTypesSubmitted": 0,
  "study.repositories.otherDataTypesSubmitted": 100,
};

const protection = { locked: true };

const columns: ColumnDef<BKeys>[] = [
  { header: "Program", key: "program._id", width: 30, protection },
  { header: "Program Title", key: "program.name", width: 30, protection },
  { header: "Program Abbreviation", key: "program.abbreviation", width: 20, protection },
  { header: "Program Description", key: "program.description", width: 30, protection },
  { header: "Study Title", key: "study.name", width: 30, protection },
  { header: "Study Abbreviation", key: "study.abbreviation", width: 30, protection },
  { header: "Study Description", key: "study.description", width: 30, protection },
  { header: "Funding Agency/Organization", key: "study.funding.agency", width: 30, protection },
  {
    header: "Grant or Contract Number(s)",
    key: "study.funding.grantNumbers",
    width: 30,
    protection,
  },
  { header: "NCI Program Officer", key: "study.funding.nciProgramOfficer", width: 30, protection },
  { header: "Publication Title", key: "study.publications.title", width: 30, protection },
  { header: "PubMed ID (PMID)", key: "study.publications.pubmedID", width: 30, protection },
  { header: "DOI", key: "study.publications.DOI", width: 30, protection },
  { header: "Publication Title", key: "study.plannedPublications.title", width: 30, protection },
  {
    header: "Expected Publication Date",
    key: "study.plannedPublications.expectedDate",
    width: 30,
    protection,
  },
  { header: "Repository Name", key: "study.repositories.name", width: 30, protection },
  { header: "Study ID", key: "study.repositories.studyID", width: 30, protection },
  {
    header: "Data Type(s) Submitted",
    key: "study.repositories.dataTypesSubmitted",
    width: 30,
    protection,
  },
  {
    header: "Other Data Type(s)",
    key: "study.repositories.otherDataTypesSubmitted",
    width: 30,
    protection,
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

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row[] {
    const startRow = 2;
    const rows = new Set<ExcelJS.Row>();

    const row = ws.getRow(startRow);
    this.setRowValues(ws, startRow, {
      "program._id": this.deps.data?.program?._id || "",
      "program.name": this.deps.data?.program?.name || "",
      "program.abbreviation": this.deps.data?.program?.abbreviation || "",
      "program.description": this.deps.data?.program?.description || "",
      "study.name": this.deps.data?.study?.name || "",
      "study.abbreviation": this.deps.data?.study?.abbreviation || "",
      "study.description": this.deps.data?.study?.description || "",
    });
    rows.add(row);

    const funding = this.deps.data?.study?.funding || [];
    funding.forEach((f, index) => {
      this.setRowValues(ws, index + startRow, {
        "study.funding.agency": f.agency || "",
        "study.funding.grantNumbers": f.grantNumbers || "",
        "study.funding.nciProgramOfficer": f.nciProgramOfficer || "",
      });
      rows.add(ws.getRow(index + startRow));
    });

    const publications = this.deps.data?.study?.publications || [];
    publications.forEach((p, index) => {
      this.setRowValues(ws, index + startRow, {
        "study.publications.title": p.title || "",
        "study.publications.pubmedID": p.pubmedID || "",
        "study.publications.DOI": p.DOI || "",
      });
      rows.add(ws.getRow(index + startRow));
    });

    const plannedPublications = this.deps.data?.study?.plannedPublications || [];
    plannedPublications.forEach((p, index) => {
      this.setRowValues(ws, index + startRow, {
        "study.plannedPublications.title": p.title || "",
        "study.plannedPublications.expectedDate": p.expectedDate || "",
      });
      rows.add(ws.getRow(index + startRow));
    });

    const repositories = this.deps.data?.study?.repositories || [];
    repositories.forEach((repo, index) => {
      this.setRowValues(ws, index + startRow, {
        "study.repositories.name": repo.name || "",
        "study.repositories.studyID": repo.studyID || "",
        "study.repositories.dataTypesSubmitted": repo.dataTypesSubmitted?.join(" | "),
        "study.repositories.otherDataTypesSubmitted": repo.otherDataTypesSubmitted || "",
      });
      rows.add(ws.getRow(index + startRow));
    });

    return [...rows];
  }

  protected async applyValidation(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const startRow = 2;
    const [A2, B2, C2, D2, E2, F2, G2] = this.getRowCells(ws, startRow);

    // Program
    A2.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: false,
      formulae: [
        LIST_FORMULA(this.deps.programSheet.name, "B", 1, this.deps.programSheet.rowCount || 1),
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

    // Study
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

    // Funding
    this.forEachCellInColumn(ws, "study.funding.grantNumbers", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 250 characters.",
        formulae: [this.CHARACTER_LIMITS["study.funding.grantNumbers"]],
      };
    });
    this.forEachCellInColumn(ws, "study.funding.nciProgramOfficer", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 50 characters.",
        formulae: [this.CHARACTER_LIMITS["study.funding.nciProgramOfficer"]],
      };
    });

    // Publications
    this.forEachCellInColumn(ws, "study.publications.title", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 500 characters.",
        formulae: [this.CHARACTER_LIMITS["study.publications.title"]],
      };
    });
    this.forEachCellInColumn(ws, "study.publications.pubmedID", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 20 characters.",
        formulae: [this.CHARACTER_LIMITS["study.publications.pubmedID"]],
      };
    });
    this.forEachCellInColumn(ws, "study.publications.DOI", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 20 characters.",
        formulae: [this.CHARACTER_LIMITS["study.publications.DOI"]],
      };
    });

    // Planned Publications

    this.forEachCellInColumn(ws, "study.plannedPublications.title", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 500 characters.",
        formulae: [this.CHARACTER_LIMITS["study.plannedPublications.title"]],
      };
    });

    this.forEachCellInColumn(ws, "study.plannedPublications.expectedDate", (cell) => {
      cell.dataValidation = {
        type: "custom",
        allowBlank: false,
        showErrorMessage: true,
        error: "Enter a valid date (MM/DD/YYYY)",
        formulae: [DATE_NOT_BEFORE_TODAY(cell, { allowBlank: false })],
      };
    });

    // Repositories
    this.forEachCellInColumn(ws, "study.repositories.name", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 50 characters.",
        formulae: [this.CHARACTER_LIMITS["study.repositories.name"]],
      };
    });
    this.forEachCellInColumn(ws, "study.repositories.studyID", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 50 characters.",
        formulae: [this.CHARACTER_LIMITS["study.repositories.studyID"]],
      };
    });

    this.forEachCellInColumn(ws, "study.repositories.otherDataTypesSubmitted", (cell) => {
      cell.dataValidation = {
        type: "textLength",
        operator: "lessThanOrEqual",
        allowBlank: false,
        showErrorMessage: true,
        error: "Must be less than or equal to 100 characters.",
        formulae: [this.CHARACTER_LIMITS["study.repositories.otherDataTypesSubmitted"]],
      };
    });
  }
}
