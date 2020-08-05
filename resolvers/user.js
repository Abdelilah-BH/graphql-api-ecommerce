const { UserInputError, AuthenticationError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/users");
const { schema_user, schema_signup, schema_signin } = require("../validations/user");
const { generate_tokens } = require("../helpers/functions");

const deleteCookie = {
    expires: new Date("1970-01-01"),
    httpOnly: true
};

const resolvers = {
    Query: {
        users: async () => await User.find({}),
        user: async (_, { user_id }) => {
            const user = await User.findOne({ _id: user_id });
            return user;
        },
        isAuth: async (_, { rt }) => {
            if(!rt) throw new AuthenticationError("you are not authenticated");
            const valid_rt = jwt.verify(rt, process.env.REFRESH_TOKEN_SECRET);
            if(valid_rt._id) {
                // I need to get just access token
                const access_token = await User.findOne({ _id: valid_rt._id }, { tokens: 1 });
                const at = access_token.tokens.find((value) => value.rt === rt).at;
                if(at) return { ok: true, message: at };
                throw new AuthenticationError("you are not authenticated");
            }
            throw new AuthenticationError("you are not authenticated");
        }
    },
    Mutation: {
        // not completed
        signup: async (_, payload) => {
            const { error } = schema_signup.validate(payload.input, { abortEarly: false });
            if(error) throw new UserInputError("Faild to signup");
            const user = new User(payload.input);
            await user.save();
            const { at, rt } = generate_tokens(user);
            user.at = at;
            user.rt = rt;
            return user;
        },

        // not completed
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
            await User.updateOne({ _id: user._id }, { $push: { tokens: { rt, at } } });
            res.cookie("rt", rt, { expire: 60 * 5, httpOnly: true });
            res.cookie("at", at, { expire: 60 * 60 * 24 * 30, httpOnly: true });        
            return {
                ok: true,
                message: "user has been connected"
            };
        },

        // not completed
        signout: async (_, payload, { res }) => {
            res.cookie("at", "deleted", deleteCookie);
            res.cookie("rt", "deleted", deleteCookie);
            return {
                ok: true,
                message: "signout with success"
            };
        },

        // not completed
        create_user: async (_, { input, consumer_id }) => {
            const { error } = schema_user.validate(input, { abortErly: false });
            if(error) 
                throw new UserInputError("Faild to create user due to validate error");
            input.history = [];
            input.history.push({
                type_of_action: "ADD",
                user: consumer_id,
                date: Date.now()
            });    
            const new_user = new User(input);
            await new_user.save();
            return new_user;
        },

        // not completed
        update_user: async (_, { input, consumer_id }) => {
            const { error } = schema_user.validate(input, { abortEarly: false });
            if(error) 
                throw new UserInputError("Faild to create user due to validate error", {
                    validationErrors: error.details
                });
            input.history = [];
            input.history.push({
                type_of_action: "UPDATE",
                user: consumer_id,
                date: Date.now()
            });
            await User.updateOne({_id: consumer_id }, input);
            return {
                ok: true,
                message: "user has been updated"
            };
        },

        // not completed
        delete_user: async (_, { users_id, consumer_id }) => {
            await User.updateMany({
                _id: { $in: users_id }
            },{
                is_deleted: true,
                history: {
                    $push: {
                        type_of_action: "DELETE",
                        user: consumer_id,
                        date: Date.now()
                    }
                }
            });
            return {
                ok: true,
                message: "users has been deleted"
            };
        }
    }
};

module.exports = resolvers;