module.exports = {
    directoryToMonitor: './data', // Replace this with the path to the directory you want to monitor
    magicString: 'your_magic_string', // Replace this with the string you want to search for
    interval: '*/5 * * * *', // Replace this with the cron expression for the interval (e.g., every 5 minutes)
    dbUrl: 'mongodb://localhost:27017/taskmonitor' // Replace this with your MongoDB connection URL
};