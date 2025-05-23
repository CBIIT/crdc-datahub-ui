import New from "../../../assets/history/new.svg?react";
import Submitted from "../../../assets/history/submitted.svg?react";
import Rejected from "../../../assets/history/rejected.svg?react";
import Approved from "../../../assets/history/submissionRequest/Approved.svg?react";
import UnderReview from "../../../assets/history/submissionRequest/UnderReview.svg?react";
import StatusApproved from "../../../assets/history/submissionRequest/StatusApproved.svg?react";
import StatusRejected from "../../../assets/history/submissionRequest/StatusRejected.svg?react";
import InProgress from "../../../assets/history/in_progress.svg?react";
import Canceled from "../../../assets/history/canceled.svg?react";
import Deleted from "../../../assets/history/deleted.svg?react";
import { IconType } from "../../HistoryDialog";

/**
 * Map of ApplicationStatus to Icon for History Modal
 *
 * @see ApplicationStatus
 */
export const HistoryIconMap: IconType<ApplicationStatus> = {
  New,
  Submitted,
  Rejected,
  Approved,
  "In Review": UnderReview,
  "In Progress": InProgress,
  Canceled,
  Deleted,
} as IconType<ApplicationStatus>;

/**
 * Map of ApplicationStatus to Icon for Status Bar
 *
 * @see ApplicationStatus
 */
export const StatusIconMap: IconType<ApplicationStatus> = {
  Rejected: StatusRejected,
  Approved: StatusApproved,
} as IconType<ApplicationStatus>;
