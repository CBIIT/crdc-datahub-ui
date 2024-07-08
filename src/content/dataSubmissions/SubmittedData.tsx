import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { Checkbox, FormControlLabel, Stack, styled } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
} from "../../graphql";
import GenericTable, { Column } from "../../components/GenericTable";
import SubmittedDataFilters, {
  FilterForm,
} from "../../components/DataSubmissions/SubmittedDataFilters";
import { safeParse } from "../../utils";
import { ExportNodeDataButton } from "../../components/DataSubmissions/ExportNodeDataButton";
import DataViewContext from "./Contexts/DataViewContext";
import { useSubmissionContext } from "../../components/Contexts/SubmissionContext";
import DeleteNodeDataButton from "../../components/DataSubmissions/DeleteNodeDataButton";

const StyledCheckbox = styled(Checkbox)({
  padding: 0,
  marginLeft: "10px",
  marginTop: "-2px",
});

const HeaderCheckbox = () => (
  <DataViewContext.Consumer>
    {({ selectedItems, totalData, handleToggleAll, handleToggleRow }) => {
      const isChecked = selectedItems.length === totalData;
      const isIntermediate = selectedItems.length > 0 && selectedItems.length < totalData;

      const handleOnChange = () => {
        // Partially checked or completely unchecked. Check all
        if (!isChecked || isIntermediate) {
          handleToggleAll();
          return;
        }

        // Completely checked. Uncheck all
        handleToggleRow(selectedItems);
      };

      return (
        <Stack direction="row" spacing={0}>
          <FormControlLabel
            control={
              <StyledCheckbox
                onChange={handleOnChange}
                checked={isChecked}
                indeterminate={isIntermediate}
              />
            }
            label={<span style={visuallyHidden}>Select All</span>}
            sx={{ margin: 0 }}
          />
        </Stack>
      );
    }}
  </DataViewContext.Consumer>
);

type T = Pick<SubmissionNode, "nodeType" | "nodeID" | "status"> & {
  props: Record<string, string>;
};

