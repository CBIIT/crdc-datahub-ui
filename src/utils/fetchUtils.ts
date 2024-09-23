import { buildReleaseNotesUrl } from "./envUtils";

/**
 * A utility function to fetch the release notes document from GitHub.
 *
 * @see Utilizes {@link buildReleaseNotesUrl} to build the URL to fetch the release notes document.
 * @note Handles caching the release notes document in {@link sessionStorage}.
 * @param signal An optional AbortSignal to cancel the fetch request
 * @returns The release notes document as a string or an Error object
 */
export const fetchReleaseNotes = async (signal?: AbortSignal): Promise<string | Error> => {
  if (sessionStorage.getItem("releaseNotes")) {
    return sessionStorage.getItem("releaseNotes");
  }

  const url: string = buildReleaseNotesUrl();
  const response = await fetch(url, { method: "GET", signal }).catch((err: Error) => err);
  if (response instanceof Error) {
    return response;
  }
  if (!response.ok || response.status !== 200) {
    return new Error(`Failed to fetch release notes: ${response.status}`);
  }

  const md = await response.text().catch(() => null);
  if (!md || md.length === 0) {
    return new Error("Release notes document is empty.");
  }

  sessionStorage.setItem("releaseNotes", md);
  return md;
};
