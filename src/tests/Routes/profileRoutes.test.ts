import request from "supertest";
import { Request, Response, NextFunction } from "express";
import { app } from "../../server"; // Your Express app instance
import { prisma } from "../../config"; // Your Prisma instance

jest.mock("../../middleware/authMiddleware", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    (req as any).userId = 1; // Mock userId
    (req as any).userRole = "JOB_SEEKER"; // Mock role
    next();
  },
}));

jest.mock("../../middleware/profileValidateMiddleware", () => ({
  validateProfileMiddleware: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe("Profile Routes", () => {
  beforeEach(async () => {
    await prisma.jobSeekerProfile.deleteMany();
    await prisma.user.deleteMany(); // Ensure clean state

    await prisma.user.create({
      data: {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword123",
        role: "JOB_SEEKER",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return 404 if profile does not exist", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Job seeker profile not found");
  });

  it("should create a new job seeker profile", async () => {
    const profileData = {
      resume: "https://example.com/resume.pdf",
      skills: "JavaScript, TypeScript, Node.js", // Fixed skills format
    };

    const res = await request(app)
      .post("/api/profile")
      .send(profileData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId", 1);
    expect(res.body.skills).toBe(profileData.skills);
  });

  it("should update an existing job seeker profile", async () => {
    await prisma.jobSeekerProfile.create({
      data: {
        userId: 1,
        resume: "https://example.com/old-resume.pdf",
        skills: "JavaScript",
      },
    });

    const updatedData = {
      resume: "https://example.com/new-resume.pdf",
      skills: "TypeScript, Node.js",
    };

    const res = await request(app)
      .put("/api/profile")
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.resume).toBe(updatedData.resume);
    expect(res.body.skills).toBe(updatedData.skills);
  });
});
