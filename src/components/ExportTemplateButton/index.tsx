import { useLazyQuery } from "@apollo/client";
import { Button, ButtonProps, styled } from "@mui/material";
import dayjs from "dayjs";
import { isEqual } from "lodash";
import { memo, useState } from "react";

import { QuestionnaireExcelMiddleware } from "@/classes/QuestionnaireExcelMiddleware";
import StyledFormTooltip from "@/components/StyledFormComponents/StyledTooltip";
import { ListInstitutionsResp, ListInstitutionsInput, LIST_INSTITUTIONS } from "@/graphql";
import { downloadBlob, Logger } from "@/utils";

const StyledTooltip = styled(StyledFormTooltip)({
  marginLeft: "0 !important",
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

type Props = Omit<ButtonProps, "onClick">;

/**
 * A button that exports a Excel template for the Submission Request form.
 *
 * @returns The ExportTemplateButton component.
 */
const ExportTemplateButton = ({ disabled, ...rest }: Props) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  const [getInstitutions] = useLazyQuery<ListInstitutionsResp, ListInstitutionsInput>(
    LIST_INSTITUTIONS,
    {
      variables: { first: -1, orderBy: "name", sortDirection: "asc" },
      context: { clientName: "backend" },
      fetchPolicy: "cache-first",
      onError: (e) => Logger.error("ExportTemplateButton: listInstitutions API error:", e),
    }
  );

  const formVersion = "1.0"; // TODO: Fetch from API

  const onButtonClick = async () => {
    setDownloading(true);

    const middleware = new QuestionnaireExcelMiddleware(null, { getInstitutions });
    const file = await middleware.serialize();

    downloadBlob(
      file,
      `CRDC_Submission_Request_Template_v${formVersion}_${dayjs().format("MMDDYYYY")}.xlsx`,
      "application/vnd.ms-excel"
    );

    setDownloading(false);
  };

  return (
    <StyledTooltip
      title="Download the Submission Request Excel Template."
      placement="top"
      data-testid="export-application-excel-template-tooltip"
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
          data-testid="export-application-excel-template-button"
          {...rest}
        >
          {/* TODO: Rename based on US */}
          Download Template
        </Button>
      </span>
    </StyledTooltip>
  );
};

export default memo<Props>(ExportTemplateButton, isEqual);
