import React from "react";

const QuestionnaireContext = React.createContext<{
  /**
   * The current user
   */
  user?: User;
  /**
   * Action performed when 'Review' button is clicked
   */
  handleOnReviewClick?: (application: Omit<Application, "questionnaireData">) => void;
}>({});

export default QuestionnaireContext;
