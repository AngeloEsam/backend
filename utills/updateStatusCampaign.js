const prisma = require("./prismaClient");

const updateStatusCampaign = async (req, res) => {
  try {
    const currentDate = new Date().toISOString();
    const campaigns = await prisma.campaign.findMany({
      where: {
        dateDue: {
          lte: currentDate,
        },
      },
    });

    const updates = campaigns.map((campaign) => {
      const currentAmount = campaign.currentAmount;
      const goalAmount = campaign.goalAmount;
      return prisma.campaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          status: currentAmount >= goalAmount ? "completed" : "field",
        },
      });
    });
    await Promise.all(updates);
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = { updateStatusCampaign };
