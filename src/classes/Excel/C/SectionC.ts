import type ExcelJS from "exceljs";

import { CharacterLimitsMap, ColumnDef, SectionBase, SectionCtxBase } from "../SectionBase";

type SectionCDeps = {
  data: QuestionnaireData | null;
  cancerTypes: string[];
  species: string[];
};

type CKeys =
  | "accessTypes.openAccess"
  | "accessTypes.controlledAccess"
  | "study.isDbGapRegistered"
  | "study.dbGaPPPHSNumber"
  | "study.GPAName" // TODO: This is NOT FINALIZED until base is merged
  | "cancerTypes"
  // | "otherCancerTypesEnabled"
  | "otherCancerTypes"
  | "preCancerTypes"
  | "species"
  // | "otherSpeciesEnabled"
  | "otherSpeciesOfSubjects"
  | "numberOfParticipants";

const DEFAULT_CHARACTER_LIMITS: CharacterLimitsMap<CKeys> = {
  "study.dbGaPPPHSNumber": 50,
  // "study.GPAName": 0, // TODO: no limit?
  otherCancerTypes: 1000,
  preCancerTypes: 500,
  otherSpeciesOfSubjects: 500,
  numberOfParticipants: 10,
};

const columns: ColumnDef<CKeys>[] = [
  {
    header: "Access Types: Open Access",
    key: "accessTypes.openAccess",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Access Types: Controlled Access",
    key: "accessTypes.controlledAccess",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Has your study been registered in dbGaP?",
    key: "study.isDbGapRegistered",
    width: 45,
    protection: { locked: true },
  },
  {
    header: "If yes, provide dbGaP PHS number with the version number",
    key: "study.dbGaPPPHSNumber",
    width: 50,
    protection: { locked: true },
  },
  {
    header: "Genomic Program Administrator",
    key: "study.GPAName",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Cancer Types",
    key: "cancerTypes",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Other cancer type(s)",
    key: "otherCancerTypes",
    width: 50,
    protection: { locked: true },
  },
  {
    header: "Pre-Cancer types (provide all that apply)",
    key: "preCancerTypes",
    width: 50,
    protection: { locked: true },
  },
  {
    header: "Species of subjects",
    key: "species",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Other Specie(s) involved",
    key: "otherSpeciesOfSubjects",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "Number of subjects included in the submission",
    key: "numberOfParticipants",
    width: 45,
    protection: { locked: true },
  },
];

export class SectionC extends SectionBase<CKeys, SectionCDeps> {
  constructor(deps: SectionCDeps) {
    super({
      id: "C",
      sheetName: "Data Access and Disease", // TODO: Use constants for the name
      columns,
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
