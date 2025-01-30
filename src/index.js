const http = require("http");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");
const connectDatabase = require("./config/database");
const { default: mongoose } = require("mongoose");
const { PORT } = require("./config/constant");
const { connectSocket } = require("./config/socket");

const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer(app);
    connectSocket(server);

    server.listen(PORT, () => {
      console.log(`Server is working on http://localhost:${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down gracefully...");
      try {
        await mongoose.connection.close();
        server.close(() => {
          console.log("Server closed. Database connections released.");
        });
      } catch (err) {
        console.error("Error during shutdown:", err);
        throw err;
      }
    });

    process.on("uncaughtException", (err) => {
      console.error(`Uncaught Exception: ${err.message}`);
      throw err;
    });

    process.on("unhandledRejection", (err) => {
      console.error(`Unhandled Promise Rejection: ${err.message}`);
      server.close(() => {
        throw err;
      });
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    throw error;
  }
};

startServer().catch((error) => {
  console.error("Fatal error occurred:", error);
});

module.exports = app;
