const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true, index: true },
    password: { type: String, min: 8 },
    role: { type: String, enum: ["ROOT", "ADMIN", "USER"], default: "USER" },
    phone: String,
    civility: { type: String, enum: ["Mr", "Mrs"] },
    date_of_birth: Date,
    is_deleted: { type: Boolean, default: false },
    addresses: [{
        address: { type: String, require: true },
        country: { type: String, require: true },
        city: { type: String, require: true },
        region: { type: String, require: true },
        phone: String,
        zip: { type: Number },
        additional_information: { type: String, min: 3, max: 55 }
    }],
    history: [{
        type_of_action: { type: String, enum: ["ADD", "UPDATE", "DELETE"] },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: Date }
    }],
}, { timestamps: { createdAt: "createdAt" } });

schema.plugin(uniqueValidator);

schema.pre("save", function(next) {
    if(!this.isModified("password")){
        return next;
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

module.exports = {
    Schema_user: schema,
    User: mongoose.model("Users", schema)
};
