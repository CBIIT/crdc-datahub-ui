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
   * Gets the mutated QuestionnaireData object.
   * This method is primarily for testing purposes to verify the migration results.
   *
   * @returns The mutated QuestionnaireData object.
   */
  public getData(): QuestionnaireData {
    return this.data;
  }

  /**
   * Gets the dependencies used by the migrator.
   * This method is useful for testing or further operations that may require the same dependencies.
   *
   * @returns The dependencies used by the migrator, useful for testing or further operations.
   */
  public getDependencies(): MigratorDependencies {
    return this.dependencies;
  }

  /**
   * Migrates institution names to IDs in the questionnaireData.
   *
   * @private Do not call this method directly; use the `run` method instead.
   */
  async _migrateInstitutionsToID(): Promise<void> {
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
        Logger.info("_migrateInstitutionsToID: Migrating institution", { ...contact }, apiData);
        contact.institutionID = apiData._id;
        return;
      }

      Logger.error("_migrateInstitutionsToID: Unable to find a matching institution", contact);
    });
  }

  /**
   * Updates any outdated institution names in the questionnaireData.
   */
  async _migrateInstitutionNames(): Promise<void> {
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
        Logger.info("_migrateInstitutionNames: Updating institution name", { ...contact }, apiData);
        contact.institution = apiData.name;
      } else if (!apiData) {
        Logger.error("_migrateInstitutionNames: Unable to find a matching institution", contact);
      }
    });
  }
}
