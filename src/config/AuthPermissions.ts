import { checkPermissionKey } from "../utils/authUtils";
import {
  Roles as ALL_ROLES,
  CanDeleteOtherSubmissionRequests,
  CanSubmitOnlyTheirOwnSubmissionRequestRoles,
} from "./AuthRoles";

/**
 * A flag indicating that no conditions, other than the user having the permission key, need to be met.
 */
const NO_CONDITIONS = "NO CONDITIONS";

type ScopeOption = {
  own: null;
  study: ApprovedStudy;
  DC: null;
  role: UserRole;
};

type Entity = keyof Permissions;
type ScopeKey = keyof ScopeOption;
type NonNullUnion = Exclude<ScopeOption[ScopeKey], null>;
type ScopeSelector = "all" | "none";

type PermissionNone<S> = S extends "none" ? { scope: "none"; scopeValues: null } : never;
type PermissionAll<S> = S extends "all" ? { scope: "all"; scopeValues: NonNullUnion[] } : never;
type PermissionArray<S> = S extends readonly ScopeKey[]
  ? { scope: S; scopeValues: Array<Exclude<ScopeOption[S[number]], null>> }
  : never;

type PermissionOpts<S extends ScopeSelector | ScopeKey[] = ScopeSelector | ScopeKey[]> =
  | PermissionNone<S>
  | PermissionAll<S>
  | PermissionArray<S>;

type PermissionCheck<Key extends keyof Permissions> =
  | typeof NO_CONDITIONS
  | ((user: User, data: Permissions[Key]["dataType"], config: PermissionConfig) => boolean);

type PermissionConfig<S extends ScopeSelector | ScopeKey[] = ScopeSelector | ScopeKey[]> = {
  data?: Permissions[keyof Permissions]["dataType"];
  onlyKey?: boolean;
  opts?: PermissionOpts<S>;
};

