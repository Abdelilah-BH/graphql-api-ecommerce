const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { resolvers } = require("./resolvers/user");
const { type_defs } = require("./typeDefs/user");
const { generate_tokens } = require("./helpers/functions");

const server = new ApolloServer({
    typeDefs: type_defs,
    resolvers,
    context: ({req, res}) => ({req, res})
});

const app = express();

app.use(cookieParser());

app.use((req, res, next) => {
    const refresh_token = req.cookies["rt"];
    const access_token = req.cookies["at"];
    if(!access_token && !refresh_token) return next();
    try {
        const user = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = user._id;
        return next();
    } catch(err) {
        try {
            const user = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
            req.userId = user._id;
            const { rt, at } = generate_tokens(user);
            res.cookie("rt", rt, { expire: 60 * 5, httpOnly: true });
            res.cookie("at", at, { expire: 60 * 60 * 24 * 30, httpOnly: true });        
            return next();
        } catch(err) {
            return next();
        }
    }
});

server.applyMiddleware({ app });

mongoose.set("useCreateIndex", true);
mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen({ port: process.env.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
);