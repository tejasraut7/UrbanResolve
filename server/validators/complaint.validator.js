import {z} from "zod";

export const createComplaintSchema = z.object({
    descriptionText: z.string().min(10 ,"Description too short").max(1000 , "description too long"),
    imageUrl: z.string().url("Must be a valid URL"),
    location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180),  // longitude
      z.number().min(-90).max(90),    // latitude
    ]),
  }).optional(),
    userCategory: z.enum(["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"]),

})

export const updateStatusSchema = z.object({
  id: z.string().min(1, "Complaint ID required"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]),
});

export const batchUpdateStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]),
});