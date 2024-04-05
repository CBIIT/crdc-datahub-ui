import { FetchListing, Order } from "../components/DataSubmissions/GenericTable";
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
