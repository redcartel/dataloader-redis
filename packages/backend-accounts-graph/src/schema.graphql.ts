import gql from "graphql-tag";

export const accountsSchema = gql`
type Account @key(fields: "id") {
  id: ID!
  email: String!
  username: String!,
  created_at: String!,
  updated_at: String!
}

type Query {
  account(id: ID!): Account
}`