import type ExcelJS from "exceljs";

import { AND, IF, LIST_FORMULA, REQUIRED, STR_EQ, TEXT_MAX } from "@/utils";

import { SectionBase, SectionCtxBase } from "../SectionBase";

import { AKeys, COLUMNS, DEFAULT_CHARACTER_LIMITS } from "./Columns";

type SectionADeps = {
  data: QuestionnaireData | null;
  institutionSheet: ExcelJS.Worksheet;
};

export class SectionA extends SectionBase<AKeys, SectionADeps> {
  constructor(deps: SectionADeps) {
    super({
      id: "A",
      sheetName: "PI and Contact", // TODO: Use constants for the name
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
      "pi.firstName": data?.pi?.firstName || "",
      "pi.lastName": data?.pi?.lastName || "",
      "pi.position": data?.pi?.position || "",
      "pi.email": data?.pi?.email || "",
      "pi.ORCID": data?.pi?.ORCID || "",
      "pi.institution": data?.pi?.institution || "",
      "pi.address": data?.pi?.address || "",
      piAsPrimaryContact: data?.piAsPrimaryContact || "FALSE",
      "primaryContact.firstName": data?.primaryContact?.firstName || "",
      "primaryContact.lastName": data?.primaryContact?.lastName || "",
      "primaryContact.position": data?.primaryContact?.position || "",
      "primaryContact.email": data?.primaryContact?.email || "",
      "primaryContact.institution": data?.primaryContact?.institution || "",
      "primaryContact.phone": data?.primaryContact?.phone || "",
    };

    data?.additionalContacts?.forEach((contact, idx) => {
      const row = ws.getRow(idx + 2);
      row.getCell("additionalContacts.firstName").value = contact.firstName || "";
      row.getCell("additionalContacts.lastName").value = contact.lastName || "";
      row.getCell("additionalContacts.position").value = contact.position || "";
      row.getCell("additionalContacts.email").value = contact.email || "";
      row.getCell("additionalContacts.institution").value = contact.institution || "";
      row.getCell("additionalContacts.phone").value = contact.phone || "";
    });

    return []; // TODO: Implement row writing
  }

  protected async applyValidation(ctx: SectionCtxBase, ws: ExcelJS.Worksheet): Promise<void> {
    const [A2, B2, C2, D2, E2, F2, G2, H2, I2, J2, K2, L2, M2, N2] = this.getRowCells(ws);

    A2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 50 characters.",
      allowBlank: false,
      formulae: [DEFAULT_CHARACTER_LIMITS["pi.firstName"]],
    };
    B2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 50 characters.",
      allowBlank: false,
      formulae: [DEFAULT_CHARACTER_LIMITS["pi.lastName"]],
    };
    C2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 100 characters.",
      allowBlank: false,
      formulae: [DEFAULT_CHARACTER_LIMITS["pi.position"]],
    };
    D2.dataValidation = {
      type: "custom",
      showErrorMessage: true,
      error: "Please enter a valid email address.",
      allowBlank: false,
      formulae: [
        `=AND(ISNUMBER(SEARCH("@",${D2.address})), ISNUMBER(SEARCH(".",${D2.address})), LEN(${D2.address}) - LEN(SUBSTITUTE(${D2.address},".","")) >= 1, LEN(${D2.address}) - LEN(SUBSTITUTE(${D2.address},"@","")) = 1)`,
      ],
    };
    E2.dataValidation = {
      type: "custom",
      showErrorMessage: true,
      error: "Please enter a valid ORCID (format: 0000-0000-0000-0000 or 0000-0000-0000-000X)",
      allowBlank: true,
      formulae: [
        '=AND(LEN(E2)=19, MID(E2,5,1)="-", MID(E2,10,1)="-", MID(E2,15,1)="-", ISNUMBER(VALUE(LEFT(E2,4))), ISNUMBER(VALUE(MID(E2,6,4))), ISNUMBER(VALUE(MID(E2,11,4))), ISNUMBER(VALUE(MID(E2,16,3))), OR(ISNUMBER(VALUE(RIGHT(E2,1))), RIGHT(E2,1)="X"))',
      ],
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
    G2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 200 characters.",
      allowBlank: false,
      formulae: [DEFAULT_CHARACTER_LIMITS["pi.address"]],
    };
    H2.dataValidation = {
      type: "list",
      allowBlank: false,
      showErrorMessage: false,
      formulae: ['"TRUE,FALSE"'],
    };

    // Primary Contact
    [I2, J2, K2, L2, M2, N2].forEach((cell) => {
      const columnKey = ws.getColumn(cell.col).key;
      const cellLimit = DEFAULT_CHARACTER_LIMITS[columnKey as AKeys] ?? 0;

      cell.dataValidation = {
        type: "custom",
        allowBlank: false,
        showErrorMessage: true,
        error: `Must be less than ${cellLimit} characters.`,
        formulae: [IF(STR_EQ(H2, "TRUE"), "TRUE", AND(REQUIRED(cell), TEXT_MAX(cell, cellLimit)))],
      };
    });

    // TODO: I think eachCell would only work if data is filled out. Probably need
    // to define validation on either the whole column OR iterate using row count

    // Additional Contacts
    ws.getColumn("additionalContacts.firstName").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "textLength",
        operator: "lessThan",
        showErrorMessage: true,
        error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["additionalContacts.firstName"]} characters.`,
        allowBlank: false,
        formulae: [DEFAULT_CHARACTER_LIMITS["additionalContacts.firstName"]],
      };
    });
    ws.getColumn("additionalContacts.lastName").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "textLength",
        operator: "lessThan",
        showErrorMessage: true,
        error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["additionalContacts.lastName"]} characters.`,
        allowBlank: false,
        formulae: [DEFAULT_CHARACTER_LIMITS["additionalContacts.lastName"]],
      };
    });
    ws.getColumn("additionalContacts.position").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "textLength",
        operator: "lessThan",
        showErrorMessage: true,
        error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["additionalContacts.position"]} characters.`,
        allowBlank: false,
        formulae: [DEFAULT_CHARACTER_LIMITS["additionalContacts.position"]],
      };
    });
    ws.getColumn("additionalContacts.email").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "custom",
        allowBlank: true,
        showErrorMessage: true,
        error: "Please enter a valid email address.",
        formulae: [
          // TODO: Use abstracted function for email validation formula (there are multiple of them)
          `=IF(ISBLANK(${cell.address}), TRUE, AND(ISNUMBER(SEARCH("@",${cell.address})), ISNUMBER(SEARCH(".",${cell.address})), LEN(${cell.address}) - LEN(SUBSTITUTE(${cell.address},".","")) >= 1, LEN(${cell.address}) - LEN(SUBSTITUTE(${cell.address},"@","")) = 1))`,
        ],
      };
    });
    ws.getColumn("additionalContacts.institution").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "textLength",
        operator: "lessThan",
        showErrorMessage: true,
        error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["additionalContacts.institution"]} characters.`,
        allowBlank: false,
        formulae: [DEFAULT_CHARACTER_LIMITS["additionalContacts.institution"]],
      };
    });
    ws.getColumn("additionalContacts.phone").eachCell((cell, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      cell.dataValidation = {
        type: "textLength",
        operator: "lessThan",
        showErrorMessage: true,
        error: `Must be less than ${DEFAULT_CHARACTER_LIMITS["additionalContacts.phone"]} characters.`,
        allowBlank: false,
        formulae: [DEFAULT_CHARACTER_LIMITS["additionalContacts.phone"]],
      };
    });
  }
}
