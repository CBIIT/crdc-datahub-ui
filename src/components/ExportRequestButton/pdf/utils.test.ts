import jsPDF from "jspdf";
import { FontResource } from "./Fonts";
import * as utils from "./utils";

const mockAddFileToVFS = jest.fn();
const mockAddFont = jest.fn();
const MockJsPDF = {
  addFileToVFS: (...p) => mockAddFileToVFS(...p),
  addFont: (...p) => mockAddFont(...p),
};

const baseFont: FontResource = {
  src: "",
  family: "mock-family",
  style: "normal",
  fontWeight: 500,
};

describe("loadFont", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.resetAllMocks();
  });

  it("should add the font to the jsPDF instance if the fetch is successful", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1)),
    } as unknown as Response);

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "http://example.com/font.ttf",
      family: "test-mock-family",
      fontWeight: 900,
    });

    expect(window.fetch).toHaveBeenCalledWith("http://example.com/font.ttf", {
      cache: "force-cache",
    });
    expect(mockAddFileToVFS).toHaveBeenCalledWith("test-mock-family", "AA==");
    expect(mockAddFont).toHaveBeenCalledWith("test-mock-family", "test-mock-family", "normal", 900);
  });

  it("should enforce heavy caching to avoid unnecessary network requests", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "https://example-fonts.com/font-abc.ttf",
    });

    expect(window.fetch).toHaveBeenCalledWith("https://example-fonts.com/font-abc.ttf", {
      cache: "force-cache",
    });
  });

  it("should not add the font to the jsPDF instance if an invalid font resource is provided (src)", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "",
    });

    expect(window.fetch).not.toHaveBeenCalled();
    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if an invalid font resource is provided (family)", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      family: "",
    });

    expect(window.fetch).not.toHaveBeenCalled();
    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if an invalid font resource is provided (style)", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      style: "",
    });

    expect(window.fetch).not.toHaveBeenCalled();
    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if an invalid font resource is provided (fontWeight)", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      fontWeight: 0,
    });

    expect(window.fetch).not.toHaveBeenCalled();
    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if the fetch fails", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue(new Response(null, { status: 404 }));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "http://example.com/font.ttf",
    });

    expect(window.fetch).toHaveBeenCalledWith("http://example.com/font.ttf", expect.any(Object));

    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if the fetch throws an exception", async () => {
    jest.spyOn(window, "fetch").mockRejectedValue(new Error("Mock fetch error"));

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "http://example.com/font.ttf",
    });

    expect(window.fetch).toHaveBeenCalledWith("http://example.com/font.ttf", expect.any(Object));

    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });

  it("should not add the font to the jsPDF instance if the arrayBuffer fails", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockRejectedValue(new Error("Mock arrayBuffer error")),
    } as unknown as Response);

    await utils.loadFont(MockJsPDF as unknown as jsPDF, {
      ...baseFont,
      src: "http://example.com/font.ttf",
    });

    expect(window.fetch).toHaveBeenCalledWith("http://example.com/font.ttf", expect.any(Object));

    expect(mockAddFileToVFS).not.toHaveBeenCalled();
    expect(mockAddFont).not.toHaveBeenCalled();
  });
});

describe("arrayBufferToBase64", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return a base64 string if the buffer is valid", () => {
    const buffer = new ArrayBuffer(1);
    const view = new Uint8Array(buffer);
    view[0] = 1;
    expect(utils.arrayBufferToBase64(buffer)).toBe("AQ==");
  });

  it("should return an empty string if the buffer argument is invalid", () => {
    const buffer = new ArrayBuffer(0);
    expect(utils.arrayBufferToBase64(buffer)).toBe("");
  });

  it.each(["", null, undefined, {}])(
    "should return an empty string if the buffer argument is not an ArrayBuffer",
    (arg) => {
      expect(utils.arrayBufferToBase64(arg as unknown as ArrayBuffer)).toBe("");
    }
  );

  it("should return an empty string if btoa fails", () => {
    jest.spyOn(window, "btoa").mockImplementation(() => {
      throw new Error("Mock btoa error");
    });

    const buffer = new ArrayBuffer(1);
    const view = new Uint8Array(buffer);
    view[0] = 1;
    expect(utils.arrayBufferToBase64(buffer)).toBe("");
  });
});
