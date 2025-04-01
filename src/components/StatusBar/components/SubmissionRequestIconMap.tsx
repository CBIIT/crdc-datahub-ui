import New from "../../../assets/history/new.svg";
import Submitted from "../../../assets/history/submitted.svg";
import Rejected from "../../../assets/history/rejected.svg";
import Approved from "../../../assets/history/submissionRequest/Approved.svg";
import UnderReview from "../../../assets/history/submissionRequest/UnderReview.svg";
import StatusApproved from "../../../assets/history/submissionRequest/StatusApproved.svg";
import StatusRejected from "../../../assets/history/submissionRequest/StatusRejected.svg";
import InProgress from "../../../assets/history/in_progress.svg";
import Canceled from "../../../assets/history/canceled.svg";
import Deleted from "../../../assets/history/deleted.svg";
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
