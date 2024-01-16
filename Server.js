
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios')
const { exec } = require('child_process');

const session = require('express-session');
const User = require('./models/userModel');
const Project = require('./models/projectModel');
const GoogleUser = require('./models/googleModel');
const { count } = require('console');

// Initialize Express
const app = express();
const port = 4000;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next()
})
app.use(cors())

app.use(express.json());

mongoose.connect('mongodb+srv://precogsai:9334973085@cluster0.nvpb1xc.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', console.error);
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Configure session management
app.use(
  session({ secret: 'secrect-key-for----secion', resave: false, saveUninitialized: true })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Configuration
passport.use(
  new GitHubStrategy(
    {
      clientID: 'ca94a374c4d560c632e2',
      clientSecret: '34e2ccd44b932c58155d64c50f5e7a377179d9c8',
      callbackURL: 'http://localhost:4500/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Store user data in MongoDB
      User.findOneAndUpdate(
        { githubId: profile.id },
        { username: profile.username, accessToken },
        { upsert: true, new: true }
      )
        .then(user => {
          if (!user) {
            // If user not found, you might want to create a new user here
            // You can return done(null, newUser) in that case
          }
          done(null, user);
        })
        .catch(err => {
          console.error(err);
          done(err);
        });

    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });

});

// Define routes for authentication and dashboard
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', (req, res) => {
  res.send('Hello World');
});



