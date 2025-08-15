import { waitFor } from "@testing-library/react";

import { applicantFactory } from "@/factories/application/ApplicantFactory";
import { applicationFactory } from "@/factories/application/ApplicationFactory";
import { contactFactory } from "@/factories/application/ContactFactory";
import { piFactory } from "@/factories/application/PIFactory";
import { questionnaireDataFactory } from "@/factories/application/QuestionnaireDataFactory";
import { Logger } from "@/utils";

import { SectionAColumns } from "./Excel/A/SectionA";
import {
  HIDDEN_SHEET_NAMES,
  QuestionnaireExcelMiddleware,
  TEMPLATE_VERSION,
} from "./QuestionnaireExcelMiddleware";

vi.mock(import("@/env"), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    default: {
      ...mod.default,
      VITE_DEV_TIER: "mock-dev-tier",
    },
  };
});

vi.mock("@/utils/logger", () => ({
  Logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Serialization", () => {
  it("should set workbook metadata properties correctly during serialization", async () => {
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
  });

  describe("Template", () => {
    it("should generate the metadata sheet with available data", async () => {
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
    });

    it("should generate SectionA sheet with all dependent sheets", async () => {
      const mockInstitutions = vi.fn().mockResolvedValue([]);

      const middleware = new QuestionnaireExcelMiddleware(null, {
        getInstitutions: mockInstitutions,
      });

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);
      expect(wb.getWorksheet(HIDDEN_SHEET_NAMES.institutions)).toBeDefined();
      expect(mockInstitutions).toHaveBeenCalled();

      // NOTE: Values are 1-indexed, need to use a empty value at 0 index
      // eslint-disable-next-line no-sparse-arrays
      expect(sheet.getRow(1).values).toEqual([, ...SectionAColumns.map((col) => col.header)]);
    });

    it.todo("should generate SectionB sheet with all dependent sheets", () => {});

    it.todo("should generate SectionC sheet with all dependent sheets", () => {});

    it.todo("should generate SectionD sheet with all dependent sheets", () => {});
  });

  describe("With Data", () => {
    it("should generate the metadata sheet with pre-filled data", async () => {
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

      expect(sheet.getCell("A2").value).toEqual("a mock uuid");
      expect(sheet.getCell("B2").value).toEqual("a-mock-name of a user");
      expect(sheet.getCell("C2").value).toEqual("a-mock-uuid-for-id");
      expect(sheet.getCell("D2").value).toEqual("In Progress");
      expect(sheet.getCell("E2").value).toEqual("1.5");
      expect(sheet.getCell("F2").value).toEqual("2025-02-15T22:36:00Z");
      expect(sheet.getCell("G2").value).toEqual("2025-02-16T22:36:00Z");
      expect(sheet.getCell("H2").value).toEqual("mock-dev-tier");
      expect(sheet.getCell("I2").value).toEqual(TEMPLATE_VERSION);
      expect(sheet.getCell("J2").value).toEqual(new Date("2025-03-15T22:36:00Z").toISOString());
    });

    it("should generate SectionA sheet with all data", async () => {
      const mockForm = questionnaireDataFactory.build({
        pi: piFactory.build({
          firstName: "benjamin",
          lastName: "bunny",
          position: "Some PI Position",
          email: "benjamin.bunny@example.com",
          ORCID: "1234-5678-9012-3456",
          institution: "A Mock Institution",
          address: "123 Bunny Lane, Bunnyville, USA 20001",
        }),
        piAsPrimaryContact: false,
        primaryContact: contactFactory.build({
          firstName: "Radish",
          lastName: "Rabbit",
          position: "Some Contact Position",
          email: "radish.rabbit@example.com",
          institution: "Another Mock Institution",
          phone: "957-123-9393",
        }),
        additionalContacts: contactFactory.build(3, (idx) => ({
          firstName: `Contact ${idx + 1} First`,
          lastName: `Contact ${idx + 1} Last`,
          position: `Contact ${idx + 1} Position`,
          email: `contact${idx + 1}@example.com`,
          institution: `Contact ${idx + 1} Institution`,
          phone: `555-123-${9000 + idx}`,
        })),
      });
      const middleware = new QuestionnaireExcelMiddleware(mockForm, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);

      // PI
      expect(sheet.getCell("A2").value).toEqual("benjamin");
      expect(sheet.getCell("B2").value).toEqual("bunny");
      expect(sheet.getCell("C2").value).toEqual("Some PI Position");
      expect(sheet.getCell("D2").value).toEqual("benjamin.bunny@example.com");
      expect(sheet.getCell("E2").value).toEqual("1234-5678-9012-3456");
      expect(sheet.getCell("F2").value).toEqual("A Mock Institution");
      expect(sheet.getCell("G2").value).toEqual("123 Bunny Lane, Bunnyville, USA 20001");

      // Primary Contact
      expect(sheet.getCell("H2").value).toEqual("No");
      expect(sheet.getCell("I2").value).toEqual("Radish");
      expect(sheet.getCell("J2").value).toEqual("Rabbit");
      expect(sheet.getCell("K2").value).toEqual("Some Contact Position");
      expect(sheet.getCell("L2").value).toEqual("radish.rabbit@example.com");
      expect(sheet.getCell("M2").value).toEqual("Another Mock Institution");
      expect(sheet.getCell("N2").value).toEqual("957-123-9393");

      // Additional Contacts x3
      expect(sheet.getColumn("O").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 First",
        "Contact 2 First",
        "Contact 3 First",
      ]);
      expect(sheet.getColumn("P").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Last",
        "Contact 2 Last",
        "Contact 3 Last",
      ]);
      expect(sheet.getColumn("Q").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Position",
        "Contact 2 Position",
        "Contact 3 Position",
      ]);
      expect(sheet.getColumn("R").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "contact1@example.com",
        "contact2@example.com",
        "contact3@example.com",
      ]);
      expect(sheet.getColumn("S").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Institution",
        "Contact 2 Institution",
        "Contact 3 Institution",
      ]);
      expect(sheet.getColumn("T").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "555-123-9000",
        "555-123-9001",
        "555-123-9002",
      ]);
    });

    it("should generate SectionA sheet with partial data (only PI)", async () => {
      const mockForm = questionnaireDataFactory.build({
        pi: piFactory.build({
          firstName: "benjamin",
          lastName: "bunny",
          position: "Some PI Position",
          email: "benjamin.bunny@example.com",
          ORCID: "1234-5678-9012-3456",
          institution: "A Mock Institution",
          address: "123 Bunny Lane, Bunnyville, USA 20001",
        }),
        piAsPrimaryContact: null,
        primaryContact: null,
        additionalContacts: null,
      });
      const middleware = new QuestionnaireExcelMiddleware(mockForm, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);

      // PI
      expect(sheet.getCell("A2").value).toEqual("benjamin");
      expect(sheet.getCell("B2").value).toEqual("bunny");
      expect(sheet.getCell("C2").value).toEqual("Some PI Position");
      expect(sheet.getCell("D2").value).toEqual("benjamin.bunny@example.com");
      expect(sheet.getCell("E2").value).toEqual("1234-5678-9012-3456");
      expect(sheet.getCell("F2").value).toEqual("A Mock Institution");
      expect(sheet.getCell("G2").value).toEqual("123 Bunny Lane, Bunnyville, USA 20001");
    });

    it("should generate SectionA sheet with partial data (only Primary Contact)", async () => {
      const mockForm = questionnaireDataFactory.build({
        pi: null,
        piAsPrimaryContact: false,
        primaryContact: contactFactory.build({
          firstName: "Radish",
          lastName: "Rabbit",
          position: "Some Contact Position",
          email: "radish.rabbit@example.com",
          institution: "Another Mock Institution",
          phone: "957-123-9393",
        }),
        additionalContacts: null,
      });
      const middleware = new QuestionnaireExcelMiddleware(mockForm, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);

      // Primary Contact
      expect(sheet.getCell("H2").value).toEqual("No");
      expect(sheet.getCell("I2").value).toEqual("Radish");
      expect(sheet.getCell("J2").value).toEqual("Rabbit");
      expect(sheet.getCell("K2").value).toEqual("Some Contact Position");
      expect(sheet.getCell("L2").value).toEqual("radish.rabbit@example.com");
      expect(sheet.getCell("M2").value).toEqual("Another Mock Institution");
      expect(sheet.getCell("N2").value).toEqual("957-123-9393");
    });

    it("should generate SectionA sheet with partial data (only Additional Contacts)", async () => {
      const mockForm = questionnaireDataFactory.build({
        pi: null,
        piAsPrimaryContact: true,
        primaryContact: null,
        additionalContacts: contactFactory.build(3, (idx) => ({
          firstName: `Contact ${idx + 1} First`,
          lastName: `Contact ${idx + 1} Last`,
          position: `Contact ${idx + 1} Position`,
          email: `contact${idx + 1}@example.com`,
          institution: `Contact ${idx + 1} Institution`,
          phone: `555-123-${9000 + idx}`,
        })),
      });
      const middleware = new QuestionnaireExcelMiddleware(mockForm, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);

      // Additional Contacts x3
      expect(sheet.getColumn("O").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 First",
        "Contact 2 First",
        "Contact 3 First",
      ]);
      expect(sheet.getColumn("P").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Last",
        "Contact 2 Last",
        "Contact 3 Last",
      ]);
      expect(sheet.getColumn("Q").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Position",
        "Contact 2 Position",
        "Contact 3 Position",
      ]);
      expect(sheet.getColumn("R").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "contact1@example.com",
        "contact2@example.com",
        "contact3@example.com",
      ]);
      expect(sheet.getColumn("S").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "Contact 1 Institution",
        "Contact 2 Institution",
        "Contact 3 Institution",
      ]);
      expect(sheet.getColumn("T").values).toEqual([
        undefined, // 1-indexed
        expect.any(String), // Header
        "555-123-9000",
        "555-123-9001",
        "555-123-9002",
      ]);
    });

    it("should generate SectionA sheet with partial data (All null)", async () => {
      const mockForm = questionnaireDataFactory.build({
        pi: piFactory.build({
          firstName: null,
          lastName: null,
          position: null,
          email: null,
          ORCID: null,
          institution: null,
          address: null,
        }),
        piAsPrimaryContact: null,
        primaryContact: contactFactory.build({
          firstName: null,
          lastName: null,
          position: null,
          email: null,
          institution: null,
          phone: null,
        }),
        additionalContacts: contactFactory.build(3, () => ({
          firstName: null,
          lastName: null,
          position: null,
          email: null,
          institution: null,
          phone: null,
        })),
      });
      const middleware = new QuestionnaireExcelMiddleware(mockForm, {});

      // @ts-expect-error Private member
      const sheet = await middleware.serializeSectionA();

      // @ts-expect-error Private member
      const wb = middleware.workbook;
      expect(wb.getWorksheet("PI and Contact")).toEqual(sheet);

      // PI
      expect(sheet.getCell("A2").value).toBeNull();
      expect(sheet.getCell("B2").value).toBeNull();
      expect(sheet.getCell("C2").value).toBeNull();
      expect(sheet.getCell("D2").value).toBeNull();
      expect(sheet.getCell("E2").value).toBeNull();
      expect(sheet.getCell("F2").value).toBeNull();
      expect(sheet.getCell("G2").value).toBeNull();

      // Primary Contact
      expect(sheet.getCell("H2").value).toEqual("No"); // Default value
      expect(sheet.getCell("I2").value).toBeNull();
      expect(sheet.getCell("J2").value).toBeNull();
      expect(sheet.getCell("K2").value).toBeNull();
      expect(sheet.getCell("L2").value).toBeNull();
      expect(sheet.getCell("M2").value).toBeNull();
      expect(sheet.getCell("N2").value).toBeNull();

      // Additional Contacts x3
      expect(sheet.getColumn("O").values.length).toBe(2); // 1-indexed and header only
      expect(sheet.getColumn("P").values.length).toBe(2);
      expect(sheet.getColumn("Q").values.length).toBe(2);
      expect(sheet.getColumn("R").values.length).toBe(2);
      expect(sheet.getColumn("S").values.length).toBe(2);
      expect(sheet.getColumn("T").values.length).toBe(2);
    });

    it.todo("should generate SectionB sheet with pre-filled data", () => {});

    it.todo("should generate SectionC sheet with pre-filled data", () => {});

    it.todo("should generate SectionD sheet with pre-filled data", () => {});
  });
});

