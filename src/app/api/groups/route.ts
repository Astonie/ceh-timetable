import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/groups - Get all public study groups
export async function GET() {
  try {
    const groups = await prisma.studyGroup.findMany({
      where: { isPublic: true },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/groups - Create new study group
export async function POST(req: NextRequest) {
  try {
    const { name, description, ownerId, maxMembers } = await req.json();

    if (!name || !ownerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description: description || null,
        ownerId,
        maxMembers: maxMembers || 10
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    // Add owner as first member with 'owner' role
    await prisma.studyGroupMember.create({
      data: {
        userId: ownerId,
        groupId: group.id,
        role: 'owner'
      }
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
