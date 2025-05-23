import New from "../../assets/history/new.svg?react";
import InProgress from "../../assets/history/in_progress.svg?react";
import Submitted from "../../assets/history/submitted.svg?react";
import Released from "../../assets/history/dataSubmission/released.svg?react";
import Withdrawn from "../../assets/history/withdrawn.svg?react";
import Rejected from "../../assets/history/rejected.svg?react";
import Completed from "../../assets/history/dataSubmission/completed.svg?react";
import Canceled from "../../assets/history/canceled.svg?react";
import Deleted from "../../assets/history/deleted.svg?react";
import { IconType } from "../HistoryDialog";

/**
 * Map of ApplicationStatus to Icon for History Modal
 *
 * @see ApplicationStatus
 */
const HistoryIconMap: IconType<SubmissionStatus> = {
  New,
  "In Progress": InProgress,
  Submitted,
  Released,
  Withdrawn,
  Rejected,
  Completed,
  Canceled,
  Deleted,
} as IconType<SubmissionStatus>;

export default HistoryIconMap;
