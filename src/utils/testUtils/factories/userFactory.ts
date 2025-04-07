export const baseUser: User = {
  _id: "",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  role: "Submitter",
  IDP: "nih",
  email: "",
  studies: null,
  dataCommons: [],
  // dataCommonsDisplayNames: [],
  createdAt: "",
  updateAt: "",
  permissions: [],
  notifications: [],
};

/**
 *  Creates a new User object with default values, allowing for field overrides
 *
 * @see {@link baseUser}
 * @param {Partial<User>} [overrides={}] - An object containing properties to override the default values
 * @returns {User} A new User object with default propety values applied as well as any overridden properties
 */
export const createUser = (overrides: Partial<User> = {}): User => ({
  ...baseUser,
  ...overrides,
});
