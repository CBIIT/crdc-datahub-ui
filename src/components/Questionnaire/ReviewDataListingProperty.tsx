import { Stack, styled } from "@mui/material";
import { FC } from "react";

const StyledLabel = styled("span")(() => ({
  color: "#889DA7",
  fontSize: "13px",
  fontFamily: "Nunito",
  fontWeight: 700,
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
}));

const StyledValue = styled("span")(() => ({
  color: "#083A50",
  fontSize: "16px",
  fontFamily: "Nunito",
  fontWeight: 400,
  lineHeight: "19.6px",
}));

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "8px",
}));

const StyledLabelWrapper = styled(Stack)(() => ({
  display: "inline-flex",
  marginRight: "8px"
}));

const StyledPropertyWrapper = styled(Stack)(() => ({
  marginBottom: "3px",
}));

type Props = {
  label?: string | JSX.Element;
  value: string | JSX.Element;
  valuePlacement?: "right" | "bottom";
  hideLabel?: boolean;
  required?: boolean;
};

const ReviewDataListingProperty: FC<Props> = ({
  label,
  value,
  valuePlacement = "right",
  hideLabel = false,
  required = false,
}) => (
  <StyledPropertyWrapper
    direction={valuePlacement === "bottom" ? "column" : "row"}
    alignItems={valuePlacement === "bottom" ? "start" : "center"}
    justifyContent="start"
  >
    {label && (
      <StyledLabelWrapper direction="row" alignItems="center">
        <StyledLabel>{!hideLabel && label}</StyledLabel>
        {required && <StyledAsterisk>*</StyledAsterisk>}
      </StyledLabelWrapper>
    )}
    <Stack
      display={valuePlacement === "right" ? "inline-flex" : "flex"}
      direction="row"
      alignItems="center"
    >
      <StyledValue>{value}</StyledValue>
    </Stack>
  </StyledPropertyWrapper>
);

export default ReviewDataListingProperty;
