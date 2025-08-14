import { applicantFactory } from "@/factories/application/ApplicantFactory";
import { applicationFactory } from "@/factories/application/ApplicationFactory";

import { QuestionnaireExcelMiddleware, TEMPLATE_VERSION } from "./QuestionnaireExcelMiddleware";

vi.mock(import("@/env"), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    default: {
      ...mod.default,
      VITE_DEV_TIER: "mock-dev-tier",
    },
  };
});

describe("Serialization", () => {
  it("should set workbook metadata properties correctly during serialization", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-07T14:11:00Z"));

    const middleware = new QuestionnaireExcelMiddleware(null, {});

    // @ts-expect-error Private member
    await middleware.setMetadataProperties();

    // @ts-expect-error Private member
    const wb = middleware.workbook;

    expect(wb.creator).toEqual("crdc-datahub-ui");
    expect(wb.lastModifiedBy).toEqual("crdc-datahub-ui");
    expect(wb.title).toEqual("CRDC Submission Request");
    expect(wb.subject).toEqual("CRDC Submission Request Template");
    expect(wb.company).toEqual("National Cancer Institute");
    expect(wb.created).toEqual(new Date("2025-06-07T14:11:00Z"));
    expect(wb.modified).toEqual(new Date("2025-06-07T14:11:00Z"));

    vi.useRealTimers();
  });

  describe("Template", () => {
    it("should generate the metadata sheet with available data", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-07T17:34:00Z"));

      const middleware = new QuestionnaireExcelMiddleware(null, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeMetadata();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("Metadata")).toEqual(sheet);

      // All of these are empty in the template
      expect(sheet.getCell("A2").value).toBeNull();
      expect(sheet.getCell("B2").value).toBeNull();
      expect(sheet.getCell("C2").value).toBeNull();
      expect(sheet.getCell("D2").value).toBeNull();
      expect(sheet.getCell("E2").value).toBeNull();
      expect(sheet.getCell("F2").value).toBeNull();
      expect(sheet.getCell("G2").value).toBeNull();

      // Pre-filled data
      expect(sheet.getCell("H2").value).toEqual("mock-dev-tier");
      expect(sheet.getCell("I2").value).toEqual(TEMPLATE_VERSION);
      expect(sheet.getCell("J2").value).toEqual(new Date("2025-01-07T17:34:00Z").toISOString());

      vi.useRealTimers();
    });

    it.todo("should generate SectionA sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionB sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionC sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionD sheet", () => {}); // TODO: check dependency sheets
  });

  describe("With Data", () => {
    it("should generate the metadata sheet with pre-filled data", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-03-15T22:36:00Z"));

      const middleware = new QuestionnaireExcelMiddleware(null, {
        application: applicationFactory.build({
          _id: "a mock uuid",
          status: "In Progress",
          version: "1.5",
          applicant: applicantFactory.build({
            applicantID: "a-mock-uuid-for-id",
            applicantName: "a-mock-name of a user",
          }),
          createdAt: "2025-02-15T22:36:00Z",
          updatedAt: "2025-02-16T22:36:00Z",
        }),
      });

      // @ts-expect-error Private member
      const sheet = await middleware.serializeMetadata();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("Metadata")).toEqual(sheet);

      // All of these are empty in the template
      expect(sheet.getCell("A2").value).toEqual("a mock uuid");
      expect(sheet.getCell("B2").value).toEqual("a-mock-name of a user");
      expect(sheet.getCell("C2").value).toEqual("a-mock-uuid-for-id");
      expect(sheet.getCell("D2").value).toEqual("In Progress");
      expect(sheet.getCell("E2").value).toEqual("1.5");
      expect(sheet.getCell("F2").value).toEqual("2025-02-15T22:36:00Z");
      expect(sheet.getCell("G2").value).toEqual("2025-02-16T22:36:00Z");

      // Pre-filled data
      expect(sheet.getCell("H2").value).toEqual("mock-dev-tier");
      expect(sheet.getCell("I2").value).toEqual(TEMPLATE_VERSION);
      expect(sheet.getCell("J2").value).toEqual(new Date("2025-03-15T22:36:00Z").toISOString());

      vi.useRealTimers();
    });

    it.todo("should generate SectionA sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionB sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionC sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionD sheet with pre-filled data", () => {}); // TODO: check dependency sheets
  });
});

describe.todo("Importing");

describe.todo("Read-Write Symmetry");
