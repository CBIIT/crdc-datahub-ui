import { useEffect, useMemo, useRef, useState } from "react";
import { Box, styled, Tab, TabProps, Tabs } from "@mui/material";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useSnackbar } from "notistack";
import { isEqual } from "lodash";
import {
  GET_RELATED_NODES,
  GET_RELATED_NODE_PROPERTIES,
  GetRelatedNodePropertiesInput,
  GetRelatedNodePropertiesResp,
  GetRelatedNodesInput,
  GetRelatedNodesResp,
} from "../../graphql";
import GenericTable, { Column } from "../GenericTable";
import { safeParse } from "../../utils";

const StyledTabs = styled(Tabs)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  zIndex: 3,
  paddingLeft: "43px",
  paddingRight: "43px",
  marginTop: "59px",
  "& .MuiTabs-flexContainer": {
    justifyContent: "flex-start",
  },
  "& .MuiTabs-indicator": {
    display: "none !important",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottom: "1.25px solid #00799E",
    zIndex: 1,
  },
}));

const StyledTab = styled(Tab)<TabProps>(() => ({
  color: "#4D7C8F",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "17px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19.6px",
  borderRadius: "8px 8px 0px 0px",
  borderTop: "1.25px solid transparent",
  borderRight: "1.25px solid transparent",
  borderLeft: "1.25px solid transparent",
  background: "transparent",
  textTransform: "capitalize",
  marginRight: 0,
  display: "inline-flex",
  padding: "14.49px 46px 12.51px 43px",
  justifyContent: "center",
  alignItems: "center",
  opacity: 1,
  zIndex: 0,
  minHeight: 0,
  alignSelf: "flex-end",

  "&.Mui-selected": {
    zIndex: 2,
    color: "#00578A",
    fontWeight: 800,
    borderRadius: "8px 8px 0px 0px",
    borderTop: "1.25px solid #00799E",
    borderRight: "1.25px solid #00799E",
    borderLeft: "1.25px solid #00799E",
    borderBottom: "1.25px solid transparent",
    background: "#FFF",
  },
}));
const StyledContentWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderLeft: "1.25px solid #00799E",
  borderRight: "1.25px solid #00799E",
  borderBottom: "1.25px solid #00799E",
  backgroundColor: "#FFF",
  padding: "35px 40px 39px 40px",
}));

type T = Pick<SubmissionNode, "props" | "status">;

type NodeTab = {
  name: string;
  relationship: NodeRelationship;
};

type Props = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
  parentNodes: NodeDetailResult["parents"];
  childNodes: NodeDetailResult["children"];
};

