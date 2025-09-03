import { GET, POST } from "../src/app/api/facilitator/route";
import { PrismaClient } from "@prisma/client";

describe("/api/facilitator API", () => {
  let prisma: PrismaClient;
  beforeAll(() => {
    prisma = new PrismaClient();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    // Reset state before each test
    await prisma.facilitatorState.deleteMany({});
  });

  it("GET returns initial state and team members", async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.index).toBe(0);
    expect(Array.isArray(data.teamMembers)).toBe(true);
    expect(data.teamMembers.length).toBeGreaterThan(0);
  });

  it("POST advances facilitator index", async () => {
    await GET(); // Ensure state exists
    const res = await POST();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.index).toBe(1);
  });

  it("POST cycles facilitator index", async () => {
    await GET();
    await POST();
    await POST();
    const res = await POST();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.index).toBe(0); // Should cycle back
  });

  it("GET handles DB errors gracefully", async () => {
    // Simulate DB error by disconnecting
    await prisma.$disconnect();
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBeDefined();
    // Reconnect for next tests
    prisma = new PrismaClient();
  });
});
