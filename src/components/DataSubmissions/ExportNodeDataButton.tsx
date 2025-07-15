import { useLazyQuery } from "@apollo/client";
import { CloudDownload } from "@mui/icons-material";
import { IconButtonProps, IconButton, styled } from "@mui/material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { unparse } from "papaparse";
import { useMemo, useState } from "react";

import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
} from "../../graphql";
import { downloadBlob, filterAlphaNumeric } from "../../utils";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

export type Props = {
  /**
   * The data submission object to export validation results for.
   *
   * At a minimum, this object should contain the `_id` and `name` fields.
   */
  submission: Pick<Submission, "_id" | "name"> | Submission;
  /**
   * The name of the node type to export validation results for.
   *
   * @example "Participant"
   */
  nodeType: string;
} & IconButtonProps;

const StyledIconButton = styled(IconButton)({
  color: "#606060",
});

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

/**
 * Provides the button and supporting functionality to export the
 * Submitted Data for a submission
 *
 * @returns {React.FC} The export validation button.
 */
export const ExportNodeDataButton: React.FC<Props> = ({
  submission,
  nodeType,
  disabled,
  ...buttonProps
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const tooltip = useMemo<string>(
    () =>
      nodeType?.toLocaleLowerCase() === "data file"
        ? "Export a list of all uploaded data files"
        : "Export submitted metadata for selected node type",
    [nodeType]
  );

  const [getSubmissionNodes] = useLazyQuery<GetSubmissionNodesResp, GetSubmissionNodesInput>(
    GET_SUBMISSION_NODES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleClick = async () => {
    setLoading(true);

    const { data: d, error } = await getSubmissionNodes({
      variables: {
        _id: submission?._id,
        sortDirection: "asc",
        nodeType,
        status: "All",
        first: -1,
        offset: 0,
      },
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    });

    if (error || !d?.getSubmissionNodes?.nodes) {
      enqueueSnackbar("Unable to retrieve data for the selected node.", {
        variant: "error",
      });
      setLoading(false);
      return;
    }

    if (!d?.getSubmissionNodes?.total || !d?.getSubmissionNodes?.nodes.length) {
      enqueueSnackbar("There is no data to export for the selected node.", {
        variant: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const filteredName = filterAlphaNumeric(submission.name?.trim()?.replaceAll(" ", "-"), "-");
      const filename = `${filteredName}_${nodeType}_${dayjs().format("YYYYMMDDHHmm")}.tsv`;
      const csvArray = d.getSubmissionNodes.nodes.map((node) => ({
        type: nodeType,
        ...JSON.parse(node.props),
        status: node.status,
      }));

      downloadBlob(unparse(csvArray, { delimiter: "\t" }), filename, "text/tab-separated-values");
    } catch (err) {
      enqueueSnackbar("Failed to export TSV for the selected node.", {
        variant: "error",
      });
    }

    setLoading(false);
  };

  return (
    <StyledTooltip title={tooltip} placement="top" data-testid="export-node-data-tooltip">
      <span>
        <StyledIconButton
          onClick={handleClick}
          disabled={loading || disabled}
          data-testid="export-node-data-button"
          aria-label="Export node data"
          {...buttonProps}
        >
          <CloudDownload />
        </StyledIconButton>
      </span>
    </StyledTooltip>
  );
};
