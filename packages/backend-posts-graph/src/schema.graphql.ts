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

  type PostsWithCursor {
    posts: [Post!]!
    cursor: String
  }

  type Like @key(fields: "id") {
    id: ID!
    posts_id: ID!
    accounts_id: ID
    author: Account
    post: Post!
  }

  extend type Account @key(fields: "id") {
    id: ID! @external
    posts: [Post!]!
    likes: [Like!]!
  }

  input PostsInput {
    accountId: String
    cursor: String
  }

  type Query {
    posts(input: PostsInput): PostsWithCursor
    post(id: ID!): Post
  }

  type Mutation {
    makePost(body: String): Post
    likePost(id: ID!): Like
  }
`;
