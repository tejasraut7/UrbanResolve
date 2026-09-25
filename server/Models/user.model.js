import mongoose,{Schema} from "mongoose"


const userSchema = new Schema({
    
        userName:{
                type:String,
                required:true,
        },
        email:{
                type: String,
                required:true,
                unique:true,
        },
        password: {
    type: String,
    required: true
  },
  role:{
        type:String,
        enum:["admin","citizen"],
        default:"citizen"
  }


   
},{timestamps:true});

export const User = mongoose.model("User",userSchema);

