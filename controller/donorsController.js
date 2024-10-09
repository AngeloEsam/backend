const prisma = require("../utills/prismaClient");

/*****************************************
 * @desc            function create donors
 * @routes          api/donors/:campaignId
 * @method          POST
 * @access          public only user login
 *****************************************/
const createDonors = async (req, res) => {
  const { amount } = req.body;
  const { campaignId } = req.params;
  try {
    // check on amount
    if (!amount) return res.status(400).json({ error: "amount is required" });
    // check on find campaign
    const findCampaign = await prisma.campaign.findUnique({
      where: {
        id: parseInt(campaignId),
      },
    });
    if (!findCampaign)
      return req.status(404).json({ error: "campaign not found" });
    // check on data finish campaign
    const currentDate = new Date().toISOString();
    if (currentDate >= findCampaign.dateDue)
      return res.status(409).json({
        error: "sorry no can donors for this campaign because date finished",
      });
    // check status
    if (findCampaign.status === "completed" || findCampaign.status === "field")
      return res.status(409).json({
        error: "sorry can't donated for this campaign because finished",
      });
    // create donors
    const donors = await prisma.donors.create({
      data: {
        amount: Number(amount),
        userId: req.userId,
        campaignId: Number(campaignId),
      },
    });
    // update on campaign
    await prisma.campaign.update({
      where: {
        id: parseInt(campaignId),
      },
      data: {
        numOfDonors: findCampaign.numOfDonors + 1,
        currentAmount: findCampaign.currentAmount + Number(amount),
        status:
          findCampaign.currentAmount + Number(amount) >= findCampaign.goalAmount
            ? "completed"
            : findCampaign.status,
      },
    });
    return res
      .status(201)
      .json({ message: "you donors successfully", data: donors });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function get donors for campaigns user
 * @routes          api/donors/donors_myCampaigns
 * @method          GET
 * @access          private
 *****************************************/
const getDonorsForMyCampaigns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const limitDonors = 5;
  try {
    const totalDocument = await prisma.campaign.count({
      where: {
        userId: req.userId,
      },
    });
    const totalPage = Math.ceil(totalDocument / limit);
    const getDonors = await prisma.campaign.findMany({
      where: {
        userId: req.userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        Donors: {
          select: {
            amount: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: limitDonors,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "success fetch",
      data: getDonors,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*****************************************
 * @desc            function get All donors for campaigns user
 * @routes          api/donors/All_donors_myCampaigns/:campaignId
 * @method          GET
 * @access          private
 *****************************************/
const getAllDonorsForMyCampaigns = async (req, res) => {
  const { campaignId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  try {
    const totalDocument = await prisma.donors.count({
      where: {
        campaignId: parseInt(campaignId),
      },
    });
    const totalPage = Math.ceil(totalDocument / limit);
    const getDonors = await prisma.donors.findMany({
      where: {
        campaignId: parseInt(campaignId),
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        amount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "success fetch",
      data: getDonors,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/*****************************************
 * @desc            function get All donors user
 * @routes          api/donors/All_myDonors
 * @method          GET
 * @access          private
 *****************************************/
const getMyDonors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  try {
    const totalDocument = await prisma.donors.count({
      where: {
        userId: req.userId,
      },
    });
    const totalPage = Math.ceil(totalDocument / limit);
    const myDonors = await prisma.donors.findMany({
      where: {
        userId: req.userId,
      },
      select: {
        amount: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return res.status(200).json({
      message: "success fetch",
      data: myDonors,
      meta: {
        totalPages: totalPage,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createDonors,
  getDonorsForMyCampaigns,
  getAllDonorsForMyCampaigns,
  getMyDonors,
};
