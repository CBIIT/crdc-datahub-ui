import { cloneDeep } from "lodash";

/**
 * Prepare the Application dataset for the API
 *
 * @param data full Application dataset
 * @returns {ApplicationInput} removes fields that should not be sent to the API
 */
export const omitForApi = (data : Application) => {
  const newObj = cloneDeep(data);

  if (!newObj?.["_id"] || newObj?.["_id"] === "new") {
    delete newObj["_id"];
  }

  if (newObj.status !== "Approved") {
    delete newObj["programLevelApproval"];
  }

  delete newObj["status"];
  delete newObj["reviewComment"];
  delete newObj["createdAt"];
  delete newObj["updatedAt"];
  delete newObj["submittedDate"];
  delete newObj["history"];
  delete newObj["applicant"];
  delete newObj["organization"];

  return {
    application: newObj,
  };
};
