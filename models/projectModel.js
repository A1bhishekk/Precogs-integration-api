
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
        id:{
            type: String,
            required: true,
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