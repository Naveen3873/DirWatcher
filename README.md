# DirWatcher
Node.js Monitoring Application with MongoDB Integration

**Description**
- This application offers functionalities related to monitoring a configurable directory at scheduled intervals. It performs the following actions during each run:

- Reads file contents: Analyzes all files in the designated directory.
Magic string counting: Counts the occurrences of a user-defined "magic string" within each file. This string can be configured through the API.
Database storage: Saves the total count for each run and other details (explained below) to a database of your choice.
File change detection: Identifies newly added or deleted files within the monitored directory.

**Key Features:**
- Directory Monitoring
- Text Analysis (Magic String Counting)
- MongoDB Integration
- Scheduled Execution
- Manual Start/Stop API
- Basic Error Handling

**Prerequisites:**
- Node.js (version 14 or later recommended) - https://nodejs.org/en
- MongoDB instance - https://www.mongodb.com/docs/

**Technologies**
- Node.js
- Express.js
- MongoDB

**REST API**
| Route | Method | Body | Response | Description |
|---|---|---|---|---|
| /task/start | POST | None | { message: 'Task started successfully' } | Starts the monitoring task if not already running. |
| /tast/stop | POST | taskId |	{ message: 'Task stopped successfully' } | Stops the monitoring task if currently running. |
| /task-runs | GET	| NONE | { [tasks] } | Retrive all tasks in the response of JSON. |
