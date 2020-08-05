const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");

const generate_tokens = user => {
    const new_refresh_token = jwt.sign({
        _id: user._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30day" });
    const new_access_token = jwt.sign({
        _id: user._id,
        civility: user.civility,
        name: user.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1min" });
    return { at: new_access_token , rt: new_refresh_token };
};

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

const isAuth = (req, res) => {
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
    return consumer;
};

module.exports = {
    generate_tokens,
    isAuth,
};