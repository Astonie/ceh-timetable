import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Creating default settings...');

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

    console.log('✅ Settings created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
