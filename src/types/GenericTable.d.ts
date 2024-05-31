type PaginationPosition = "top" | "bottom" | "both";

type Order = "asc" | "desc";

type FetchListing<T> = {
  first: number;
  offset: number;
  sortDirection: Order;
  orderBy: keyof T;
  comparator: (a: T, b: T) => number;
};

type TableMethods = {
  refresh: () => void;
  setPage: (page: number, forceRefetch?: boolean) => void;
};
