import * as utils from "./fetchUtils";

describe("fetchReleaseNotes", () => {
  const mockReleaseNotes = "# Release Notes\n\n- Feature 1\n- Feature 2";

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it("should successfully handle fetching of release notes", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(mockReleaseNotes),
    });

    expect(await utils.fetchReleaseNotes()).toBe(mockReleaseNotes);
  });

  it("should cache successful responses in sessionStorage", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(mockReleaseNotes),
    });

    expect(sessionStorage.getItem("releaseNotes")).toBeNull();

    await utils.fetchReleaseNotes();

    expect(sessionStorage.getItem("releaseNotes")).toBe(mockReleaseNotes);
  });

  it("should return cached release notes from sessionStorage", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");

    sessionStorage.setItem("releaseNotes", mockReleaseNotes);

    const result = await utils.fetchReleaseNotes();

    expect(result).toBe(mockReleaseNotes);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should forward fetch errors", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Test network error"));

    await expect(utils.fetchReleaseNotes()).rejects.toThrow("Test network error");
  });

  it("should handle non-200 HTTP responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(utils.fetchReleaseNotes()).rejects.toThrow(
      "Failed to fetch release notes: HTTP Error 404"
    );
  });

  it("should handle an empty release notes document", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(""),
    });

    await expect(utils.fetchReleaseNotes()).rejects.toThrow("Release notes document is empty.");
  });

  it("should  handle an error thrown while retrieving the response text", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockRejectedValue(new Error("some mock text error")),
    });

    await expect(utils.fetchReleaseNotes()).rejects.toThrow("some mock text error");
  });
});
