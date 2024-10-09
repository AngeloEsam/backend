const express = require("express");
const {
  createDonors,
  getDonorsForMyCampaigns,
  getMyDonors,
  getAllDonorsForMyCampaigns,
} = require("../controller/donorsController");
const auth = require("../middlewares/auth");
const router = express.Router();
router.post("/:campaignId", auth, createDonors);
router.get("/donors_myCampaigns", auth, getDonorsForMyCampaigns);

router.get(
  "/All_donors_myCampaigns/:campaignId",
  auth,
  getAllDonorsForMyCampaigns
);

router.get("/All_myDonors", auth, getMyDonors);

module.exports = router;