type PermissionMap = {
  [Key in keyof Permissions]: Partial<{
    [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
  }>;
};

type Permissions = {
  access: {
    dataType: null;
    action: "request";
  };
  dashboard: {
    dataType: null;
    action: "view";
  };
  submission_request: {
    dataType: Application | Omit<Application, "questionnaireData">;
    action: "view" | "create" | "submit" | "review" | "cancel";
  };
  data_submission: {
    dataType: Submission;
    action: "view" | "create" | "review" | "admin_submit" | "confirm" | "cancel";
  };
  user: {
    dataType: null;
    action: "manage";
  };
  program: {
    dataType: null;
    action: "manage";
  };
  study: {
    dataType: null;
    action: "manage";
  };
  institution: {
    dataType: null;
    action: "manage";
  };
};

export const PERMISSION_MAP = {
  submission_request: {
    view: NO_CONDITIONS,
    create: NO_CONDITIONS,
    submit: (user, application) => {
      const { role } = user;
      const isFormOwner = application?.applicant?.applicantID === user?._id;
      const hasPermissionKey = checkPermissionKey(user, "submission_request:submit");
      const submitStatuses: ApplicationStatus[] = ["In Progress", "Inquired"];

      if (!submitStatuses?.includes(application?.status)) {
        return false;
      }

      if (CanSubmitOnlyTheirOwnSubmissionRequestRoles.includes(role)) {
        return isFormOwner && hasPermissionKey;
      }

      return hasPermissionKey;
    },
    review: NO_CONDITIONS,
    cancel: (user, application) => {
      const hasPermissionKey = checkPermissionKey(user, "submission_request:cancel");
      if (!hasPermissionKey) {
        return false;
      }

      const isFormOwner = application?.applicant?.applicantID === user?._id;
      if (!isFormOwner && !CanDeleteOtherSubmissionRequests.includes(user?.role)) {
        return false;
      }

      const statusActionMap: Record<ApplicationStatus, UserRole[]> = {
        New: ALL_ROLES,
        "In Progress": ALL_ROLES,
        Inquired: ALL_ROLES,
        Submitted: ["Admin", "Federal Lead", "Data Commons Personnel"],
        "In Review": ["Admin", "Federal Lead", "Data Commons Personnel"],
        Canceled: ALL_ROLES,
        Deleted: ALL_ROLES,
        Approved: [],
        Rejected: [],
      };

      return statusActionMap[application?.status]?.includes(user?.role) ?? false;
    },
  },
  dashboard: {
    view: NO_CONDITIONS,
  },
  data_submission: {
    view: NO_CONDITIONS,
    create: (user, submission) => {
      const hasPermissionKey = checkPermissionKey(user, "data_submission:create");
      const isSubmissionOwner = submission?.submitterID === user?._id;
      const isCollaborator = submission?.collaborators?.some((c) => c.collaboratorID === user?._id);

      if (isCollaborator) {
        return true;
      }
      if (isSubmissionOwner && hasPermissionKey) {
        return true;
      }

      return false;
    },
    review: (user, submission) => {
      const { role, dataCommons, studies } = user;
      const hasPermissionKey = checkPermissionKey(user, "data_submission:review");

      if (role === "Federal Lead" && hasPermissionKey) {
        return studies?.some((s) => s._id === submission.studyID || s._id === "All");
      }
      if (role === "Data Commons Personnel" && hasPermissionKey) {
        return dataCommons?.some((dc) => dc === submission?.dataCommons);
      }
      if (role === "Admin" && hasPermissionKey) {
        return true;
      }

      return false;
    },
    admin_submit: (user, submission) => {
      const { role, dataCommons, studies } = user;
      const hasPermissionKey = checkPermissionKey(user, "data_submission:admin_submit");

      if (role === "Federal Lead" && hasPermissionKey) {
        return studies?.some((s) => s._id === submission.studyID || s._id === "All");
      }
      if (role === "Data Commons Personnel" && hasPermissionKey) {
        return dataCommons?.some((dc) => dc === submission?.dataCommons);
      }
      if (role === "Admin" && hasPermissionKey) {
        return true;
      }

      return false;
    },
    confirm: (user, submission) => {
      const { role, dataCommons, studies } = user;
      const hasPermissionKey = checkPermissionKey(user, "data_submission:confirm");

      if (role === "Federal Lead" && hasPermissionKey) {
        return studies?.some((s) => s._id === submission.studyID || s._id === "All");
      }
      if (role === "Data Commons Personnel" && hasPermissionKey) {
        return dataCommons?.some((dc) => dc === submission?.dataCommons);
      }
      if (role === "Admin" && hasPermissionKey) {
        return true;
      }

      return false;
    },
    cancel: (user, submission) => {
      const { role, dataCommons, studies } = user;
      const hasPermissionKey = checkPermissionKey(user, "data_submission:cancel");
      const isSubmissionOwner = submission?.submitterID === user?._id;
      const isCollaborator = submission?.collaborators?.some((c) => c.collaboratorID === user?._id);

      if (isCollaborator) {
        return true;
      }
      if (role === "Submitter" && isSubmissionOwner && hasPermissionKey) {
        return true;
      }
      if (role === "Federal Lead" && hasPermissionKey) {
        return studies?.some((s) => s._id === submission.studyID || s._id === "All");
      }
      if (role === "Data Commons Personnel" && hasPermissionKey) {
        return dataCommons?.some((dc) => dc === submission?.dataCommons);
      }
      if (role === "Admin" && hasPermissionKey) {
        return true;
      }

      return false;
    },
  },
  access: {
    request: NO_CONDITIONS,
  },
  user: {
    manage: NO_CONDITIONS,
  },
  program: {
    manage: NO_CONDITIONS,
  },
  study: {
    manage: NO_CONDITIONS,
  },
  institution: {
    manage: NO_CONDITIONS,
  },
} as const satisfies PermissionMap;

/**
 * Determines if a user has the necessary permission to perform a specific action on a resource.
 *
 * @template E - A key of `Permissions` for the target resource.
 * @template A - An action from `Permissions[E]["action"]`.
 * @param {User} user - The user attempting the action.
 * @param {E} entity - The resource name (e.g. `"submission_request"`).
 * @param {A} action - The specific action to check (e.g. `"create"`, `"submit"`).
 * @param {PermissionConfig<S>} [config]
 *   Optional configuration:
 *   - `data` (`Permissions[E]["dataType"]`): payload for dynamic checks.
 *   - `onlyKey` (`boolean`): if true, skip all logic except the permission key.
 *   - `opts` (`PermissionOpts<S>`): scope filters (`scope` + `scopeValues`).
 * @returns {boolean} `true` if the user is authorized; otherwise `false`.
 *
 * @example
 * // Key-only check:
 * hasPermission(user, "submission_request", "create", { onlyKey: true });
 *
 * @example
 * // Data + scope check:
 * hasPermission(user, "data_submission", "create", {
 *   data: submission,
 *   opts: { scope: ["role"], scopeValues: ["Submitter", "Admin"] },
 * });

 */
export const hasPermission = <
  E extends Entity,
  A extends Permissions[E]["action"],
  S extends ScopeSelector | ScopeKey[] = ScopeSelector | ScopeKey[],
>(
  user: User,
  entity: E,
  action: A,
  config?: PermissionConfig<S>
): boolean => {
  if (!user?.role) {
    return false;
  }

  const { data = null, onlyKey = false } = config || {};

  const permission = (PERMISSION_MAP as PermissionMap)?.[entity]?.[action];
  const permissionKey = `${entity}:${action}`;

  // If no conditions need to be checked, just check if user has permission key
  if (onlyKey || permission === NO_CONDITIONS) {
    return checkPermissionKey(user, permissionKey);
  }

  // If permission not defined, then deny permission
  if (permission == null) {
    return false;
  }

  // Check conditions
  return !!data && permission(user, data, config);
};
