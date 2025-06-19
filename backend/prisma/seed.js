import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ignite2026.com' },
    update: {},
    create: {
      email: 'admin@ignite2026.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  // Create brigade leads (only 2)
  const brigadeLeadPassword = await bcrypt.hash('lead123', 10);
  const brigadeLeads = [];

  for (let i = 1; i <= 2; i++) {
    const lead = await prisma.user.upsert({
      where: { email: `lead${i}@ignite2026.com` },
      update: {},
      create: {
        email: `lead${i}@ignite2026.com`,
        password: brigadeLeadPassword,
        role: 'BRIGADE_LEAD',
        firstName: `Brigade`,
        lastName: `Lead ${i}`,
      },
    });
    brigadeLeads.push(lead);
  }

  // Create brigades
  const brigades = [];
  const brigadeNames = ['Alpha', 'Beta'];

  for (let i = 0; i < brigadeNames.length; i++) {
    const brigade = await prisma.brigade.upsert({
      where: { name: `Brigade ${brigadeNames[i]}` },
      update: {},
      create: {
        name: `Brigade ${brigadeNames[i]}`,
        leaderId: brigadeLeads[i].id,
      },
    });
    brigades.push(brigade);
  }

  // Create sample students (only 6)
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];

  for (let i = 1; i <= 6; i++) {
    const brigadeIndex = (i - 1) % brigades.length;
    const tempRollNumber = `IG2026${String(i).padStart(3, '0')}`;
    
    // Create user account for student
    const studentUser = await prisma.user.upsert({
      where: { email: `student${i}@ignite2026.com` },
      update: {},
      create: {
        email: `student${i}@ignite2026.com`,
        password: studentPassword,
        role: 'STUDENT',
        firstName: `Student`,
        lastName: `${i}`,
      },
    });

    const student = await prisma.student.upsert({
      where: { tempRollNumber: tempRollNumber },
      update: {},
      create: {
        tempRollNumber: tempRollNumber,
        firstName: `Student`,
        lastName: `${i}`,
        email: `student${i}@ignite2026.com`,
        phone: `+91${String(9000000000 + i)}`,
        brigadeId: brigades[brigadeIndex].id,
        userId: studentUser.id,
      },
    });
    students.push(student);
  }



  // Create sample notifications
  await prisma.notification.create({
    data: {
      title: 'Welcome to Ignite 2026',
      message: 'Welcome to the Ignite 2026 Attendance Management System. Please ensure you mark attendance on time.',
      type: 'INFO',
      isGlobal: true,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Attendance Reminder',
      message: 'Reminder: FN session attendance should be marked between 9:00 AM - 9:30 AM',
      type: 'WARNING',
      targetRole: 'BRIGADE_LEAD',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📧 Login Credentials:');
  console.log('Admin: admin@ignite2026.com / admin123');
  console.log('Brigade Lead 1: lead1@ignite2026.com / lead123');
  console.log('Brigade Lead 2: lead2@ignite2026.com / lead123');
  console.log('Students: student1@ignite2026.com to student6@ignite2026.com / student123');
  console.log('Student Rolls: IG2026001 to IG2026006');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });