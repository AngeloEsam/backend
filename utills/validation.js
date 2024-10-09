// validation on enter date campaig
const validationDataCampaign = (
  { title, description, category, goalAmount, dateDue },
  res
) => {
  if (!title || !category || !description || !goalAmount || !dateDue) {
    res.status(400).json({
      error:
        "you must enter title, category,description,goalAmount, image, dateDue",
    });
    return false;
  }
  if (title.length > 200) {
    res.status(400).json({ error: "title must not long 200 characters" });
    return false;
  }
  return true;
};

// validation on category campaign
const validationCategory = ({ category }, res) => {
  if (
    !["Education", "Health", "Arts", "Tecnology", "Social"].includes(category)
  ) {
    res.status(400).json({ error: "category is invalid" });
    return false;
  }
  return true;
};

// validation on date campaign
const validationDate = ({ dateDue }, res) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateDue)) {
    res.status(400).json({ error: "invalid format date , use YYYY-MM-DD" });
    return false;
  }
  const dueDate = new Date(dateDue);
  if (dueDate <= new Date()) {
    res.status(400).json({ error: "date Due must be in future" });
    return false;
  }
  return true;
};

module.exports = { validationCategory, validationDataCampaign, validationDate };
