export type TableAction<T> =
  | { type: "SET_DATA"; payload: T[] }
  | { type: "SET_TOTAL"; payload: number }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PER_PAGE"; payload: number }
  | { type: "SET_SORT_DIRECTION"; payload: Order }
  | { type: "SET_ORDER_BY"; payload: string }
  | { type: "SET_ALL"; payload: Partial<TableState<T>> };

export const tableActionTypes = {
  SET_DATA: "SET_DATA",
  SET_TOTAL: "SET_TOTAL",
  SET_PAGE: "SET_PAGE",
  SET_PER_PAGE: "SET_PER_PAGE",
  SET_SORT_DIRECTION: "SET_SORT_DIRECTION",
  SET_ORDER_BY: "SET_ORDER_BY",
  SET_ALL: "SET_ALL",
} as const;

export const tableStateReducer = <T>(
  state: TableState<T>,
  action: TableAction<T>
): TableState<T> => {
  switch (action.type) {
    case tableActionTypes.SET_DATA:
      return { ...state, data: action.payload };
    case tableActionTypes.SET_TOTAL:
      return { ...state, total: action.payload };
    case tableActionTypes.SET_PAGE:
      return { ...state, page: action.payload };
    case tableActionTypes.SET_PER_PAGE:
      return { ...state, perPage: action.payload };
    case tableActionTypes.SET_SORT_DIRECTION:
      return { ...state, sortDirection: action.payload };
    case tableActionTypes.SET_ORDER_BY:
      return { ...state, orderBy: action.payload };
    case tableActionTypes.SET_ALL:
      return { ...state, ...action.payload };
    default:
      throw new Error(`Unexpected action type.`);
  }
};
