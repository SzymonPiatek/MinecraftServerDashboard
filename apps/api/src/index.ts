import { createApp } from "./app.js";
import { parseEnv } from "./config/env.js";
import { createContainer } from "./container.js";

const env = parseEnv();
const container = createContainer(env);
const server = createApp(container).listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});

const shutdown = () => {
  server.close(() => void container.close().then(() => process.exit(0)));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
