import React from "react";

const DataViewContext = React.createContext<{
  /**
   * An array of the currently selected items
   */
  selectedItems?: string[];
  /**
   * The total number of items matching the current filters
   */
  totalData?: number;
  /**
   * A reference to a boolean indicating if all data is being fetched
   */
  isFetchingAllData?: React.MutableRefObject<boolean>;
  /**
   * Toggle the current row selection
   *
   * @param nodeIds The node IDs to toggle selection for
   */
  handleToggleRow?: (nodeIds: string[]) => void;
  /**
   * Select all items
   *
   * @returns A promise that resolves when all items are selected
   */
  handleToggleAll?: () => Promise<void>;
}>({});

export default DataViewContext;
