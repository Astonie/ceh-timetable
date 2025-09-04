import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/[id] - Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        studyPoints: true,
        joinDate: true,
        lastActive: true,
        isPublic: true,
        ownedGroups: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { members: true }
            }
          }
        },
        memberships: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
                _count: {
                  select: { members: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPublic) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const { name, bio, avatar, isPublic } = await req.json();

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        avatar,
        isPublic
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        isPublic: true,
        studyPoints: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
