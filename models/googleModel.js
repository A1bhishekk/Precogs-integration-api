const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
        },
        photo:{
            type: String,
            required: true,
        },
        role:{
            type: String,
            enun: ['user', 'admin'],
            default: 'user',
        },


    },
    {
        timestamps: true,
    }
);


const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

module.exports = GoogleUser;

