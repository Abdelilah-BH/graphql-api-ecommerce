const { gql } = require("apollo-server-express");

const type_defs = gql`
    enum Civility {
        Mr
        Mrs
    }

    enum Roles {
        ROOT
        ADMIN
        USER
    }

    type Query {
        users: [User!]
        user(user_id: ID!): User!
    }
    
    input UserInput {
        name: String!
        email: String!
        role: Roles
        password: String
        confirmation_password: String
        phone: String
        civility: Civility!
        date_of_birth: String
    }

    input SignupInput {
        civility: Civility!
        name: String!
        email: String!
        password: String!
        confirmation_password: String!
    }

    input SinginInput {
        email: String!
        password: String!
    }

    type Result {
        ok: Boolean!
        message: String!
    }

    type Mutation {
        signup(input: SignupInput!): User
        signin(input: SinginInput!): Result
        signout: Result
        create_user(input: UserInput!): User
        update_user(users_id: ID!, input: UserInput ): Result
        delete_user(users_id: [ID]!): User
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        role: Roles
        password: String
        phone: String
        civility: Civility
        date_of_birth: String
        is_deleted: Boolean
        history: [History]
        at: String
        rt: String
    }

    scalar Date

    type History {
        _id: ID!
        type_of_action: Actions
        user: ID!
        date: Date
    }

    enum Actions {
        ADD
        UPDATE
        DELETE
    }
`;

module.exports = { type_defs };
