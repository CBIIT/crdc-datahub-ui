import { SORT, DIRECTION } from "../config/TableConfig";

/**
 * Converts a string sorting order to its corresponding numeric value
 *
 * @param {Order} sortDirection - The sorting direction as a string ("asc" or "desc")
 * @returns {number} The numeric representation of the sorting direction: 1 for ascending, -1 for descending
 */
export const getSortDirection = (sortDirection: Order) =>
  sortDirection?.toLowerCase() === SORT.ASC ? DIRECTION.ASC : DIRECTION.DESC;

/**
 * Sorts and paginates a dataset
 *
 * @param {T[]} data - The array of data to be sorted and paginated
 * @param {FetchListing<T>} fetchListing - Object containing sorting and pagination parameters
 * @returns {T[]} The sorted and paginated subset of the original data
 *
 * @template T - Type of the elements in the data array
 */
export const paginateAndSort = <T>(data: T[], fetchListing: FetchListing<T>): T[] => {
  if (!data) {
    return [];
  }
  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    const { orderBy, sortDirection } = fetchListing;
    const sort = getSortDirection(sortDirection);
    const propA = a[orderBy];
    const propB = b[orderBy];

    if (!propA) return sort;
    if (!propB) return -sort;
    if (propA > propB) return sort;
    if (propA < propB) return -sort;

    return 0;
  });

  // Pagination logic
  const { first, offset } = fetchListing;
  return sortedData.slice(offset, offset + first);
};

/**
 * Validates if the total number of items is a valid number and non-negative.
 * @param {number} total - The total number of items to validate.
 * @returns {boolean} - Returns `true` if the total is a valid, non-negative number; otherwise, returns `false`.
 */
export const validateTotal = (total: number) => {
  if (isNaN(total)) {
    return false;
  }
  if (total < 0) {
    return false;
  }

  return true;
};

/**
 * Validates if the provided page number is a valid number and not less than the minimum page number (0).
 * @param {number} page - The page number to validate.
 * @returns {boolean} - Returns `true` if the page number is valid and not less than 0; otherwise, returns `false`.
 */
export const validatePage = (page: number) => {
  if (isNaN(page)) {
    return false;
  }
  const minPage = 0;
  if (page < minPage) {
    return false;
  }

  return true;
};

/**
 * Validates if the given rows per page number is included in the provided options.
 * @param {number} perPage - The number of rows per page to validate.
 * @param {number[]} perPageOptions - An array of valid options for rows per page.
 * @returns {boolean} - Returns `true` if perPage is a number and exists in perPageOptions; otherwise, returns `false`.
 */
export const validateRowsPerPage = (perPage: number, perPageOptions: number[]) => {
  if (isNaN(perPage)) {
    return false;
  }
  if (perPageOptions?.length && !perPageOptions?.includes(perPage)) {
    return false;
  }

  return true;
};

/**
 * Validates that the provided array contains only numeric values.
 * @param {number[]} perPageOptions - An array of numbers representing the valid options for rows per page.
 * @returns {boolean} - Returns `true` if the array is valid and all elements are numbers; otherwise, returns `false`.
 */
export const validatePerPageOptions = (perPageOptions: number[]) => {
  if (!Array.isArray(perPageOptions)) {
    return false;
  }
  if (perPageOptions.some((opt) => isNaN(opt))) {
    return false;
  }

  return true;
};

/**
 * Validates that the sort direction is either 'asc' or 'desc'.
 * @param {string} sortDirection - The sort direction to validate.
 * @returns {boolean} - Returns `true` if the sort direction is either 'asc' or 'desc'; otherwise, returns `false`.
 */
export const validateSortDirection = (sortDirection: string): sortDirection is Order =>
  sortDirection === "asc" || sortDirection === "desc";

/**
 * Updates the given `updates` object with a new value for a specified key if the new value is
 * valid and different from the current state.
 *
 * This function creates a clone of the `updates` object, modifies the clone if the new value
 * passes validation and is different from the current value in the state, and then returns the clone.
 * This avoids direct mutation of the original `updates` object, adhering to immutability principles.
 *
 * @param {keyof T} key - The key in the state object that needs to be updated.
 * @param {T[K]} newValue - The new value proposed for the key.
 * @param {(value: T[K]) => boolean} validator - A function that returns true if the new value is valid.
 * @param {T} currentState - The current state object containing the current values of keys.
 * @param {Partial<T>} updates - The object to which validated and changed values are added.
 *
 * @returns {T} A new object with the updated values if changes were valid and necessary.
 */
export const updateIfValidAndChanged = <T, K extends keyof T>(
  key: K,
  newValue: T[K],
  validator: (value: T[K]) => boolean,
  currentState: T,
  updates: Partial<T>
): T => {
  const updated = { ...currentState, ...updates };
  if (newValue !== undefined && validator(newValue) && newValue !== currentState[key]) {
    updated[key] = newValue;
  }

  return updated;
};
