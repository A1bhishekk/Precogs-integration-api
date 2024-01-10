
const mongoose = require("mongoose");

const projectInfoSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
    },
    label: {
        type: String,
    },

});

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
        id: {
            type: String,
            required: true,
            unique: true,
        },
        language: {
            type: String,
        },
        // businessPriority: [projectInfoSchema],
        // projectScope: [projectInfoSchema],
        // environment:[projectInfoSchema],
        // projectType: [projectInfoSchema],
        businessPriority: {
            type: Map,
            of: String,
        },
        projectScope: {
            type: Map,
            of: String,
        },
        environment: {
            type: Map,
            of: String,
        },
        projectType: {
            type: Map,
            of: String,
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

