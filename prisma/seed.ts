import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bfp.gov.ph' },
    update: {},
    create: {
      email: 'admin@bfp.gov.ph',
      password: adminPassword,
      name: 'BFP Administrator',
      age: 30,
      role: 'admin',
      isActive: true,
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create sample users for testing
  const kidPassword = await bcrypt.hash('kid123', 10)
  const adultPassword = await bcrypt.hash('adult123', 10)
  const professionalPassword = await bcrypt.hash('pro123', 10)

  const kidUser = await prisma.user.upsert({
    where: { email: 'kid@bfp.gov.ph' },
    update: {},
    create: {
      email: 'kid@bfp.gov.ph',
      password: kidPassword,
      name: 'Young Firefighter',
      age: 12,
      role: 'kid',
      isActive: true,
    },
  })

  const adultUser = await prisma.user.upsert({
    where: { email: 'adult@bfp.gov.ph' },
    update: {},
    create: {
      email: 'adult@bfp.gov.ph',
      password: adultPassword,
      name: 'John Smith',
      age: 25,
      role: 'adult',
      isActive: true,
    },
  })

  const professionalUser = await prisma.user.upsert({
    where: { email: 'pro@bfp.gov.ph' },
    update: {},
    create: {
      email: 'pro@bfp.gov.ph',
      password: professionalPassword,
      name: 'Firefighter Cruz',
      age: 28,
      role: 'professional',
      isActive: true,
    },
  })

  console.log('✅ Created sample users')

  // Seed carousel images
  const carouselImages = [
    {
      title: 'BFP Firefighters in Action',
      altText: 'BFP Firefighters in Action',
      imageUrl: '/bfp-firefighters-in-action.jpg',
      order: 1,
      isActive: true,
    },
    {
      title: 'Fire Safety Training',
      altText: 'Fire Safety Training',
      imageUrl: '/fire-safety-training-session.jpg',
      order: 2,
      isActive: true,
    },
    {
      title: 'BFP Sta Cruz - Always Ready',
      altText: 'BFP Sta Cruz',
      imageUrl: '/bfp-sta-cruz-fire-station.jpg',
      order: 3,
      isActive: true,
    },
  ]

  for (const image of carouselImages) {
    await prisma.carouselImage.create({
      data: image,
    })
  }
  console.log('✅ Seeded carousel images')

  // Seed videos
  const videos = [
    {
      title: 'Advanced Firefighting Techniques',
      description: 'Professional firefighting methods and strategies',
      youtubeId: 'W25rzeEO740',
      category: 'professional' as const,
      duration: '15:30',
      isActive: true,
    },
    {
      title: 'Fire Code Compliance',
      description: 'Understanding fire safety regulations',
      youtubeId: 'ldPH_D60jpo',
      category: 'professional' as const,
      duration: '12:45',
      isActive: true,
    },
    {
      title: 'Emergency Response Protocols',
      description: 'Standard operating procedures for emergencies',
      youtubeId: '9XpJZv_YsGM',
      category: 'professional' as const,
      duration: '18:20',
      isActive: true,
    },
    {
      title: 'Fire Investigation Basics',
      description: 'Introduction to fire investigation techniques',
      youtubeId: '5_YeQpOXnP8',
      category: 'professional' as const,
      duration: '20:15',
      isActive: true,
    },
    {
      title: 'Hazardous Materials Handling',
      description: 'Safe handling of hazardous materials in fire scenarios',
      youtubeId: 'q_oBg1U2x9Q',
      category: 'professional' as const,
      duration: '16:40',
      isActive: true,
    },
    {
      title: 'Rescue Operations',
      description: 'Advanced rescue techniques and equipment',
      youtubeId: 'x1oo76Y_87A',
      category: 'professional' as const,
      duration: '14:25',
      isActive: true,
    },
    {
      title: 'Fire Prevention Strategies',
      description: 'Proactive fire prevention in communities',
      youtubeId: 'sCmPKeTILq4',
      category: 'professional' as const,
      duration: '11:30',
      isActive: true,
    },
  ]

  for (const video of videos) {
    await prisma.video.create({
      data: video,
    })
  }
  console.log('✅ Seeded professional videos')

  // Seed blog posts
  const blogPosts = [
    {
      title: 'Home Fire Safety Essentials',
      excerpt: 'Learn the basic fire safety measures every home should have',
      content: 'Fire safety at home is crucial for protecting your family and property. Install smoke detectors on every level of your home, especially near bedrooms. Test them monthly and replace batteries annually. Keep fire extinguishers in key locations like the kitchen and garage. Create and practice a fire escape plan with your family. Ensure everyone knows two ways out of every room and establish a meeting point outside.',
      imageUrl: '/home-fire-safety-equipment.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Kitchen Fire Prevention',
      excerpt: 'Prevent the most common cause of home fires',
      content: 'Kitchen fires are the leading cause of home fires. Never leave cooking unattended, especially when frying, grilling, or broiling. Keep flammable items away from the stove. Clean cooking surfaces regularly to prevent grease buildup. Keep a lid nearby to smother small pan fires. Never use water on grease fires. Install a fire extinguisher in your kitchen and learn how to use it properly.',
      imageUrl: '/kitchen-fire-safety-cooking.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Electrical Fire Safety',
      excerpt: 'Protect your home from electrical hazards',
      content: 'Electrical fires can be prevented with proper awareness. Avoid overloading outlets and power strips. Replace damaged or frayed electrical cords immediately. Use the correct wattage for light fixtures. Have a qualified electrician inspect your home regularly. Never run cords under rugs or furniture. Unplug appliances when not in use, especially heat-producing devices.',
      imageUrl: '/electrical-safety-outlets-wiring.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Fire Escape Planning',
      excerpt: 'Create an effective evacuation plan for your family',
      content: 'A well-practiced fire escape plan can save lives. Draw a floor plan of your home showing all doors and windows. Mark two escape routes from each room. Choose an outside meeting place a safe distance from your home. Practice your escape plan at least twice a year. Make sure everyone knows how to call emergency services. Consider special needs of children, elderly, or disabled family members.',
      imageUrl: '/family-fire-escape-plan.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Smoke Detector Maintenance',
      excerpt: 'Keep your first line of defense working properly',
      content: 'Smoke detectors are your first warning of fire. Install them on every level of your home and in every bedroom. Test detectors monthly by pressing the test button. Replace batteries at least once a year. Replace the entire unit every 10 years. Clean detectors regularly to remove dust. Consider interconnected detectors so when one sounds, they all sound.',
      imageUrl: '/smoke-detector-alarm-maintenance.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
    {
      title: 'Fire Extinguisher Guide',
      excerpt: 'Know how to use a fire extinguisher effectively',
      content: 'Remember PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side. Keep extinguishers in accessible locations. Check pressure gauges monthly. Know the different types: Class A for ordinary combustibles, Class B for flammable liquids, Class C for electrical fires. Most home extinguishers are ABC rated for all three. Only fight small fires - if in doubt, evacuate and call 911.',
      imageUrl: '/fire-extinguisher-usage-demonstration.jpg',
      category: 'adult' as const,
      authorId: adultUser.id,
      isPublished: true,
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    })
  }
  console.log('✅ Seeded blog posts')

  // Seed kids modules (sample 5 modules for demo)
  const kidsModules = [
    {
      title: 'Fire Safety Basics',
      description: 'Introduction to fire safety for kids',
      dayNumber: 1,
      content: 'Fire is hot and can be dangerous. We need to learn how to stay safe around fire. Today we will learn about what fire needs to burn and why we should never play with matches or lighters.',
      isActive: true,
    },
    {
      title: 'Stop, Drop, and Roll',
      description: 'What to do if your clothes catch fire',
      dayNumber: 2,
      content: 'If your clothes ever catch on fire, remember: Stop, Drop, and Roll! Stop where you are, drop to the ground, and roll over and over to put out the flames. Practice this with your family.',
      isActive: true,
    },
    {
      title: 'Smoke Detectors',
      description: 'Why smoke detectors are important',
      dayNumber: 3,
      content: 'Smoke detectors are like watchdogs that warn us when there is smoke or fire. They make a loud noise to wake us up if there is danger. We need smoke detectors in every bedroom and on every floor.',
      isActive: true,
    },
    {
      title: 'Fire Escape Plan',
      description: 'Planning how to get out of the house safely',
      dayNumber: 4,
      content: 'Every family needs a fire escape plan. Draw a map of your home and mark two ways out of every room. Choose a safe meeting place outside. Practice your escape plan with your family.',
      isActive: true,
    },
    {
      title: 'Firefighter Heroes',
      description: 'Learning about firefighters and their equipment',
      dayNumber: 5,
      content: 'Firefighters are brave heroes who help us when there are fires. They wear special suits, helmets, and use big trucks with ladders. They help people and put out fires to keep us safe.',
      isActive: true,
    },
  ]

  for (const module of kidsModules) {
    await prisma.kidsModule.upsert({
      where: { dayNumber: module.dayNumber },
      update: {},
      create: module,
    })
  }
  console.log('✅ Seeded kids modules')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Test Accounts Created:')
  console.log('Admin: admin@bfp.gov.ph / admin123')
  console.log('Kid: kid@bfp.gov.ph / kid123')
  console.log('Adult: adult@bfp.gov.ph / adult123')
  console.log('Professional: pro@bfp.gov.ph / pro123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
