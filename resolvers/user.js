const { UserInputError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const { schema_create_user, schema_signup, schema_signin } = require("../validations/user");
const { generate_tokens } = require("../helpers/functions");

const resolvers = {
    Query: {
        users: async () => await User.find({})
    },
    Mutation: {
        signup: async (_, payload) => {
            const { error } = schema_signup.validate(payload.input, { abortEarly: false });
            if(error)
                throw new UserInputError("Faild to signup", {
                    validationErrors: error.details
                });
            const user = new User(payload.input);
            await user.save();
            return user;
        },

        signin: async (_, payload, { res }) => {
            const { error } = schema_signin.validate(payload.input, { abortEarly: false });
            if(error)
                throw new UserInputError("Faild to signin", {
                    validationErrors: error.details
                });
            const user = await User.findOne({ email: payload.input.email });
            if(!user) return { ok: false, message: "Your email not exist"};
            if(!bcrypt.compareSync(payload.input.password, user.password))
                return { ok: false, message: "Your password is incorrect"};
            const { rt, at } = generate_tokens(user);
            res.cookie("rt", rt, { expire: 60 * 5, httpOnly: true });
            res.cookie("at", at, { expire: 60 * 60 * 24 * 30, httpOnly: true });        
            return {
                ok: true,
                message: "user has been connected"
            };
        },

        // signout: async () => {
        //     // todo signout.
        //     console.log("signout");
        // },

        create_user: async (_, payload) => {
            const { error } = schema_create_user.validate(payload.input, { abortErly: false });
            if(error) 
                throw new UserInputError("Faild to create user due to validate error", {
                    validationErrors: error.details
                });
            const new_user = new User(payload.input);
            await new_user.save();
            return new_user;
        },

        delete_user: async (_, { users_id }) => {
            const res = await User.deleteMany({ _id: { $in: users_id }}, (err) => {
                if(err) throw new UserInputError(err);
            });
            if(res.deletedCount === 0) throw new UserInputError("No user has been deleted");
            return users_id.length();
        }
    }
};

module.exports = {
    resolvers
};