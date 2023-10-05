import New from "../../assets/history/dataSubmission/new.svg";
import InProgress from "../../assets/history/dataSubmission/in_progress.svg";
import Submitted from "../../assets/history/dataSubmission/submitted.svg";
import Released from "../../assets/history/dataSubmission/released.svg";
import Completed from "../../assets/history/dataSubmission/completed.svg";
import Archived from "../../assets/history/dataSubmission/archived.svg";
import { IconType } from "../Shared/HistoryDialog";

/**
 * Map of ApplicationStatus to Icon for History Modal
 *
 * @see ApplicationStatus
 */
const HistoryIconMap : IconType<DataSubmissionStatus> = {
  New,
  "In Progress": InProgress,
  Submitted,
  Released,
  Withdrawn: null,
  Rejected: null,
  Completed,
  Archived,
  Canceled: null
} as IconType<DataSubmissionStatus>;

export default HistoryIconMap;
