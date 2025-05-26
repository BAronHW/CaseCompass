import app from './app.js';
import config from './config/config.js';
import { startTaskWorker } from './lib/taskWorker.js';
import { TypeOfTask } from './models/models.js';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

startTaskWorker(TypeOfTask.DocumentUpload);