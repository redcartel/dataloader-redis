import gql from "graphql-tag";

export const postsSchema = gql`
type Post @key(fields: "id") {
  id: ID!
  accounts_id: ID! 
  body: String!
  author: Account!
}

extend type Account @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
}

type Query {
  post(id: ID!): Post
}`