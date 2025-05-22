import { Grid, IconButton, Stack, Typography, styled } from "@mui/material";
import { memo } from "react";
import TruncatedText from "../TruncatedText";
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon_2.svg";
import Tooltip from "../Tooltip";

const StyledLabel = styled(Typography)(() => ({
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
}));

export const StyledValue = styled(Typography)(() => ({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  display: "inline",
}));

const StyledWrapper = styled("span", {
  shouldForwardProp: (p) => p !== "disabled",
})<{ disabled: boolean }>(({ disabled }) => ({
  cursor: disabled ? "not-allowed" : "auto",
}));

const StyledCopyIDButton = styled(IconButton)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: 0,
  height: "fit-content",
  "&.MuiIconButton-root.Mui-disabled": {
    color: "#B0B0B0",
  },
  "&.Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
    cursor: "not-allowed",
  },
  marginLeft: "8px",
}));

type Props = {
  label: string;
  value: string | JSX.Element;
  tooltipText?: string;
  showCopyTextIcon?: boolean;
  copyText?: string;
  truncateAfter?: number | false;
};

const SubmissionHeaderProperty = ({
  label,
  value,
  tooltipText,
  showCopyTextIcon,
  copyText,
  truncateAfter = 16,
}: Props) => {
  const handleCopyText = () => {
    if (!copyText?.trim()) {
      return;
    }

    navigator.clipboard.writeText(copyText);
  };

  return (
    <Grid lg={6} xs={12} item>
      <Stack direction="row" alignItems="center" width="100%" maxWidth="100%" spacing={2.75}>
        <StyledLabel variant="body1">{label}</StyledLabel>
        <Stack
          flexDirection="row"
          flexGrow={1}
          alignItems="center"
          overflow="hidden"
          lineHeight="16px"
        >
          {typeof value === "string" ? (
            <StyledValue variant="body1" data-testid="property-value">
              {truncateAfter && truncateAfter > 0 ? (
                <TruncatedText
                  text={value}
                  maxCharacters={truncateAfter}
                  underline={false}
                  disableHoverListener={showCopyTextIcon ? false : undefined}
                  wrapperSx={{ lineHeight: "20px" }}
                  tooltipText={tooltipText || undefined}
                  ellipsis
                  arrow
                />
              ) : (
                value
              )}
            </StyledValue>
          ) : (
            value
          )}

          {showCopyTextIcon && (
            <Tooltip
              placement="top"
              title="Copy the Program full name"
              open={undefined}
              disableHoverListener={!copyText}
              arrow
            >
              <StyledWrapper disabled={!copyText}>
                <StyledCopyIDButton
                  data-testid={`copy-${label}-button`}
                  aria-label={`Copy ${label}`}
                  onClick={handleCopyText}
                  disabled={!copyText}
                >
                  <CopyIconSvg />
                </StyledCopyIDButton>
              </StyledWrapper>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Grid>
  );
};

export default memo(SubmissionHeaderProperty);
