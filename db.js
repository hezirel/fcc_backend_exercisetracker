require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Logs' }],
});

const logSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, required: true }
});

const User = mongoose.model('User', userSchema);

const createUser = (username, done) => {
    const newUser = new User({ username });

    newUser.save((err, savedUser) => {
        if (err) done(err);
        else done(null, savedUser);
    });
};

const listUser = (done) => {
    User.find({}, (err, users) => {
        if (err) return done(err);
        else done(null, users);
    });
}

exports.createUser = createUser;
exports.listUser = listUser;