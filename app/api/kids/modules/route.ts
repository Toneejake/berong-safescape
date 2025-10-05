import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For now, return the sample modules structure
    // In a real implementation, this would come from the database
    const modules = [
      {
        id: 1,
        title: "Module 1: Welcome to the Fire Station!",
        description: "Introduction to fire safety and meeting our heroes",
        dayNumber: 1,
        content: "Learn about fire safety basics and meet firefighter Berong!",
        isActive: true,
        progress: 0,
        isLocked: false,
        isCompleted: false,
        sections: [
          { id: 1, title: "1.1 Introduction to Fire Safety", completed: false },
          { id: 2, title: "1.2 Your Community Heroes", completed: false },
          { id: 3, title: "1.3 The Super Sniffer: Smoke Alarms", completed: false },
          { id: 4, title: "1.4 Mission: Smoke Alarm Hunt", completed: false },
          { id: 5, title: "1.5 Module 1 Quiz", completed: false }
        ]
      },
      {
        id: 2,
        title: "Module 2: The Proactive Protector",
        description: "Kitchen safety and home hazard prevention",
        dayNumber: 2,
        content: "Learn about kitchen safety and electrical hazards",
        isActive: true,
        progress: 0,
        isLocked: true,
        isCompleted: false,
        sections: [
          { id: 1, title: "2.1 Kitchen Safety 101", completed: false },
          { id: 2, title: "2.2 Video: Coco's Kitchen Mishap", completed: false },
          { id: 3, title: "2.3 The Plug Patrol: Electrical Safety", completed: false },
          { id: 4, title: "2.4 Mission: Home Hazard Checklist", completed: false },
          { id: 5, title: "2.5 Module 2 Quiz", completed: false }
        ]
      },
      {
        id: 3,
        title: "Module 3: The Action Plan",
        description: "Emergency response and escape planning",
        dayNumber: 3,
        content: "Learn how to create and practice escape plans",
        isActive: true,
        progress: 0,
        isLocked: true,
        isCompleted: false,
        sections: [
          { id: 1, title: "3.1 Your Great Escape Plan", completed: false },
          { id: 2, title: "3.2 Video: Get Low and Go!", completed: false },
          { id: 3, title: "3.3 Mission: Draw Your Escape Plan", completed: false },
          { id: 4, title: "3.4 Module 3 Quiz", completed: false }
        ]
      },
      {
        id: 4,
        title: "Module 4: Community Champion",
        description: "Community safety and emergency procedures",
        dayNumber: 4,
        content: "Learn about community safety and emergency calls",
        isActive: true,
        progress: 0,
        isLocked: true,
        isCompleted: false,
        sections: [
          { id: 1, title: "4.1 How to Call for Help", completed: false },
          { id: 2, title: "4.2 Fire Extinguishers", completed: false },
          { id: 3, title: "4.3 Video: The P.A.S.S. Method", completed: false },
          { id: 4, title: "4.4 Module 4 Quiz", completed: false }
        ]
      },
      {
        id: 5,
        title: "Final Certification",
        description: "Junior Fire Marshal certification exam",
        dayNumber: 5,
        content: "Complete your journey to become a certified Junior Fire Marshal!",
        isActive: true,
        progress: 0,
        isLocked: true,
        isCompleted: false,
        sections: [
          { id: 1, title: "Final Exam", completed: false }
        ]
      }
    ]

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching kids modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}
