import env from "../env";

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
    console.error("parseReleaseVersion: REACT_APP_FE_VERSION is not set or is not a string");
    return "N/A";
  }

  const ReleaseRegex = /^(\d{1,4}\.\d{1,4}\.\d{1,4}).*/;
  if (!ReleaseRegex.test(REACT_APP_FE_VERSION)) {
    console.error(
      `parseReleaseVersion: REACT_APP_FE_VERSION is not in the expected format: ${REACT_APP_FE_VERSION}`
    );
    return "N/A";
  }

  const splitVersion = REACT_APP_FE_VERSION.match(ReleaseRegex);
  if (!splitVersion || splitVersion.length < 2 || !splitVersion[1]) {
    console.error(
      `parseReleaseVersion: Unable to get release version from build tag: ${REACT_APP_FE_VERSION}`
    );
    return "N/A";
  }

  return splitVersion[1];
};
