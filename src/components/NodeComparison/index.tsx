import { useQuery } from "@apollo/client";
import { Box, styled, Typography } from "@mui/material";
import { FC, memo, useMemo } from "react";
import { useSnackbar } from "notistack";
import {
  RETRIEVE_RELEASED_DATA,
  RetrieveReleasedDataInput,
  RetrieveReleasedDataResp,
} from "../../graphql";
import { Logger } from "../../utils";
import NodeComparisonTable from "./NodeComparisonTable";

const StyledBox = styled(Box)({
  padding: "10px",
});

const StyledHeadingTypography = styled(Typography)({
  color: "#595959",
  fontSize: "14px",
});

export type NodeComparisonProps = {
  /**
   * The identifier for the Data Submission which contains the node
   *
   * @example "submission_10290"
   */
  submissionID: string;
  /**
   * The distinct type of the node to be compared
   *
   * @example "participant"
   */
  nodeType: string;
  /**
   * The identifier for the node
   *
   * @example "participant_10290"
   */
  submittedID: string;
};

type NodeData = RetrieveReleasedDataResp["retrieveReleasedDataByID"][number];

/**
 * A component that renders the existing/new data comparison table of two nodes
 *
 * @returns The DataComparison component
 */
const NodeComparison: FC<NodeComparisonProps> = ({ submissionID, nodeType, submittedID }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useQuery<RetrieveReleasedDataResp, RetrieveReleasedDataInput>(
    RETRIEVE_RELEASED_DATA,
    {
      variables: {
        submissionId: submissionID,
        nodeType,
        nodeId: submittedID,
      },
      fetchPolicy: "cache-and-network",
      onError: (error) => {
        Logger.error("NodeComparison API error received", error);
        enqueueSnackbar("Oops! Unable to retrieve the data record comparison", {
          variant: "error",
        });
      },
    }
  );

  const isLoading = useMemo<boolean>(() => loading && !data, [loading]);

  const [newNode, existingNode] = useMemo<[NodeData, NodeData]>(() => {
    if (isLoading) {
      return null;
    }
    if (data?.retrieveReleasedDataByID?.length !== 2) {
      Logger.error("NodeComparison API did not return exactly 2 nodes", data);
      return null;
    }

    return [data.retrieveReleasedDataByID[0], data.retrieveReleasedDataByID[1]];
  }, [data, isLoading]);

  return (
    <StyledBox>
      <StyledHeadingTypography variant="body1" data-testid="node-comparison-header">
        A record with this ID already exists. Review the existing and newly submitted data to decide
        whether to update the current record.
      </StyledHeadingTypography>
      {!loading && newNode && existingNode ? (
        <NodeComparisonTable newNode={newNode} existingNode={existingNode} loading={isLoading} />
      ) : (
        <p data-testid="node-comparison-error">Oops! Unable to show the data record comparison</p>
      )}
    </StyledBox>
  );
};

export default memo<NodeComparisonProps>(NodeComparison);
