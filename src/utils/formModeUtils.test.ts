import { InitialApplication, InitialQuestionnaire } from "../config/InitialValues";
import * as utils from "./formModeUtils";

describe("getFormMode tests based on provided requirements", () => {
  const baseUser: Omit<User, "role"> = {
    _id: "user-123",
    firstName: "John",
    lastName: "Doe",
    userStatus: "Active" as User["userStatus"],
    email: "johndoe@example.com",
    IDP: "nih",
    createdAt: "2023-05-01T09:23:30Z",
    updateAt: "2023-05-02T09:23:30Z",
    organization: {
      orgID: "org1",
      orgName: "TestOrg",
      status: "Active",
      createdAt: "2023-05-01T09:23:30Z",
      updateAt: "2023-05-02T09:23:30Z",
    },
    dataCommons: [],
  };

  // submission created by baseUser and part of the same org
  const baseSubmission: Application = {
    ...InitialApplication,
    _id: "submission-123",
    questionnaireData: InitialQuestionnaire,
    status: "New",
    organization: {
      _id: baseUser.organization.orgID,
      name: baseUser.organization.orgName,
    },
    applicant: {
      applicantID: baseUser._id,
      applicantName: baseUser.firstName,
      applicantEmail: baseUser.email,
    },
    createdAt: "2023-05-01T09:23:30Z",
    updatedAt: "2023-05-02T09:23:30Z",
  };

  // User Tests
  describe("getFormMode > User tests", () => {
    const user: User = { ...baseUser, role: "User" };

    it("should allow User to edit when form status is New", () => {
      expect(utils.getFormMode(user, baseSubmission)).toBe(utils.FormModes.EDIT);
    });

    it("should set View Only for User when form is Submitted, In Review, Approved, or Rejected", () => {
      const statuses: ApplicationStatus[] = ["Submitted", "In Review", "Approved", "Rejected"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });

    it("should allow User to edit when form status is New, In Progress or Inquired", () => {
      const statuses: ApplicationStatus[] = ["New", "In Progress", "Inquired"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(utils.FormModes.EDIT);
      });
    });

    it("should be Unauthorized for User when User does not own the Submission", () => {
      const submission: Application = {
        ...baseSubmission,
        status: "In Progress",
        applicant: {
          ...baseSubmission.applicant,
          applicantID: "user-456-another-user",
        },
      };

      expect(utils.getFormMode(user, submission)).toBe(utils.FormModes.UNAUTHORIZED);
    });
  });

  // Submitter Tests
  describe("getFormMode > Submitter tests", () => {
    const user: User = { ...baseUser, role: "Submitter" };

    it("should allow Submitter to edit when form status is New", () => {
      expect(utils.getFormMode(user, baseSubmission)).toBe(utils.FormModes.EDIT);
    });

    it("should set View Only for Submitter when form is Submitted, In Review, Approved, or Rejected", () => {
      const statuses: ApplicationStatus[] = ["Submitted", "In Review", "Approved", "Rejected"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });

    it("should allow Submitter to edit when form status is New, In Progress, or Inquired", () => {
      const statuses: ApplicationStatus[] = ["New", "In Progress", "Inquired"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(utils.FormModes.EDIT);
      });
    });
  });

  // Federal Lead Tests
  describe("getFormMode > Fed Lead tests", () => {
    const user: User = { ...baseUser, role: "Federal Lead" };

    it("should set Review mode for Fed Lead when status is Submitted or In Review", () => {
      const statuses: ApplicationStatus[] = ["Submitted", "In Review"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(utils.FormModes.REVIEW);
      });
    });

    it("should set View Only mode for Fed Lead for all other statuses", () => {
      const statuses: ApplicationStatus[] = [
        "New",
        "Approved",
        "In Progress",
        "Rejected",
        "Inquired",
      ];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });

    it("should be View Only mode for any Submission when Fed Lead does not own the Submission", () => {
      const submission: Application = {
        ...baseSubmission,
        status: "In Progress",
        applicant: {
          ...baseSubmission.applicant,
          applicantID: "user-456-another-user",
        },
      };

      expect(utils.getFormMode(user, submission)).toBe(utils.FormModes.VIEW_ONLY);
    });
  });

  // Org Owner Tests
  describe("getFormMode > Org Owner tests", () => {
    const user: User = { ...baseUser, role: "Organization Owner" };

    it("should allow Org Owner to edit their own unsubmitted or inquired forms", () => {
      const statuses: ApplicationStatus[] = ["New", "In Progress", "Inquired"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(utils.FormModes.EDIT);
      });
    });

    it("should set View Only for Org Owner when form is Submitted, In Review, Approved, or Rejected", () => {
      const statuses: ApplicationStatus[] = ["Submitted", "In Review", "Approved", "Rejected"];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });

    it("should be View Only mode for any Submission when Org Owner does not own the Submission", () => {
      const submission: Application = {
        ...baseSubmission,
        status: "In Progress",
        applicant: {
          ...baseSubmission.applicant,
          applicantID: "user-456-another-user",
        },
      };

      expect(utils.getFormMode(user, submission)).toBe(utils.FormModes.VIEW_ONLY);
    });
  });

  // Admin Tests
  describe("getFormMode > Admin tests", () => {
    const user: User = { ...baseUser, role: "Admin" };

    it("should always set View Only for Admin", () => {
      const statuses: ApplicationStatus[] = [
        "New",
        "Submitted",
        "In Review",
        "Approved",
        "In Progress",
        "Rejected",
        "Inquired",
      ];

      statuses.forEach((status) => {
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });

    it("should be View Only mode for any Submission when Admin does not own the Submission", () => {
      const submission: Application = {
        ...baseSubmission,
        status: "In Progress",
        applicant: {
          ...baseSubmission.applicant,
          applicantID: "user-456-another-user",
        },
      };

      expect(utils.getFormMode(user, submission)).toBe(utils.FormModes.VIEW_ONLY);
    });
  });

  // Other role Tests
  describe("getFormMode > Other roles tests", () => {
    it("should always set View Only for all other roles", () => {
      const roles: User["role"][] = [
        "Data Commons POC",
        "Some other role",
        "This role doesn't exist",
      ] as unknown as User["role"][];
      const statuses: ApplicationStatus[] = [
        "New",
        "In Progress",
        "Submitted",
        "In Review",
        "Approved",
        "Rejected",
        "Inquired",
      ];

      roles.forEach((role) => {
        const user: User = { ...baseUser, role };
        statuses.forEach((status) => {
          expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
            utils.FormModes.VIEW_ONLY
          );
        });
      });
    });
  });

  // New Rejected status tests
  describe("getFormMode > New Rejected status test", () => {
    it("rejected is a final state, no role should be able to do anything past rejected", () => {
      const roles: User["role"][] = [
        "Data Commons POC",
        "Some other role",
        "This role doesn't exist",
      ] as unknown as User["role"][];
      const status: ApplicationStatus = "Rejected";

      roles.forEach((role) => {
        const user: User = { ...baseUser, role };
        expect(utils.getFormMode(user, { ...baseSubmission, status })).toBe(
          utils.FormModes.VIEW_ONLY
        );
      });
    });
  });

  // New Inquired status tests
  describe("getFormMode > New Inquired status test", () => {
    it("inquired should be read only for Fed Lead but not for the submission request owner", () => {
      const submission: Application = {
        ...baseSubmission,
        status: "Inquired",
        applicant: {
          ...baseSubmission.applicant,
          applicantID: "user-456-another-user",
        },
      };
      const fedLead: User = { ...baseUser, role: "Organization Owner" };
      const submitterOwner: User = {
        ...baseUser,
        role: "Submitter",
        _id: "user-456-another-user",
      };
      const orgOwnerSubmissionOwner: User = {
        ...baseUser,
        role: "Organization Owner",
        _id: "user-456-another-user",
      };

      expect(utils.getFormMode(fedLead, submission)).toBe(utils.FormModes.VIEW_ONLY);
      expect(utils.getFormMode(submitterOwner, submission)).toBe(utils.FormModes.EDIT);
      expect(utils.getFormMode(orgOwnerSubmissionOwner, submission)).toBe(utils.FormModes.EDIT);
    });
  });

  // Edge case Tests
  describe("getFormMode > Edge Case Tests", () => {
    describe("getFormMode > Edge Case Tests > Invalid data tests", () => {
      it("should set Unauthorized when a null User is provided", () => {
        expect(utils.getFormMode(null, baseSubmission)).toBe(utils.FormModes.UNAUTHORIZED);
      });

      it("should set Unauthorized when a null data Submission is provided", () => {
        const user: User = { ...baseUser, role: "User" };

        expect(utils.getFormMode(user, null)).toBe(utils.FormModes.UNAUTHORIZED);
      });

      it("should set Unauthorized when a null data Submission and User is provided", () => {
        expect(utils.getFormMode(null, null)).toBe(utils.FormModes.UNAUTHORIZED);
      });

      it("should set Unauthorized form if user role is undefined", () => {
        const user: User = { ...baseUser, role: undefined };

        expect(utils.getFormMode(user, baseSubmission)).toBe(utils.FormModes.UNAUTHORIZED);
      });

      it("should set Unauthorized if form status is unknown or not defined", () => {
        const user: User = { ...baseUser, role: "User" };
        const submission: Application = {
          ...baseSubmission,
          status: undefined,
        };

        expect(utils.getFormMode(user, submission)).toBe(utils.FormModes.UNAUTHORIZED);
      });
    });
  });
});
