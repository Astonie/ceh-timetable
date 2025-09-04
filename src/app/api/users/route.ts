import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users - Get all public users for leaderboard
export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const { username, email, name, bio } = await req.json();

    if (!username || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        name,
        bio: bio || null,
        studyPoints: 0
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        studyPoints: true,
        joinDate: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
