const mongoose = require('mongoose');

const TaskResultSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    totalRuntime: Number,
    totalOccurrences: Number,
    newFilesAdded: [String],
    deletedFiles: [String],
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    }
});

module.exports = mongoose.model('TaskResult', TaskResultSchema);
