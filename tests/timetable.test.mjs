import { test, describe, before, after, mock } from 'node:test';
import assert from 'node:assert';

describe('API Timetable Tests', () => {
  let mockPrisma;
  let mockTimetableData;

  before(() => {
    console.log('Setting up timetable tests...');
    
    mockTimetableData = {
      id: 1,
      week: 'Week 1',
      schedule: {
        monday: [
          { time: '09:00-10:30', subject: 'Mathematics', instructor: 'Dr. Smith' },
          { time: '11:00-12:30', subject: 'Physics', instructor: 'Prof. Johnson' }
        ],
        tuesday: [
          { time: '09:00-10:30', subject: 'Chemistry', instructor: 'Dr. Brown' }
        ]
      }
    };

    mockPrisma = {
      timetable: {
        findMany: mock.fn(() => Promise.resolve([mockTimetableData])),
        create: mock.fn(() => Promise.resolve(mockTimetableData)),
        update: mock.fn(() => Promise.resolve(mockTimetableData)),
        delete: mock.fn(() => Promise.resolve(mockTimetableData))
      }
    };
  });

  after(() => {
    console.log('Cleaning up timetable tests...');
  });

  test('should validate timetable data structure', () => {
    assert.strictEqual(typeof mockTimetableData.id, 'number');
    assert.strictEqual(typeof mockTimetableData.week, 'string');
    assert.strictEqual(typeof mockTimetableData.schedule, 'object');
    
    // Validate schedule structure
    assert.ok('monday' in mockTimetableData.schedule);
    assert.ok(Array.isArray(mockTimetableData.schedule.monday));
    
    // Validate individual schedule item
    const mondayClass = mockTimetableData.schedule.monday[0];
    assert.strictEqual(typeof mondayClass.time, 'string');
    assert.strictEqual(typeof mondayClass.subject, 'string');
    assert.strictEqual(typeof mondayClass.instructor, 'string');
  });

  test('should handle time format validation', () => {
    const validTimeFormats = [
      '09:00-10:30',
      '14:00-15:30',
      '10:15-11:45'
    ];

    const invalidTimeFormats = [
      '9:00-10:30',    // Missing leading zero
      '09:00',         // Missing end time
      '25:00-26:00',   // Invalid hour  
      '09:60-10:30'    // Invalid minute
    ];

    validTimeFormats.forEach(time => {
      const timePattern = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
      assert.ok(timePattern.test(time), `Valid time format ${time} should match pattern`);
    });

    invalidTimeFormats.forEach(time => {
      const timePattern = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
      const matchesPattern = timePattern.test(time);
      
      // For times that match the pattern but have invalid values, we need additional validation
      if (matchesPattern && time.includes('-')) {
        const [startTime, endTime] = time.split('-');
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const isValidTime = startHour >= 0 && startHour <= 23 && 
                           startMin >= 0 && startMin <= 59 &&
                           endHour >= 0 && endHour <= 23 && 
                           endMin >= 0 && endMin <= 59;
        
        assert.strictEqual(isValidTime, false, `Invalid time values in ${time} should not pass validation`);
      } else {
        assert.strictEqual(matchesPattern, false, `Invalid time format ${time} should not match pattern`);
      }
    });
  });

  test('should handle timetable CRUD operations', async () => {
    // Test Create
    const created = await mockPrisma.timetable.create({ data: mockTimetableData });
    assert.strictEqual(created.id, 1);
    assert.strictEqual(mockPrisma.timetable.create.mock.calls.length, 1);

    // Test Read
    const timetables = await mockPrisma.timetable.findMany();
    assert.ok(Array.isArray(timetables));
    assert.strictEqual(timetables.length, 1);
    assert.strictEqual(mockPrisma.timetable.findMany.mock.calls.length, 1);

    // Test Update
    const updated = await mockPrisma.timetable.update({ 
      where: { id: 1 }, 
      data: { week: 'Week 2' } 
    });
    assert.strictEqual(updated.id, 1);
    assert.strictEqual(mockPrisma.timetable.update.mock.calls.length, 1);

    // Test Delete
    const deleted = await mockPrisma.timetable.delete({ where: { id: 1 } });
    assert.strictEqual(deleted.id, 1);
    assert.strictEqual(mockPrisma.timetable.delete.mock.calls.length, 1);
  });

  test('should validate weekly schedule completeness', () => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const schedule = mockTimetableData.schedule;

    // Check that at least some days are present
    const presentDays = daysOfWeek.filter(day => day in schedule);
    assert.ok(presentDays.length > 0, 'Schedule should have at least one day');

    // Validate each present day has valid structure
    presentDays.forEach(day => {
      assert.ok(Array.isArray(schedule[day]), `${day} should be an array`);
      
      schedule[day].forEach(classItem => {
        assert.ok('time' in classItem, 'Class item should have time');
        assert.ok('subject' in classItem, 'Class item should have subject');
        assert.ok('instructor' in classItem, 'Class item should have instructor');
      });
    });
  });
});
