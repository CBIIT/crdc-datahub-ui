import { Button, ButtonProps, styled } from "@mui/material";
import { isEqual } from "lodash";
import { memo, useState } from "react";

import { QuestionnaireExcelMiddleware } from "@/classes/QuestionnaireExcelMiddleware";
import { useFormContext } from "@/components/Contexts/FormContext";
import StyledFormTooltip from "@/components/StyledFormComponents/StyledTooltip";
import { downloadBlob } from "@/utils";

const StyledTooltip = styled(StyledFormTooltip)({
  marginLeft: "0 !important",
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

type Props = Omit<ButtonProps, "onClick">;

/**
 * A button that exports the current Submission Request to an Excel file.
 *
 * @returns The ExportApplicationButton component.
 */
const ExportApplicationButton = ({ disabled, ...rest }: Props) => {
  const { data } = useFormContext();

  const [downloading, setDownloading] = useState<boolean>(false);

  const requestName = "TODO"; // TODO: What is the name of the request??

  const onButtonClick = async () => {
    setDownloading(true);

    const { questionnaireData } = data;

    const middleware = new QuestionnaireExcelMiddleware(questionnaireData, {
      application: data,
    });
    const file = await middleware.serialize();

    downloadBlob(
      file,
      `CRDC_Submission_Request_${requestName}_v${data.version}.xlsx`,
      "application/vnd.ms-excel"
    );

    setDownloading(false);
  };

  return (
    <StyledTooltip
      title="Export the Submission Request to Excel."
      placement="top"
      data-testid="export-application-excel-tooltip"
      disableInteractive
      arrow
    >
      <span>
        {/* TODO: Style based on design */}
        <Button
          variant="contained"
          color="primary"
          type="button"
          onClick={onButtonClick}
          disabled={disabled || downloading}
          aria-label="Export application to Excel button"
          data-testid="export-application-excel-button"
          {...rest}
        >
          {/* TODO: Rename based on US */}
          Export
        </Button>
      </span>
    </StyledTooltip>
  );
};

export default memo<Props>(ExportApplicationButton, isEqual);
