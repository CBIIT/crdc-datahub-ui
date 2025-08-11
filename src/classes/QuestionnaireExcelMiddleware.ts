import { LazyQueryExecFunction } from "@apollo/client";
import ExcelJS from "exceljs";
import { cloneDeep, merge } from "lodash";

import cancerTypeOptions from "@/config/CancerTypesConfig";
import { NotApplicableProgram, OtherProgram } from "@/config/ProgramConfig";
import speciesOptions from "@/config/SpeciesConfig";
import env from "@/env";
import { ListInstitutionsResp, ListOrgsInput, ListOrgsResp } from "@/graphql";
import { questionnaireDataSchema } from "@/schemas/Application";
import { Logger } from "@/utils/logger";
import { parseSchemaObject } from "@/utils/zodUtils";

import { SectionA } from "./Excel/A/SectionA";
import columns from "./Excel/B/Columns";
import { SectionB } from "./Excel/B/SectionB";
import { SectionC } from "./Excel/C/SectionC";
import { SectionD } from "./Excel/D/SectionD";
import { SectionCtxBase } from "./Excel/SectionBase";

/**
 * An internal template version identifier.
 */
const TEMPLATE_VERSION = "1.0";

/**
 * The names of the HIDDEN sheets used in the Excel workbook.
 * Primarily used for hidden lists.
 */
export const HIDDEN_SHEET_NAMES = {
  institutions: "InstitutionList",
  programs: "ProgramList",
} as const;

/**
 * The names of the sheets used in the Excel workbook.
 */
const SHEET_NAMES = {
  ...HIDDEN_SHEET_NAMES,
  meta: "Metadata",
  A: "PI and Contact",
  B: "Program and Study",
} as const;

/**
 * The required dependencies to import or export a Submission Request.
 */
