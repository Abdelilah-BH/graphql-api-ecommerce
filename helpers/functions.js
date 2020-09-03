const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models/users");

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
    { expiresIn: "5min" });
    return { at: new_access_token , rt: new_refresh_token };
};

const isAuth = (req) => {
    try {
        let access_token = req.headers.authorization;
        access_token = access_token ? access_token.split(" ")[1] : null;
        if (!access_token)
            throw new AuthenticationError("YOU ARE NOT AUTHENTICATED");
        const result = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        req.user = result;
        return result;    
    } catch(error) {
        throw new AuthenticationError("YOU ARE NOT AUTHENTICATED");
    }
};

const generate_access_token = (refresh_token) => {
    try {
        const verify = jwt.verify(refresh_token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.find({ _id: verify._id });
        if(!user)
            return false;
        const access_token = jwt.sign({
            _id: user._id,
            civility: user.civility,
            name: user.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "5min" });
        return access_token;
    } catch(error) {
        return false;
    }
};

module.exports = {
    generate_tokens,
    isAuth,
    generate_access_token
};