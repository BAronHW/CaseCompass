import { server, app } from './app.js';
import { config, websocketConfig } from './config/config.js';
import { startTaskWorker } from './lib/taskWorker.js';
import { TypeOfTask } from './models/models.js';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

server.listen(websocketConfig.port, () => {
  console.log(`Websocket Server Running on port: ${websocketConfig.port}`)
})

startTaskWorker(TypeOfTask.DocumentUpload);