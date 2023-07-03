import { Collapse, Grid } from "@mui/material";
import { TransitionGroup } from "react-transition-group";

type WithKey = { key: string };

type Props<T extends WithKey> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

/**
 * Creates a TransitionGroup and adds a Collapse transition
 * when an item is added or removed.
 *
 * NOTE:
 * - This component was created to be directly used within
 *   the SectionGroup component.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const TransitionGroupWrapper = <T extends WithKey>({
  items,
  renderItem,
}: Props<T>) => (
  <Grid item xs={12}>
    <Grid container rowSpacing={1.5} columnSpacing={0}>
      <TransitionGroup component={null} style={{ width: "100%" }}>
        {items?.map((item: T, idx: number) => (
          <Grid key={item.key} item xs={12} component={Collapse}>
            {renderItem(item, idx)}
          </Grid>
        ))}
      </TransitionGroup>
    </Grid>
  </Grid>
);

export default TransitionGroupWrapper;
