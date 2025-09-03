import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query - try to get settings count
    const settingsCount = await prisma.setting.count();
    console.log(`📊 Settings in database: ${settingsCount}`);
    
    // Test facilitator count
    const facilitatorCount = await prisma.facilitator.count();
    console.log(`👥 Facilitators in database: ${facilitatorCount}`);
    
    // Test timetable entries count
    const timetableCount = await prisma.timetableEntry.count();
    console.log(`📅 Timetable entries in database: ${timetableCount}`);
    
    console.log('🎉 All database operations successful!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if your internet connection is stable');
      console.log('2. Verify database credentials in .env file');
      console.log('3. Check if the database service is running');
      console.log('4. Try restarting the database service');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
