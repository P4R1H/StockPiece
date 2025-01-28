import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.db.js";
import initializeAdmin from "./scripts/initializeAdmin.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(()=>{
    initializeAdmin();
  })
  .then(() => {
    app.on("error", (err) => {
      throw err;
    });
    app.listen(PORT, () => {
      console.log(`server started port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`server start error: ${err}`);
    process.exit(1);
  });
