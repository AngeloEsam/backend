const cloudinary = require("cloudinary").v2;
const prisma = require("../utills/prismaClient");
const {
  validationDate,
  validationCategory,
  validationDataCampaign,
} = require("../utills/validation");

/*****************************************
 * @desc            function craateCampaign
 * @routes          api/campaign
 * @method          POST
 * @access          public condition login
 *****************************************/
const createCampaign = async (req, res) => {
  const { title, category, description, goalAmount, dateDue } = req.body;
  try {
    // check on all data
    if (
      !validationDataCampaign(
        { title, category, description, goalAmount, dateDue },
        res
      )
    )
      return;
    // validation on category
    if (!validationCategory({ category }, res)) return;
    // validation on date
    if (!validationDate({ dateDue }, res)) return;
    // validation on image
    if (!req.file) return res.status(400).json({ error: "image is required" });
    // upload image on cloudinary
    const data = await cloudinary.uploader.upload(req.file.path, {
      folder: "taskReact",
    });
    // create campaign
    const newCampaign = await prisma.campaign.create({
      data: {
        userId: req.userId,
        title,
        description,
        category,
        goalAmount: Number(goalAmount),
        dateDue: new Date(dateDue).toISOString(),
        image: data.secure_url,
      },
    });
    return res
      .status(201)
      .json({ message: "create campaign successgully", data: newCampaign });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function get campaign
 * @routes          api/campaign
 * @method          GET
 * @access          public
 *****************************************/
const getCampaign = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  try {
    const totalDocument = await prisma.campaign.count();
    const totalPage = Math.ceil(totalDocument / limit) || 1;
    const campaign = await prisma.campaign.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "success fetch data",
      data: campaign,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function get campaign Filter
 * @routes          api/campaign/filter?category=
 * @method          GET
 * @access          public
 *****************************************/
const getCampaignFilter = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const categoryQuery = req.query.category || "";
  try {
    const totalDocument = await prisma.campaign.count({
      where: {
        category: categoryQuery,
      },
    });
    const totalPage = Math.ceil(totalDocument / limit) || 1;
    const campaign = await prisma.campaign.findMany({
      where: {
        category: categoryQuery,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "success fetch data",
      data: campaign,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function get single campaign
 * @routes          api/campaign/:campaignId
 * @method          GET
 * @access          public
 *****************************************/

const getSingleCampaign = async (req, res) => {
  const { campaignId } = req.params;
  try {
    const singleCampaign = await prisma.campaign.findUnique({
      where: {
        id: parseInt(campaignId),
      },
    });
    if (!singleCampaign)
      return res.status(404).json({ error: "campaign not found" });
    return res
      .status(200)
      .json({ message: "success fetch", data: singleCampaign });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function get campaign for user login
 * @routes          api/campaign/campaign_user_login
 * @method          GET
 * @access          private
 *****************************************/

const getCampaignUserLogin = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  try {
    const totalDocument = await prisma.campaign.count({
      where: {
        userId: req.userId,
      },
    });
    const totalPage = Math.ceil(totalDocument / limit) || 1;
    const campaign = await prisma.campaign.findMany({
      where: {
        userId: req.userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      message: "success fetch data",
      data: campaign,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createCampaign,
  getCampaign,
  getCampaignUserLogin,
  getSingleCampaign,
  getCampaignFilter,
};
