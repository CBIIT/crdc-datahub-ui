import New from "./New.svg";
import Submitted from "./Submitted.svg";
import Rejected from "./Rejected.svg";
import Approved from "./Approved.svg";
import UnderReview from "./UnderReview.svg";
import StatusApproved from "./StatusApproved.svg";
import StatusRejected from "./StatusRejected.svg";
import InProgress from "./InProgress.svg";

export type IconType = {
  [key: string]: string;
};

/**
 * Map of ApplicationStatus to Icon for History Modal
 *
 * @see ApplicationStatus
 */
export const HistoryIconMap : IconType = {
  New,
  Submitted,
  Rejected,
  Approved,
  "In Review": UnderReview,
  "In Progress": InProgress,
};

/**
 * Map of ApplicationStatus to Icon for Status Bar
 *
 * @see ApplicationStatus
 */
export const StatusIconMap : IconType = {
  Rejected: StatusRejected,
  Approved: StatusApproved,
};
