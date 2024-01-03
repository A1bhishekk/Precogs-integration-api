
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios')

const session = require('express-session');
const User = require('./models/userModel');
const Project = require('./models/projectModel');

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


// app.get('/githubrepo', async (req, res) => {
//   try {
//     // if (!req.isAuthenticated()) {
//     //   return res.redirect('/auth/github');
//     // }

//     // const user = await User.findOne({ githubId: req.user.githubId });
//     // console.log(user)

//     // if (!user) {
//     //   return res.status(404).json({ error: "User not found" });
//     // }

//     // const githubAccessToken = user.accessToken;
//     const githubAccessToken = "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";

//     // Function to fetch all pages of repositories recursively
//     async function fetchRepositories(url, repositories = []) {
//       try {
//         const response = await axios.get(url, {
//           headers: {
//             Authorization: `token ${githubAccessToken}`,
//           },
//           params: {
//             visibility: 'all',
//             per_page: 50,
//           },
//         });

//         const pageRepositories = response.data;
//         repositories = repositories.concat(pageRepositories);

//         // Check if there are more pages
//         const nextPageLink = response.headers.link;
//         if (nextPageLink && nextPageLink.includes('rel="next"')) {
//           const nextPageUrl = nextPageLink
//             .split(', ')
//             .find(link => link.includes('rel="next"'))
//             .split(';')[0]
//             .slice(1, -1);
//           return fetchRepositories(nextPageUrl, repositories);
//         }

//         return repositories;
//       } catch (error) {
//         throw error;
//       }
//     }

//     const repositories = await fetchRepositories('https://api.github.com/user/repos');

//     res.json({
//       // user: user,
//       success: true,
//       message: "Repositories fetched successfully",
//       Total_Repositories: repositories.length,
//       repositories: repositories,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.get('/githubrepo', async (req, res) => {
  try {
    const githubAccessToken = "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";

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
        const projects=await Project.find();

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

app.get('/userprojects/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Retrieve user and populate the projects field
    const user = await User.findById(userId).populate('projects');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: "User projects retrieved successfully",
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
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// search project 

const GITHUB_API_BASE_URL = 'https://api.github.com';

app.get('/searchprojects', async (req, res) => {

  try {
    const accessToken = "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";
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token is required' });
    }

    const headers = {
      Authorization: `token ${accessToken}`,
    };

    const searchResponse = await axios.get(`${GITHUB_API_BASE_URL}/search/repositories`, {
      params: {
        q: query,
        per_page: 10, // Adjust the number of results per page as needed
      },
      headers,
    });

    const projects = searchResponse.data.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      url: item.html_url,
      owner: item.owner.login,
    }));

    res.json({
      success: true,
      message: 'Projects retrieved successfully',
      projects: projects,
    });
  } catch (error) {
    console.error(error);
    res.status(error.response?.status || 500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

