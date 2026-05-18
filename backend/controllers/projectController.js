const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: members || []
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    // Admins see all their created projects, Members see projects they are part of
    let query = {};
    if (req.user.role === 'Admin') {
      query = { createdBy: req.user.id };
    } else {
      query = { members: req.user.id };
    }
    const projects = await Project.find(query).populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
