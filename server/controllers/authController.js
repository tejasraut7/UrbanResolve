import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../Models/user.model.js"


export const registerAdmin = async(req ,res,next)=>{
    try {
        const {userName ,email , password,inviteSecret} =req.body ;

        if (inviteSecret !== process.env.ADMIN_INVITE_SECRET) {
      return res.status(403).json({ success: false, message: "Invalid invite secret" });
    }



        const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

        const hasshedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            userName,
            email,
            password: hasshedPassword,
        });

        res.status(201).json({
            success:true,
            data :user
        })

    }catch(error){
        next(error);
    }
}

export const loginAdmin = async (req,res,next)=>{
    try {
        const {email , password}= req.body ;

        const user = await User.findOne({email});

        if(!user)
            return res.status(400).json({message:"invalid credentials"});

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            return res.status(400).json({message:"invalid credentials"});

        const token = jwt.sign(
            {id:user._id  , role: user.role },
             process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.json({
            token
        });
    }catch(error){
        next(error)
    }
}