const express = require("express");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const resolvers = require("./resolvers/user");
const { type_defs } = require("./typeDefs/user");
const PermissionDirective = require("./directives/permission");
const { generate_access_token } = require("./helpers/functions");
const server = new ApolloServer({
    typeDefs: type_defs,
    resolvers,
    schemaDirectives: { permissions: PermissionDirective },
    context: ({req, res}) => ({ req, res })
});

const app = express();

app.use(cookieParser());

app.post("/refresh-token", (req, res) => {
    const refresh_token = req.cookies["rt"];
    if(!refresh_token) 
        return res.send("NOT AUTHORIZED");
    const access_token = generate_access_token(refresh_token);
    if(!access_token)
        return res.send("NOT AUTHORIZED");
    return res.status(200).json({ access_token });
});


server.applyMiddleware({ app, path: "/e-commerce" });

mongoose.set("useCreateIndex", true);
mongoose.connect(`${process.env.DB_URL}${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen({ port: process.env.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
);