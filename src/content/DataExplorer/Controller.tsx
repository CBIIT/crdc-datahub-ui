import { Status as AuthStatus, useAuthContext } from "../../components/Contexts/AuthContext";
import SuspenseLoader from "../../components/SuspenseLoader";

import ListView from "./ListView";

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
const DataExplorerController = () => {
  const { status: authStatus } = useAuthContext();

  if (authStatus === AuthStatus.LOADING) {
    return <SuspenseLoader data-testid="data-explorer-suspense-loader" />;
  }

  return <ListView />;
};

export default DataExplorerController;
