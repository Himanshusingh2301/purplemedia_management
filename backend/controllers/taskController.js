const Task = require('../models/Task');
const { notifyUsers } = require('../utils/notify');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, deadline, documentLinks } = req.body;
    
    const assignedToArray = Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []);
    
    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      assignedTo: assignedToArray,
      deadline,
      documentLinks: documentLinks || []
    });
    
    // Populate assignedTo to get the user's name/email if needed
    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');

    if (assignedToArray.length > 0) {
      notifyUsers(
        req.io,
        assignedToArray,
        `New task assigned: "${populatedTask.title}"`,
        populatedTask
      );
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      // Employees see tasks where their ID is in the assignedTo array
      query = { assignedTo: { $in: [req.user.id] } };
    }
    // Admin sees all tasks
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name')
      .populate('notes.user', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, deadline, status } = req.body;
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority || task.priority;
    const previousAssignees = task.assignedTo.map((id) => id.toString());

    if (assignedTo !== undefined) {
      task.assignedTo = Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []);
    }
    task.deadline = deadline !== undefined ? deadline : task.deadline;
    task.status = status || task.status;

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');

    const newAssignees = task.assignedTo
      .map((id) => id.toString())
      .filter((id) => !previousAssignees.includes(id));

    if (newAssignees.length > 0) {
      notifyUsers(
        req.io,
        newAssignees,
        `You were assigned to "${populatedTask.title}"`,
        populatedTask
      );
    }

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (req.user.role === 'Employee' && !task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDocumentLink = async (req, res) => {
  try {
    const { link } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'Employee' && !task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.documentLinks.push(link);
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { type, content } = req.body;
    if (!['text', 'link'].includes(type) || !content?.trim()) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'Employee' && !task.assignedTo.some(id => id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to add notes on this task' });
    }

    task.notes.push({ user: req.user.id, type, content: content.trim() });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('notes.user', 'name')
      .populate('comments.user', 'name');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'Employee' && !task.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    task.comments.push({ user: req.user.id, text });
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
