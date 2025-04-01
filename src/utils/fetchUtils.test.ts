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

describe("authenticationLogout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully handle a successful logout request (API)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: true }),
    });

    expect(await utils.authenticationLogout()).toBe(true);
  });

  it("should handle a failed logout request (API)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: false }),
    });

    expect(await utils.authenticationLogout()).toBe(false);
  });

  it("should handle a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Test network error"));

    await expect(utils.authenticationLogout()).resolves.toBe(false);
  });

  it("should handle an abort error", async () => {
    global.fetch = jest.fn().mockRejectedValue({ name: "AbortError" });

    await expect(utils.authenticationLogout()).resolves.toBe(false);
  });

  it("should handle a json promise rejection", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error("Test json error")),
    });

    await expect(utils.authenticationLogout()).resolves.toBe(false);
  });
});

describe("authenticationLogin", () => {
  it("should successfully handle a successful login request (API)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ timeout: 1000, error: undefined }),
    });

    expect(await utils.authenticationLogin("test-code")).toEqual({
      success: true,
      error: undefined,
    });
  });

  it("should handle a failed login request (API)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ timeout: null, error: "Test login error" }),
    });

    expect(await utils.authenticationLogin("test-code")).toEqual({
      success: false,
      error: "Test login error",
    });
  });

  it("should handle a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Test network error"));

    await expect(utils.authenticationLogin("test-code")).resolves.toEqual({
      success: false,
      error: "An unknown error occurred during login.",
    });
  });

  it("should short-circuit on an abort signal", async () => {
    const abortController = new AbortController();
    const { signal } = abortController;

    global.fetch = jest
      .fn()
      .mockRejectedValue(new DOMException("The operation was aborted.", "AbortError")); // Simulate an abort error

    abortController.abort(); // Mark the signal was aborted so signal.aborted is true

    await expect(utils.authenticationLogin("test-code", signal)).resolves.toEqual({
      success: false,
      error: undefined,
    });
  });

  it("should handle failed json parsing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error("Test json error")),
    });

    await expect(utils.authenticationLogin("test-code")).resolves.toEqual({
      success: false,
      error: "An unknown error occurred during login.",
    });
  });
});
