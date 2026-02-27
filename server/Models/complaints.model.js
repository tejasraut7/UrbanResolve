import mongoose, { Schema } from "mongoose"

const complaintSchema= new Schema({
     descriptionText:{
        type :String,
        required: true,
        trim: true,
        index: true,
     },
     imageUrl:{
        type:String,
        required:true
     },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
            required:true,
        },
    
    coordinates:{
        type:[Number],
        required:true,
    },
},
    userCategory:{
        type:string,
        enum:["Waste","Water","Road","Electricity","Sanitation","Other"],
        required :true,
    },
       aiCategory: {
      type: String,
      enum: ["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"],
    },

    categoryConfidence: {
      type: Number,
    },

    priorityScore:
    {
        type:Number,
        required:true
    },

    priorityLevel:{
        type:String,
        enum:["Low","Medium","High","Critical"],
        required:true,
    },
    Status:{
        type:string,
        enum:["Pending","In Progress","Resolved"],
        default:"Pending",
    },
},
{timestamps:true}
);


export const Complaint = mongoose.model("Complaint",complaintSchema)