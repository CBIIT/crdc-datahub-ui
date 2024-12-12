import { useParams } from "react-router-dom";
import FormView from "./FormView";
import ListView from "./ListView";
import { FormProvider } from "../../components/Contexts/FormContext";
import { InstitutionProvider } from "../../components/Contexts/InstitutionListContext";
import { OrganizationProvider } from "../../components/Contexts/OrganizationListContext";

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
const QuestionnaireController = () => {
  const { appId, section } = useParams();

  if (appId) {
    return (
      <OrganizationProvider preload>
        <InstitutionProvider>
          <FormProvider id={appId}>
            <FormView section={section} />
          </FormProvider>
        </InstitutionProvider>
      </OrganizationProvider>
    );
  }

  return <ListView />;
};

export default QuestionnaireController;
