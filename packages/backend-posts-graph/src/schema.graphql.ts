import gql from "graphql-tag";

export const postsSchema = gql`
type Post @key(fields: "id") {
  id: ID!
  accounts_id: ID! 
  body: String!
  author: Account!
  created_at: String!
  updated_at: String!
  likes: [Like!]!
  likes_count: Int!
}

type Like @key(fields: "id") {
  id: ID!
  accounts_id: ID!
  posts_id: ID!
  post: Post!
  account: Account!
}

extend type Account @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
  likes: [Like!]!
}

type Query {
  post(id: ID!): Post
}`