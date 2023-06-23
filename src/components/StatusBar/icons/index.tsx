import New from "./New.svg";
import Submitted from "./Submitted.svg";
import Rejected from "./Rejected.svg";
import Approved from "./Approved.svg";
import UnderReview from "./UnderReview.svg";
import Comments from "./Comments.svg";

export type IconType = {
  [key: string]: string;
};

/**
 * Map of ApplicationStatus to Icon
 *
 * @see ApplicationStatus
 */
export const HistoryIconMap : IconType = {
  New,
  Submitted,
  Rejected,
  Approved,
  "In Review": UnderReview,
};

export const StatusIconMap : IconType = {
  Rejected: Comments,
  Approved: Comments,
};
