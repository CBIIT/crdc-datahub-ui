import { FC, LazyExoticComponent, Suspense } from "react";

import SuspenseLoader from "../SuspenseLoader";

/**
 * Provides a basic lazy loader for components with a loading indicator.
 *
 * @param Component The component to be loaded.
 * @param placeholder The loading indicator to be displayed while the component is loading.
 * @returns The component wrapped in a Suspense component.
 */
const LazyLoader =
  (Component: LazyExoticComponent<FC>, Fallback: FC = SuspenseLoader) =>
  (props) => (
    <Suspense fallback={<Fallback />}>
      <Component {...props} />
    </Suspense>
  );

export default LazyLoader;
