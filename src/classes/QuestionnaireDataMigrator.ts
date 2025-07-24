import { LazyQueryExecFunction } from "@apollo/client";
import { cloneDeep } from "lodash";
import { validate as validateUUID } from "uuid";

import { ListInstitutionsInput, ListInstitutionsResp } from "@/graphql";
import { Logger } from "@/utils/logger";

/**
 * The required dependencies to run data migrations
 */
type MigratorDependencies = {
  getInstitutions: LazyQueryExecFunction<ListInstitutionsResp, ListInstitutionsInput>;
};

/**
 * A specialized class to handle data migrations of QuestionnaireData
 */
export class QuestionnaireDataMigrator {
  /**
   * The QuestionnaireData object that will be migrated.
   */
  private data: QuestionnaireData;

  /**
   * The dependencies required for migration, such as fetching institutions.
   * This allows the migrator to be decoupled from specific data-fetching implementations.
   */
  private dependencies: MigratorDependencies;

  /**
   * Creates an instance of the QuestionnaireDataMigrator.
   *
   * @param data The QuestionnaireData object to be migrated.
   * @param dependencies The migration dependencies
   */
  constructor(data: QuestionnaireData, dependencies: MigratorDependencies) {
    this.data = cloneDeep(data);
    this.dependencies = dependencies;
  }

  /**
   * Executes all migration steps in a predefined order.
   *
   * @returns The fully migrated questionnaireData object.
   */
  public async run(): Promise<QuestionnaireData> {
    await this._migrateInstitutionsToID();
    await this._migrateInstitutionNames();

    return this.data;
  }

  /**
   * Migrates institution names to IDs in the questionnaireData.
   */
  private async _migrateInstitutionsToID(): Promise<void> {
    const { pi, primaryContact, additionalContacts } = this.data;
    const { getInstitutions } = this.dependencies;

    const outdatedContacts = [pi, primaryContact, ...(additionalContacts || [])].filter(
      (obj) => obj && !!obj.institution && !validateUUID(obj.institutionID)
    );
    if (outdatedContacts.length === 0) {
      return;
    }

    const { data } = await getInstitutions();
    const institutionList = data?.listInstitutions?.institutions || [];
    if (institutionList.length === 0) {
      Logger.error("_migrateInstitutionsToID: No institutions found for migration");
      return;
    }

    outdatedContacts.forEach((contact) => {
      const { institution } = contact;

      // Find the institution by name
      const apiData = institutionList.find((i) => i.name === institution);
      if (validateUUID(apiData?._id)) {
        contact.institutionID = apiData._id;
        Logger.info("_migrateInstitutionsToID: Migrated institution", { ...contact }, apiData);
        return;
      }

      Logger.error("_migrateInstitutionsToID: Unable to find a matching institution", contact);
    });
  }

  /**
   * Updates any outdated institution names in the questionnaireData.
   */
  private async _migrateInstitutionNames(): Promise<void> {
    const { pi, primaryContact, additionalContacts } = this.data;
    const { getInstitutions } = this.dependencies;

    const contactsWithUUID = [pi, primaryContact, ...(additionalContacts || [])].filter(
      (obj) => obj && validateUUID(obj.institutionID)
    );
    if (contactsWithUUID.length === 0) {
      return;
    }

    const { data } = await getInstitutions();
    const institutionList = data?.listInstitutions?.institutions || [];
    if (institutionList.length === 0) {
      Logger.error("_migrateInstitutionNames: No institutions found for migration");
      return;
    }

    contactsWithUUID.forEach((contact) => {
      const { institutionID } = contact;

      // Find the institution by ID
      const apiData = institutionList.find((i) => i._id === institutionID);
      if (!!apiData?.name && apiData.name !== contact.institution) {
        contact.institution = apiData.name;
        Logger.info("_migrateInstitutionNames: Updated institution name", { ...contact }, apiData);
      }
    });
  }
}
