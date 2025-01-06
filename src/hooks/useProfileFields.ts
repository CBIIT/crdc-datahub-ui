import { useAuthContext } from "../components/Contexts/AuthContext";
import { RequiresStudiesAssigned } from "../config/AuthRoles";
/**
 * Constrains the fields that this hook supports generating states for
 */
type EditableFields = Extends<
  keyof User,
  "firstName" | "lastName" | "role" | "userStatus" | "studies" | "dataCommons"
>;

/**
 * Represents a set of fields on the "User Profile" or "Edit User" page
 */
export type ProfileFields = Record<EditableFields, FieldState>;

/**
 * Represents the state of a field on the "User Profile" or "Edit User" page
 *
 * - `HIDDEN` means the field is not visible to the user at all
 * - `DISABLED` means the field is visible but not editable
 * - `UNLOCKED` means the field is visible and editable
 * - `READ_ONLY` means the field is rendered as text only
 */
export type FieldState = "HIDDEN" | "DISABLED" | "UNLOCKED" | "READ_ONLY";

/**
 * An array of fields that are visible to the viewer, regardless of their state
 */
export const VisibleFieldState: FieldState[] = ["UNLOCKED", "DISABLED"];

/**
 * Determines which profile fields are visible, editable, and disabled for the current user
 *
 * @param profileOf the user whose profile is being viewed
 * @param viewType the page where the user originated from
 * @returns a collection of profile fields
 */
const useProfileFields = (
  profileOf: Pick<User, "_id" | "role">,
  viewType: "users" | "profile"
): Readonly<Partial<ProfileFields>> => {
  const { user } = useAuthContext();
  const fields: ProfileFields = {
    firstName: "READ_ONLY",
    lastName: "READ_ONLY",
    role: "READ_ONLY",
    userStatus: "READ_ONLY",
    dataCommons: "HIDDEN",
    studies: "HIDDEN",
  };
  const isSelf: boolean = user?._id === profileOf?._id;

  // Editable for the current user viewing their own profile
  if (isSelf && viewType === "profile") {
    fields.firstName = "UNLOCKED";
    fields.lastName = "UNLOCKED";
  }

  // Editable for Admin viewing Manage Users
  if (user?.role === "Admin" && viewType === "users") {
    fields.role = "UNLOCKED";
    fields.userStatus = "UNLOCKED";

    // Editable for Admin viewing certain roles, otherwise hidden (even for a user viewing their own profile)
    fields.studies = RequiresStudiesAssigned.includes(profileOf?.role) ? "UNLOCKED" : "HIDDEN";
  }

  // Only applies to Data Commons POC
  if (profileOf?.role === "Data Commons POC" || profileOf?.role === "Data Curator") {
    fields.dataCommons = user?.role === "Admin" && viewType === "users" ? "UNLOCKED" : "READ_ONLY";
  } else {
    fields.dataCommons = "HIDDEN";
  }

  return fields;
};

export default useProfileFields;
