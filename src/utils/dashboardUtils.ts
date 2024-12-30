import { DashboardContentOptions } from "amazon-quicksight-embedding-sdk";
import { Logger } from "./logger";

/**
 * A helper that decides whether to add the "studiesParameter" for
 * roles that require assigned studies (e.g., Federal Lead).
 *
 * @param {User} user - The current user
 * @returns {DashboardContentOptions["parameters"]} The updated dashboard parameters
 */
export const addStudiesParameter = (user: User): DashboardContentOptions["parameters"] => {
  const params: DashboardContentOptions["parameters"] = [];
  const { studies } = user || {};

  // If "All" is the first study, do NOT push the "studiesParameter"
  if (studies?.[0]?._id === "All") {
    return params;
  }

  // Otherwise, push a real or fallback param
  if (Array.isArray(studies) && studies.length > 0) {
    params.push({
      Name: "studiesParameter",
      Values: studies.map((s) => s._id),
    });
    return params;
  }

  Logger.error(
    "Federal Lead requires studies to be set but none or invalid values were found.",
    studies
  );
  params.push({ Name: "studiesParameter", Values: ["NO-CONTENT"] });
  return params;
};

/**
 * A helper that decides whether to add the "dataCommonsParameter" for
 * Data Commons Personnel.
 *
 * @param {User} user - The current user
 * @returns {DashboardContentOptions["parameters"]} The updated dashboard parameters
 */
export const addDataCommonsParameter = (user: User): DashboardContentOptions["parameters"] => {
  const params: DashboardContentOptions["parameters"] = [];
  const { dataCommons } = user || {};

  if (Array.isArray(dataCommons) && dataCommons.length > 0) {
    params.push({ Name: "dataCommonsParameter", Values: dataCommons });
    return params;
  }

  Logger.error(
    "Data Commons Personnel requires dataCommons to be set but none were found.",
    dataCommons
  );
  params.push({ Name: "dataCommonsParameter", Values: ["NO-CONTENT"] });
  return params;
};
