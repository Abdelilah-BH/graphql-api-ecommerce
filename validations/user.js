const Joi = require("@hapi/joi");

const schema_user = Joi.object({
    name: Joi.string().max(100).trim().required(),
    email: Joi.string().email().required(),
    phone: Joi.string(),
    civility: Joi.string().valid("Mr", "Mrs").required(),
    is_active: Joi.boolean().default(true),
    date_of_birth: Joi.date(),
    role: Joi.string().valid("ROOT", "ADMIN", "USER"),
    password: Joi.string().min(8),
    confirmation_password: Joi.any().valid(Joi.ref("password"))
});

const schema_signup = Joi.object({
    civility: Joi.string().valid("Mr", "Mrs"),
    name: Joi.string().max(100).trim().required(),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    confirmation_password: Joi.any().valid(Joi.ref("password"))
});

const schema_signin = Joi.object({
    email: Joi.string().email().message("Email invalid"),
    password: Joi.string().min(8).message("8 characters minimum in the password")
});

module.exports = {
    schema_user,
    schema_signup,
    schema_signin
};