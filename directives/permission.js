const { SchemaDirectiveVisitor } = require("apollo-server-express");
const { defaultFieldResolver } = require("graphql");
const { isAuth } = require("../helpers/functions");
const { User } = require("../models/users");


// not complete
class PermissionDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field, details) {
        this.ensureFieldsWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
    }

    ensureFieldsWrapped(objectType) {
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const { resolve = defaultFieldResolver } = field;
            field.resolve = async function (...args) {
                let context = args[2];
                const { req, res } = context;
                const consumer = isAuth(req, res);
                const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;
                if (!requiredRole) {
                    return resolve.apply(this, args);
                }
                const user = await User.findOne({ _id: consumer._id });
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