const RelatedNodes = ({ submissionID, nodeType, nodeID, parentNodes, childNodes }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState<NodeTab>(null);
  const [state, setState] = useState<GetRelatedNodesResp["getRelatedNodes"]>(null);
  const [error, setError] = useState<boolean>(false);
  const [columns, setColumns] = useState<Column<T>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [prevListing, setPrevListing] = useState<FetchListing<T>>(null);

  const tableRef = useRef<TableMethods>(null);
  const columnsRetrievedRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const handleSetupColumns = (rawColumns: string[]) => {
    const cols: Column<T>[] = rawColumns?.map((prop: string, idx: number) => ({
      label: prop,
      renderValue: (d) => d?.props?.[prop],
      fieldKey: prop,
      default: idx === 0 ? true : undefined,
    }));

    setColumns(cols || []);
    columnsRetrievedRef.current = true;
  };

  const { loading: loadingColumns } = useQuery<
    GetRelatedNodePropertiesResp,
    GetRelatedNodePropertiesInput
  >(GET_RELATED_NODE_PROPERTIES, {
    variables: {
      submissionID,
      nodeType,
      nodeID,
      relationship: currentTab?.relationship,
      relatedNodeType: currentTab?.name,
    },
    skip: !submissionID || !nodeType || !nodeID || !currentTab?.relationship || !currentTab?.name,
    onCompleted: (data) => handleSetupColumns(data?.getRelatedNodes?.properties),
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const [getRelatedNodes] = useLazyQuery<GetRelatedNodesResp, GetRelatedNodesInput>(
    GET_RELATED_NODES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const firstTab: NodeTab | null = useMemo(() => {
    if (!parentNodes?.length && !childNodes?.length) {
      return null;
    }

    const isParent = parentNodes?.length > 0;
    return {
      relationship: isParent ? "parent" : "child",
      name: isParent ? parentNodes[0].nodeType : childNodes[0].nodeType,
    };
  }, [parentNodes, childNodes]);

  useEffect(() => {
    if (!error || !submissionID || !nodeType || !currentTab) {
      return;
    }

    enqueueSnackbar("Unable to load node details.", { variant: "error" });
  }, [error]);

  useEffect(() => {
    if (!currentTab) {
      return;
    }

    setColumns([]);
    setState(null);
    columnsRetrievedRef.current = false;
  }, [currentTab]);

  useEffect(() => {
    if (!firstTab || currentTab === firstTab) {
      return;
    }

    setCurrentTab(firstTab);
  }, [firstTab]);

  useEffect(() => {
    tableRef.current?.setPage(0, true);
  }, [columnsRetrievedRef.current]);

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    try {
      if (!currentTab?.relationship || !currentTab?.name) {
        return;
      }
      if (!force && state?.nodes?.length > 0 && isEqual(fetchListing, prevListing)) {
        return;
      }
      if (abortControllerRef.current && prevListing) {
        abortControllerRef.current.abort();
      }
      if (!columns?.length) {
        return;
      }

      setLoading(true);
      setPrevListing(fetchListing);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const { data: d, error } = await getRelatedNodes({
        variables: {
          submissionID,
          nodeType,
          nodeID,
          relationship: currentTab.relationship,
          relatedNodeType: currentTab.name,
          first,
          offset,
          sortDirection,
          orderBy,
        },
        context: { clientName: "backend", fetchOptions: { signal: abortController.signal } },
        fetchPolicy: "no-cache",
      });
      if (abortController.signal.aborted) {
        return;
      }
      if (error || !d?.getRelatedNodes) {
        throw new Error("Unable to retrieve Related Nodes.");
      }

      setState({
        nodes: d.getRelatedNodes.nodes?.map((node) => ({
          nodeType: node.nodeType,
          nodeID: node.nodeID,
          props: safeParse(node.props),
          status: node.status,
        })),
        total: d.getRelatedNodes?.total,
      });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTab = (name: string, relationship: NodeRelationship) => {
    setCurrentTab({ relationship, name });
  };

  const isLoading = loading || !columnsRetrievedRef.current || loadingColumns || !prevListing;

  return (
    <>
      <StyledTabs value={currentTab?.name || false} aria-label="Related nodes tabs">
        {parentNodes?.map((parent, idx) => (
          <StyledTab
            key={`parent_node_tab_${parent.nodeType}`}
            value={parent.nodeType}
            label={parent.nodeType}
            aria-label={`Related parent node tab ${parent.nodeType}`}
            data-testid="related-nodes-parent-node-tab"
            onClick={() => handleSelectTab(parent.nodeType, "parent")}
            disableRipple
          />
        ))}
        {childNodes?.map((child) => (
          <StyledTab
            key={`child_node_tab_${child.nodeType}`}
            value={child.nodeType}
            label={child.nodeType}
            aria-label={`Related child node tab ${child.nodeType}`}
            data-testid="related-nodes-child-node-tab"
            onClick={() => handleSelectTab(child.nodeType, "child")}
            disableRipple
          />
        ))}
      </StyledTabs>
      <StyledContentWrapper>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={state?.nodes || []}
          total={state?.total || 0}
          loading={isLoading}
          defaultRowsPerPage={10}
          numRowsNoContent={5}
          defaultOrder="desc"
          position="both"
          onFetchData={handleFetchData}
          tableProps={{ sx: { whiteSpace: "nowrap" } }}
          setItemKey={(item, idx) => `${idx}_${nodeType}_${nodeID}_${item.status}`}
        />
      </StyledContentWrapper>
    </>
  );
};

export default RelatedNodes;
