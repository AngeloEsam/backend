const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const campaignRoute = require("./routes/campaignRouts");
const donorsRoute = require("./routes/donorsRouts");
const cloudinary = require("cloudinary").v2;
const cron = require("node-cron");
const { updateStatusCampaign } = require("./utills/updateStatusCampaign");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
cron.schedule("0 0 0 * * *", () => {
  updateStatusCampaign();
});

app.use("/api/user", userRoute);
app.use("/api/campaign", campaignRoute);
app.use("/api/donors", donorsRoute);
app.listen(5000, () => {
  console.log("server connected");
});
