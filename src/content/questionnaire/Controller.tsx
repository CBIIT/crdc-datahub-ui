import { useParams } from "react-router-dom";
import FormView from "./FormView";
import ListView from "./ListView";
import { FormProvider } from "../../components/Contexts/FormContext";
import { InstitutionProvider } from "../../components/Contexts/InstitutionListContext";

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
      <InstitutionProvider>
        <FormProvider id={appId}>
          <FormView section={section} />
        </FormProvider>
      </InstitutionProvider>
    );
  }

  return <ListView />;
};

export default QuestionnaireController;
