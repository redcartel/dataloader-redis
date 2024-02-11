import gql from "graphql-tag";

export const schema = gql`
    type AccountToken {
        username: String
        email: String
        error: String
    }

    type Query {
        me : AccountToken
    }

    type Mutation {
        login(username: String!, password: String!) : AccountToken
    }
`