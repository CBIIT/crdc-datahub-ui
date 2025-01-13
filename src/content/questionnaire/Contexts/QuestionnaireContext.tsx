import React from "react";
import { ListApplicationsResp } from "../../../graphql";

const QuestionnaireContext = React.createContext<{
  /**
   * The current user
   */
  user?: User;
  /**
   * Action performed when 'Review' button is clicked
   */
  handleOnReviewClick?: (
    application: ListApplicationsResp["listApplications"]["applications"][number]
  ) => void;
  /**
   * Action performed when 'Cancel' or 'Restore' button is clicked
   */
  handleOnCancelClick?: (
    application: ListApplicationsResp["listApplications"]["applications"][number]
  ) => void;
}>({});

export default QuestionnaireContext;
