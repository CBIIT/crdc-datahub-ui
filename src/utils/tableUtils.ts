import { isEqual } from "lodash";
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
  if (total == null || isNaN(total)) {
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
  if (page == null || isNaN(page)) {
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
 * Validates if the provided value is either null or a string.
 * This function is used to ensure that order by parameters are either non-existent (null)
 * or correctly represented as strings.
 *
 * @param value {string | null} - The value to be validated.
 * @returns {boolean} - Returns `true` if the value is either null or a string, otherwise returns `false`.
 */
export const validateOrderBy = (value: string | null): boolean =>
  value === null || typeof value === "string";

/**
 * Conditionally updates a property within a state object if the new value passes an optional validation function
 * and is different from the current value. This function helps ensure state immutability and controlled updates.
 *
 * @template T - The type of the state object.
 * @template K - The key of the property within the state object to update.
 * @param {T} state - The current state object.
 * @param {K} key - The key of the property in the state object to update.
 * @param {T[K]} payload - The new value for the property specified by key.
 * @param {(value: T[K]) => boolean} [validatorFn] - An optional function to validate the new value before updating.
 * If the validation function is provided and returns false, the state is not updated.
 *
 * @returns {T} - Returns the updated state if the new value is valid and different from the current value; otherwise,
 * returns the original state unchanged.
 */
export const validateAndSetIfChanged = <T, K extends keyof T>(
  state: T,
  key: K,
  payload: T[K],
  validatorFn?: (value: T[K]) => boolean
): T => {
  if (validatorFn && !validatorFn(payload)) {
    return state; // return unchanged state if fails validation
  }

  // if attempting to set state to same value
  if (isEqual(payload, state[key])) {
    return state;
  }

  return { ...state, [key]: payload };
};
