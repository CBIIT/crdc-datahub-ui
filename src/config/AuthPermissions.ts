type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: User, data: Permissions[Key]["dataType"]) => boolean);

type RolesWithPermissions = {
  [R in UserRole]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
    }>;
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
    dataType: Application;
    action: "view" | "create" | "submit" | "review";
  };
  data_submission: {
    dataType: Submission;
    action: "view" | "create" | "review" | "admin_submit" | "confirm";
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
};

export const ROLES = {
  "Federal Lead": {
    submission_request: {
      view: true,
      create: true,
      submit: true,
      review: true,
    },
    dashboard: {
      view: true,
    },
    data_submission: {
      view: true,
      create: true,
      review: true,
      admin_submit: false,
      confirm: true,
    },
    access: {
      request: false,
    },
    user: {
      manage: true,
    },
    program: {
      manage: true,
    },
    study: {
      manage: true,
    },
  },
  "Data Commons Personnel": {
    submission_request: {
      view: true,
      create: true,
      submit: true,
      review: true,
    },
    dashboard: {
      view: true,
    },
    data_submission: {
      view: true,
      create: true,
      review: true,
      admin_submit: true,
      confirm: true,
    },
    access: {
      request: false,
    },
    user: {
      manage: false,
    },
    program: {
      manage: true,
    },
    study: {
      manage: true,
    },
  },
  Admin: {
    submission_request: {
      view: true,
      create: false,
      submit: false,
      review: false,
    },
    dashboard: {
      view: true,
    },
    data_submission: {
      view: true,
      create: false,
      review: true,
      admin_submit: true,
      confirm: true,
    },
    access: {
      request: false,
    },
    user: {
      manage: true,
    },
    program: {
      manage: true,
    },
    study: {
      manage: true,
    },
  },
  Submitter: {
    submission_request: {
      view: false,
      create: true,
      submit: false,
      review: false,
    },
    dashboard: {
      view: false,
    },
    data_submission: {
      view: true,
      create: true,
      review: false,
      admin_submit: false,
      confirm: false,
    },
    access: {
      request: true,
    },
    user: {
      manage: false,
    },
    program: {
      manage: false,
    },
    study: {
      manage: false,
    },
  },
  User: {
    submission_request: {
      view: false,
      create: true,
      submit: false,
      review: false,
    },
    dashboard: {
      view: false,
    },
    data_submission: {
      view: false,
      create: false,
      review: false,
      admin_submit: false,
      confirm: false,
    },
    access: {
      request: true,
    },
    user: {
      manage: false,
    },
    program: {
      manage: false,
    },
    study: {
      manage: false,
    },
  },
} as const satisfies RolesWithPermissions;

/**
 * Determines if a user has the necessary permission to perform a specific action on a resource.
 *
 * @template Resource - A key of the `Permissions` type representing the resource to check.
 * @param {User} user - The user object, which contains the user's role and permissions.
 * @param {Resource} resource - The resource on which the action is being performed.
 * @param {Permissions[Resource]["action"]} action - The action to check permission for.
 * @param {Permissions[Resource]["dataType"]} [data] - Optional additional data needed for dynamic permission checks.
 * @returns {boolean} - `true` if the user has permission, otherwise `false`.
 *
 * @example
 * // Basic permission check without additional data
 * const canCreate = hasPermission(user, "submission_request", "create");
 *
 * @example
 * // Permission check with additional data
 * const canSubmit = hasPermission(user, "submission_request", "submit", applicationData);
 */
export const hasPermission = <Resource extends keyof Permissions>(
  user: User,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"]
): boolean => {
  const { role } = user || {};

  if (!role) {
    return false;
  }

  const permission = (ROLES as RolesWithPermissions)[role]?.[resource]?.[action];
  const permissionKey = `${resource}:${action}`;

  // If permission not defined, or not listed within the user permissions, then deny permission
  if (permission == null || !user.permissions?.includes(permissionKey as AuthPermissions)) {
    return false;
  }

  if (typeof permission === "boolean") {
    return permission;
  }

  return !!data && permission(user, data);
};
