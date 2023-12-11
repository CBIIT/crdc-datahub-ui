import { FC, useCallback, useState } from 'react';
import { PieChart, Pie, Label, Cell } from 'recharts';
import { Box, styled } from '@mui/material';
import PieChartCenter from './PieChartCenter';
import ActiveArc from './ActiveArc';

export type PieSectorDataItem = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  /**
   * The data to display in the pie chart
   */
  data: PieSectorDataItem[];
};

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
 * Builds a summary of node states (passed, new, ...) chart for the node statistics
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const NodeTotalChart: FC<Props> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onMouseOver = useCallback((data, index) => setActiveIndex(index), []);
  const onMouseLeave = useCallback(() => setActiveIndex(null), []);

  return (
    <StyledChartContainer>
      <PieChart width={391} height={391}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={391 / 2}
          innerRadius={115}
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
          activeShape={ActiveArc}
          activeIndex={activeIndex}
        >
          {data.map(({ label, color }) => (<Cell key={label} fill={color} />))}
          <Label
            position="center"
            content={(
              <PieChartCenter
                title="Total"
                subtitle={data?.[activeIndex]?.label}
                value={data?.[activeIndex]?.value}
              />
            )}
          />
        </Pie>
      </PieChart>
    </StyledChartContainer>
  );
};

export default NodeTotalChart;
