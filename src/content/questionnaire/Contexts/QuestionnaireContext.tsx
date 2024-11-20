import React from "react";

const QuestionnaireContext = React.createContext<{
  /**
   * The current user
   */
  user?: User;
}>({});

export default QuestionnaireContext;
