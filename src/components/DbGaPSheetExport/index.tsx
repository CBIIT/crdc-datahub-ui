import { Button, ButtonProps } from "@mui/material";
import { FC, memo, useCallback, useState } from "react";
import DownloadIconSvg from "../../assets/icons/download_icon.svg?react";
import Tooltip from "../StyledFormComponents/StyledTooltip";
import { useSubmissionContext } from "../Contexts/SubmissionContext";

/**
 * An array of supported data commons for dbGaP sheet export.
 */
const SUPPORTED_DATA_COMMONS: string[] = ["CDS"];

/**
 * Props for the dbGap Sheet Export component.
 */
export type DbGaPSheetExportProps = Omit<ButtonProps, "onClick">;

/**
 * A component that handles the logic of exporting dbGaP loading sheets.
 *
 * @depends on {@link useSubmissionContext}
 * @returns The dbGaP Loading Sheets Button component
 */
const DbGaPSheetExport: FC<DbGaPSheetExportProps> = ({ disabled, ...rest }) => {
  const { data } = useSubmissionContext();
  const { _id, dataCommons } = data?.getSubmission || {};

  const [loading, setLoading] = useState<boolean>(false);

  const handleOnClick = useCallback(() => {
    setLoading(true);
    setLoading(false);
  }, [_id]);

  if (!_id || !SUPPORTED_DATA_COMMONS.includes(dataCommons)) {
    return null;
  }

  return (
    <Tooltip
      title="This download generates dbGaP submission sheets based on available submission data. Additional information may still be required to complete the dbGaP submission."
      aria-label="dbGaP Loading Sheets Button Tooltip"
      data-testid="dbGaP-sheet-export-tooltip"
      arrow
    >
      <span>
        <Button
          variant="text"
          onClick={handleOnClick}
          data-testid="dbGaP-sheet-export-button"
          endIcon={<DownloadIconSvg />}
          disabled={loading || disabled}
          disableFocusRipple
          disableRipple
          {...rest}
        >
          dbGaP Sheets
        </Button>
      </span>
    </Tooltip>
  );
};

export default memo<DbGaPSheetExportProps>(DbGaPSheetExport);
