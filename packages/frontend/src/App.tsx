import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";
import { PreBuiltUIList, SuperTokensConfig, ComponentWrapper } from "./config";
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { LoggedOutHome } from "./LoggedOutHome";

SuperTokens.init(SuperTokensConfig);

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <SuperTokensWrapper>
      <ApolloProvider client={client}>
        <ComponentWrapper>
            <Router>
                <Routes>
                  {/* This shows the login UI on "/auth" route */}
                  {getSuperTokensRoutesForReactRouterDom(
                    require("react-router-dom"),
                    PreBuiltUIList,
                  )}

                  <Route
                    path="/login"
                    element={
                      /* This protects the "/" route so that it shows
                                    <Home /> only if the user is logged in.
                                    Else it redirects the user to "/auth" */
                      <SessionAuth>
                        <Home />
                      </SessionAuth>
                    }/>
                    <Route
                      path="/"
                      element={
                        <LoggedOutHome/>
                      }
                  />
                </Routes>
            </Router>
        </ComponentWrapper>
      </ApolloProvider>
    </SuperTokensWrapper>
  );
}

export default App;
