import { LazyQueryExecFunction } from "@apollo/client";
import ExcelJS from "exceljs";
import { cloneDeep } from "lodash";

import env from "@/env";
import { ListInstitutionsResp } from "@/graphql";
import { Logger } from "@/utils/logger";

/**
 * An internal template version identifier.
 */
const TEMPLATE_VERSION = "1.0";

/**
 * The names of the sheets used in the Excel workbook.
 */
const SHEET_NAMES = {
  meta: "Metadata",
  A: "PI and Contact",
  institutions: "InstitutionList",
} as const;

/**
 * The required dependencies to import or export a Submission Request.
 */
type MiddlewareDependencies = {
  application?: Omit<Application, "QuestionnaireData">;
  getPrograms?: LazyQueryExecFunction<ListInstitutionsResp, unknown>;
  getInstitutions?: LazyQueryExecFunction<ListInstitutionsResp, unknown>;
};

/**
 * A specialized class to handle importing and exporting of a Submission Request.
 * This class is designed to work with QuestionnaireData, allowing for the import and export of data
 * via Excel files.
 */
export class QuestionnaireExcelMiddleware {
  /**
   * The internal ExcelJS Workbook object.
   * This object is used to create and manipulate the Excel file during the import/export process.
   */
  private workbook: ExcelJS.Workbook;

  /**
   * The internal QuestionnaireData object.
   * This object is mutated during the import process, but remains immutable for export.
   */
  private data: QuestionnaireData | null;

  /**
   * The dependencies required for exporting or importing,
   * such as fetching Programs or Institutions.
   */
  private dependencies: MiddlewareDependencies;

  /**
   * Creates an instance of the QuestionnaireExcelMiddleware.
   *
   * @param data The QuestionnaireData object, if applicable, to be exported.
   * @param dependencies The import/export dependencies
   */
  constructor(data: QuestionnaireData | null, dependencies: MiddlewareDependencies) {
    this.workbook = new ExcelJS.Workbook();
    this.data = data ? cloneDeep(data) : null;
    this.dependencies = dependencies;
  }

  /**
   * A method to serialize the QuestionnaireData object to an Excel file.
   * If no `QuestionnaireData` is provided, the Excel file will be generated with no pre-filled values.
   *
   * @throws Will throw an error if the serialization fails significantly.
   * @returns A Promise that resolves to an ArrayBuffer containing the Excel file data.
   */
  public async serialize(): Promise<ArrayBuffer> {
    this.setMetadataProperties();

    // TODO: Implement the serialization logic Sections A-D
    await this.serializeMetadata();
    await this.serializeSectionA();

    return this.workbook.xlsx.writeBuffer();
  }

  /**
   * A static method to parse the input file and return a QuestionnaireExcelMiddleware instance.
   * This method is the inverse of the `serialize` method.
   *
   * @param fileBuffer The Excel file data to be parsed.
   * @param dependencies The dependencies required for parsing the data.
   * @throws Will throw an error if the data cannot be parsed or is invalid.
   * @returns A new instance of QuestionnaireExcelMiddleware with the parsed data.
   */
  public static async parse(
    fileBuffer: ArrayBuffer,
    dependencies: MiddlewareDependencies
  ): Promise<QuestionnaireExcelMiddleware> {
    /**
     * TODO – See below
     * 1. Add the parsing logic for each page individually (not all in here)
     * 2. validate the data, clean invalid data and log messages about it
     * 3. Return a new instance of the class? Or return the data directly?
     * 4. If we aren't returning a new instance, we can separate import/export dependency types
     */

    return new QuestionnaireExcelMiddleware(null, dependencies);
  }

  /**
   * Sets the metadata properties for the Excel workbook.
   *
   * @returns Promise<void>
   */
  private async setMetadataProperties(): Promise<void> {
    this.workbook.creator = "CRDC Submission Portal";
    this.workbook.lastModifiedBy = "CRDC Submission Portal";
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
  }

  /**
   * Builds the metadata page for the Excel workbook.
   *
   * This page contains information such as:
   * - Submission Request Information
   * - Applicant Information
   * - Development Tier
   * - Template Version
   * - Export Date
   *
   * @returns Promise<void>
   */
  private async serializeMetadata(): Promise<Readonly<ExcelJS.Worksheet>> {
    const { application } = this.dependencies;

    const sheet = this.workbook.addWorksheet(SHEET_NAMES.meta, { state: "hidden" });
    sheet.columns = [
      { header: "Submission ID", key: "submissionId", width: 35, protection: { locked: true } },
      { header: "Applicant", key: "applicantName", width: 30, protection: { locked: true } },
      { header: "Applicant ID", key: "applicantId", width: 35, protection: { locked: true } },
      { header: "Last Status", key: "lastStatus", width: 10, protection: { locked: true } },
      { header: "Form Version", key: "formVersion", width: 15, protection: { locked: true } },
      { header: "Created Date", key: "createdAt", width: 30, protection: { locked: true } },
      { header: "Last Modified", key: "updatedAt", width: 30, protection: { locked: true } },
      { header: "Tier", key: "devTier", width: 10, protection: { locked: true } },
      {
        header: "Template Version",
        key: "templateVersion",
        width: 15,
        protection: { locked: true },
      },
      { header: "Export Date", key: "exportedAt", width: 30, protection: { locked: true } },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };
    sheet.getRow(2).getCell("lastStatus").alignment = { horizontal: "center" };

    // Submission Request metadata
    sheet.getRow(2).getCell("submissionId").value = application?._id;
    sheet.getRow(2).getCell("applicantName").value = application?.applicant?.applicantName;
    sheet.getRow(2).getCell("applicantId").value = application?.applicant?.applicantID;
    sheet.getRow(2).getCell("lastStatus").value = application?.status;
    sheet.getRow(2).getCell("formVersion").value = application?.version;
    sheet.getRow(2).getCell("createdAt").value = application?.createdAt;
    sheet.getRow(2).getCell("updatedAt").value = application?.updatedAt;

    // Generic metadata
    sheet.getRow(2).getCell("devTier").value = env.VITE_DEV_TIER || "N/A";
    sheet.getRow(2).getCell("templateVersion").value = TEMPLATE_VERSION;
    sheet.getRow(2).getCell("exportedAt").value = new Date().toISOString();

    return sheet;
  }

