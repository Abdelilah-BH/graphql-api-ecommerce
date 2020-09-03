const { SchemaDirectiveVisitor } = require("apollo-server-express");
const { defaultFieldResolver } = require("graphql");
const { isAuth } = require("../helpers/functions");
const { User } = require("../models/users");

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
                const user = isAuth(context.req);
                const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;
                if (!requiredRole) {
                    return resolve.apply(this, args);
                }
                const res = await User.findOne({ _id: user._id });
                if (!requiredRole.includes(res.role)) {
                    throw new Error("not authorized");
                }
                return resolve.apply(this, args);
            };
        });
    }
}

module.exports = PermissionDirective;