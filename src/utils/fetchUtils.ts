import { buildReleaseNotesUrl } from "./envUtils";

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
  if (sessionStorage.getItem("releaseNotes")) {
    return sessionStorage.getItem("releaseNotes");
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
