import React from "react";
import { useParams } from "react-router-dom";
import FormView from "./FormView";
import ListView from "./ListView";
import { FormProvider } from "../../components/Contexts/FormContext";

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
      <FormProvider id={appId}>
        <FormView section={section} />
      </FormProvider>
    );
  }

  return <ListView />;
};
