const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Assuming you're using MongoDB
const config = require('./config');
const TaskResult = require('./TaskResult'); // Replace with your data model
const backgroundTask = require('./backgroundTask');
const schedule = require('node-schedule');

// Connect to database (optional, for retrieving task runs)
mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Database connection error:', err));

const app = express();
const port = 3000; // Or any other port you prefer

app.use(bodyParser.json());

// Endpoint to get current configuration
app.get('/config', (req, res) => {
    res.json(config);
});

// Endpoint to update configuration (if applicable)
app.put('/config', (req, res) => {
    const newConfig = req.body;

    // Validate and sanitize newConfig values before updating (optional)

    Object.assign(config, newConfig);
    backgroundTask.restart(newConfig.interval); // Restart task with new interval

    res.json({ message: 'Configuration updated successfully' });
});

// Endpoint to retrieve the current task status
app.get('/task/status', (req, res) => {
    res.json({ status: getStatus() });
});

// New endpoint to start the task manually
app.post('/task/start', async (req, res) => {
    try {
        await backgroundTask.monitorDirectory(); // Call the monitoring function directly
        res.json({ message: 'Task started successfully' });
    } catch (error) {
        console.error('Error starting task manually:', error);
        res.status(500).json({ message: 'Failed to start task' });
    }
});

// Endpoint to retrieve task run details
app.get('/task-runs', async (req, res) => {
    try {
        const taskRuns = await TaskResult.find().sort({ startTime: -1 }).exec();
        const enrichedTaskRuns = taskRuns.map(run => ({
            ...run.toObject(), // Include all properties from the document
            runtime: calculateRuntime(run.startTime, run.endTime), // Add calculated runtime
        }));
        res.json(enrichedTaskRuns);
    } catch (error) {
        console.error('Error retrieving task runs:', error);
        res.status(500).json({ message: 'Failed to retrieve task runs' });
    }
});

function calculateRuntime(startTime, endTime) {
    const diff = endTime - startTime;
    // Convert milliseconds to a human-readable format (optional)
    return diff;
}

const startBackgroundTask = () => {
    const newJob = schedule.Job(); // Create a new job object
    backgroundTask.startBackgroundTask(newJob); // Pass the job object
};

startBackgroundTask(); // Start the task initially

app.post('/task/stop', async (req, res) => {
    try {
      // 1. Retrieve task ID from request body (assuming this is your approach)
      const { taskId } = req.body; // Destructure taskId from request body
  
      // 2. Validate taskId (optional but recommended)
      if (!taskId) {
        return res.status(400).json({ message: 'Missing required field: taskId' });
      }
  
      // 3. Retrieve start time from storage (replace with your storage logic)
      const startTimeFromStorage = await backgroundTask.getTaskStartTimeFromStorage(taskId);
  
      // Error handling for storage retrieval (assuming getTaskStartTimeFromStorage throws errors)
      if (!startTimeFromStorage) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // 4. Get task status
      const status = await backgroundTask.getStatus(startTimeFromStorage);
  
      // 5. CannotStop task and respond based on status
      if (status === 'running') {
          console.log("'/task/stop'------------if cond running------------",backgroundTask.job);
          backgroundTask.cancelJob(taskId);
        res.json({ message: 'Task stopped successfully' });
      } else {
        res.json({ message: 'Task is not currently running' });
      }
    } catch (error) {
      console.error('Error stopping task:', error);
      res.status(500).json({ message: 'Failed to stop task' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
