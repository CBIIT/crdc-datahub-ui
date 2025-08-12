import type ExcelJS from "exceljs";

import { AND, EMAIL, IF, LIST_FORMULA, ORCID, REQUIRED, STR_EQ, TEXT_MAX } from "@/utils";

import { YesNoList } from "../D/SectionD";
import { SectionBase, SectionCtxBase } from "../SectionBase";

import { AKeys, COLUMNS, DEFAULT_CHARACTER_LIMITS } from "./Columns";

type SectionADeps = {
  data: QuestionnaireData | null;
  institutionSheet: ExcelJS.Worksheet;
};

export class SectionA extends SectionBase<AKeys, SectionADeps> {
  static SHEET_NAME = "PI and Contact";

  constructor(deps: SectionADeps) {
    super({
      id: "A",
      sheetName: SectionA.SHEET_NAME,
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
      "pi.firstName": data?.pi?.firstName || "",
      "pi.lastName": data?.pi?.lastName || "",
      "pi.position": data?.pi?.position || "",
      "pi.email": data?.pi?.email || "",
      "pi.ORCID": data?.pi?.ORCID || "",
      "pi.institution": data?.pi?.institution || "",
      "pi.address": data?.pi?.address || "",
      piAsPrimaryContact: data?.piAsPrimaryContact ? "Yes" : "No",
      "primaryContact.firstName": data?.primaryContact?.firstName || "",
      "primaryContact.lastName": data?.primaryContact?.lastName || "",
      "primaryContact.position": data?.primaryContact?.position || "",
      "primaryContact.email": data?.primaryContact?.email || "",
      "primaryContact.institution": data?.primaryContact?.institution || "",
      "primaryContact.phone": data?.primaryContact?.phone || "",
    });
    rows.add(row);

    data?.additionalContacts?.forEach((contact, idx) => {
      this.setRowValues(ws, idx + startRow, {
        "additionalContacts.firstName": contact.firstName || "",
        "additionalContacts.lastName": contact.lastName || "",
        "additionalContacts.position": contact.position || "",
        "additionalContacts.email": contact.email || "",
        "additionalContacts.institution": contact.institution || "",
        "additionalContacts.phone": contact.phone || "",
      });
      rows.add(ws.getRow(idx + startRow));
    });

    return [...rows];
  }

  protected async applyValidation(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const [A2, B2, C2, D2, E2, F2, G2, H2, I2, J2, K2, L2, M2, N2] = this.getRowCells(ws);

    this.applyTextLengthValidation(A2, DEFAULT_CHARACTER_LIMITS["pi.firstName"]);
    this.applyTextLengthValidation(B2, DEFAULT_CHARACTER_LIMITS["pi.lastName"]);
    this.applyTextLengthValidation(C2, DEFAULT_CHARACTER_LIMITS["pi.position"]);
    this.applyTextLengthValidation(G2, DEFAULT_CHARACTER_LIMITS["pi.address"]);

    D2.dataValidation = {
      type: "custom",
      showErrorMessage: true,
      error: "Please enter a valid email address.",
      allowBlank: true,
      formulae: [EMAIL(D2)],
    };
    E2.dataValidation = {
      type: "custom",
      showErrorMessage: true,
      error: "Please provide a valid ORCID.",
      allowBlank: true,
      formulae: [ORCID(E2)],
    };
    F2.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: false,
      formulae: [
        LIST_FORMULA(
          this.deps.institutionSheet.name,
          "B",
          1,
          this.deps.institutionSheet.rowCount || 0
        ),
      ],
    };
    H2.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: false,
      formulae: [YesNoList],
    };

    // Primary Contact
    [I2, J2, K2, L2, M2, N2].forEach((cell) => {
      const columnKey = ws.getColumn(cell.col).key;
      const cellLimit = DEFAULT_CHARACTER_LIMITS[columnKey as AKeys] ?? 0;

      cell.dataValidation = {
        type: "custom",
        allowBlank: true,
        showErrorMessage: true,
        error: `Must be less than ${cellLimit} characters.`,
        formulae: [IF(STR_EQ(H2, "Yes"), "TRUE", AND(REQUIRED(cell), TEXT_MAX(cell, cellLimit)))],
      };
    });

    // Additional Contacts
    this.forEachCellInColumn(ws, "additionalContacts.firstName", (cell) => {
      this.applyTextLengthValidation(
        cell,
        DEFAULT_CHARACTER_LIMITS["additionalContacts.firstName"]
      );
    });
    this.forEachCellInColumn(ws, "additionalContacts.lastName", (cell) => {
      this.applyTextLengthValidation(cell, DEFAULT_CHARACTER_LIMITS["additionalContacts.lastName"]);
    });
    this.forEachCellInColumn(ws, "additionalContacts.position", (cell) => {
      this.applyTextLengthValidation(cell, DEFAULT_CHARACTER_LIMITS["additionalContacts.position"]);
    });
    this.forEachCellInColumn(ws, "additionalContacts.email", (cell) => {
      cell.dataValidation = {
        type: "custom",
        allowBlank: true,
        showErrorMessage: true,
        error: "Please enter a valid email address.",
        formulae: [EMAIL(cell)],
      };
    });
    this.forEachCellInColumn(ws, "additionalContacts.institution", (cell) => {
      this.applyTextLengthValidation(
        cell,
        DEFAULT_CHARACTER_LIMITS["additionalContacts.institution"]
      );
    });
    this.forEachCellInColumn(ws, "additionalContacts.phone", (cell) => {
      this.applyTextLengthValidation(cell, DEFAULT_CHARACTER_LIMITS["additionalContacts.phone"]);
    });
  }
}
