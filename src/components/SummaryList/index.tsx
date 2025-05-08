import { memo, ReactNode, useMemo } from "react";
import { isEqual } from "lodash";
import { styled, Typography } from "@mui/material";
import Tooltip from "../Tooltip";

const StyledContainerTypography = styled(Typography)<{ component: React.ElementType }>({
  wordWrap: "break-word",
  maxWidth: "100%",
  fontSize: "inherit",
});

const StyledList = styled("ul")({
  paddingInlineStart: 16,
  marginBlockStart: 6,
  marginBlockEnd: 6,
});

const StyledListItem = styled("li")({
  "&:not(:last-child)": {
    marginBottom: 8,
  },
  fontSize: 14,
});

const StyledTypography = styled(Typography)<{ component: React.ElementType }>(() => ({
  textDecoration: "underline",
  cursor: "pointer",
  color: "#0B6CB1",
}));

export type Props<T> = {
  data: T[];
  emptyText?: string;
  getItemKey: (item: T) => string;
  renderItem: (item: T) => string | ReactNode;
  renderTooltipItem: (item: T) => string | ReactNode;
};

/**
 * A component which handles the display of the first data item
 * and displays the remaining list in a tooltip.
 *
 * @returns The formatted list of items.
 */
const SummaryList = <T,>({
  data,
  emptyText = "None.",
  getItemKey,
  renderItem,
  renderTooltipItem,
}: Props<T>): JSX.Element => {
  const tooltipContent = useMemo<React.ReactNode>(
    () => (
      <StyledList>
        {data?.map((item) => {
          const itemKey = getItemKey(item);

          return (
            <StyledListItem key={itemKey} data-testid={itemKey}>
              {renderTooltipItem(item)}
            </StyledListItem>
          );
        })}
      </StyledList>
    ),
    [data]
  );

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <span>{emptyText}</span>;
  }

  return (
    <StyledContainerTypography component="span">
      {renderItem(data[0])}
      {data.length > 1 && (
        <>
          {" and "}
          <Tooltip
            title={tooltipContent}
            placement="top"
            open={undefined}
            disableHoverListener={false}
            arrow
          >
            <StyledTypography component="span" data-testid="study-list-other-count">
              other {data.length - 1}
            </StyledTypography>
          </Tooltip>
        </>
      )}
    </StyledContainerTypography>
  );
};

type SummaryListComponent = <T>(props: Props<T>) => JSX.Element;

export default memo(SummaryList, isEqual) as SummaryListComponent;
