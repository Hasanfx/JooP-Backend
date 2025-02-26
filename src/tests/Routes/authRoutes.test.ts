import request from "supertest";
import { prisma } from "../../config";
import {app} from "../../server"; // Ensure this points to your Express app
import { hashSync } from "bcryptjs";


describe("Auth Routes", () => {
  let user: { email: string; password: string };

  beforeAll(async () => {
    // Clean database
    await prisma.application.deleteMany();
    await prisma.jobSeekerProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    user = {
      email: "testuser@example.com",
      password: "Test1234",
    };

    await prisma.user.create({
      data: {
        email: user.email,
        name: "Test User",
        password: hashSync(user.password, 10),
        role: "JOB_SEEKER", // Adjust according to your schema
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should sign up a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "newuser@example.com",
      name: "New User",
      password: "SecurePass123",
      role: "EMPLOYER",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("newuser@example.com");
  });

  test("should not allow duplicate signup", async () => {
    const res = await request(app).post("/api/auth//signup").send({
      email: user.email, // Existing email
      name: "Another User",
      password: "AnotherPass123",
      role: "JOB_SEEKER",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Email already exists");
  });

  test("should login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.data.email).toBe(user.email);
  });

  test("should reject login with incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "WrongPassword123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid Password");
  });

  test("should reject login for non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "SomePass123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid User");
  });

 
});
