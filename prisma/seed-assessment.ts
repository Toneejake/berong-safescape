/**
 * Seed Assessment Questions for BFP Berong E-Learning
 * Pre-Test & Post-Test Question Bank
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const assessmentQuestions = [
  // ============================================
  // FIRE PREVENTION (3 questions)
  // ============================================
  {
    question: "What is the best way to prevent electrical fires at home?",
    options: [
      "Use multiple extension cords",
      "Overload electrical outlets",
      "Regularly check and replace damaged wires",
      "Leave appliances plugged in when not in use"
    ],
    correctAnswer: 2,
    explanation: "Regularly checking and replacing damaged wires prevents electrical fires. Damaged wires can cause short circuits and sparks.",
    category: "Fire Prevention",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "How often should you clean your stove and cooking area to prevent kitchen fires?",
    options: [
      "Once a year",
      "Once a month",
      "After every cooking session",
      "Only when it looks very dirty"
    ],
    correctAnswer: 2,
    explanation: "Cleaning after every cooking session removes grease buildup, which is highly flammable and a common cause of kitchen fires.",
    category: "Kitchen Safety",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "Which of these materials is MOST flammable and should be kept away from heat sources?",
    options: [
      "Metal pans",
      "Ceramic plates",
      "Cooking oil and gasoline",
      "Glass containers"
    ],
    correctAnswer: 2,
    explanation: "Cooking oil and gasoline are highly flammable liquids that can ignite quickly when exposed to heat or sparks.",
    category: "Fire Prevention",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },

  // ============================================
  // EMERGENCY RESPONSE (3 questions)
  // ============================================
  {
    question: "What is the FIRST thing you should do if you discover a small fire?",
    options: [
      "Try to put it out yourself immediately",
      "Alert others and call for help (911 or BFP)",
      "Take a video of the fire",
      "Run away without telling anyone"
    ],
    correctAnswer: 1,
    explanation: "Safety first! Alert others and call emergency services immediately. Even small fires can grow quickly and become dangerous.",
    category: "Emergency Response",
    difficulty: "Medium",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "If your clothes catch fire, what should you do?",
    options: [
      "Run to find water",
      "Stop, Drop, and Roll",
      "Take off your clothes quickly",
      "Wave your arms to put out the flames"
    ],
    correctAnswer: 1,
    explanation: "STOP, DROP, and ROLL immediately. Running makes the fire burn faster. Rolling on the ground smothers the flames.",
    category: "Emergency Response",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "In case of fire, why should you crawl low under smoke?",
    options: [
      "It's faster to crawl than to walk",
      "Smoke and toxic gases rise, so cleaner air is near the floor",
      "To avoid being seen by the fire",
      "It's easier to find the door while crawling"
    ],
    correctAnswer: 1,
    explanation: "Hot smoke and toxic gases rise to the ceiling. Cleaner, cooler air stays near the floor, making it safer to breathe while escaping.",
    category: "Emergency Response",
    difficulty: "Medium",
    forRoles: ["kid", "adult", "professional"]
  },

  // ============================================
  // ELECTRICAL SAFETY (2 questions)
  // ============================================
  {
    question: "What should you NEVER do with electrical appliances near water?",
    options: [
      "Unplug them when not in use",
      "Use them with wet hands or near sinks",
      "Keep them on a dry surface",
      "Read the instruction manual"
    ],
    correctAnswer: 1,
    explanation: "Never use electrical appliances with wet hands or near water. Water conducts electricity and can cause electric shock or fires.",
    category: "Electrical Safety",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "What is 'octopus wiring' and why is it dangerous?",
    options: [
      "A type of cable used by electricians",
      "Connecting multiple extension cords to one outlet, causing overload",
      "A safety device that prevents electrical fires",
      "A special wiring system for large buildings"
    ],
    correctAnswer: 1,
    explanation: "'Octopus wiring' overloads outlets by connecting too many devices, causing overheating and potential electrical fires.",
    category: "Electrical Safety",
    difficulty: "Medium",
    forRoles: ["adult", "professional"]
  },

  // ============================================
  // KITCHEN SAFETY (2 questions)
  // ============================================
  {
    question: "If a cooking oil fire starts in your pan, what should you do?",
    options: [
      "Pour water on the fire",
      "Cover the pan with a metal lid to smother the flames",
      "Move the pan to the sink",
      "Blow on the fire to put it out"
    ],
    correctAnswer: 1,
    explanation: "Never pour water on an oil fire! Cover the pan with a metal lid to cut off oxygen and smother the flames. Turn off the heat.",
    category: "Kitchen Safety",
    difficulty: "Medium",
    forRoles: ["adult", "professional"]
  },
  {
    question: "Why should you never leave cooking unattended?",
    options: [
      "The food might get overcooked",
      "Someone might steal the food",
      "Unattended cooking is a leading cause of home fires",
      "It wastes electricity or gas"
    ],
    correctAnswer: 2,
    explanation: "Unattended cooking is the leading cause of home fires. Food can overheat, catch fire, or cause pots to boil over and ignite.",
    category: "Kitchen Safety",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },

  // ============================================
  // EVACUATION PLANNING (2 questions)
  // ============================================
  {
    question: "Why is it important to have a family fire escape plan?",
    options: [
      "It's required by law",
      "To practice fire drills for fun",
      "So everyone knows how to exit safely and where to meet during a fire",
      "To impress your neighbors"
    ],
    correctAnswer: 2,
    explanation: "A fire escape plan ensures everyone knows the exits, escape routes, and a safe meeting spot outside, reducing panic during emergencies.",
    category: "Evacuation Planning",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
  {
    question: "When evacuating a burning building, what should you do with doors before opening them?",
    options: [
      "Kick them open immediately",
      "Touch the doorknob and door with the back of your hand to check for heat",
      "Open them wide for fresh air",
      "Look through the keyhole first"
    ],
    correctAnswer: 1,
    explanation: "Check if the door is hot before opening. A hot door means fire is on the other side. Use an alternate exit if the door is hot.",
    category: "Evacuation Planning",
    difficulty: "Medium",
    forRoles: ["adult", "professional"]
  },

  // ============================================
  // FIRE EXTINGUISHER USE (2 questions)
  // ============================================
  {
    question: "What does the acronym 'PASS' stand for when using a fire extinguisher?",
    options: [
      "Point, Aim, Spray, Stop",
      "Pull, Aim, Squeeze, Sweep",
      "Push, Activate, Spray, Smother",
      "Prepare, Alert, Spray, Secure"
    ],
    correctAnswer: 1,
    explanation: "PASS stands for: Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep from side to side.",
    category: "Fire Extinguisher Use",
    difficulty: "Medium",
    forRoles: ["adult", "professional"]
  },
  {
    question: "Where should you aim a fire extinguisher when fighting a fire?",
    options: [
      "At the flames",
      "At the smoke",
      "At the base of the fire",
      "At the ceiling"
    ],
    correctAnswer: 2,
    explanation: "Aim at the BASE of the fire, not the flames. This targets the fuel source and is more effective at extinguishing the fire.",
    category: "Fire Extinguisher Use",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },

  // ============================================
  // SMOKE DETECTOR KNOWLEDGE (1 question)
  // ============================================
  {
    question: "How often should you test your smoke detectors?",
    options: [
      "Once a year",
      "Every 6 months",
      "Once a month",
      "Only when they beep"
    ],
    correctAnswer: 2,
    explanation: "Test smoke detectors monthly by pressing the test button. Replace batteries annually or when the low-battery alert sounds.",
    category: "Smoke Detector Knowledge",
    difficulty: "Easy",
    forRoles: ["adult", "professional"]
  },

  // ============================================
  // GENERAL SAFETY AWARENESS (1 question)
  // ============================================
  {
    question: "What is the emergency hotline number for the Bureau of Fire Protection (BFP) in the Philippines?",
    options: [
      "117",
      "911",
      "143",
      "166"
    ],
    correctAnswer: 1,
    explanation: "911 is the national emergency hotline in the Philippines for all emergencies, including fires. BFP also has local hotlines like 426-0219.",
    category: "General Safety Awareness",
    difficulty: "Easy",
    forRoles: ["kid", "adult", "professional"]
  },
];

async function main() {
  console.log('🔥 Seeding Assessment Questions...\n');

  // Clear existing questions (optional - remove in production if you want to keep old data)
  console.log('⚠️  Clearing existing assessment questions...');
  await prisma.userAnswer.deleteMany({});
  await prisma.assessmentQuestion.deleteMany({});
  
  // Insert questions
  for (const question of assessmentQuestions) {
    const created = await prisma.assessmentQuestion.create({
      data: question,
    });
    console.log(`✅ Created: ${question.category} - ${question.question.substring(0, 50)}...`);
  }

  console.log(`\n🎉 Successfully seeded ${assessmentQuestions.length} assessment questions!\n`);

  // Print summary
  const categoryCounts = assessmentQuestions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Questions by Category:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
