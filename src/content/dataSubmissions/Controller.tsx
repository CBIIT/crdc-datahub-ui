import React from "react";
import { useParams } from "react-router-dom";
import ListView from "./DataSubmissionsListView";

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
export default () => {
  const { appId, section } = useParams();

  if (appId) {
    return (
         null
    //   <FormProvider id={appId}>
    //     <FormView section={section} />
    //   </FormProvider>
    );
  }

  return <ListView />;
};
