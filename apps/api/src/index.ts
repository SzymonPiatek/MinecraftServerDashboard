import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
