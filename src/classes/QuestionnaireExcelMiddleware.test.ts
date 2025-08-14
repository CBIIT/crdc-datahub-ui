import { QuestionnaireExcelMiddleware } from "./QuestionnaireExcelMiddleware";

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
    it.todo("should generate the metadata sheet with pre-filled data", () => {});

    it.todo("should generate SectionA sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionB sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionC sheet", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionD sheet", () => {}); // TODO: check dependency sheets
  });

  describe("With Data", () => {
    it.todo("should generate the metadata sheet with pre-filled data", () => {});

    it.todo("should generate SectionA sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionB sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionC sheet with pre-filled data", () => {}); // TODO: check dependency sheets

    it.todo("should generate SectionD sheet with pre-filled data", () => {}); // TODO: check dependency sheets
  });
});

describe.todo("Importing");

describe.todo("Read-Write Symmetry");
