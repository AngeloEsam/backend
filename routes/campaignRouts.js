const express = require("express");
const {
  createCampaign,
  getCampaign,
  getCampaignUserLogin,
  getSingleCampaign,
  getCampaignFilter,
} = require("../controller/campaignController");
const upload = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/", auth, upload.single("image"), createCampaign);
router.get("/", getCampaign);
router.get("/filter", getCampaignFilter);
router.get("/:campaignId", getSingleCampaign);
router.get("/campaign_user", auth, getCampaignUserLogin);

module.exports = router;
