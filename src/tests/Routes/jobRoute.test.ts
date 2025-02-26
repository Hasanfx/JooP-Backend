import request from "supertest";
import { app } from "../../server";
import { prisma } from "../../config";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

// Mock JWT_SECRET explicitly in the test
jest.mock("../../config", () => {
  return {
    prisma: {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $disconnect: jest.fn(),
    },
    JWT_SECRET: "hasan10203040", // Same secret as in your authMiddleware
  };
});

// Function to generate a mock token with the same secret
const generateMockToken = (payload: object) => {
  return jwt.sign(payload, "hasan10203040", { expiresIn: '1h' });
};

describe("Job API Endpoints", () => {
  const authHeader = { Authorization: `Bearer ${generateMockToken({ userId: 123, userRole: "EMPLOYER" })}` };

  it("should return a list of jobs", async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: "Software Engineer", company: "Tech Corp", salary: 5000 },
    ]);

    const res = await request(app).get("/api/job").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Software Engineer");
  });

  it("should return a single job by ID", async () => {
    (prisma.job.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      title: "Software Engineer",
      company: "Tech Corp",
      salary: 5000,
    });

    const res = await request(app).get("/api/job/1").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("should return jobs for the authenticated employer", async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([
      { id: 1, title: "Software Engineer", company: "Tech Corp", salary: 5000 },
    ]);

    const res = await request(app).get("/api/job/employer").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("should create a new job", async () => {
    const newJob = { 
      title: "Backend Developer", 
      company: "Startup Inc", 
      salary: 7000,
      category: 'tech',
      location: 'lagos',
      description: 'good job',
      employerId: 123
    };

    (prisma.job.create as jest.Mock).mockResolvedValue({ id: 2, ...newJob });

    const res = await request(app).post("/api/job/create").set(authHeader).send(newJob);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(2);
  });

  // it("should update an existing job", async () => {
  //   // Mock the findUnique call
  //   (prisma.job.findUnique as jest.Mock).mockResolvedValue({
  //     id: 2,
  //     title: "Backend Developer",
  //     company: "Startup Inc",
  //     description: "Original job description",
  //     salary: 7000,
  //     category: "tech",
  //     location: "lagos",
  //     employerId: 123
  //   });
    
  //   // Include ALL fields expected by the controller
  //   const updatedJob = { 
  //     title: "Senior Backend Developer", 
  //     company: "Startup Inc", 
  //     description: "Updated job description",
  //     salary: 9000,
  //     category: "tech",
  //     location: "lagos"
  //   };
  
  //   (prisma.job.update as jest.Mock).mockResolvedValue({ 
  //     title: "Senior Backend Developer", 
  //     company: "Startup Inc", 
  //     description: "Updated job description",
  //     salary: 9000,
  //     category: "tech",
  //     location: "lagos",
  //   });
  
  //   const res = await request(app).put("/api/job/2").set(authHeader).send(updatedJob);
    
  //   // Temporarily log the response for debugging
  //   console.log("Update test response:", res.status, res.body);
    
  //   expect(res.status).toBe(200);
  //   expect(res.body.title).toBe("Senior Backend Developer");
  // });
  
  it("should delete a job", async () => {
    // First mock the findUnique call to return a job owned by userId 123
    (prisma.job.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      title: "Backend Developer",
      company: "Startup Inc",
      salary: 7000,
      employerId: 123 // This must match the userId in your token
    });
  
    (prisma.job.delete as jest.Mock).mockResolvedValue({
      id: 2,
      title: "Backend Developer",
      company: "Startup Inc",
      salary: 7000,
      employerId: 123
    });
  
    const res = await request(app).delete("/api/job/2").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Job deleted successfully");
  });
});
