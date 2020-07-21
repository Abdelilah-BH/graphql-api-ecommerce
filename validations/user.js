const Joi = require("@hapi/joi");

const schema_create_user = Joi.object({
    name: Joi.string().max(100).required(),
    email: Joi.string().email(),
    phone: Joi.string(),
    civility: Joi.string().valid("Mr", "Mrs"),
    date_of_birth: Joi.date(),
    role: Joi.string().valid("ROOT", "ADMIN", "USER"),
    password: Joi.string().min(8),
    confirmation_password: Joi.any().valid(Joi.ref("password"))
});

const schema_signup = Joi.object({
    civility: Joi.string().valid("Mr", "Mrs"),
    name: Joi.string().max(100).required(),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    confirmation_password: Joi.any().valid(Joi.ref("password"))
});

const schema_signin = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().min(8)
});

module.exports = {
    schema_create_user,
    schema_signup,
    schema_signin
};