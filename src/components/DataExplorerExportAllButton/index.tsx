import { useLazyQuery } from "@apollo/client";
import { CloudDownload } from "@mui/icons-material";
import { IconButtonProps, IconButton, styled } from "@mui/material";
import dayjs from "dayjs";
import JSZip from "jszip";
import { useSnackbar } from "notistack";
import { unparse } from "papaparse";
import { memo, useState } from "react";

import {
  GET_RELEASED_NODE_TYPES,
  GetReleasedNodeTypesInput,
  GetReleasedNodeTypesResp,
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
  RETRIEVE_PROPS_FOR_NODE_TYPE,
  RetrievePropsForNodeTypeInput,
  RetrievePropsForNodeTypeResp,
} from "../../graphql";
import { downloadBlob, fetchAllData, Logger } from "../../utils";
import type { Column } from "../GenericTable";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

export type DataExplorerExportAllButtonProps = {
  /**
   * The `_id` of the study to export data for.
   */
  studyId: string;
  /**
   * The display name/abbreviation of the study to export data for (e.g. "CMB").
   * Included in the filename of the exported ZIP.
   */
  studyAbbreviation: string;
  /**
   * The display name of the data commons to filter exported data by (e.g. "GC").
   */
  dataCommonsDisplayName: string;
} & IconButtonProps;

const StyledIconButton = styled(IconButton)({
  color: "#346798",
});

const StyledCloudDownload = styled(CloudDownload)({
  fontSize: "31px",
});

/**
 * Provides the button and supporting functionality to export the
 * released metadata for all node types in a study as a ZIP file.
 *
 * @returns The button to export all released metadata
 */
const DataExplorerExportAllButton: React.FC<DataExplorerExportAllButtonProps> = ({
  studyId,
  studyAbbreviation,
  dataCommonsDisplayName,
  disabled,
  ...buttonProps
}: DataExplorerExportAllButtonProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [getReleasedNodeTypes] = useLazyQuery<GetReleasedNodeTypesResp, GetReleasedNodeTypesInput>(
    GET_RELEASED_NODE_TYPES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const [listReleasedDataRecords] = useLazyQuery<
    ListReleasedDataRecordsResponse,
    ListReleasedDataRecordsInput
  >(LIST_RELEASED_DATA_RECORDS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const [retrievePropsForNodeType] = useLazyQuery<
    RetrievePropsForNodeTypeResp,
    RetrievePropsForNodeTypeInput
  >(RETRIEVE_PROPS_FOR_NODE_TYPE, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleClick = async () => {
    setLoading(true);

    enqueueSnackbar("Downloading metadata for all node types. This may take several moments...", {
      variant: "default",
    });

    try {
      // First, get all available node types for the study
      const { data: nodeTypesData, error: nodeTypesError } = await getReleasedNodeTypes({
        variables: { studyId, dataCommonsDisplayName },
      });

      if (nodeTypesError) {
        throw nodeTypesError;
      }

      const nodeTypes = nodeTypesData?.getReleaseNodeTypes?.nodes || [];
      if (!nodeTypes.length) {
        throw new Error("No node types found for this study");
      }

      const zip = new JSZip();
      const timestamp = dayjs().format("YYYYMMDDHHmmss");
      let filesAdded = 0;

      // Process each node type
      /* eslint-disable no-await-in-loop */
      for (const nodeType of nodeTypes) {
        try {
          // Get properties for this node type
          const { data: propsData, error: propsError } = await retrievePropsForNodeType({
            variables: { nodeType: nodeType.name, studyId, dataCommonsDisplayName },
          });

          if (propsError) {
            Logger.error(`Failed to get properties for node type ${nodeType.name}:`, propsError);
            /* eslint-disable-next-line no-continue */
            continue;
          }

          const properties = propsData?.retrievePropsForNodeType || [];
          const columns: Column<Record<string, unknown>>[] = properties.map((prop) => ({
            label: prop.name,
            field: prop.name,
            renderValue: (data) => String(data[prop.name] || ""),
          }));

          // Get all data for this node type
          const data = await fetchAllData<
            ListReleasedDataRecordsResponse,
            ListReleasedDataRecordsInput,
            Record<string, unknown>
          >(
            listReleasedDataRecords,
            { dataCommonsDisplayName, studyId, nodeType: nodeType.name },
            (data) => data.listReleasedDataRecords.nodes,
            (data) => data.listReleasedDataRecords.total,
            { pageSize: 5000, total: Infinity }
          );

          if (data?.length) {
            // Map data to include only the properties we have columns for
            const finalData = data.map((item) => {
              const newItem: Record<string, unknown> = {};
              columns.forEach((col) => {
                newItem[col.field] = item[col?.field] || "";
              });
              return newItem;
            });

            // Create TSV content
            const tsvContent = unparse(finalData, { delimiter: "\t" });

            // Add to ZIP file
            const fileName = `${nodeType.name}.tsv`;
            zip.file(fileName, tsvContent);
            /* eslint-disable-next-line no-plusplus */
            filesAdded++;
          }
        } catch (nodeError) {
          Logger.error(`Failed to process node type ${nodeType.name}:`, nodeError);
          // Continue processing other node types
        }
      }
      /* eslint-enable no-await-in-loop */

      // Check if we have any files to download
      if (filesAdded === 0) {
        throw new Error("No data was found for any node types");
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download the ZIP file
      const filename = `${studyAbbreviation}_AllNodes_${timestamp}.zip`;
      downloadBlob(zipBlob, filename, "application/zip");

      enqueueSnackbar(`Successfully downloaded metadata for ${filesAdded} node type(s)`, {
        variant: "success",
      });
    } catch (err) {
      Logger.error("Error during ZIP generation", err);
      enqueueSnackbar("Failed to generate the ZIP file for all node types.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledFormTooltip
      title="Download metadata for all node types with all properties"
      data-testid="data-explorer-export-all-tooltip"
      placement="top"
    >
      <span>
        <StyledIconButton
          onClick={handleClick}
          disabled={loading || disabled}
          data-testid="data-explorer-export-all-button"
          aria-label="Export All Nodes ZIP"
          {...buttonProps}
        >
          <StyledCloudDownload />
        </StyledIconButton>
      </span>
    </StyledFormTooltip>
  );
};

export default memo<DataExplorerExportAllButtonProps>(DataExplorerExportAllButton);
