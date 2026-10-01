import mongoose,{Schema} from "mongoose"
import bcrypt from "bcryptjs"
import { boolean, lowercase } from "zod";


const userSchema = new Schema({
    
        userName:{
                type:String,
                required:true,
                trim:true
        },
        email:{
                type: String,
                required:true,
                unique:true,
                trim:true,
                lowercase:true
        },
        password: {
    type: String,
    required: true,
    select:false
  },
  
  role:{
        type:String,
        enum:["admin","citizen"],
        default:"citizen"
  },
  isVerified:{
        type:boolean,
        default:false
  },

  emailOtp:{
        type:String,
        select:false
  },
  emailOtpExpires:{
        type:Date,
        select:false
  },
  passwordResetToken:{
        type:String,
        select:false

  },
  passwordResetExpires:{
        type:Date,
        select:false
  },

  refreshTokens:[{
        type:String,
        select:false
  }],

},{timestamps:true});

userSchema.pre('save', async function (next) {
        if(!this.isModified('password')) return next();
        this.password = bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User",userSchema);