export type MiddlewareDependencies = {
  application?: Omit<Application, "QuestionnaireData">;
  getPrograms?: LazyQueryExecFunction<ListOrgsResp, ListOrgsInput>;
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
  private data: QuestionnaireData | RecursivePartial<QuestionnaireData> | null;

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
    await this.serializeSectionB();
    await this.serializeSectionC();
    await this.serializeSectionD();

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

    // Load the workbook from the ArrayBuffer
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    // Create an instance with null data, then assign the loaded workbook
    const middleware = new QuestionnaireExcelMiddleware(null, dependencies);
    middleware.workbook = workbook;
    await middleware.parseSectionB();

    return middleware;
  }

  /**
   * Sets the metadata properties for the Excel workbook.
   *
   * @returns Promise<void>
   */
  private async setMetadataProperties(): Promise<void> {
    this.workbook.creator = "crdc-datahub-ui";
    this.workbook.lastModifiedBy = "crdc-datahub-ui";
    this.workbook.title = "CRDC Submission Request";
    this.workbook.subject = "CRDC Submission Request Template";
    this.workbook.company = "National Cancer Institute";
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
    const ctx: SectionCtxBase = {
      workbook: this.workbook,
      u: {
        header: (ws: ExcelJS.Worksheet, color?: string) => {
          const r1 = ws.getRow(1);
          r1.font = { bold: true };
          r1.alignment = { horizontal: "center" };
          r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        },
      },
    };

    const sectionA = new SectionA({
      data: this.data as QuestionnaireData,
      institutionSheet: await this.createInstitutionSheet(),
    });

    return sectionA.serialize(ctx);
  }

  /**
   * Serializes Section B data into the Excel workbook.
   *
   * @returns The serialized worksheet for Section B.
   */
  private async serializeSectionB(): Promise<Readonly<ExcelJS.Worksheet>> {
    const ctx: SectionCtxBase = {
      workbook: this.workbook,
      u: {
        header: (ws: ExcelJS.Worksheet, color?: string) => {
          const r1 = ws.getRow(1);
          r1.font = { bold: true };
          r1.alignment = { horizontal: "center" };
          r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        },
      },
    };

    const sectionB = new SectionB({
      data: this.data as QuestionnaireData,
      programSheet: await this.createProgramsSheet(),
    });

    const sheet = await sectionB.serialize(ctx);

    return sheet;
  }

  /**
   * Adds the form section C to the Excel workbook.
   *
   * @returns A readonly reference to the created worksheet.
   */
  private async serializeSectionC(): Promise<Readonly<ExcelJS.Worksheet>> {
    const ctx: SectionCtxBase = {
      workbook: this.workbook,
      u: {
        header: (ws: ExcelJS.Worksheet, color?: string) => {
          const r1 = ws.getRow(1);
          r1.font = { bold: true };
          r1.alignment = { horizontal: "center" };
          r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        },
      },
    };

    const sectionC = new SectionC({
      data: this.data as QuestionnaireData,
      cancerTypes: cancerTypeOptions,
      species: speciesOptions,
    });

    return sectionC.serialize(ctx);
  }

  private async serializeSectionD(): Promise<Readonly<ExcelJS.Worksheet>> {
    const ctx: SectionCtxBase = {
      workbook: this.workbook,
      u: {
        header: (ws: ExcelJS.Worksheet, color?: string) => {
          const r1 = ws.getRow(1);
          r1.font = { bold: true };
          r1.alignment = { horizontal: "center" };
          r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        },
      },
    };

    const sectionD = new SectionD({
      data: this.data as QuestionnaireData,
      programSheet: await this.createProgramsSheet(),
    });

    const sheet = await sectionD.serialize(ctx);

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
   * Parses the data from Section B of the Excel workbook.
   *
   * @returns A Promise that resolves to a boolean indicating success or failure of the parsing.
   */
  private async parseSectionB(): Promise<boolean> {
    const ws = this.workbook.getWorksheet(SHEET_NAMES.B);
    if (!ws) {
      Logger.info("parseSectionB: No sheet found for Section B");
      return Promise.resolve(false);
    }

    const data = await this.extractValuesFromWorksheet(ws);
    const newData = new Map();
    // Swap the column headers for the column keys in the mapping
    data.forEach((values, key) => {
      const colKey = columns.find((col) => col.header === key)?.key;
      newData.set(
        colKey,
        values.map((value) => String(value).trim())
      );
    });
    const newMapping = SectionB.mapValues(newData, {
      programSheet: await this.createProgramsSheet(),
    });

    const result: RecursivePartial<QuestionnaireData> = parseSchemaObject(
      questionnaireDataSchema,
      newMapping
    );

    this.data = merge({}, this.data, result);

    return Promise.resolve(true);
  }

  /**
   * Adds a hidden sheet which contains the full list of API provided institutions at function call.
   *
   * Columns:
   * - `A` - Institution ID
   * - `B` - Institution Name
   *
   * @returns An immutable internal reference to the sheet.
   */
  private async createInstitutionSheet(): Promise<Readonly<ExcelJS.Worksheet>> {
    let sheet = this.workbook.getWorksheet(HIDDEN_SHEET_NAMES.institutions);
    if (!sheet) {
      sheet = this.workbook.addWorksheet(HIDDEN_SHEET_NAMES.institutions, { state: "veryHidden" });

      const institutions = await this.getAPIInstitutions();
      institutions?.forEach((institution, index) => {
        sheet.getCell(`A${index + 1}`).value = institution._id;
        sheet.getCell(`B${index + 1}`).value = institution.name;
      });
    }

    return sheet;
  }

  /**
   * Adds a hidden sheet which contains the full list of API provided programs at function call.
   *
   * Columns:
   * - `A` - Program ID
   * - `B` - Program Name
   *
   * @returns The created worksheet.
   */
  private async createProgramsSheet(): Promise<Readonly<ExcelJS.Worksheet>> {
    let sheet = this.workbook.getWorksheet(HIDDEN_SHEET_NAMES.programs);
    if (!sheet) {
      sheet = this.workbook.addWorksheet(HIDDEN_SHEET_NAMES.programs, { state: "veryHidden" });

      const programs = await this.getAPIPrograms();
      const fullPrograms: ProgramInput[] = [NotApplicableProgram, ...programs, OtherProgram];

      fullPrograms.forEach((program, index) => {
        const row = index + 1;

        sheet.getCell(`A${row}`).value = program._id || "";
        sheet.getCell(`B${row}`).value = program.name || "";
        sheet.getCell(`C${row}`).value = program.abbreviation || "";
        sheet.getCell(`D${row}`).value = program.description || "";

        // Set the formula for the Program name to default to Program ID if empty
        sheet.getCell(`E${row}`).value = {
          formula: `IF(LEN(TRIM(B${row}))>0,B${row},A${row})`,
        };
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

  /**
   * Retrieves the list of programs from the dependencies.
   *
   * @note This excludes 'readOnly' programs from the program list.
   * @returns The array of programs.
   */
  private async getAPIPrograms(): Promise<Organization[]> {
    try {
      const { data } = (await this.dependencies.getPrograms?.()) || {};
      return (
        (data?.listPrograms?.programs as Organization[])?.filter((program) => !program.readOnly) ||
        []
      );
    } catch (error) {
      return [];
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async extractValuesFromWorksheet(
    ws: ExcelJS.Worksheet
  ): Promise<Map<string, Array<unknown>>> {
    const data = new Map<string, Array<unknown>>();
    const headerRow = ws.getRow(1);
    const headers = headerRow.values;

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (!header) {
          // Invalid data, ignore
          return;
        }

        const existingValues = data.get(header) || [];
        data.set(header, [...existingValues, cell.value]);
      });
    });

    return data;
  }
}
