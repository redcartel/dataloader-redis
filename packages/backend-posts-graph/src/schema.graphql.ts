import gql from "graphql-tag";

export const postsSchema = gql`
  type Post @key(fields: "id") {
    id: ID!
    authorId: ID!
    body: String!
    author: Account!
    createdAt: String!
    updatedAt: String!
  }

  type PostsWithCursor {
    posts: [Post!]!
    cursorTimestamp: String
    cursorId: String
  }

  extend type Account @key(fields: "id") {
    id: ID! @external
    posts: [Post!]!
  }

  input PostsInput {
    accountId: String
    cursorTimestamp: String
    cursorId: String
  }

  type Query {
    posts(input: PostsInput): PostsWithCursor
    post(id: ID!): Post
  }

  type Mutation {
    createPost(body: String): Post
  }
`;
