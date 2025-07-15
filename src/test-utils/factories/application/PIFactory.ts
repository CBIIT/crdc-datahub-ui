import { Factory } from "../Factory";

/**
 * Base principal investigator (PI) object
 */
export const basePI: PI = {
  firstName: "",
  lastName: "",
  position: "",
  email: "",
  ORCID: "",
  institution: "",
  address: "",
};

/**
 * PI factory for creating PI instances
 */
export const piFactory = new Factory<PI>((overrides) => ({
  ...basePI,
  ...overrides,
}));
