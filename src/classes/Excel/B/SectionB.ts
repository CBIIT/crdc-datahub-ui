import type ExcelJS from "exceljs";

import { IF, STR_EQ, REQUIRED, TEXT_MAX, AND, LIST_FORMULA, DATE_NOT_BEFORE_TODAY } from "@/utils";

import { CharacterLimitsMap, SectionBase, SectionCtxBase } from "../SectionBase";

import columns, { BKeys } from "./Columns";

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

type SectionBDeps = {
  data: QuestionnaireData | null;
  programSheet: ExcelJS.Worksheet;
};

export class SectionB extends SectionBase<BKeys, SectionBDeps> {
  static SHEET_NAME = "Program and Study";

  constructor(deps: SectionBDeps) {
    super({
      id: "B",
      sheetName: SectionB.SHEET_NAME,
      columns,
      headerColor: "D9EAD3",
      characterLimits: DEFAULT_CHARACTER_LIMITS,
      deps,
    });
  }

  protected write(_ctx: SectionCtxBase, ws: ExcelJS.Worksheet): ExcelJS.Row[] {
    const startRow = 2;
    const rows = new Set<ExcelJS.Row>();

    let foundProgramName = "";
    const rawProgramId = this.deps.data?.program?._id;
    const foundProgramCell = this.findProgramById(rawProgramId);

    // Use name if available
    if (rawProgramId?.length > 0) {
      foundProgramName = foundProgramCell
        ? `${this.deps?.programSheet?.getCell(`B${foundProgramCell.row}`).value || ""}`
        : "Other";
    }

    // Otherwise use ID
    if (!foundProgramName && rawProgramId?.length > 0 && foundProgramCell) {
      foundProgramName = `${
        this.deps?.programSheet?.getCell(`A${foundProgramCell.row}`).value || ""
      }`;
    }

    const row = ws.getRow(startRow);
    this.setRowValues(ws, startRow, {
      "program._id": foundProgramName,
      "program.name": foundProgramName === "Other" ? this.deps.data?.program?.name || "" : "",
      "program.abbreviation":
        foundProgramName === "Other" ? this.deps.data?.program?.abbreviation || "" : "",
      "program.description":
        foundProgramName === "Other" ? this.deps.data?.program?.description || "" : "",
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

    ws.addConditionalFormatting({
      ref: "B2:D2",
      rules: [
        {
          type: "expression",
          formulae: ['AND($A2<>"Other", LEN(TRIM($A2))>0)'],
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

    // Program
    A2.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: false,
      formulae: [
        LIST_FORMULA(this.deps.programSheet.name, "E", 1, this.deps.programSheet.rowCount || 1),
      ],
    };

    // Program Name
    B2.dataValidation = {
      type: "custom",
      allowBlank: true,
      showErrorMessage: true,
      showInputMessage: true,
      error: "Invalid operation.",
      formulae: [
        IF(
          STR_EQ(A2, "Other"),
          AND(REQUIRED("B2"), TEXT_MAX("B2", this.CHARACTER_LIMITS["program.name"])),
          `LEN(TRIM(${"B2"}))=0`
        ),
      ],
    };

    // Program Abbreviation
    C2.dataValidation = {
      type: "custom",
      allowBlank: true,
      showErrorMessage: true,
      showInputMessage: true,
      error: "Invalid operation.",
      formulae: [
        IF(
          STR_EQ(A2, "Other"),
          AND(REQUIRED("C2"), TEXT_MAX("C2", this.CHARACTER_LIMITS["program.abbreviation"])),
          `LEN(TRIM(${"C2"}))=0`
        ),
      ],
    };

    // Program Description
    D2.dataValidation = {
      type: "custom",
      allowBlank: true,
      showErrorMessage: true,
      showInputMessage: true,
      error: "Invalid operation.",
      formulae: [
        IF(
          STR_EQ(A2, "Other"),
          AND(REQUIRED("D2"), TEXT_MAX("D2", this.CHARACTER_LIMITS["program.description"])),
          `LEN(TRIM(${"D2"}))=0`
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

  public static mapValues(
    data: Map<BKeys, Array<unknown>>,
    deps: Partial<SectionBDeps>
  ): RecursivePartial<QuestionnaireData> {
    const funding: Funding[] =
      (data.get("study.funding.agency")?.map((agency, index) => ({
        agency,
        grantNumbers: data.get("study.funding.grantNumbers")?.[index],
        nciProgramOfficer: data.get("study.funding.nciProgramOfficer")?.[index],
      })) as Funding[]) || [];

    const publications: Publication[] =
      (data.get("study.publications.title")?.map((title, index) => ({
        title,
        pubmedID: data.get("study.publications.pubmedID")?.[index],
        DOI: data.get("study.publications.DOI")?.[index],
      })) as Publication[]) || [];

    const plannedPublications: PlannedPublication[] =
      (data.get("study.plannedPublications.title")?.map((title, index) => ({
        title,
        expectedDate: data.get("study.plannedPublications.expectedDate")?.[index],
      })) as PlannedPublication[]) || [];

    const repositories: Repository[] =
      (data.get("study.repositories.name")?.map((name, index) => ({
        name,
        studyID: data.get("study.repositories.studyID")?.[index],
        dataTypesSubmitted: String(data.get("study.repositories.dataTypesSubmitted")[index]).split(
          " | "
        ),
        otherDataTypesSubmitted: data.get("study.repositories.otherDataTypesSubmitted")?.[index],
      })) as Repository[]) || [];

    // Match program name to get the _id
    const programColB = deps.programSheet.getColumn(2);
    let programId: string;
    programColB.eachCell((cell, rowNumber) => {
      const name = String(cell.value || "").trim();
      if (name === data.get("program._id")[0]) {
        programId = String(deps.programSheet.getCell(`A${rowNumber}`).value || "").trim();
      }
    });

    const questionnairedata: RecursivePartial<QuestionnaireData> = {
      program: {
        _id: programId,
        name: data.get("program.name")[0] as unknown as string,
        abbreviation: data.get("program.abbreviation")[0] as unknown as string,
        description: data.get("program.description")[0] as unknown as string,
      },
      study: {
        name: data.get("study.name")[0] as unknown as string,
        abbreviation: data.get("study.abbreviation")[0] as string,
        description: data.get("study.description")[0] as string,
        funding,
        publications,
        plannedPublications,
        repositories,
      },
    };

    return questionnairedata;
  }

  /**
   * Finds a program by its ID.
   * @param id The ID of the program to find.
   * @returns The ExcelJS cell containing the program ID, or null if not found.
   */
  private findProgramById(id: string): ExcelJS.Cell | null {
    if (!id?.trim()?.length) {
      return null;
    }

    const colA = this.deps?.programSheet?.getColumn(1);
    if (!colA) {
      return null;
    }

    let cell: ExcelJS.Cell | undefined;
    colA.eachCell((c) => {
      if (!cell && c.value === id) {
        cell = c;
      }
    });

    return cell || null;
  }
}
