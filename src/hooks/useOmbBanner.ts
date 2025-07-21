import { useQuery } from "@apollo/client";
import { GET_OMB_BANNER, GetOmbBannerResp } from "../graphql";

/**
 * Custom hook to fetch OMB banner data with cache-first policy
 *
 * @returns Object containing loading state, error, and OMB banner data
 */
export const useOmbBanner = () => {
  const { data, loading, error } = useQuery<GetOmbBannerResp>(GET_OMB_BANNER, {
    fetchPolicy: "cache-first",
    errorPolicy: "all", // Return partial data even on error
  });

  return {
    loading,
    error,
    ombBanner: data?.getOmbBanner,
  };
};

export default useOmbBanner;
