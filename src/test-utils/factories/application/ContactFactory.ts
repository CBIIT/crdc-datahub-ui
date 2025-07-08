import { Factory } from "../Factory";

/**
 * Base contact object
 */
export const baseContact: Contact = {
  position: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

/**
 * Contact factory for creating contact instances
 */
export const contactFactory = new Factory<Contact>((overrides) => ({
  ...baseContact,
  ...overrides,
}));
