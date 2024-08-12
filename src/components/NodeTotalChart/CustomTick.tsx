import { styled } from "@mui/material";
import { titleCase } from "../../utils";

const StyledText = styled("text")({
  fontFamily: "Roboto",
  fontSize: "11px",
  fontWeight: 400,
  color: "#474747",
  textTransform: "capitalize",
  overflow: "hidden",
  userSelect: "none",
  textAnchor: "start",
});

const CustomTick = ({ x, y, payload, labelLength = 8 }) => {
  const tickLabel: string = titleCase(payload?.value?.replace(/_/g, " "));

  return (
    <g transform={`translate(${x},${y})`}>
      <g transform="rotate(65), translate(-4, 7)">
        <StyledText>
          {tickLabel?.length > labelLength
            ? `${tickLabel.slice(0, labelLength).trim()}...`
            : tickLabel}
        </StyledText>
      </g>
    </g>
  );
};

export default CustomTick;
