import { useLazyQuery } from "@apollo/client";
import { Button, ButtonProps, styled } from "@mui/material";
import { isEqual } from "lodash";
import { memo, useState } from "react";

import { QuestionnaireExcelMiddleware } from "@/classes/QuestionnaireExcelMiddleware";
import { useFormContext } from "@/components/Contexts/FormContext";
import StyledFormTooltip from "@/components/StyledFormComponents/StyledTooltip";
import {
  LIST_INSTITUTIONS,
  LIST_ORGS,
  ListInstitutionsInput,
  ListInstitutionsResp,
  ListOrgsInput,
  ListOrgsResp,
} from "@/graphql";
import { downloadBlob, Logger } from "@/utils";

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

  const [getInstitutions] = useLazyQuery<ListInstitutionsResp, ListInstitutionsInput>(
    LIST_INSTITUTIONS,
    {
      variables: { status: "Active", first: -1, orderBy: "name", sortDirection: "asc" },
      context: { clientName: "backend" },
      fetchPolicy: "cache-first",
      onError: (e) => Logger.error("ExportTemplateButton: listInstitutions API error:", e),
    }
  );

  const [listOrgs] = useLazyQuery<ListOrgsResp, ListOrgsInput>(LIST_ORGS, {
    context: { clientName: "backend" },
    variables: { status: "All", first: -1, orderBy: "name", sortDirection: "asc" },
    fetchPolicy: "cache-first",
    onError: (e) => Logger.error("ExportTemplateButton: listOrgs API error:", e),
  });

  const requestName = "TODO"; // TODO: What is the name of the request??

  const onButtonClick = async () => {
    setDownloading(true);

    const { questionnaireData } = data;

    const middleware = new QuestionnaireExcelMiddleware(questionnaireData, {
      application: data,
      getInstitutions,
      getPrograms: listOrgs,
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
