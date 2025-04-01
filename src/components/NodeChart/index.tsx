import React, { FC, useCallback, useMemo, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { PieChart, Pie, Label, Cell } from "recharts";
import { isEqual } from "lodash";
import PieChartCenter from "./PieChartCenter";
import TruncatedText from "../TruncatedText";
import { capitalizeFirstLetter, titleCase } from "../../utils";

type Props = {
  /**
   * Top label for the chart
   */
  label: string;
  /**
   * Node count to display in the center of the chart
   */
  centerCount: number;
  /**
   * The data to display in the pie chart
   */
  data: PieSectorDataItem[];
};

const StyledPieChartLabel = styled(Typography)({
  color: "#3D4551",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "21px",
  marginBottom: "12px",
  userSelect: "none",
});

const StyledChartContainer = styled(Box)({
  overflow: "visible",
  "& div": {
    margin: "0 auto",
  },
  "& svg *:focus": {
    outline: "none",
  },
});

/**
 * Builds a Pie Chart with a center "Total Count" display
 *
 * @param {string} label Top label for the chart
 * @param {number} centerCount Node count to display in the center of the chart
 * @returns {React.FC<Props>}
 */
const NodeChart: FC<Props> = ({ label, centerCount, data }: Props) => {
  const [hoveredSlice, setHoveredSlice] = useState<PieSectorDataItem>(null);

  const dataset: PieSectorDataItem[] = useMemo(() => data.filter(({ value }) => value > 0), [data]);

  const showDefaultCenter: boolean = useMemo(
    () => (dataset.length === 0 && hoveredSlice === null) || hoveredSlice?.value === 0,
    [dataset, hoveredSlice]
  );

  const reformattedLabel = useMemo<string>(() => {
    const replacedLabel = label?.replace(/_/g, " ") || "";

    // If the label has no spaces, capitalize the first letter to avoid
    // titleCase from performing a full title case conversion
    if (replacedLabel?.indexOf(" ") === -1) {
      return capitalizeFirstLetter(replacedLabel);
    }

    return titleCase(replacedLabel);
  }, [label]);

  const onMouseOver = useCallback((data) => setHoveredSlice(data), []);
  const onMouseLeave = useCallback(() => setHoveredSlice(null), []);

  return (
    <StyledChartContainer>
      {reformattedLabel && (
        <StyledPieChartLabel>
          <TruncatedText
            text={reformattedLabel}
            wrapperSx={{ margin: "0 auto" }}
            maxCharacters={14}
          />
        </StyledPieChartLabel>
      )}
      <PieChart width={150} height={150}>
        <Pie
          data={[{ value: 100 }]}
          dataKey="value"
          outerRadius={75}
          innerRadius={40}
          fill="#f2f2f2"
          isAnimationActive={false}
          aria-label={`${label} chart background`}
        >
          {showDefaultCenter ? (
            <Label position="center" content={<PieChartCenter title="Total" value={0} />} />
          ) : null}
        </Pie>
        <Pie
          data={dataset}
          dataKey="value"
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={75}
          innerRadius={40}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
          aria-label={`${label} chart`}
        >
          {dataset.map(({ label, color }) => (
            <Cell key={label} fill={color} cursor="pointer" />
          ))}
          <Label
            position="center"
            content={
              <PieChartCenter
                title={hoveredSlice ? hoveredSlice.label : "Total"}
                value={hoveredSlice ? hoveredSlice.value : centerCount}
              />
            }
          />
        </Pie>
      </PieChart>
    </StyledChartContainer>
  );
};

export default React.memo<Props>(NodeChart, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
