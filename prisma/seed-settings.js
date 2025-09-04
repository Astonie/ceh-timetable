import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  try {
    console.log('🌱 Seeding settings...');

    // Meeting time setting
    await prisma.setting.upsert({
      where: { key: 'meeting_time' },
      update: {},
      create: {
        key: 'meeting_time',
        value: '20:00',
        description: 'Daily meeting time in 24-hour format (CAT - Central Africa Time)'
      }
    });

    // Meeting timezone setting
    await prisma.setting.upsert({
      where: { key: 'meeting_timezone' },
      update: {},
      create: {
        key: 'meeting_timezone',
        value: 'CAT',
        description: 'Meeting timezone (CAT - Central Africa Time)'
      }
    });

    // Meeting days setting
    await prisma.setting.upsert({
      where: { key: 'meeting_days' },
      update: {},
      create: {
        key: 'meeting_days',
        value: 'Monday,Tuesday,Wednesday,Thursday,Friday',
        description: 'Days when meetings are held (comma-separated)'
      }
    });

    // Meeting link setting
    await prisma.setting.upsert({
      where: { key: 'meeting_link' },
      update: {},
      create: {
        key: 'meeting_link',
        value: '',
        description: 'Meeting link URL (leave empty to hide the join button)'
      }
    });

    console.log('✅ Settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSettings();
