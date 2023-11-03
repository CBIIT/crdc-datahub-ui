import { MODEL_FILE_REPO } from '../config/DataCommons';
import env from '../env';

/**
 * Fetch the tracked Data Model content manifest.
 *
 * @returns The parsed content manifest.
 * @throws An error if the manifest cannot be fetched.
 */
export const fetchManifest = async (): Promise<DataModelManifest> => {
  if (sessionStorage.getItem("manifest")) {
    return JSON.parse(sessionStorage.getItem("manifest"));
  }

  const response = await fetch(`${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/content.json`).catch(() => null);
  const parsed = await response?.json() || {};
  if (response && parsed) {
    sessionStorage.setItem("manifest", JSON.stringify(parsed));
    return parsed;
  }

  throw new Error("Unable to fetch manifest");
};
