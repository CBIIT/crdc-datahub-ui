/**
 * Utility functions for institution management, UUID generation, and migration logic
 */

/**
 * Generate a UUID v4 using the Web Crypto API
 * @returns {string} A UUID v4 string
 */
export const generateUUID = (): string => {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID (like some test environments)
  // eslint-disable-next-line no-bitwise
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Type for new institutions that need to be created
 */
export type NewInstitution = {
  id: string;
  name: string;
};

/**
 * Result of institution migration process
 */
export type MigrationResult = {
  /** The migrated contact with institution ID */
  contact: Contact;
  /** New institutions that were created during migration */
  newInstitutions: NewInstitution[];
};

/**
 * Migrate a contact's institution from name to ID
 * @param contact - The contact to migrate
 * @param existingInstitutions - List of existing institutions
 * @param existingNewInstitutions - List of new institutions already created
 * @returns MigrationResult with migrated contact and any new institutions
 */
export const migrateContactInstitution = (
  contact: Contact,
  existingInstitutions: Institution[],
  existingNewInstitutions: NewInstitution[] = []
): MigrationResult => {
  // If contact has no institution, return as-is
  if (!contact?.institution) {
    return {
      contact: { ...contact },
      newInstitutions: [],
    };
  }

  const institutionValue = contact.institution.trim();

  // If institution is already a UUID (contains dashes in UUID pattern), assume it's an ID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(institutionValue)) {
    return {
      contact: { ...contact },
      newInstitutions: [],
    };
  }

  // Check if institution name matches an existing institution
  const existingInstitution = existingInstitutions.find(
    (inst) => inst.name.toLowerCase().trim() === institutionValue.toLowerCase()
  );

  if (existingInstitution) {
    // Replace with existing institution ID
    return {
      contact: {
        ...contact,
        institution: existingInstitution._id,
      },
      newInstitutions: [],
    };
  }

  // Check if we already created a new institution with this name
  const existingNewInstitution = existingNewInstitutions.find(
    (inst) => inst.name.toLowerCase().trim() === institutionValue.toLowerCase()
  );

  if (existingNewInstitution) {
    // Use the existing new institution ID
    return {
      contact: {
        ...contact,
        institution: existingNewInstitution.id,
      },
      newInstitutions: [],
    };
  }

  // Create a new institution
  const newInstitution: NewInstitution = {
    id: generateUUID(),
    name: institutionValue,
  };

  return {
    contact: {
      ...contact,
      institution: newInstitution.id,
    },
    newInstitutions: [newInstitution],
  };
};

/**
 * Result of PI institution migration process
 */
export type PIMigrationResult = {
  /** The migrated PI with institution ID */
  contact: PI;
  /** New institutions that were created during migration */
  newInstitutions: NewInstitution[];
};

/**
 * Migrate a PI's institution from name to ID
 * @param pi - The PI to migrate
 * @param existingInstitutions - List of existing institutions
 * @param existingNewInstitutions - List of new institutions already created
 * @returns PIMigrationResult with migrated PI and any new institutions
 */
export const migratePIInstitution = (
  pi: PI,
  existingInstitutions: Institution[],
  existingNewInstitutions: NewInstitution[] = []
): PIMigrationResult => {
  // Convert PI to Contact-like object for migration, then convert back
  const contactLike: Contact = {
    firstName: pi.firstName,
    lastName: pi.lastName,
    email: pi.email,
    position: pi.position,
    institution: pi.institution,
    phone: "", // PI doesn't have phone, but we need it for Contact interface
  };

  const migration = migrateContactInstitution(
    contactLike,
    existingInstitutions,
    existingNewInstitutions
  );

  const migratedPI: PI = {
    ...pi,
    institution: migration.contact.institution,
  };

  return {
    contact: migratedPI,
    newInstitutions: migration.newInstitutions,
  };
};

/**
 * Migrate all contacts in questionnaire data from institution names to IDs
 * @param questionnaireData - The questionnaire data to migrate
 * @param existingInstitutions - List of existing institutions
 * @returns Object with migrated questionnaire data and new institutions
 */
export const migrateQuestionnaireInstitutions = (
  questionnaireData: QuestionnaireData,
  existingInstitutions: Institution[]
): {
  questionnaireData: QuestionnaireData;
  newInstitutions: NewInstitution[];
} => {
  const allNewInstitutions: NewInstitution[] = [];
  const migratedData = { ...questionnaireData };

  // Migrate PI institution
  if (migratedData.pi?.institution) {
    const piMigration = migratePIInstitution(
      migratedData.pi,
      existingInstitutions,
      allNewInstitutions
    );
    migratedData.pi = piMigration.contact;
    allNewInstitutions.push(...piMigration.newInstitutions);
  }

  // Migrate primary contact institution
  if (migratedData.primaryContact?.institution) {
    const primaryMigration = migrateContactInstitution(
      migratedData.primaryContact,
      existingInstitutions,
      allNewInstitutions
    );
    migratedData.primaryContact = primaryMigration.contact;
    allNewInstitutions.push(...primaryMigration.newInstitutions);
  }

  // Migrate additional contacts institutions
  if (migratedData.additionalContacts?.length > 0) {
    migratedData.additionalContacts = migratedData.additionalContacts.map((contact) => {
      const migration = migrateContactInstitution(
        contact,
        existingInstitutions,
        allNewInstitutions
      );
      allNewInstitutions.push(...migration.newInstitutions);
      return migration.contact;
    });
  }

  return {
    questionnaireData: migratedData,
    newInstitutions: allNewInstitutions,
  };
};

/**
 * Get institution name by ID from existing institutions or new institutions
 * @param institutionId - The institution ID to look up
 * @param existingInstitutions - List of existing institutions
 * @param newInstitutions - List of new institutions
 * @returns The institution name or the ID if not found
 */
export const getInstitutionNameById = (
  institutionId: string,
  existingInstitutions: Institution[],
  newInstitutions: NewInstitution[] = []
): string => {
  if (!institutionId) {
    return "";
  }

  // Check existing institutions
  const existingInstitution = existingInstitutions.find((inst) => inst._id === institutionId);
  if (existingInstitution) {
    return existingInstitution.name;
  }

  // Check new institutions
  const newInstitution = newInstitutions.find((inst) => inst.id === institutionId);
  if (newInstitution) {
    return newInstitution.name;
  }

  // If not found, return the ID (fallback for display)
  return institutionId;
};