describe("Parsing", () => {
  it("should parse the metadata section correctly", async () => {
    vi.setSystemTime(new Date("2025-03-15T22:36:00Z"));

    const middleware = new QuestionnaireExcelMiddleware(null, {});

    // @ts-expect-error Private member
    const sheet = await middleware.serializeMetadata();

    // Modify columns to force different values
    sheet.getCell("A2").value = "some uuid";
    sheet.getCell("H2").value = "invalid dev tier";
    sheet.getCell("I2").value = "invalid template version";

    // @ts-expect-error Private member
    middleware.dependencies.application = applicationFactory.build({
      _id: "a different uuid",
    });

    // @ts-expect-error Private member
    await middleware.parseMetadata();

    await waitFor(() => {
      expect(Logger.info).toHaveBeenCalled();
    });

    expect(Logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Received mismatched devTier."),
      expect.objectContaining({
        expected: "mock-dev-tier",
        received: "invalid dev tier",
      })
    );
    expect(Logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Received mismatched templateVersion."),
      expect.objectContaining({
        expected: expect.any(String), // Internal variable
        received: "invalid template version",
      })
    );
    expect(Logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Received mismatched submissionId."),
      expect.objectContaining({
        expected: "a different uuid",
        received: "some uuid",
      })
    );
  });
});

describe.todo("Read-Write Symmetry");
