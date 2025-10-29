import { server } from './app.js';
import { config } from './config/config.js';
import { startTaskWorker } from './lib/taskWorker.js';
import { TypeOfTask } from './models/models.js';
server.listen(config.port, () => {
    console.log(`Server Running on port: ${config.port}`);
});
startTaskWorker(TypeOfTask.DocumentUpload);
