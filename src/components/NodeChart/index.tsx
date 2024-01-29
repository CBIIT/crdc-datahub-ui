import React, { FC, useCallback, useMemo, useState } from 'react';
import { Box, Typography, styled } from "@mui/material";
import { PieChart, Pie, Label, Cell } from 'recharts';
import { isEqual } from 'lodash';
import PieChartCenter from './PieChartCenter';

export type PieSectorDataItem = {
  label: string;
  value: number;
  color: string;
};

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
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "21px",
  textTransform: "capitalize",
  marginBottom: "12px",
  textAlign: "center",
  alignSelf: "center",
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
  const onMouseOver = useCallback((data) => setHoveredSlice(data), []);
  const onMouseLeave = useCallback(() => setHoveredSlice(null), []);

  return (
    <StyledChartContainer>
      {label && <StyledPieChartLabel>{label}</StyledPieChartLabel>}
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
          {(dataset.length === 0 && hoveredSlice === null) && <Label position="center" content={(<PieChartCenter title="Total" value={0} />)} />}
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
          {dataset.map(({ label, color }) => (<Cell key={label} fill={color} />))}
          <Label
            position="center"
            content={(
              <PieChartCenter
                title={hoveredSlice ? hoveredSlice.label : "Total"}
                value={hoveredSlice ? hoveredSlice.value : centerCount}
              />
            )}
          />
        </Pie>
      </PieChart>
    </StyledChartContainer>
  );
};

export default React.memo<Props>(NodeChart, (prevProps, nextProps) => isEqual(prevProps, nextProps));
