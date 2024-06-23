/* eslint-disable no-console */
import { isEqual } from "lodash";
import {
  validateTotal,
  validatePage,
  validatePerPageOptions,
  validateRowsPerPage,
  validateSortDirection,
  updateIfValidAndChanged,
} from "../../utils";

export const TableStatus = {
  INITIAL: "INITIAL",
  LOADING: "LOADING",
  LOADED: "LOADED",
  ERROR: "ERROR",
} as const;

export type TableAction<T> =
  | { type: "SET_STATUS"; payload: TableStatus }
  | { type: "SET_DATA"; payload: T[] }
  | { type: "SET_TOTAL"; payload: number }
  | { type: "SET_DATA_AND_TOTAL"; payload: { data: T[]; total: number } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PER_PAGE"; payload: number }
  | { type: "SET_PER_PAGE_OPTIONS"; payload: number[] }
  | { type: "SET_SORT_DIRECTION"; payload: Order }
  | { type: "SET_ORDER_BY"; payload: string }
  | { type: "SET_ALL"; payload: Partial<TableState<T>> };

export const tableActionTypes = {
  SET_STATUS: "SET_STATUS",
  SET_DATA: "SET_DATA",
  SET_TOTAL: "SET_TOTAL",
  SET_DATA_AND_TOTAL: "SET_DATA_AND_TOTAL",
  SET_PAGE: "SET_PAGE",
  SET_PER_PAGE: "SET_PER_PAGE",
  SET_PER_PAGE_OPTIONS: "SET_PER_PAGE_OPTIONS",
  SET_SORT_DIRECTION: "SET_SORT_DIRECTION",
  SET_ORDER_BY: "SET_ORDER_BY",
  SET_ALL: "SET_ALL",
} as const;

export const tableStateReducer = <T>(
  state: TableState<T>,
  action: TableAction<T>
): TableState<T> => {
  switch (action.type) {
    case tableActionTypes.SET_STATUS: {
      if (!Object.values(TableStatus)?.includes(action.payload)) {
        return state; // invalid status
      }

      return { ...state, status: action.payload };
    }
    case tableActionTypes.SET_DATA: {
      if (!Array.isArray(action.payload)) {
        console.error("TableReducer.ts: Invalid Data", { data: action.payload });
        return state; // invalid data
      }
      if (isEqual(action.payload, state.data)) {
        return state;
      }

      console.log(`TableReducer.ts`, { type: action.type, payload: action.payload });
      return { ...state, data: action.payload };
    }
    case tableActionTypes.SET_TOTAL: {
      if (!validateTotal(action.payload)) {
        console.error("TableReducer.ts: Invalid Total", { total: action.payload });
        return state; // invalid total
      }
      // TODO: removing this causes no content message to flicker
      // but keeping it break SubmittedData table
      if (action.payload === state.total) {
        return state;
      }

      // check if still on valid page, otherwise reset to first page
      if (!validatePage(state.page)) {
        console.log("SET TOTAL RESET PAGE", {
          total: action.payload,
          page: state.page,
          perPage: state.perPage,
        });
        return { ...state, total: action.payload, page: 0 };
      }

      console.log(`TableReducer.ts`, {
        type: action.type,
        payload: action.payload,
        status: TableStatus.LOADED,
      });
      return { ...state, total: action.payload, status: TableStatus.LOADED };
    }
    case tableActionTypes.SET_PAGE: {
      if (!validatePage(action.payload)) {
        console.error("TableReducer.ts: Invalid Page", { page: action.payload });
        return state; // invalid page
      }
      if (action.payload === state.page) {
        return state;
      }

      console.log(`TableReducer.ts`, { type: action.type, payload: action.payload });
      return { ...state, page: action.payload };
    }
    case tableActionTypes.SET_PER_PAGE: {
      if (!validateRowsPerPage(action.payload, state.perPageOptions)) {
        console.error("TableReducer.ts: Invalid Per Page", {
          perPage: action.payload,
          perPageOptions: state.perPageOptions,
        });
        return state;
      }
      if (action.payload === state.perPage) {
        return state;
      }

      // check if still on valid page, otherwise reset to first page
      if (!validatePage(state.page)) {
        console.log("SET PER PAGE RESET PAGE");
        return { ...state, total: action.payload, page: 0 };
      }

      console.log(`TableReducer.ts`, { type: action.type, payload: action.payload });
      return { ...state, perPage: action.payload };
    }
    case tableActionTypes.SET_PER_PAGE_OPTIONS: {
      if (!validatePerPageOptions(action.payload)) {
        console.error("TableReducer.ts: Invalid Per Page Options", {
          perPageOptions: action.payload,
        });
        return state; // invalid per page options
      }
      if (action.payload === state.perPageOptions) {
        return state;
      }

      console.log(`TableReducer.ts`, { type: action.type, payload: action.payload });
      return { ...state, perPageOptions: action.payload };
    }
    case tableActionTypes.SET_SORT_DIRECTION: {
      if (!validateSortDirection(action.payload)) {
        console.error("TableReducer.ts: Invalid Sort Direction", { sortDirection: action.payload });
        return state; // invalid sort direction
      }
      if (action.payload === state.sortDirection) {
        return state;
      }

      console.log(`TableReducer.ts`, { type: action.type, payload: action.payload });
      return { ...state, sortDirection: action.payload };
    }
    case tableActionTypes.SET_ORDER_BY:
      return { ...state, orderBy: action.payload };
    case tableActionTypes.SET_ALL: {
      const { total, perPage, perPageOptions, sortDirection, page, orderBy } = action.payload || {};

      if (isEqual(state, { ...state, ...action.payload })) {
        console.log("ALL EQUAL");
        return state;
      }

      let updates: TableState<T> = { ...state };

      updates = updateIfValidAndChanged("total", total, validateTotal, state, updates);

      updates = updateIfValidAndChanged(
        "perPage",
        perPage,
        (perPage) => validateRowsPerPage(perPage, updates.perPageOptions),
        state,
        updates
      );

      updates = updateIfValidAndChanged(
        "perPageOptions",
        perPageOptions,
        validatePerPageOptions,
        state,
        updates
      );

      updates = updateIfValidAndChanged(
        "sortDirection",
        sortDirection,
        validateSortDirection,
        state,
        updates
      );

      // Update page; ensure it remains within valid range after other updates
      updates = updateIfValidAndChanged("page", page, (page) => validatePage(page), state, updates);

      updates.orderBy = orderBy;

      console.log(`TableReducer.ts`, {
        type: action.type,
        payload: action.payload,
        state,
        updates,
      });
      return updates;
    }
    default:
      throw new Error(`Unexpected action type.`);
  }
};
