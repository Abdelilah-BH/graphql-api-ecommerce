const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const { defaultFieldResolver } = require("graphql");
const { generate_tokens } = require("../helpers/functions");

const checkToken = (access_token, refresh_token) => {
    let result;
    try {
        result = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        try {
            result = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            throw new AuthenticationError("you are not authenticated");
        }
    }
    return result;
};

// Create (or import) a custom schema directive
class AuthDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async function (...args) {
            let context = args[2];
            const { req, res } = context; 
            const refresh_token = req.cookies["rt"];
            const access_token = req.cookies["at"];
            if (!access_token && !refresh_token)
                throw new AuthenticationError("you are not authenticated");
            const consumer = checkToken(access_token, refresh_token);
            const { rt, at } = generate_tokens(consumer);
            res.cookie("rt", rt, { expire: 60 * 5, httpOnly: true });
            res.cookie("at", at, {
                expire: 60 * 60 * 24 * 30,
                httpOnly: true,
            });
            Object.assign(args[1], {consumer_id: consumer._id});
            return resolve.apply(this, args);
        };
    }
}

module.exports = AuthDirective;
