import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting database seeding...');

  try {
    // First, let's check if the Setting table exists by trying to count records
    console.log('📊 Checking Settings table...');
    const existingCount = await prisma.setting.count();
    console.log(`Found ${existingCount} existing settings`);

    // Define default settings
    const defaultSettings = [
      {
        key: 'meeting_time',
        value: '20:00',
        description: 'Default meeting time in HH:MM format (24-hour)'
      },
      {
        key: 'meeting_timezone',
        value: 'CAT',
        description: 'Meeting timezone (Central Africa Time)'
      },
      {
        key: 'meeting_days',
        value: 'Monday,Tuesday,Wednesday,Thursday,Friday',
        description: 'Days when meetings are scheduled'
      }
    ];

    // Create or update each setting
    for (const settingData of defaultSettings) {
      try {
        const existing = await prisma.setting.findUnique({
          where: { key: settingData.key }
        });

        if (existing) {
          console.log(`⚡ Updating existing setting: ${settingData.key}`);
          await prisma.setting.update({
            where: { key: settingData.key },
            data: {
              value: settingData.value,
              description: settingData.description
            }
          });
        } else {
          console.log(`🆕 Creating new setting: ${settingData.key}`);
          await prisma.setting.create({
            data: settingData
          });
        }
      } catch (settingError) {
        console.error(`❌ Error handling setting ${settingData.key}:`, settingError.message);
      }
    }

    // Verify the seeding
    console.log('🔍 Verifying seeded data...');
    const allSettings = await prisma.setting.findMany();
    console.log('📋 Current settings:');
    allSettings.forEach(setting => {
      console.log(`  • ${setting.key}: ${setting.value}`);
    });

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('🚨 Fatal error during seeding:', e);
    process.exit(1);
  });
