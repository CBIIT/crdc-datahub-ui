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

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row {
    const startRow = 2;
    const row = ws.getRow(startRow);
    row.values = {
      "program._id": this.deps.data?.program?._id || "",
      "program.name": this.deps.data?.program?.name || "",
      "program.abbreviation": this.deps.data?.program?.abbreviation || "",
      "program.description": this.deps.data?.program?.description || "",
      "study.name": this.deps.data?.study?.name || "",
      "study.abbreviation": this.deps.data?.study?.abbreviation || "",
      "study.description": this.deps.data?.study?.description || "",
    };

    const funding = this.deps.data?.study?.funding || [];
    funding.forEach((f, index) => {
      const r = ws.getRow(index + startRow);

      r.getCell("study.funding.agency").value = f.agency || "";
      r.getCell("study.funding.grantNumbers").value = f.grantNumbers || "";
      r.getCell("study.funding.nciProgramOfficer").value = f.nciProgramOfficer || "";
    });

    const publications = this.deps.data?.study?.publications || [];
    publications.forEach((p, index) => {
      const r = ws.getRow(index + startRow);

      r.getCell("study.publications.title").value = p.title || "";
      r.getCell("study.publications.pubmedID").value = p.pubmedID || "";
      r.getCell("study.publications.DOI").value = p.DOI || "";
    });

    const plannedPublications = this.deps.data?.study?.plannedPublications || [];
    plannedPublications.forEach((p, index) => {
      const r = ws.getRow(index + startRow);

      r.getCell("study.plannedPublications.title").value = p.title || "";
      r.getCell("study.plannedPublications.expectedDate").value = p.expectedDate || "";
    });

    const repositories = this.deps.data?.study?.repositories || [];
    repositories.forEach((repo, index) => {
      const r = ws.getRow(index + startRow);
      r.getCell("study.repositories.name").value = repo.name || "";
      r.getCell("study.repositories.studyID").value = repo.studyID || "";
      r.getCell("study.repositories.dataTypesSubmitted").value =
        repo.dataTypesSubmitted?.join(" | ");
      r.getCell("study.repositories.otherDataTypesSubmitted").value =
        repo.otherDataTypesSubmitted || "";
    });

    return row;
  }

  protected async validate(
    _ctx: SectionCtxBase,
    ws: ExcelJS.Worksheet,
    _rows: ExcelJS.Row
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [A2, B2, C2, D2, E2, F2, G2, _H2, I2, J2, K2, L2, M2, N2, O2, P2, Q2, _R2, S2] =
      this.getRowCells(ws);

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
    I2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 250 characters.",
      formulae: [this.CHARACTER_LIMITS["study.funding.grantNumbers"]],
    };
    J2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 50 characters.",
      formulae: [this.CHARACTER_LIMITS["study.funding.nciProgramOfficer"]],
    };

    // Publications
    K2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 500 characters.",
      formulae: [this.CHARACTER_LIMITS["study.publications.title"]],
    };
    L2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 20 characters.",
      formulae: [this.CHARACTER_LIMITS["study.publications.pubmedID"]],
    };
    M2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 20 characters.",
      formulae: [this.CHARACTER_LIMITS["study.publications.DOI"]],
    };

    // Planned Publications
    N2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 500 characters.",
      formulae: [this.CHARACTER_LIMITS["study.plannedPublications.title"]],
    };
    O2.dataValidation = {
      type: "custom",
      allowBlank: false,
      showErrorMessage: true,
      error: "Enter a valid date (MM/DD/YYYY)",
      formulae: [DATE_NOT_BEFORE_TODAY(O2, { allowBlank: false })],
    };

    // Repositories
    P2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 50 characters.",
      formulae: [this.CHARACTER_LIMITS["study.repositories.name"]],
    };
    Q2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 50 characters.",
      formulae: [this.CHARACTER_LIMITS["study.repositories.studyID"]],
    };
    S2.dataValidation = {
      type: "textLength",
      operator: "lessThanOrEqual",
      allowBlank: false,
      showErrorMessage: true,
      error: "Must be less than or equal to 100 characters.",
      formulae: [this.CHARACTER_LIMITS["study.repositories.otherDataTypesSubmitted"]],
    };
  }
}
