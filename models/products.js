const Joi = require("@hapi/joi");

const schema_product = Joi.object({
    SKU: Joi.string().length(8),
    title: Joi.string().required(),
    price: {
        tax_incl: Joi.number(),
        duty_free: Joi.number(),
        VAT: Joi.number()
    },
    dimenssions: Joi.object({
        length: Joi.number(),
        width: Joi.number(),
        height: Joi.number(),
        unit: Joi.string().valid(["cm", "mm", "m"])
    }),
    weight: Joi.object({
        type: Joi.string(),
        enum: Joi.string().valid(["kg", "g"]),
    }),
    category: Joi.string(),
    sub_categories: Joi.array().items(Joi.string().valid(["kg", "g"])),
    description: Joi.string()
});

module.exports = {
    schema_product
};
