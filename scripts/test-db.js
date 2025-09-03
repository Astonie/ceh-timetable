const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test basic connection
    console.log('Testing database connection...');
    const facilitators = await prisma.facilitator.findMany();
    console.log('✅ Database connected! Found facilitators:', facilitators.length);

    // Check if Setting table exists
    console.log('Testing Setting table...');
    const settings = await prisma.setting.findMany();
    console.log('✅ Settings table exists! Found settings:', settings.length);

    // Create default settings if none exist
    if (settings.length === 0) {
      console.log('🌱 Creating default settings...');
      
      await prisma.setting.create({
        data: {
          key: 'meeting_time',
          value: '20:00',
          description: 'Daily meeting time in 24-hour format (CAT - Central Africa Time)'
        }
      });

      await prisma.setting.create({
        data: {
          key: 'meeting_timezone',
          value: 'CAT',
          description: 'Meeting timezone (CAT - Central Africa Time)'
        }
      });

      await prisma.setting.create({
        data: {
          key: 'meeting_days',
          value: 'Monday,Tuesday,Wednesday,Thursday,Friday',
          description: 'Days when meetings are held (comma-separated)'
        }
      });

      console.log('✅ Default settings created!');
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
