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



// const projectSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//         },
//         full_name: {
//             type: String,
//         },
//         githubLink: {
//             type: String,
//         },
//         html_url: {
//             type: String,
//         },
//         id: {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         language: {
//             type: String,
//         },
//         businessPriority: {
//             type: Map,
//             of: String,
//         },

//         projectScope: {
//             type: Map,
//             of: String,
//         },
//         environment: {
//             type: Map,
//             of: String,
//         },
//         projectType: {
//             type: Map,
//             of: String,
//         },

//         owner: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// const Project = mongoose.model("Project", projectSchema);

// module.exports = Project;

