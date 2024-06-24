type PaginationPosition = "top" | "bottom" | "both";

type Order = "asc" | "desc";

type FetchListing<T> = {
  first: number;
  offset: number;
  sortDirection: Order;
  orderBy: string;
  comparator?: (a: T, b: T) => number;
};

type TableMethods = {
  refresh: () => void;
  setPage: (page: number, forceRefetch?: boolean) => void;
};

type TableURLParams = {
  page: string; // converted from number for URL
  rowsPerPage: string; // converted from number for URL
  orderBy: string;
  sortDirection: Order;
};

type TableParams = {
  page: number;
  perPage: number;
  sortDirection: Order;
  orderBy: string;
};

type TableState<T> = {
  data: T[];
  total: number;
  perPageOptions: number[];
} & TableParams;

type FilterFunction<T> = (item: T) => boolean;
