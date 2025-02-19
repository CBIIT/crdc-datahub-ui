import New from "../../assets/history/new.svg";
import InProgress from "../../assets/history/in_progress.svg";
import Submitted from "../../assets/history/submitted.svg";
import Released from "../../assets/history/dataSubmission/released.svg";
import Withdrawn from "../../assets/history/withdrawn.svg";
import Rejected from "../../assets/history/rejected.svg";
import Completed from "../../assets/history/dataSubmission/completed.svg";
import Canceled from "../../assets/history/canceled.svg";
import Deleted from "../../assets/history/deleted.svg";
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
