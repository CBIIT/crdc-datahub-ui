import { LazyQueryExecFunction } from "@apollo/client";
import ExcelJS from "exceljs";
import { cloneDeep } from "lodash";

import sectionMetadata from "@/config/SectionMetadata";
import { ListInstitutionsResp } from "@/graphql";
import { Logger } from "@/utils/logger";

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

    // If an existing Submission Request is provided, add a metadata page
    if (this.data !== null && this.dependencies.application !== undefined) {
      Logger.info("serialize: Adding metadata sheet");
      await this.serializeMetadata();
    }

    // TODO: Implement the serialization logic Sections A-D
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
   * This method is called when an existing Submission Request is provided.
   * It will add a metadata page to the workbook with relevant information.
   *
   * @returns Promise<void>
   */
  private async serializeMetadata(): Promise<void> {
    const { application } = this.dependencies;

    // TODO: Was this page removed from the requirements?
    const sheet = this.workbook.addWorksheet("Metadata");

    sheet.columns = [
      { header: "Submission ID", key: "submissionId", width: 35 },
      { header: "Applicant", key: "applicantName", width: 30 },
      { header: "Status", key: "status", width: 8 },
      { header: "Created Date", key: "createdAt", width: 30 },
      { header: "Last Modified", key: "updatedAt", width: 30 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };

    sheet.getRow(2).getCell("submissionId").value = application._id;
    sheet.getRow(2).getCell("applicantName").value = application.applicant.applicantName;
    sheet.getRow(2).getCell("status").value = application.status;
    sheet.getRow(2).getCell("status").alignment = { horizontal: "center" };
    sheet.getRow(2).getCell("createdAt").value = application.createdAt;
    sheet.getRow(2).getCell("updatedAt").value = application.updatedAt;
  }

  /**
   * Adds the form section A to the Excel workbook.
   */
  private async serializeSectionA(): Promise<void> {
    this.workbook.addWorksheet(sectionMetadata.A.title);

    // TODO: Implement the logic to add Section A data
  }

  /**
   * Parses the data from Section A of the Excel workbook.
   */
  private async parseSectionA(): Promise<void> {
    const sheet = this.workbook.getWorksheet(sectionMetadata.A.title);
    if (!sheet) {
      Logger.info("parseSectionA: No sheet found for Section A");
    }

    // TODO: Mutate the data object with Section A data
    // Example: this.data.pi = { ... };
  }
}
