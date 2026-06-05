import cloudinary, { getCloudinary } from"../utils/cloudinary.js";

export const getSignature = async (req,res,next)=>{


    const cloudinary = getCloudinary();
         console.log("Cloudinary env check:", {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      hasSecret: !!process.env.CLOUDINARY_API_SECRET,
    });
    try{

     
        const timestamp = Math.round(Date.now()/1000);

        const params={
            timestamp,
            folder: "grievance_complaints",     
           
        };

        const signature=cloudinary.utils.api_sign_request(
             params,
      process.env.CLOUDINARY_API_SECRET
        )
        res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
    });

    }catch(error){
        next(error);
    }
}