import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";
import "dotenv/config";

const totalCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Number of CPUs: ${totalCPUs}`);

  // Fork workers for each CPU
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker processes
  import("./index.js")
    .then(() => {
      console.log(`Worker ${process.pid} started`);
    })
    .catch((err) => {
      console.error("Worker failed to start:", err);
      process.exit(1);
    });
}
