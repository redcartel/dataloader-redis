import gql from "graphql-tag";

export const schema = gql`
    type AccountToken {
        username: String
        email: String
        token: String
    }

    type Query {
        me : AccountToken
    }

    type Mutation {
        login(username: String!, password: String!) : AccountToken
    }
`