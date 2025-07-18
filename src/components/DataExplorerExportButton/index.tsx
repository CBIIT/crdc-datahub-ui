import { useLazyQuery } from "@apollo/client";
import { CloudDownload } from "@mui/icons-material";
import { IconButtonProps, IconButton, styled } from "@mui/material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { unparse } from "papaparse";
import { memo, useState } from "react";

import {
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
} from "../../graphql";
import { downloadBlob, fetchAllData, Logger } from "../../utils";
import type { Column } from "../GenericTable";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

export type DataExplorerExportButtonProps = {
  /**
   * The `_id` of the study to export data for.
   */
  studyId: string;
  /**
   * The display name of the study to export data for (e.g. "My Study").
   * Included in the filename of the exported TSV.
   */
  studyDisplayName: string;
  /**
   * The node type to export data for (e.g. "participant").
   */
  nodeType: string;
  /**
   * The display name of the data commons to filter exported data by (e.g. "GC").
   */
  dataCommonsDisplayName: string;
  /**
   * The visible columns that should be included in the export TSV.
   */
  columns: Column<ListReleasedDataRecordsResponse["listReleasedDataRecords"]["nodes"][number]>[];
} & IconButtonProps;

const StyledIconButton = styled(IconButton)({
  color: "#346798",
});

const StyledCloudDownload = styled(CloudDownload)({
  fontSize: "31px",
});

/**
 * Provides the button and supporting functionality to export the
 * released metadata for a given study.
 *
 * @returns The button to export the released metadata
 */
const DataExplorerExportButton: React.FC<DataExplorerExportButtonProps> = ({
  studyId,
  studyDisplayName,
  nodeType,
  dataCommonsDisplayName,
  columns,
  disabled,
  ...buttonProps
}: DataExplorerExportButtonProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [listReleasedDataRecords] = useLazyQuery<
    ListReleasedDataRecordsResponse,
    ListReleasedDataRecordsInput
  >(LIST_RELEASED_DATA_RECORDS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleClick = async () => {
    setLoading(true);

    enqueueSnackbar("Downloading the requested metadata file. This may take a moment...", {
      variant: "default",
    });

    try {
      const data = await fetchAllData<
        ListReleasedDataRecordsResponse,
        ListReleasedDataRecordsInput,
        Record<string, unknown>
      >(
        listReleasedDataRecords,
        { dataCommonsDisplayName, studyId, nodeType },
        (data) => data.listReleasedDataRecords.nodes,
        (data) => data.listReleasedDataRecords.total,
        { pageSize: 5000, total: Infinity }
      );

      if (!data?.length) {
        throw new Error("No data returned from fetch");
      }

      const filename = `${studyDisplayName}_${nodeType}_${dayjs().format("YYYYMMDDHHmmss")}.tsv`;
      const finalData = data.map((item) => {
        const newItem: Record<string, unknown> = {};
        columns.forEach((col) => {
          newItem[col.field] = item[col?.field] || "";
        });
        return newItem;
      });

      downloadBlob(unparse(finalData, { delimiter: "\t" }), filename, "text/tab-separated-values");
    } catch (err) {
      Logger.error("Error during TSV generation", err);
      enqueueSnackbar("Failed to generate the TSV for the selected node.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledFormTooltip
      title="Download displayed metadata in .tsv format"
      data-testid="data-explorer-export-tooltip"
      placement="top"
    >
      <span>
        <StyledIconButton
          onClick={handleClick}
          disabled={loading || disabled}
          data-testid="data-explorer-export-button"
          aria-label="Export Node TSV"
          {...buttonProps}
        >
          <StyledCloudDownload />
        </StyledIconButton>
      </span>
    </StyledFormTooltip>
  );
};

export default memo<DataExplorerExportButtonProps>(DataExplorerExportButton);
