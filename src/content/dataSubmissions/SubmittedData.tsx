import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { Alert, Checkbox, FormControlLabel, Stack, styled } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
} from "../../graphql";
import GenericTable, { Column } from "../../components/GenericTable";
import SubmittedDataFilters, {
  FilterForm,
  FilterMethods,
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

const StyledAlert = styled(Alert, { shouldForwardProp: (p) => p !== "visible" })<{
  visible: boolean;
}>(({ visible }) => ({
  marginBottom: "22px",
  display: visible ? "flex" : "none",
}));

const HeaderCheckbox = () => (
  <DataViewContext.Consumer>
    {({ selectedItems, totalData, isFetchingAllData, handleToggleAll, handleToggleRow }) => {
      const isChecked = selectedItems.length === totalData;
      const isIntermediate = selectedItems.length > 0 && selectedItems.length < totalData;

      const handleOnChange = () => {
        // Completely unchecked. Check all
        if (!isChecked && !isIntermediate) {
          isFetchingAllData.current = true;
          handleToggleAll();
          return;
        }

        // Partially or fully checked. Uncheck all
        handleToggleRow(selectedItems);
      };

      return (
        <Stack direction="row" spacing={0}>
          <FormControlLabel
            control={
              <StyledCheckbox
                onChange={handleOnChange}
                checked={isChecked || isFetchingAllData.current}
                indeterminate={isIntermediate && !isFetchingAllData.current}
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
  const { data: dataSubmission, refetch: refetchSubmission, updateQuery } = useSubmissionContext();
  const { enqueueSnackbar } = useSnackbar();
  const { _id, name, deletingData } = dataSubmission?.getSubmission || {};

  const tableRef = useRef<TableMethods>(null);
  const filterMethodRef = useRef<FilterMethods>(null);
  const filterRef = useRef<FilterForm>({ nodeType: "", status: "All", submittedID: "" });
  const prevFilterRef = useRef<FilterForm>({ nodeType: "", status: "All", submittedID: "" });
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const isFetchingAllData = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column<T>[]>([]);
  const [data, setData] = useState<T[]>([]);
  const [prevListing, setPrevListing] = useState<FetchListing<T>>(null);
  const [totalData, setTotalData] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

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

    if (error || !d?.getSubmissionNodes || !("properties" in d.getSubmissionNodes)) {
      enqueueSnackbar("Unable to retrieve node data.", { variant: "error" });
      setLoading(false);
      return;
    }

    if (!d?.getSubmissionNodes?.total || !d?.getSubmissionNodes?.properties?.length) {
      setData([]);
      setTotalData(0);
      setLoading(false);
      setColumns([]);
      return;
    }

    // Only update columns if the nodeType has changed or if there are no previous columns
    if (prevFilterRef.current.nodeType !== filterRef.current.nodeType || !columns.length) {
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

      setColumns(cols);
    }

    prevFilterRef.current = filterRef.current;
    setTotalData(d.getSubmissionNodes.total);
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
      isFetchingAllData.current = false;
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
      isFetchingAllData.current = false;
      return;
    }

    setSelectedItems(d.getSubmissionNodes.nodes.map((node) => node.nodeID));
    isFetchingAllData.current = false;
  }, [_id, filterRef, data, totalData, isFetchingAllData, setSelectedItems]);

  const handleOnDelete = (successMessage: string) => {
    setDeleteSuccessMessage(successMessage);
    setSelectedItems([]);

    updateQuery((prev) => ({
      ...prev,
      getSubmission: {
        ...prev.getSubmission,
        deletingData: true,
      },
    }));

    // Kick off polling to check for deletion status change
    // NOTE: We're waiting 1000ms to allow the cache to update
    setTimeout(refetchSubmission, 1000);
  };

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
    () => ({ handleToggleRow, handleToggleAll, selectedItems, totalData, isFetchingAllData }),
    [handleToggleRow, handleToggleAll, selectedItems, totalData, isFetchingAllData]
  );

  useEffect(() => {
    if (deletingData === true || !deleteSuccessMessage) {
      return;
    }

    enqueueSnackbar(deleteSuccessMessage, { variant: "success" });
    setDeleteSuccessMessage(null);

    tableRef.current?.setPage(0, true);
    filterMethodRef.current?.refetch();
  }, [deletingData]);

  return (
    <>
      <StyledAlert
        severity="warning"
        visible={deletingData === true}
        data-testid="submitted-data-deletion-alert"
      >
        All selected nodes are currently being deleted. Please wait...
      </StyledAlert>
      <SubmittedDataFilters
        submissionId={_id}
        onChange={handleFilterChange}
        ref={filterMethodRef}
      />
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
          setItemKey={(item, idx) => `${idx}_${item.nodeID}`}
          onFetchData={handleFetchData}
          containerProps={{ sx: { marginBottom: "8px" } }}
          tableProps={{ sx: { whiteSpace: "nowrap" } }}
        />
      </DataViewContext.Provider>
    </>
  );
};

export default React.memo(SubmittedData);
