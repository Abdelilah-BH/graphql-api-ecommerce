const jwt = require("jsonwebtoken");
const { generate_tokens } = require("../helpers/functions");

const Auth = ({req, res}) => {
    let isAuth = false;
    const refresh_token = req.cookies["rt"];
    const access_token = req.cookies["at"];
    if(!access_token && !refresh_token) return { req, res, isAuth };
    try {
        const user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        isAuth = true;
        return { req, res, isAuth, user };
    } catch(err) {
        try {
            const user = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
            const { rt, at } = generate_tokens(user);
            res.cookie("rt", rt, { expire: 60 * 5, httpOnly: true });
            res.cookie("at", at, { expire: 60 * 60 * 24 * 30, httpOnly: true });      
            isAuth = true;
            return { req, res, isAuth, user };
        } catch(err) {
            return { req, res, isAuth };
        }
    }
};

module.exports = { Auth };