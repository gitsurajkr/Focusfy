import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.notes.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Cleared existing data");

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const testUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });

  console.log(`👤 Created test user: ${testUser.email}`);

  // Sample tasks data with userId
  const sampleTasks = [
    {
      title: "Morning Workout",
      type: "HABIT" as const,
      tags: ["health", "daily"],
      repeat_interval: 1440, // Daily
      channel: ["telegram"],
      userId: testUser.id,
    },
    {
      title: "Study React",
      type: "NORMAL" as const,
      tags: ["learning", "coding"],
      reminder_every: 180, // Every 3 hours
      channel: ["discord"],
      userId: testUser.id,
    },
    {
      title: "Team Meeting",
      type: "EVENT" as const,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reminder_before: 30, // 30 minutes before
      channel: ["telegram", "discord"],
      userId: testUser.id,
    },
  ];

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: taskData,
    });
  }

  // Sample notes data with userId
  const sampleNotes = [
    {
      title: "Daily Goals",
      content: "Focus on completing the authentication system integration today.",
      userId: testUser.id,
    },
    {
      title: "Meeting Notes",  
      content: "Discussed new features for the productivity app. Next steps: implement user authentication and notifications.",
      userId: testUser.id,
    },
  ];

  for (const noteData of sampleNotes) {
    await prisma.notes.create({
      data: noteData,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`📋 Created ${sampleTasks.length} sample tasks`);
  console.log(`📜 Created ${sampleNotes.length} sample notes`);
  console.log(`🔑 Test user credentials: test@example.com / password123`);
}

seedDatabase()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