  /**
   * Adds the form section A to the Excel workbook.
   *
   * @returns A readonly reference to the created worksheet.
   */
  private async serializeSectionA(): Promise<Readonly<ExcelJS.Worksheet>> {
    const sheet = this.workbook.addWorksheet(SHEET_NAMES.A);

    sheet.getColumn("A").width = 20;
    sheet.getColumn("B").width = 20;
    sheet.getColumn("C").width = 20;
    sheet.getColumn("D").width = 30;
    sheet.getColumn("E").width = 30;
    sheet.getColumn("F").width = 30;
    sheet.getColumn("G").width = 30;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9EAD3" } };

    const [A1, B1, C1, D1, E1, F1, G1] = [
      sheet.getRow(1).getCell("A"),
      sheet.getRow(1).getCell("B"),
      sheet.getRow(1).getCell("C"),
      sheet.getRow(1).getCell("D"),
      sheet.getRow(1).getCell("E"),
      sheet.getRow(1).getCell("F"),
      sheet.getRow(1).getCell("G"),
    ];
    A1.value = "First Name";
    B1.value = "Last Name";
    C1.value = "Position";
    D1.value = "Email";
    E1.value = "ORCID";
    F1.value = "Institution";
    G1.value = "Institution Address";

    const [A2, B2, C2, D2, E2, F2, G2] = [
      sheet.getRow(2).getCell("A"),
      sheet.getRow(2).getCell("B"),
      sheet.getRow(2).getCell("C"),
      sheet.getRow(2).getCell("D"),
      sheet.getRow(2).getCell("E"),
      sheet.getRow(2).getCell("F"),
      sheet.getRow(2).getCell("G"),
    ];
    A2.value = this.data?.pi?.firstName || "";
    B2.value = this.data?.pi?.lastName || "";
    C2.value = this.data?.pi?.position || "";
    D2.value = this.data?.pi?.email || "";
    E2.value = this.data?.pi?.ORCID || "";
    F2.value = this.data?.pi?.institution || "";
    G2.value = this.data?.pi?.address || "";

    A2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 50 characters.",
      allowBlank: false,
      formulae: [50],
    };
    B2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 50 characters.",
      allowBlank: false,
      formulae: [50],
    };
    C2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 100 characters.",
      allowBlank: false,
      formulae: [100],
    };
    D2.dataValidation = {
      type: "custom",
      showErrorMessage: true,
      error: "Please enter a valid email address.",
      allowBlank: false,
      formulae: [
        '=AND(ISNUMBER(SEARCH("@",D2)), ISNUMBER(SEARCH(".",D2)), LEN(D2) - LEN(SUBSTITUTE(D2,".","")) >= 1, LEN(D2) - LEN(SUBSTITUTE(D2,"@","")) = 1)',
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

    const institutionSheet = await this.createInstitutionSheet();
    F2.dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: false,
      formulae: [`=${institutionSheet.name}!$B$1:$B$${institutionSheet.rowCount}`],
    };
    G2.dataValidation = {
      type: "textLength",
      operator: "lessThan",
      showErrorMessage: true,
      error: "Must be less than 200 characters.",
      allowBlank: false,
      formulae: [200],
    };

    return sheet;
  }

  /**
   * Parses the data from Section A of the Excel workbook.
   */
  private async parseSectionA(): Promise<void> {
    const sheet = this.workbook.getWorksheet(SHEET_NAMES.A);
    if (!sheet) {
      Logger.info("parseSectionA: No sheet found for Section A");
    }

    // TODO: Mutate the data object with Section A data
    // Example: this.data.pi = { ... };
  }

  /**
   * Adds a hidden sheet which contains the full list of API provided institutions at function call.
   *
   * Columns:
   * - `A` – Institution ID
   * - `B` – Institution Name
   *
   * @returns An immutable internal reference to the sheet.
   */
  private async createInstitutionSheet(): Promise<Readonly<ExcelJS.Worksheet>> {
    let sheet = this.workbook.getWorksheet(SHEET_NAMES.institutions);
    if (!sheet) {
      sheet = this.workbook.addWorksheet(SHEET_NAMES.institutions, { state: "veryHidden" });

      const institutions = await this.getAPIInstitutions();
      institutions?.forEach((institution, index) => {
        sheet.getCell(`A${index + 1}`).value = institution._id;
        sheet.getCell(`B${index + 1}`).value = institution.name;
      });
    }

    return sheet;
  }

  /**
   * An internal utility to retrieve the Institution List from the dependencies
   *
   * @note This is error-safe
   * @returns The array of institutions
   */
  private async getAPIInstitutions(): Promise<Institution[]> {
    try {
      const { data } = (await this.dependencies.getInstitutions?.()) || {};
      return data?.listInstitutions?.institutions || [];
    } catch (error) {
      return [];
    }
  }
}
