export interface CarouselImage {
  id: string
  url: string
  altText: string
  title: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: "adult" | "professional"
  createdAt: string
  author: string
}

export interface VideoContent {
  id: string
  title: string
  description: string
  youtubeId: string
  category: "professional" | "adult" | "kids"
  duration: string
}

export const carouselImages: CarouselImage[] = [
  {
    id: "1",
    url: "/bfp-firefighters-in-action.jpg",
    altText: "BFP Firefighters in Action",
    title: "Serving and Protecting Our Community",
  },
  {
    id: "2",
    url: "/fire-safety-training-session.jpg",
    altText: "Fire Safety Training",
    title: "Professional Fire Safety Training",
  },
  {
    id: "3",
    url: "/bfp-sta-cruz-fire-station.jpg",
    altText: "BFP Sta Cruz",
    title: "BFP Sta Cruz - Always Ready",
  },
]

export const professionalVideos: VideoContent[] = [
  {
    id: "1",
    title: "Advanced Firefighting Techniques",
    description: "Professional firefighting methods and strategies",
    youtubeId: "W25rzeEO740",
    category: "professional",
    duration: "15:30",
  },
  {
    id: "2",
    title: "Fire Code Compliance",
    description: "Understanding fire safety regulations",
    youtubeId: "ldPH_D60jpo",
    category: "professional",
    duration: "12:45",
  },
  {
    id: "3",
    title: "Emergency Response Protocols",
    description: "Standard operating procedures for emergencies",
    youtubeId: "9XpJZv_YsGM",
    category: "professional",
    duration: "18:20",
  },
  {
    id: "4",
    title: "Fire Investigation Basics",
    description: "Introduction to fire investigation techniques",
    youtubeId: "5_YeQpOXnP8",
    category: "professional",
    duration: "20:15",
  },
  {
    id: "5",
    title: "Hazardous Materials Handling",
    description: "Safe handling of hazardous materials in fire scenarios",
    youtubeId: "q_oBg1U2x9Q",
    category: "professional",
    duration: "16:40",
  },
  {
    id: "6",
    title: "Rescue Operations",
    description: "Advanced rescue techniques and equipment",
    youtubeId: "x1oo76Y_87A",
    category: "professional",
    duration: "14:25",
  },
  {
    id: "7",
    title: "Fire Prevention Strategies",
    description: "Proactive fire prevention in communities",
    youtubeId: "sCmPKeTILq4",
    category: "professional",
    duration: "11:30",
  },
]

export const adultBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Home Fire Safety Essentials",
    excerpt: "Learn the basic fire safety measures every home should have",
    content:
      "Fire safety at home is crucial for protecting your family and property. Install smoke detectors on every level of your home, especially near bedrooms. Test them monthly and replace batteries annually. Keep fire extinguishers in key locations like the kitchen and garage. Create and practice a fire escape plan with your family. Ensure everyone knows two ways out of every room and establish a meeting point outside.",
    imageUrl: "/home-fire-safety-equipment.jpg",
    category: "adult",
    createdAt: "2025-01-15",
    author: "BFP Sta Cruz",
  },
  {
    id: "2",
    title: "Kitchen Fire Prevention",
    excerpt: "Prevent the most common cause of home fires",
    content:
      "Kitchen fires are the leading cause of home fires. Never leave cooking unattended, especially when frying, grilling, or broiling. Keep flammable items away from the stove. Clean cooking surfaces regularly to prevent grease buildup. Keep a lid nearby to smother small pan fires. Never use water on grease fires. Install a fire extinguisher in your kitchen and learn how to use it properly.",
    imageUrl: "/kitchen-fire-safety-cooking.jpg",
    category: "adult",
    createdAt: "2025-01-10",
    author: "BFP Sta Cruz",
  },
  {
    id: "3",
    title: "Electrical Fire Safety",
    excerpt: "Protect your home from electrical hazards",
    content:
      "Electrical fires can be prevented with proper awareness. Avoid overloading outlets and power strips. Replace damaged or frayed electrical cords immediately. Use the correct wattage for light fixtures. Have a qualified electrician inspect your home regularly. Never run cords under rugs or furniture. Unplug appliances when not in use, especially heat-producing devices.",
    imageUrl: "/electrical-safety-outlets-wiring.jpg",
    category: "adult",
    createdAt: "2025-01-05",
    author: "BFP Sta Cruz",
  },
  {
    id: "4",
    title: "Fire Escape Planning",
    excerpt: "Create an effective evacuation plan for your family",
    content:
      "A well-practiced fire escape plan can save lives. Draw a floor plan of your home showing all doors and windows. Mark two escape routes from each room. Choose an outside meeting place a safe distance from your home. Practice your escape plan at least twice a year. Make sure everyone knows how to call emergency services. Consider special needs of children, elderly, or disabled family members.",
    imageUrl: "/family-fire-escape-plan.jpg",
    category: "adult",
    createdAt: "2024-12-28",
    author: "BFP Sta Cruz",
  },
  {
    id: "5",
    title: "Smoke Detector Maintenance",
    excerpt: "Keep your first line of defense working properly",
    content:
      "Smoke detectors are your first warning of fire. Install them on every level of your home and in every bedroom. Test detectors monthly by pressing the test button. Replace batteries at least once a year. Replace the entire unit every 10 years. Clean detectors regularly to remove dust. Consider interconnected detectors so when one sounds, they all sound.",
    imageUrl: "/smoke-detector-alarm-maintenance.jpg",
    category: "adult",
    createdAt: "2024-12-20",
    author: "BFP Sta Cruz",
  },
  {
    id: "6",
    title: "Fire Extinguisher Guide",
    excerpt: "Know how to use a fire extinguisher effectively",
    content:
      "Remember PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, and Sweep from side to side. Keep extinguishers in accessible locations. Check pressure gauges monthly. Know the different types: Class A for ordinary combustibles, Class B for flammable liquids, Class C for electrical fires. Most home extinguishers are ABC rated for all three. Only fight small fires - if in doubt, evacuate and call 911.",
    imageUrl: "/fire-extinguisher-usage-demonstration.jpg",
    category: "adult",
    createdAt: "2024-12-15",
    author: "BFP Sta Cruz",
  },
]

export const bfpInfo = {
  mission:
    "To prevent and suppress destructive fires, investigate their causes, enforce fire safety laws and regulations, and provide emergency medical and rescue services.",
  vision:
    "A modern fire service fully capable of providing efficient and effective fire protection and emergency services.",
  about:
    "The Bureau of Fire Protection Sta Cruz is committed to serving our community with excellence in fire prevention, suppression, and emergency response. Our dedicated team of firefighters works around the clock to ensure the safety and security of our citizens.",
  contact: {
    address: "BFP Sta Cruz Fire Station, Sta Cruz, Philippines",
    phone: "(02) 8888-0000",
    emergency: "911",
    email: "bfp.stacruz@bfp.gov.ph",
  },
}

export function getCarouselImages(): CarouselImage[] {
  if (typeof window === "undefined") {
    return carouselImages
  }
  const stored = localStorage.getItem("bfp_carousel")
  return stored ? JSON.parse(stored) : carouselImages
}

export function getBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") {
    return adultBlogPosts
  }
  const stored = localStorage.getItem("bfp_blogs")
  return stored ? JSON.parse(stored) : adultBlogPosts
}
