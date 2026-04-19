import mongoose, { Schema } from "mongoose";

const complaintSchema = new Schema({
    descriptionText: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            // required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            // required: true,
        },
    },
    userCategory: {
        type: String, // Fixed: was "string"
        enum: ["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"],
        required: true,
    },
    aiCategory: {
        type: String,
        enum: ["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"],
    },
    categoryConfidence: {
        type: Number,
    },
    priorityScore: {
        type: Number,
        // required: true
    },
    priorityLevel: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        // required: true,
    },
    status: { // Changed to lowercase "status" (convention)
        type: String, // Fixed: was "string"
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
        default: "OPEN",
    },

    statusHistory:[{
        status: String,
        updatedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref :"User"
        
    },
    timestamp : {
        type: Date,
        default  :Date.now
    }
}]
});

// Add this index to enable geospatial queries
complaintSchema.index({ location: "2dsphere" },{ sparse: true });

export const Complaint = mongoose.model("Complaint", complaintSchema);