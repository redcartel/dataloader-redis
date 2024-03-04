import gql from "graphql-tag";

export const accountsSchema = gql`
  type Account @key(fields: "id") {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
    updatedAt: String!
  }

  type AccountResponse {
    id: ID
    email: String
  }

  type Query {
    account(id: ID!): Account
    me: AccountResponse
  }
`;
