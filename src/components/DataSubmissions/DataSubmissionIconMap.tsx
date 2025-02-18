import New from "../../assets/history/dataSubmission/new.svg";
import InProgress from "../../assets/history/dataSubmission/in_progress.svg";
import Submitted from "../../assets/history/dataSubmission/submitted.svg";
import Released from "../../assets/history/dataSubmission/released.svg";
import Withdrawn from "../../assets/history/dataSubmission/withdrawn.svg";
import Rejected from "../../assets/history/dataSubmission/rejected.svg";
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