// github repo with access
app.get('/access/githubrepo', async (req, res) => {
  try {
    const githubAccessToken = "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";
    // const githubAccessToken = "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";

    // Function to fetch all pages of repositories recursively
    async function fetchRepositories(url, repositories = []) {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `token ${githubAccessToken}`,
          },
          params: {
            visibility: 'all',
            per_page: 50,
          },
        });

        const pageRepositories = response.data;
        // const projects=await Project.find();
        // project of auth user
        const projects = await Project.find({ owner: "6593c7cb95a0c6626594f131" });

        // Add the 'access' property to each repository with the value 'false'
        const repositoriesWithAccess = pageRepositories.map(repo => (
          {
            access: projects.some(project => project.name.toLowerCase() === repo.name.toLowerCase()),
            ...repo,
          }

        ));

        repositories = repositories.concat(repositoriesWithAccess);

        // Check if there are more pages
        const nextPageLink = response.headers.link;
        if (nextPageLink && nextPageLink.includes('rel="next"')) {
          const nextPageUrl = nextPageLink
            .split(', ')
            .find(link => link.includes('rel="next"'))
            .split(';')[0]
            .slice(1, -1);
          return fetchRepositories(nextPageUrl, repositories);
        }

        return repositories;
      } catch (error) {
        throw error;
      }
    }

    const repositories = await fetchRepositories('https://api.github.com/user/repos');

    res.json({
      success: true,
      message: "Repositories fetched successfully",
      Total_Repositories: repositories.length,
      repositories: repositories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all user 

app.get('/getusers', async (req, res) => {
  try {
    const users = await User.find().populate('projects');
    res.json({
      success: true,
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// get all project of a user

app.get('/userprojects', async (req, res) => {
  try {
    const userId = "6593c7cb95a0c6626594f131";

    // Retrieve user and populate the projects field
    const user = await User.findById(userId).populate('projects');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: "User projects retrieved successfully",
      Total: user.projects.length,
      userProjects: user.projects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// create multiple project in one go

app.post('/createproject', async (req, res) => {
  try {
    const projectsData = req.body;
    const userId = "6593c7cb95a0c6626594f131";
    console.log(req.body)
    const savedProjects = []
    // Use Promise.all to concurrently save multiple projects
    await Promise.all(projectsData.map(async (projectData) => {
      projectData.owner = userId;
      const newProject = new Project(projectData);
      const savedProject = await newProject.save();
      savedProjects.push(savedProject);
    }));

    // Update the user's projects array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { projects: { $each: savedProjects } } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Projects created successfully",
      projects: savedProjects,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });

  }
});


// get all projects

app.get('/getprojects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json({
      success: true,
      message: "Projects fetched successfully",
      projects: projects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// get project by id
app.get('/getproject/:projectId', async (req, res) => {

  try {
    const projectId = req.params.projectId;
    // console.log(projectId)
    const project = await Project.findById(projectId);
    // const project = await Project.findOne({ id: projectId })
    // .populate('owner');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: "Project retrieved successfully",
      project: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get overview of project

app.get('/getoverview/:projectId', async (req, res) => {

  try {
    const projectId = req.params.projectId;
    // console.log(projectId)
    const project = await Project.findById(projectId);
    // const project = await Project.findOne({ id: projectId })
    // .populate('owner');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: "Project retrieved successfully",
      overview: {
        _id: project._id,
        name: project.name,
        full_name: project.full_name,
        githubLink: project.githubLink,
        html_url: project.html_url,
        id: project.id,
        language: project.language,
        owner: project.owner,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        project_info: {
          environment: project.environment,
          projectScope: project.projectScope,
          businessPriority: project.businessPriority,
          projectType: project.projectType,
        },

      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//update project by id

app.put('/updateproject/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const projectData = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      projectData,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.put('/update/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  const projectData = req.body;
  console.log(projectData)
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    projectData,
    { new: true }
  );

  if (!updatedProject) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project: updatedProject,
  });


});

// app.put('/update/:projectId', async (req, res) => {
//   const projectId = req.params.projectId;

//   try {
//     const project = await Project.findById(projectId);

//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     const { key, value } = req.body;

//     if (key && Object.keys(project.overview).includes(key)) {
//       project.overview[key] = value;
//       const updatedProject = await project.save();

//       res.status(200).json({
//         message: `Updated ${key} to ${value}`,
//         overview: updatedProject.overview,
//         success: true,
//       });
//     } else {
//       res.status(400).json({ error: 'Invalid key or value' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// Delete a project and remove it from user projects
app.delete('/deleteproject/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Find the project and get the associated user ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const userId = project.owner;

    // Delete the project
    const deletedProject = await Project.findByIdAndRemove(projectId);
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove the project from the user's projects array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { projects: projectId } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Project deleted successfully and removed from user's projects",
      deletedProject: deletedProject,
      // user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get user all project status

app.get('/getprojectstatus', async (req, res) => {
  const userId = "6593c7cb95a0c6626594f131";
  try {
    const statusCounts = await Project.aggregate([
      {
        $match: {
          owner:new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$issue_status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      open: 0,
      fixed: 0,
      ignored: 0,
    };

    statusCounts.forEach((statusCount) => {
      result[statusCount._id] = statusCount.count;
    });

    res.json({
      success: true,
      message: "Project status fetched successfully",
      statusCounts: result,
      total_issues: result.open + result.fixed + result.ignored,
    });
  } catch (error) {
    throw error;
  }

});



//CHILD PROCESS FOR PYTHON SCRIPT
app.post('/scan-code', (req, res) => {
  const {code} = req.body;
  // console.log(req.body)
  
  // Execute Python script as a child process
  const pythonScript = 'dummy_vuln_model.py';  
  const command = `python ${pythonScript} "${code}"`;

  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error: ${error.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (stderr) {
          console.error(`Error: ${stderr}`);
          return res.status(400).json({ error: 'Bad Request' });
      }

      const vulnerabilities = stdout.trim()
      res.status(200).json({
          success: true,
          message: 'Code scanned successfully',
          vulnerabilities: vulnerabilities,
      });
  });
});




// // search project 

// const GITHUB_API_BASE_URL = 'https://api.github.com';

// app.get('/searchprojects', async (req, res) => {

//   try {
//     const accessToken = "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";
//     const { query } = req.query;

//     if (!query) {
//       return res.status(400).json({ error: 'Missing query parameter' });
//     }

//     if (!accessToken) {
//       return res.status(401).json({ error: 'Access token is required' });
//     }

//     const headers = {
//       Authorization: `token ${accessToken}`,
//     };

//     const searchResponse = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
//       params: {
//         q: query,
//         per_page: 10, // Adjust the number of results per page as needed
//       },
//       headers,
//     });

//     const projects = searchResponse.data.items.map((item) => ({
//       id: item.id,
//       name: item.name,
//       description: item.description,
//       url: item.html_url,
//       owner: item.owner.login,
//     }));

//     res.json({
//       success: true,
//       message: 'Projects retrieved successfully',
//       projects: projects,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(error.response?.status || 500).json({ error: 'Internal server error' });
//   }
// });



// // signin with google

// app.post('/auth/google', async (req, res) => {
//   const { name, email, photo, role, _id } = req.body;

//   if (!name || !email || !photo || !role || !_id) {
//     return res.status(400).json({ error: "All fields are required" })
//   }

//   let user = await GoogleUser.findById(_id);

//   if (user) {
//     return res.status(200).json({
//       success: true,
//       message: `Welcome back ${user.name}`,
//     })
//   }

//   const newUser = new GoogleUser({
//     _id,
//     name,
//     email,
//     photo,
//     role,
//   });

//   await newUser.save();

//   res.status(200).json({
//     success: true,
//     message: `Welcome ${newUser.name}`,
//   })
// });

// // get user by id
// app.get('/getuser/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await GoogleUser.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" })
//     }

//     res.json({
//       success: true,
//       message: "User retrieved successfully",
//       user: user,
//     })
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" })
//   }
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

