const Inquiry = require("../Models/Inquiry");

module.exports.SaveInquiry = async (req, res) => {
  try {
    const { date, time, startTime, ownerId, id } = req.body;
    console.log(req.body.id)
    console.log("Owner ID ", ownerId);
    const inquiry = new Inquiry({ 
      boatId: id, 
      ownerId,
      date, 
      duration: time,
      startTime, 
      passenger: req.body.passanger.passanger,
      username: req.name,
      email:req.email });

    if (!inquiry) {
      return res.status(201).json("Inquiry Not send");
    }
    await inquiry.save();
    console.log(inquiry);
    return res.status(200).json({ message: "Inquiry Saved", inquiry });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.AllInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.find();
    if (!inquiry) {
      return res.status(201).json("Inquiry Not send");
    }

    return res.status(200).json({ message: "Inquiry Saved", inquiry });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};