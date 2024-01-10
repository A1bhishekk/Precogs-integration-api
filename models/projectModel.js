
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
        projectScope: {
            internal: {
                type: Boolean,
                default: false,
            },
            external: {
                type: Boolean,
                default: false,
            },
        },
        projectType: {
            frontend: {
                type: Boolean,
                default: false,
            },
            backend: {
                type: Boolean,
                default: false,
                
            },
        },
        businessPriority: {
            critical: {
                type: Boolean,
                default: false,
            },
            high: {
                type: Boolean,
                default: false,
            },
            medium:{
                type: Boolean,
                default: false,
            },
            low: {
                type: Boolean,
                default: false,
            }
        },
        environment: {
            production: {
                type: Boolean,
                default: false,
            },
            development:{
                type: Boolean,
                default: false,
            },
            testing: {
                type: Boolean,
                default: false,
            },
            sandbox: {
                type: Boolean,
                default: false,
            }
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

