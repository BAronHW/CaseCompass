import app from './app';
import config from './config/config';
import { startTaskWorker } from './lib/taskWorker';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

startTaskWorker();