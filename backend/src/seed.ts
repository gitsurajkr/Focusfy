import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.notes.deleteMany();

  // Sample tasks
  const sampleTasks = [
    {
      title: "Complete Tutorial Quest",
      type: "NORMAL",
      tags: ["tutorial", "getting-started"],
      completed: true,
    },
    {
      title: "Daily Mining Session",
      type: "HABIT",
      tags: ["daily", "mining"],
      repeat_interval: 1440, // 24 hours
      reminder_every: 60,
      channel: ["telegram"],
      completed: false,
    },
    {
      title: "Boss Fight Event",
      type: "EVENT",
      tags: ["boss", "event", "pvp"],
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reminder_before: 30,
      reminder_every: 10,
      channel: ["discord"],
      completed: false,
    },
    {
      title: "Build Castle Foundation",
      type: "NORMAL",
      tags: ["building", "architecture"],
      completed: false,
    },
    {
      title: "Weekly Backup",
      type: "HABIT",
      tags: ["maintenance", "backup"],
      repeat_interval: 10080, // 7 days
      reminder_every: 180,
      channel: ["telegram", "discord"],
      completed: false,
    },
    {
      title: "Organize Inventory",
      type: "NORMAL",
      tags: ["organization", "inventory"],
      completed: true,
    },
  ];

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: taskData as any,
    });
  }

  // Sample notes
  const sampleNotes = [
    {
      title: "Adventure Log - Day 1",
      content: `Started my Minecraft productivity journey today! 

🏗️ Built my first productivity dashboard
⚒️ Created task tracking system  
📜 Set up note-taking functionality

Goals for tomorrow:
- Add more quests
- Organize inventory system
- Plan castle construction`,
    },
    {
      title: "Building Tips",
      content: `Useful building techniques:

1. Always start with a solid foundation
2. Plan your layout before placing blocks
3. Use symmetry for aesthetic appeal
4. Mix different materials for texture
5. Don't forget proper lighting!

Materials needed:
- Stone bricks: 64 stacks
- Oak wood: 32 stacks  
- Glass panes: 16 stacks
- Redstone: 8 stacks`,
    },
    {
      title: "Server Rules",
      content: `🏰 MINECRAFT PRODUCTIVITY SERVER RULES 🏰

1. Be respectful to other players
2. No griefing or destroying others' builds
3. Complete your daily quests
4. Help fellow adventurers when possible
5. Keep the spawn area clean
6. Document your adventures in notes
7. Have fun and be creative!

Remember: We're all here to craft our best productivity life! ⛏️`,
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
}

seedDatabase()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
