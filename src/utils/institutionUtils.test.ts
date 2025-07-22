import { describe, it, expect, vi } from "vitest";

import {
  generateUUID,
  migrateContactInstitution,
  migrateQuestionnaireInstitutions,
  getInstitutionNameById,
  type NewInstitution,
} from "./institutionUtils";

// Mock data
const mockExistingInstitutions: Institution[] = [
  {
    _id: "existing-id-1",
    name: "Harvard University",
    status: "Active",
    submitterCount: 5,
  },
  {
    _id: "existing-id-2",
    name: "Stanford University",
    status: "Active",
    submitterCount: 3,
  },
];

const mockContact: Contact = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  position: "Researcher",
  institution: "Harvard University",
};

const mockPI: PI = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  position: "Principal Investigator",
  institution: "New Institution",
  ORCID: "0000-0000-0000-0000",
  address: "123 Main St",
};

describe("institutionUtils", () => {
  describe("generateUUID", () => {
    it("should generate a valid UUID v4", () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it("should work when crypto.randomUUID is not available", () => {
      const originalRandomUUID = global.crypto?.randomUUID;

      // Mock crypto to not have randomUUID
      Object.defineProperty(global.crypto, "randomUUID", {
        value: undefined,
        configurable: true,
      });

      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);

      // Restore original function
      if (originalRandomUUID) {
        Object.defineProperty(global.crypto, "randomUUID", {
          value: originalRandomUUID,
          configurable: true,
        });
      }
    });
  });

  describe("migrateContactInstitution", () => {
    it("should return contact as-is when no institution", () => {
      const contactWithoutInstitution = { ...mockContact, institution: undefined };
      const result = migrateContactInstitution(contactWithoutInstitution, mockExistingInstitutions);

      expect(result.contact).toEqual(contactWithoutInstitution);
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should return contact as-is when institution is empty", () => {
      const contactWithEmptyInstitution = { ...mockContact, institution: "" };
      const result = migrateContactInstitution(
        contactWithEmptyInstitution,
        mockExistingInstitutions
      );

      expect(result.contact).toEqual(contactWithEmptyInstitution);
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should return contact as-is when institution is already a UUID", () => {
      const uuidInstitution = "550e8400-e29b-41d4-a716-446655440000";
      const contactWithUUID = { ...mockContact, institution: uuidInstitution };
      const result = migrateContactInstitution(contactWithUUID, mockExistingInstitutions);

      expect(result.contact).toEqual(contactWithUUID);
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should replace with existing institution ID when name matches", () => {
      const result = migrateContactInstitution(mockContact, mockExistingInstitutions);

      expect(result.contact.institution).toBe("existing-id-1");
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should handle case-insensitive matching for existing institutions", () => {
      const contactWithDifferentCase = { ...mockContact, institution: "HARVARD UNIVERSITY" };
      const result = migrateContactInstitution(contactWithDifferentCase, mockExistingInstitutions);

      expect(result.contact.institution).toBe("existing-id-1");
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should create new institution when name doesn't match existing", () => {
      const contactWithNewInstitution = { ...mockContact, institution: "New University" };
      const result = migrateContactInstitution(contactWithNewInstitution, mockExistingInstitutions);

      expect(result.contact.institution).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(result.newInstitutions).toHaveLength(1);
      expect(result.newInstitutions[0].name).toBe("New University");
      expect(result.newInstitutions[0].id).toBe(result.contact.institution);
    });

    it("should reuse existing new institution when name matches", () => {
      const existingNewInstitutions: NewInstitution[] = [
        { id: "new-uuid-1", name: "New University" },
      ];
      const contactWithNewInstitution = { ...mockContact, institution: "New University" };
      const result = migrateContactInstitution(
        contactWithNewInstitution,
        mockExistingInstitutions,
        existingNewInstitutions
      );

      expect(result.contact.institution).toBe("new-uuid-1");
      expect(result.newInstitutions).toHaveLength(0);
    });

    it("should handle whitespace in institution names", () => {
      const contactWithWhitespace = { ...mockContact, institution: "  Harvard University  " };
      const result = migrateContactInstitution(contactWithWhitespace, mockExistingInstitutions);

      expect(result.contact.institution).toBe("existing-id-1");
      expect(result.newInstitutions).toHaveLength(0);
    });
  });

  describe("migrateQuestionnaireInstitutions", () => {
    it("should migrate all contacts in questionnaire data", () => {
      const questionnaireData: QuestionnaireData = {
        pi: mockPI,
        primaryContact: { ...mockContact, institution: "Stanford University" },
        additionalContacts: [
          { ...mockContact, institution: "New Institution 1" },
          { ...mockContact, institution: "Harvard University" },
          { ...mockContact, institution: "New Institution 2" },
        ],
        sections: [],
        piAsPrimaryContact: false,
        program: {},
        study: {
          name: "Test Study",
          abbreviation: "TS",
          description: "Test Description",
          publications: [],
          plannedPublications: [],
          repositories: [],
          funding: [],
          isDbGapRegistered: false,
          dbGaPPPHSNumber: "",
        },
        accessTypes: [],
        targetedSubmissionDate: "",
        targetedReleaseDate: "",
        timeConstraints: [],
        cancerTypes: [],
        otherCancerTypes: "",
        otherCancerTypesEnabled: false,
        preCancerTypes: "",
        numberOfParticipants: 0,
        species: [],
        otherSpeciesEnabled: false,
        otherSpeciesOfSubjects: "",
        cellLines: false,
        modelSystems: false,
        imagingDataDeIdentified: false,
        dataDeIdentified: false,
        dataTypes: [],
        otherDataTypes: "",
        clinicalData: {
          dataTypes: [],
          otherDataTypes: "",
          futureDataTypes: false,
        },
        files: [],
        submitterComment: "",
      };

      const result = migrateQuestionnaireInstitutions(questionnaireData, mockExistingInstitutions);

      // PI should get new institution ID (not in existing institutions)
      expect(result.questionnaireData.pi.institution).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      // Primary contact should get existing Stanford ID
      expect(result.questionnaireData.primaryContact.institution).toBe("existing-id-2");

      // Additional contacts
      expect(result.questionnaireData.additionalContacts[0].institution).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ); // New Institution 1
      expect(result.questionnaireData.additionalContacts[1].institution).toBe("existing-id-1"); // Harvard
      expect(result.questionnaireData.additionalContacts[2].institution).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ); // New Institution 2

      // Should have created 3 new institutions
      expect(result.newInstitutions).toHaveLength(3);
      expect(result.newInstitutions.map((i) => i.name)).toEqual(
        expect.arrayContaining(["New Institution", "New Institution 1", "New Institution 2"])
      );
    });

    it("should handle questionnaire data with no contacts needing migration", () => {
      const questionnaireData: QuestionnaireData = {
        pi: { ...mockPI, institution: undefined }, // No institution to migrate
        primaryContact: { ...mockContact, institution: undefined }, // No institution to migrate
        additionalContacts: [],
        sections: [],
        piAsPrimaryContact: false,
        program: {},
        study: {
          name: "Test Study",
          abbreviation: "TS",
          description: "Test Description",
          publications: [],
          plannedPublications: [],
          repositories: [],
          funding: [],
          isDbGapRegistered: false,
          dbGaPPPHSNumber: "",
        },
        accessTypes: [],
        targetedSubmissionDate: "",
        targetedReleaseDate: "",
        timeConstraints: [],
        cancerTypes: [],
        otherCancerTypes: "",
        otherCancerTypesEnabled: false,
        preCancerTypes: "",
        numberOfParticipants: 0,
        species: [],
        otherSpeciesEnabled: false,
        otherSpeciesOfSubjects: "",
        cellLines: false,
        modelSystems: false,
        imagingDataDeIdentified: false,
        dataDeIdentified: false,
        dataTypes: [],
        otherDataTypes: "",
        clinicalData: {
          dataTypes: [],
          otherDataTypes: "",
          futureDataTypes: false,
        },
        files: [],
        submitterComment: "",
      };

      const result = migrateQuestionnaireInstitutions(questionnaireData, mockExistingInstitutions);

      expect(result.newInstitutions).toHaveLength(0);
      expect(result.questionnaireData.pi.institution).toBeUndefined();
      expect(result.questionnaireData.primaryContact.institution).toBeUndefined();
    });
  });

  describe("getInstitutionNameById", () => {
    const newInstitutions: NewInstitution[] = [
      { id: "new-id-1", name: "New Institution 1" },
      { id: "new-id-2", name: "New Institution 2" },
    ];

    it("should return empty string for empty ID", () => {
      const result = getInstitutionNameById("", mockExistingInstitutions, newInstitutions);
      expect(result).toBe("");
    });

    it("should return name for existing institution ID", () => {
      const result = getInstitutionNameById(
        "existing-id-1",
        mockExistingInstitutions,
        newInstitutions
      );
      expect(result).toBe("Harvard University");
    });

    it("should return name for new institution ID", () => {
      const result = getInstitutionNameById("new-id-1", mockExistingInstitutions, newInstitutions);
      expect(result).toBe("New Institution 1");
    });

    it("should return ID when not found in either list", () => {
      const unknownId = "unknown-id";
      const result = getInstitutionNameById(unknownId, mockExistingInstitutions, newInstitutions);
      expect(result).toBe(unknownId);
    });

    it("should work without new institutions array", () => {
      const result = getInstitutionNameById("existing-id-2", mockExistingInstitutions);
      expect(result).toBe("Stanford University");
    });
  });
});
