import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";

jest.setTimeout(30000);

const MONGO_URI_TEST = env.MONGO_URI_TEST
beforeAll(async () => {
  await mongoose.connect(MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Complaint routes", () => {
  it("POST /api/complaints — rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .send({ descriptionText: "too short" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/complaints — creates successfully", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .send({
        descriptionText: "Large pothole on main road causing accidents",
        imageUrl: "https://example.com/photo.jpg",
        userCategory: "Road",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("OPEN");
  });

  it("PUT /api/complaints/status — rejects without token", async () => {
    const res = await request(app)
      .put("/api/complaints/status")
      .send({ id: "fakeid", status: "IN_PROGRESS" });

    expect(res.status).toBe(401);
  });

  it("PUT /api/complaints/status/batch — rejects without token", async () => {
    const res = await request(app)
      .put("/api/complaints/status/batch")
      .send({ ids: ["507f1f77bcf86cd799439011"], status: "IN_PROGRESS" });

    expect(res.status).toBe(401);
  });
});
