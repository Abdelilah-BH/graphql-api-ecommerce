const { gql } = require("apollo-server-express");

const type_defs = gql`
    directive @permissions(requires: [Roles]) on FIELD_DEFINITION

    type Query {
        users: [user_output!] @permissions
        user(user_id: ID!): user_output!
        get_access_token(rt: String!): Output
        isAuth(at: String!): Output
    }

    type Mutation {
        signup(input: register_input!): user_output
        signin(input: login_input!): output_signin
        signout: Output
        create_user(input: create_user_input!): user_output
        update_user(users_id: ID!, input: update_user_input ): Output
        delete_user(users_id: [ID]!): user_output
    }

    type output_signin {
        ok: Boolean!
        access_token: String!
    }
    
    input create_user_input {
        name: String!
        email: String!
        role: Roles
        password: String!
        confirmation_password: String!
        phone: String
        is_active: Boolean!
        civility: Civility!
        date_of_birth: String
    }

    input update_user_input {
        name: String
        email: String
        role: Roles
        password: String
        confirmation_password: String
        phone: String
        is_active: Boolean
        civility: Civility
        date_of_birth: String
    }

    type user_output {
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


    enum Roles {
        ROOT
        ADMIN
        USER
    }

    enum Civility {
        Mr
        Mrs
    }

    input register_input {
        civility: Civility!
        name: String!
        email: String!
        password: String!
        confirmation_password: String!
    }

    input login_input {
        email: String!
        password: String!
    }

    type Output {
        ok: Boolean!
        message: String!
    }

`;

module.exports = { type_defs };
