import env from "../env";
import { Logger } from "./logger";

/**
 * A regular expression to match the release version from the build tag.
 *
 * @see {@link parseReleaseVersion} for a usage example.
 */
export const ReleaseRegex = /^(\d{1,4}\.\d{1,4}\.\d{1,4}).*/;

/**
 * Safely parse the release version from the environment variable.
 * If it is not set, return an empty string.
 *
 * @note This utility expects the current tag to be defined as `X.X.X.buildNumber`.
 * @see {@link AppEnv.REACT_APP_FE_VERSION}
 * @returns The parsed release version or "N/A" if not set.
 */
export const parseReleaseVersion = (): string => {
  const { REACT_APP_FE_VERSION } = env || {};

  if (!REACT_APP_FE_VERSION || typeof REACT_APP_FE_VERSION !== "string") {
    Logger.error("parseReleaseVersion: REACT_APP_FE_VERSION is not set or is not a string");
    return "N/A";
  }

  if (!ReleaseRegex.test(REACT_APP_FE_VERSION)) {
    Logger.error(
      `parseReleaseVersion: REACT_APP_FE_VERSION is not in the expected format: ${REACT_APP_FE_VERSION}`
    );
    return "N/A";
  }

  const splitVersion = REACT_APP_FE_VERSION.match(ReleaseRegex);
  if (!splitVersion || splitVersion.length < 2 || !splitVersion[1]) {
    Logger.error(
      `parseReleaseVersion: Unable to get release version from build tag: ${REACT_APP_FE_VERSION}`
    );
    return "N/A";
  }

  return splitVersion[1];
};

/**
 * A utility to build the Release Notes Markdown URL based on the current build tag.
 *
 * @note If the build tag is not set or is not in the expected format, it will default to the main branch instead of a tag.
 * @returns The URL to the Release Notes Markdown file.
 */
export const buildReleaseNotesUrl = (): string => {
  const { REACT_APP_FE_VERSION } = env || {};

  if (
    REACT_APP_FE_VERSION &&
    typeof REACT_APP_FE_VERSION === "string" &&
    ReleaseRegex.test(REACT_APP_FE_VERSION)
  ) {
    return `https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/tags/${REACT_APP_FE_VERSION}/CHANGELOG.md`;
  }

  return "https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/heads/main/CHANGELOG.md";
};
