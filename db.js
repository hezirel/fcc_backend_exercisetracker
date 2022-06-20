require('dotenv').config()
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true }
});

const Log = mongoose.model('Log', logSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    log: [logSchema]
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

const dateFormat = (date) => date.toString().split(' ').slice(0, 4).join(' ');
const addLog = ({description, duration, date: inputDate}, userId, done) => {


    const newLog = new Log({
        userId,
        description,
        duration,
        date: inputDate,
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

const getUser = async ({_id: userId}, {from, to, limit, duration}, done) => {
    console.log(from, to, limit);
    const user = await User.aggregate([
        {
            $match: { _id: mongoose.Types.ObjectId(userId) }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                log: 1
            }
        },
        {
            $unwind: '$log'
        },
        {
            $cond: {
                if: from,
                then: {
                    $match: {
                        'log.date': {
                            $gte: from,
                            $lte: to
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                log: 1
            }
        }
    ]);

    done(null, user);
};

exports.createUser = createUser;
exports.listUser = listUser;
exports.addLog = addLog;
exports.getUser = getUser;
