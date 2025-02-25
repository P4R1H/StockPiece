import { performance } from "perf_hooks";

const URL = "http://localhost:8000/api/v1/market/statistics/all";
const NUM_REQUESTS = 1000; // Change this to the number of concurrent requests

async function sendRequests() {
  const startTime = performance.now(); // Start time

  const requests = Array.from({ length: NUM_REQUESTS }, () =>
    fetch(URL)
      .then((res) => res.status)
      .catch((err) => err)
  );

  const responses = await Promise.all(requests); // Send all requests concurrently

  const endTime = performance.now(); // End time
  const totalTime = (endTime - startTime) / 1000; // Convert to seconds

  console.log(`Sent ${NUM_REQUESTS} requests.`);
  console.log(`Total time taken: ${totalTime.toFixed(2)} seconds`);
  console.log("Response Status Codes:", responses);
}

sendRequests();
