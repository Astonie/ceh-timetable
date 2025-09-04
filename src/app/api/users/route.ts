import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET /api/users - Get all public users for leaderboard
export async function GET() {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        studyPoints: true,
        joinDate: true,
        lastActive: true,
        _count: {
          select: {
            ownedGroups: true,
            memberships: true
          }
        }
      },
      orderBy: { studyPoints: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient();
    const { username, name, email, bio, avatar, isPublic } = await req.json();

    if (!username || !name || !email) {
      return NextResponse.json({ error: "Username, name, and email are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this username or email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        bio: bio || null,
        avatar: avatar || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        studyPoints: 0,
        joinDate: new Date(),
        lastActive: new Date()
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
