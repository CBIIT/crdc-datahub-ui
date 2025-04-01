import env from "../env";
import { buildReleaseNotesUrl } from "./envUtils";
import { Logger } from "./logger";

/**
 * A utility function to fetch the release notes document from GitHub.
 *
 * @see Utilizes {@link buildReleaseNotesUrl} to build the URL to fetch the release notes document.
 * @note Handles caching the release notes document in {@link sessionStorage}.
 * @param signal An optional AbortSignal to cancel the fetch request
 * @returns The release notes document as a string
 * @throws An error if the fetch request fails
 */
export const fetchReleaseNotes = async (signal?: AbortSignal): Promise<string> => {
  const cachedNotes = sessionStorage.getItem("releaseNotes");
  if (cachedNotes) {
    return cachedNotes;
  }

  const url: string = buildReleaseNotesUrl();
  const response = await fetch(url, { method: "GET", signal });
  if (!response.ok || response.status !== 200) {
    throw new Error(`Failed to fetch release notes: HTTP Error ${response.status}`);
  }

  const md = await response.text();
  if (!md || md.length === 0) {
    throw new Error("Release notes document is empty.");
  }

  sessionStorage.setItem("releaseNotes", md);
  return md;
};

/**
 * Performs a authentication logout request to the authentication service.
 *
 * @param signal An optional AbortSignal to cancel the fetch request
 * @returns A boolean indicating if the logout was successful
 */
export const authenticationLogout = async (signal?: AbortSignal): Promise<boolean> => {
  const response = await fetch(`${window.origin}/api/authn/logout`, {
    method: "POST",
    signal,
  }).catch((error) => {
    if (error.name === "AbortError") {
      return;
    }

    Logger.error("Failed to logout user.", error);
  });

  if (!response || !response?.ok) {
    return false;
  }

  const { status } = await response.json().catch(() => ({}));
  return status || false;
};

/**
 * Performs a authentication login request to the authentication service.
 *
 * @param code The authorization code used to verify login
 * @param signal An optional AbortSignal to cancel the fetch request
 * @returns An object containing a boolean indicating if the login was successful and an error message
 */
export const authenticationLogin = async (
  code: string,
  signal?: AbortSignal
): Promise<{ success: boolean; error: string }> => {
  const response = await fetch(`${window.origin}/api/authn/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      IDP: "nih",
      redirectUri: env.REACT_APP_NIH_REDIRECT_URL,
    }),
    signal,
  }).catch((error) => {
    if (error.name === "AbortError") {
      return;
    }

    Logger.error("Failed to login user.", error);
  });

  if (signal?.aborted) {
    return { success: false, error: undefined };
  }

  if (!response) {
    return { success: false, error: "An unknown error occurred during login." };
  }

  const { timeout, error } = await response.json().catch(() => ({
    timeout: null,
    error: "An unknown error occurred during login.",
  }));
  return { success: typeof timeout === "number" && typeof error === "undefined", error };
};
