import gql from "graphql-tag";

export const postsSchema = gql`
  type Post @key(fields: "id") {
    id: ID!
    authorId: ID!
    # body: String!
    author: Account!
    createdAt: String!
    updatedAt: String!
    # likes: [Like!]!
    # likes_count: Int!
  }

  type PostsWithCursor {
    posts: [Post!]!
    cursorTimestamp: String
    cursorId: String
  }

  type Like @key(fields: "id") {
    id: ID!
    posts_id: ID!
    accountsId: ID
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
    cursorTimestamp: String
    cursorId: String
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
