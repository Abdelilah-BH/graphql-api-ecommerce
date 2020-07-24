const { sign } = require("jsonwebtoken");

const generate_tokens = user => {
    const new_refresh_token = sign({
        _id: user._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1min" });
    const new_access_token = sign({
        _id: user._id,
        civility: user.civility,
        name: user.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1min" });
    return { at: new_access_token , rt: new_refresh_token };
};

module.exports = {
    generate_tokens
};