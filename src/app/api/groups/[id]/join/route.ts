import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/groups/[id]/join - Join a study group
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const { userId } = await req.json();

    if (isNaN(groupId) || !userId) {
      return NextResponse.json({ error: 'Invalid group ID or user ID' }, { status: 400 });
    }

    // Check if group exists and is public
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (!group.isPublic) {
      return NextResponse.json({ error: 'Group is private' }, { status: 403 });
    }

    // Check if user is already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Check if group is full
    if (group._count.members >= group.maxMembers) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 });
    }

    // Add user to group
    const membership = await prisma.studyGroupMember.create({
      data: {
        userId,
        groupId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]/leave - Leave a study group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const { userId } = await req.json();

    if (isNaN(groupId) || !userId) {
      return NextResponse.json({ error: 'Invalid group ID or user ID' }, { status: 400 });
    }

    // Check if membership exists
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      },
      include: {
        group: true
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 400 });
    }

    // Don't allow owner to leave their own group
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Group owner cannot leave the group' }, { status: 400 });
    }

    // Remove membership
    await prisma.studyGroupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    return NextResponse.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
  }
}
