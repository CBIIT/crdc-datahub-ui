import { Box, Stack, styled, Typography, Skeleton } from "@mui/material";
import React, { memo } from "react";
import { useOmbBanner } from "../../hooks/useOmbBanner";

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

// Fallback data for when the API is unavailable or returns an error
const FALLBACK_OMB_DATA = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content: `Collection of this information is authorized by The Public Health Service Act, Section 411 (42 USC 285a). Rights of participants are protected by The Privacy Act of 1974. Participation is voluntary, and there are no penalties for not participating or withdrawing at any time. Refusal to participate will not affect your benefits in any way. The information collected will be kept private to the extent provided by law. Names and other identifiers will not appear in any report. Information provided will be combined for all participants and reported as summaries. You are being contacted online to complete this form so that NCI can consider your study for submission into the Cancer Research Data Commons.

Public reporting burden for this collection of information is estimated to average 60 minutes per response, including the time for reviewing instructions, searching existing data sources, gathering and maintaining the data needed, and completing and reviewing the collection of information. An agency may not conduct or sponsor, and a person is not required to respond to, a collection of information unless it displays a currently valid OMB control number. Send comments regarding this burden estimate or any other aspect of this collection of information, including suggestions for reducing this burden to: NIH, Project Clearance Branch, 6705 Rockledge Drive, MSC 7974, Bethesda, MD 20892-7974, ATTN: PRA (0925-7775). Do not return the completed form to this address.`,
};

/**
 * Loading skeleton component for the PANS banner
 */
const PansBannerSkeleton: React.FC = () => (
  <StyledBox>
    <StyledHeaderStack>
      <Skeleton variant="text" width={140} height={24} />
      <Skeleton variant="text" width={180} height={20} />
    </StyledHeaderStack>
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="90%" height={16} />
    <Box mt={2}>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="80%" height={16} />
    </Box>
  </StyledBox>
);

/**
 * Handles the rendering of the Privacy Act Notification Statement (PANS) banner.
 * Dynamically loads OMB banner content from the backend with cache-first policy.
 * Falls back to hardcoded content if the API is unavailable.
 *
 * @returns {React.FC}
 */
const PansBanner: React.FC = (): React.ReactNode => {
  const { loading, ombBanner } = useOmbBanner();

  // Show loading skeleton while fetching data
  if (loading) {
    return <PansBannerSkeleton />;
  }

  // Use dynamic data if available, otherwise fall back to hardcoded content
  const bannerData = ombBanner || FALLBACK_OMB_DATA;
  const paragraphs = bannerData.content.split("\n\n");

  return (
    <StyledBox>
      <StyledHeaderStack>
        <StyledApprovalNumber variant="h1" data-testid="pans-approval-number">
          OMB No.: {bannerData.ombNumber}
        </StyledApprovalNumber>
        <StyledExpirationDate variant="h2" data-testid="pans-expiration">
          Expiration Date: {bannerData.expirationDate}
        </StyledExpirationDate>
      </StyledHeaderStack>
      <StyledContent>
        {paragraphs.map((paragraph, index) => (
          <React.Fragment key={`paragraph-${paragraph.substring(0, 10)}`}>
            {paragraph}
            {index < paragraphs.length - 1 && (
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
