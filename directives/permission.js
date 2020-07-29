const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const { defaultFieldResolver } = require("graphql");
const { generate_tokens } = require("../helpers/functions");
const { User } = require("../models/users");

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

// not complete
class PermissionDirective extends SchemaDirectiveVisitor {
    visitObject(type) {
        console.log("kkkkk");
        this.ensureFieldsWrapped(type);
        type._requiredAuthRole = this.args.requires;
    }
    // Visitor methods for nested types like fields and arguments
    // also receive a details object that provides information about
    // the parent and grandparent types.
    visitFieldDefinition(field, details) {
        let user_id = "";
        this.ensureFieldsWrapped(details.objectType, user_id);
        field._requiredAuthRole = this.args.requires;    

    }

    ensureFieldsWrapped(objectType, user_id) {
        console.log(user_id);
        // Mark the GraphQLObjectType object to avoid re-wrapping:
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const { resolve = defaultFieldResolver } = field;
            field.resolve = async function (...args) {
            // Get the required Role from the field first, falling back
            // to the objectType if no Role is required by the field:
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
                const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;
                if (!requiredRole) {
                    return resolve.apply(this, args);
                }
                const user = await User.findOne({ _id: consumer._id });
                console.log({requiredRole: requiredRole.includes(user.role)});
                if (!requiredRole.includes(user.role)) {
                    throw new Error("not authorized");
                }

                Object.assign(args[1], {consumer_id: consumer._id});
                return resolve.apply(this, args);
            };
        });
    }
}

module.exports = PermissionDirective;