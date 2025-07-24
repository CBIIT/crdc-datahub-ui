import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { useFormContext } from "@/components/Contexts/FormContext";
import { ListInstitutionsResp, ListInstitutionsInput, LIST_INSTITUTIONS } from "@/graphql";
import { Logger } from "@/utils";

/**
 * Represents the result of calling the `useAggregatedInstitutions` hook.
 */
type UseAggregatedInstitutionsResult = {
  /**
   * The combined dataset derived from the Submission Request data and listInstitutions result
   */
  data: AggregatedInstitution[];
};

/**
 * Represents an Institution returned by the `useAggregatedInstitutions` hook.
 */
export type AggregatedInstitution = Pick<Institution, "_id" | "name">;

/**
 * A hook to aggregate the list of institutions from two locations:
 *
 *  1. The current Submission Request
 *  2. The listInstitutions API
 *
 * Also provides related utilities.
 *
 * @returns {UseAggregatedInstitutionsResult} The aggregated institutions data and related utils.
 */
const useAggregatedInstitutions = (): UseAggregatedInstitutionsResult => {
  const [list, setList] = useState<AggregatedInstitution[]>([]);

  const { data: appData } = useFormContext();
  const { data: apiData } = useQuery<ListInstitutionsResp, ListInstitutionsInput>(
    LIST_INSTITUTIONS,
    {
      variables: { first: -1, orderBy: "name", sortDirection: "asc" },
      context: { clientName: "backend" },
      fetchPolicy: "cache-first",
      onError: (e) => Logger.error("useAggregatedInstitutions received API error:", e),
    }
  );

  useEffect(() => {
    const newList: AggregatedInstitution[] = [];
    newList.push(
      ...(appData?.newInstitutions?.map(({ id, name }) => ({
        _id: id,
        name,
      })) || [])
    );

    // TODO: do we need special handling for the status?
    // I assume we need to filter out institutions that are not active
    // but also they are needed to determine if the institution is new or not
    // since hiding them would cause that some existing institutions are marked as new
    newList.push(
      ...(apiData?.listInstitutions?.institutions?.map(({ _id, name, status }) => ({
        _id,
        name,
      })) || [])
    );

    setList(newList);
  }, [appData?.newInstitutions, apiData?.listInstitutions.institutions]);

  // TODO: sorting of list
  // TODO: remove duplicates, but prioritize API data first since that's most updated
  return { data: list };
};

export default useAggregatedInstitutions;
