import { Complaint } from "../Models/complaints.model.js";

export const createComplaint = async (req, res, next) => {
  try {
    const { descriptionText, imageUrl, location, userCategory } = req.body;

 const locationData = location?.coordinates
      ? { type: "Point", coordinates: location.coordinates }
      : undefined;

    if (location?.coordinates) {
      const fourtyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const nearby = await Complaint.findOne({
        userCategory,
        createdAt: { $gte: fourtyEightHoursAgo },
        status: { $nin: ["REJECTED", "RESOLVED"] },
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: location.coordinates },
            $maxDistance: 100,
          },
        },
      });

      if (nearby) {
        return res.status(409).json({
          success: false,
          code: "DUPLICATE_COMPLAINT",
          message: "A similar complaint was already filed nearby within 48 hours",
          existingComplaintId: nearby._id,
        });
      }
    }

    const complaint = await Complaint.create({
      descriptionText,
      imageUrl,
      ...(locationData ? { location: locationData } : {}),
      userCategory,
      priorityScore: 10,
      priorityLevel: "Low",
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });

  } catch (error) {
    next(error)
  }
};



export const getAllComplaints = async (req , res, next)=>{
    try {
        const {status ,category }= req.query ;

        let filter ={};

        if(status) filter.status=status;
        if (category) filter.userCategory = category ;
         
        const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

         res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
    
    }catch(error){
         next(error)
    }
}



export const getAnalytics = async (req, res, next )=>{
  try {
    const totalComplaints = await Complaint.countDocuments();

    const byCategory = await Complaint.aggregate([
      {$group :{_id:  "$userCategory", count :{$sum:1}}}
    ])

    const byStatus = await Complaint.aggregate([
      {$group:{_id:"$status", count:{$sum:1}}}
    ])

    const byPriority =await Complaint.aggregate([
      {$group:{_id:"$priorityLevel",count:{$sum:1}}}
    ])


    res.status(200).json({
       success: true,
          data: {
        totalComplaints,
        byCategory,
        byStatus,
        byPriority
      }
    });
    
  }catch(error){
    next(error)
  };
}