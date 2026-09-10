import "dotenv/config";
import { createPrismaClient } from "./lib/prisma.js";
import { createApp } from "./app.js";

const prisma = createPrismaClient();

const app = createApp(prisma);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server Is Running On Port ${PORT}`);
});
