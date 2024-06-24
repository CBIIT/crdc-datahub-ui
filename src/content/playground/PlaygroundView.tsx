import { FC, memo } from "react";
import { Box, styled } from "@mui/material";
import type { Fetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { print } from "graphql";
import { GET_MY_USER } from "../../graphql";

const StyledContainer = styled(Box)({
  height: "100vh",
});

type Props = {
  fetcher: Fetcher;
};

/**
 * Provides a GraphiQL playground for exploring the GraphQL API
 *
 * @param fetcher The GraphiQL fetcher component
 * @returns Playground component
 */
const GraphqlPlayground: FC<Props> = ({ fetcher }) => (
  <StyledContainer>
    <GraphiQL
      fetcher={fetcher}
      defaultQuery={print(GET_MY_USER)}
      showPersistHeadersSettings={false}
      forcedTheme="light"
      disableTabs
    />
  </StyledContainer>
);

export default memo(GraphqlPlayground);