const SubmittedData: FC = () => {
  const { data: dataSubmission, refetch } = useSubmissionContext();
  const { enqueueSnackbar } = useSnackbar();
  const { _id, name } = dataSubmission?.getSubmission || {};

  const tableRef = useRef<TableMethods>(null);
  const filterRef = useRef<FilterForm>({ nodeType: "", status: "All", submittedID: "" });
  const prevFilterRef = useRef<FilterForm>({ nodeType: "", status: "All", submittedID: "" });
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column<T>[]>([]);
  const [data, setData] = useState<T[]>([]);
  const [prevListing, setPrevListing] = useState<FetchListing<T>>(null);
  const [totalData, setTotalData] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [getSubmissionNodes] = useLazyQuery<GetSubmissionNodesResp, GetSubmissionNodesInput>(
    GET_SUBMISSION_NODES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!_id) {
      return;
    }
    if (!force && data?.length > 0 && isEqual(fetchListing, prevListing)) {
      return;
    }
    if (!filterRef.current.nodeType) {
      setData([]);
      setTotalData(0);
      return;
    }
    if (abortControllerRef.current && prevListing) {
      abortControllerRef.current.abort();
    }

    setPrevListing(fetchListing);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const { data: d, error } = await getSubmissionNodes({
      variables: {
        _id,
        first,
        offset,
        sortDirection,
        orderBy,
        partial: false,
        ...filterRef.current,
      },
      context: { fetchOptions: { signal: abortController.signal } },
    });

    if (abortController.signal.aborted) {
      return;
    }

    if (
      error ||
      !d?.getSubmissionNodes ||
      !("properties" in d.getSubmissionNodes) ||
      !d?.getSubmissionNodes?.properties?.length
    ) {
      enqueueSnackbar("Unable to retrieve node data.", { variant: "error" });
      setLoading(false);
      return;
    }

    // Only update columns if the nodeType has changed
    if (prevFilterRef.current.nodeType !== filterRef.current.nodeType) {
      const cols: Column<T>[] = d.getSubmissionNodes.properties.map(
        (prop: string, index: number) => ({
          label: prop,
          renderValue: (d) => d?.props?.[prop] || "",
          fieldKey: prop,
          default: index === 0 ? true : undefined,
        })
      );

      cols.unshift({
        label: <HeaderCheckbox />,
        renderValue: (d) => (
          <DataViewContext.Consumer>
            {({ selectedItems, handleToggleRow }) => (
              <Stack direction="row" spacing={1}>
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      checked={selectedItems?.includes(d.nodeID)}
                      onChange={() => handleToggleRow([d.nodeID])}
                    />
                  }
                  label={<span style={visuallyHidden}>Select Row</span>}
                  sx={{ margin: 0 }}
                />
              </Stack>
            )}
          </DataViewContext.Consumer>
        ),
        sortDisabled: true,
        fieldKey: "checkbox",
      });
      cols.push({
        label: "Status",
        renderValue: (d) => d?.status || "",
        field: "status",
      });

      setTotalData(d.getSubmissionNodes.total);
      setColumns(cols);

      prevFilterRef.current = filterRef.current;
    }

    setData(
      d.getSubmissionNodes.nodes.map((node) => ({
        nodeType: node.nodeType,
        nodeID: node.nodeID,
        props: safeParse(node.props),
        status: node.status,
      }))
    );
    setLoading(false);
  };

  const handleFilterChange = useCallback(
    (filters: FilterForm) => {
      setSelectedItems([]);
      filterRef.current = filters;
      tableRef.current?.setPage(0, true);
    },
    [setSelectedItems, filterRef.current, tableRef.current]
  );

  const handleToggleRow = useCallback(
    (nodeIds: string[]) => {
      setSelectedItems((prev) => {
        const newSelected = new Set(prev);
        nodeIds.forEach((id) => {
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        });
        return Array.from(newSelected);
      });
    },
    [setSelectedItems]
  );

  const handleToggleAll = useCallback(async () => {
    // NOTE: Force immediate update of selectedItems for the current page
    flushSync(() => {
      setSelectedItems(data?.map((node) => node.nodeID) || []);
    });

    // If all rows are already visible, no need to fetch data
    if (data?.length === totalData) {
      return;
    }

    const { data: d, error } = await getSubmissionNodes({
      variables: {
        _id,
        first: -1,
        partial: true,
        ...filterRef.current,
      },
    });

    if (error || !d?.getSubmissionNodes) {
      enqueueSnackbar("Cannot select all rows. Unable to retrieve node data.", {
        variant: "error",
      });
      setSelectedItems([]);
      return;
    }

    setSelectedItems(d.getSubmissionNodes.nodes.map((node) => node.nodeID));
  }, [_id, filterRef, data, totalData, setSelectedItems]);

  const handleOnDelete = useCallback(() => {
    setSelectedItems([]);
    tableRef.current?.setPage(0, true);
    refetch();
  }, [setSelectedItems, refetch, tableRef.current]);

  const Actions = useMemo<React.ReactNode>(
    () => (
      <Stack direction="row" alignItems="center" gap="8px" marginRight="37px">
        <ExportNodeDataButton
          submission={{ _id, name }}
          nodeType={filterRef.current.nodeType}
          disabled={loading || !data?.length}
        />
        <DeleteNodeDataButton
          selectedItems={selectedItems}
          nodeType={filterRef.current.nodeType}
          disabled={loading}
          onDelete={handleOnDelete}
        />
      </Stack>
    ),
    [handleOnDelete, _id, name, filterRef.current?.nodeType, selectedItems, loading, data.length]
  );

  const providerValue = useMemo(
    () => ({ handleToggleRow, handleToggleAll, selectedItems, totalData }),
    [handleToggleRow, handleToggleAll, selectedItems, totalData]
  );

  return (
    <>
      <SubmittedDataFilters submissionId={_id} onChange={handleFilterChange} />
      <DataViewContext.Provider value={providerValue}>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={data || []}
          total={totalData || 0}
          loading={loading}
          defaultRowsPerPage={20}
          defaultOrder="desc"
          position="both"
          AdditionalActions={Actions}
          horizontalScroll
          setItemKey={(item, idx) => `${idx}_${item.nodeID}`}
          onFetchData={handleFetchData}
          containerProps={{ sx: { marginBottom: "8px" } }}
        />
      </DataViewContext.Provider>
    </>
  );
};

export default React.memo(SubmittedData);
