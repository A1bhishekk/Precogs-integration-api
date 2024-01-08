
const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        full_name: {
            type: String,
        },
        githubLink: {
            type: String,
        },
        html_url: {
            type: String,
        },
        id:{
            type: String,
            required: true,
            unique: true,
        },
        language: {
            type: String,
        },
       
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;