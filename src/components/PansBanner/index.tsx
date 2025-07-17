import { useQuery } from "@apollo/client";
import { Box, Skeleton, Stack, styled, Typography } from "@mui/material";
import React, { memo } from "react";

import { RETRIEVE_OMB_DETAILS, RetrieveOMBDetailsResp } from "../../graphql";

const StyledBox = styled(Box)({
  padding: "20px",
  borderBottom: "0.5px solid #6B7294",
  marginBottom: "38px",
});

const StyledHeaderStack = styled(Stack)({
  flexDirection: "row",
  columnGap: "15px",
  alignItems: "center",
  marginBottom: "16px",
});

const StyledApprovalNumber = styled(Typography)({
  fontWeight: 600,
  fontSize: "17px",
  color: "#5A7C81",
});

const StyledExpirationDate = styled(Typography)({
  fontWeight: 400,
  fontSize: "14px",
  color: "#2A836D",
  fontFamily: "'Inter', 'Nunito', sans-serif",
});

const StyledContent = styled(Typography)({
  fontSize: "13px",
  color: "#2A836D",
});

/**
 * Loading placeholder component for the PANS banner
 */
const PansBannerLoading: React.FC = () => (
  <StyledBox>
    <StyledHeaderStack>
      <Skeleton
        variant="text"
        width={160}
        height={25}
        data-testid="pans-approval-number-skeleton"
      />
      <Skeleton variant="text" width={180} height={20} data-testid="pans-expiration-skeleton" />
    </StyledHeaderStack>
    <div data-testid="pans-content-skeleton">
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="90%" height={18} />
      <Skeleton variant="text" width={0} height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="80%" height={18} />
    </div>
  </StyledBox>
);

/**
 * Handles the rendering of the Privacy Act Notification Statement (PANS) banner.
 *
 * @returns {React.FC}
 */
const PansBanner: React.FC = (): React.ReactNode => {
  const { data, loading, error } = useQuery<RetrieveOMBDetailsResp>(RETRIEVE_OMB_DETAILS, {
    fetchPolicy: "cache-first",
    context: { clientName: "mockService" },
  });

  // If there's an error, return null
  if (error) {
    return null;
  }

  // Show loading state
  if (loading) {
    return <PansBannerLoading />;
  }

  return (
    <StyledBox>
      <StyledHeaderStack>
        <StyledApprovalNumber variant="h1" data-testid="pans-approval-number">
          OMB No.: {data?.retrieveOMBDetails.ombNumber}
        </StyledApprovalNumber>
        <StyledExpirationDate variant="h2" data-testid="pans-expiration">
          Expiration Date: {data?.retrieveOMBDetails.expirationDate}
        </StyledExpirationDate>
      </StyledHeaderStack>
      <StyledContent data-testid="pans-content">
        {data?.retrieveOMBDetails.content.map((paragraph, index) => (
          <React.Fragment key={paragraph.substring(0, 50).replace(/\s/g, "")}>
            {paragraph}
            {index < data.retrieveOMBDetails.content.length - 1 && (
              <>
                <br />
                <br />
              </>
            )}
          </React.Fragment>
        ))}
      </StyledContent>
    </StyledBox>
  );
};

export default memo(PansBanner);
