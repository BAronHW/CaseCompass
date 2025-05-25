import app from './app';
import config from './config/config';
import { startTaskWorker } from './lib/taskWorker';
import { TypeOfTask } from './models/models';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

startTaskWorker(TypeOfTask.DocumentUpload);