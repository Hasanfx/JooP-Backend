import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rootRoute from "./routes/rootRoutes";

dotenv.config(); // Load environment variables

 const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: "*", // Allow all origins
  methods: "GET,POST,PUT,DELETE", // Adjust allowed HTTP methods as needed
  allowedHeaders: "Content-Type, Authorization", // Allow specific headers
};
app.use(cors());




// Routes
app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});
app.use('/api',rootRoute)

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export {app}