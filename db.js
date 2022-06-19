require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
    username: { type: String, required: false },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String, required: true }
});

const Log = mongoose.model('Log', logSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    log: [{ type: logSchema }]
    }
);

const User = mongoose.model('User', userSchema);

const createUser = (username, done) => {
    const newUser = new User({ username });

    newUser.save((err, savedUser) => {
        if (err) done(err);
        else done(null, savedUser);
        });
}

const listUser = (done) => {
    User.find({}, (err, users) => {
        if (err) return done(err);
        else done(null, users);
    });
}

const addLog = ({description, duration, date: inputDate}, userId, done) => {

    const dateFormat = (date) => date.toString().split(' ').slice(0, 4).join(' ');

    const newLog = new Log({
        description,
        duration,
        date: inputDate.toDateString()
    });
    User.findOneAndUpdate({_id: userId}, {$push: {log: newLog}}, (err, updatedUser) => {
        if (err) done(err);
        updatedUser.save((err, savedUser) => {
            if (err) done(err);
            else {
                const resolve = {
                    _id: savedUser._id,
                    username: savedUser.username,
                    date: dateFormat(inputDate),
                    duration,
                    description
                };
                done(null, resolve);
            }
        }, {new: true});
    });

}

const getUser = ({_id}, {from, to, limit}, done) => {
    User.findById(_id, (err, user) => {
        if (err) done(err);
        else {
                const resolve = {
                    _id: user._id,
                    username: user.username,
                    count: user.log.length,
                    log: user.log.map(log => ({
                        description: log.description,
                        duration: log.duration,
                        date: log.date
                    }))
                }
                done(null, resolve);
        }
    });
};

exports.createUser = createUser;
exports.listUser = listUser;
exports.addLog = addLog;
exports.getUser = getUser;
