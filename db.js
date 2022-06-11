require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    logs: [{ type: Array}]
});

const logSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    username: { type: String, required: false },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now() }
});

const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);

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

const addLog = ({description, duration, date = Date.now()}, _id, done) => {

    const fdate = new Date(date);
    const newLog = new Log({
        _id,
        description,
        duration,
        date: fdate.toDateString()
    });

    User.findByIdAndUpdate(_id, 
        {
            $push: {
                logs: newLog
            }
        },
        (err, updatedUser) => {
            if (err) done(err);
            else {
                updatedUser.save((err, savedUser) => {
                    if (err) done(err);
                    else {
                        const {username} = savedUser;
                        const resolve = {_id, username, date: fdate.toDateString(), duration, description};
                        done(null, resolve);
                    }
                });
            }
        });
}

exports.createUser = createUser;
exports.listUser = listUser;
exports.addLog = addLog;