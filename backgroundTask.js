const fs = require('fs');
const schedule = require('node-schedule');
// const mongoose = require('mongoose'); // Assuming you're using MongoDB
const config = require('./config');
const TaskResult = require('./TaskResult'); // Replace with your data model

// mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to database'))
//     .catch(err => console.error('Database connection error:', err));

let job; // Declare the job variable here

const monitorDirectory = async () => {
    try {
        const startTime = Date.now(); // Record start time

        const files = await new Promise((resolve, reject) => {
            fs.readdir(config.directoryToMonitor, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });

        const totalOccurrences = await calculateTotalOccurrences(files);
        const newFilesAdded = getNewFiles(files, previousFiles);
        const deletedFiles = getDeletedFiles(files, previousFiles);

        const taskResult = new TaskResult({
            totalOccurrences,
            newFilesAdded,
            deletedFiles,
            startTime,
        });

        await taskResult.save(); // Save results to database
        previousFiles = files; // Update previous files list

        console.log('Task completed successfully.');
    } catch (error) {
        console.error('Error during monitoring:', error);
    } finally {
        endTime = Date.now(); // Record end time
    }
};

const calculateTotalOccurrences = async (files) => {
    let total = 0;
    for (const file of files) {
        const content = await fs.promises.readFile(`${config.directoryToMonitor}/${file}`, 'utf8');
        total += (content.match(new RegExp(config.magicString, 'g')) || []).length;
    }
    return total;
};

const getNewFiles = (currentFiles, previousFiles) => {
    return currentFiles.filter(file => !previousFiles.includes(file));
};

const getDeletedFiles = (currentFiles, previousFiles) => {
    return previousFiles.filter(file => !currentFiles.includes(file));
};

function getStatus(startTime, passedJob) { // Pass job as an argument
    const currentTime = Date.now();
    const threshold = config.idleThreshold || 60000;
    if (currentTime - startTime < threshold) {
        return 'running';
    } else {
        return passedJob ? 'scheduled' : 'stopped'; // Check passed job
    }
}

async function getTaskStartTimeFromStorage(taskId) {
    try {
      const result = await TaskResult.findById(taskId);
      console.log("=================getTaskStartTimeFromStorage=================",result);
      const task = result; // Assuming single row for a task
      return task ? task.startTime : null;
    } catch (error) {
      console.error('Error retrieving task start time:', error);
      throw error; // Re-throw for handling in the endpoint
    }
}

const startBackgroundTask = (passedJob) => {
    job = passedJob; // Assign the passed job object
    job = schedule.scheduleJob(config.interval, monitorDirectory);
    return job;
}

const cancelJob = (taskId) => {
    TaskResult.findByIdAndUpdate(taskId, { $set: { status: 'stopped' } })
        .then(updatedDoc => {
            if (updatedDoc) {
            console.log('Document updated successfully:', updatedDoc);
            } else {
            console.log('No document found with the given ID');
            }
        })
        .catch(error => console.error('Error updating document:', error));
}
const restartBackgroundTask = (newInterval) => {
    job.cancel(); // Cancel the existing job
    config.interval = newInterval; // Update interval in config
    startBackgroundTask(); // Start a new job with updated interval
};

let previousFiles = []; // Initialize an empty array for tracking previous files

// startBackgroundTask(); // Start the background task initially

module.exports = { startBackgroundTask, restart: restartBackgroundTask,monitorDirectory,getStatus,getTaskStartTimeFromStorage,cancelJob };
