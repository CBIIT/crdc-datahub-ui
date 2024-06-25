import { FC, useMemo } from "react";
import { createGraphiQLFetcher, Fetcher } from "@graphiql/toolkit";
import PlaygroundView from "./PlaygroundView";
import env from "../../env";

/**
 * Controller for the GraphQL Playground page
 *
 * @returns {FC} Controller
 */
const Controller: FC = () => {
  const fetcher: Fetcher = useMemo(
    () => createGraphiQLFetcher({ url: env.REACT_APP_BACKEND_API }),
    [env.REACT_APP_BACKEND_API]
  );

  return <PlaygroundView fetcher={fetcher} />;
};

export default Controller;
