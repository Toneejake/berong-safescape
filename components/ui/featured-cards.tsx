import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PermissionGuard } from '@/components/permission-guard';

// Define the type for a featured card item
type FeaturedCardItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
};

// Mock data for featured cards - this will be replaced by dynamic data fetching
const mockFeaturedCards: FeaturedCardItem[] = [
  {
    id: 1,
    title: 'For Professionals',
    description: 'Access comprehensive fire safety codes, standards, and professional training materials.',
    imageUrl: '/professional_card.png', // Professional card image
    link: '/professional',
    requiredPermission: 'accessProfessional',
  },
  {
    id: 2,
    title: 'For Adults',
    description: 'Learn essential fire safety practices for your home, family, and workplace.',
    imageUrl: '/adults_card.png', // Adult card image
    link: '/adult',
    requiredPermission: 'accessAdult',
  },
  {
    id: 3,
    title: 'For Kids',
    description: 'Fun and interactive modules to teach children about fire safety.',
    imageUrl: '/kids_card.png', // Kids card image
    link: '/kids',
    requiredPermission: 'accessKids',
  },
];

export function FeaturedCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      {mockFeaturedCards.map((card) => (
        <PermissionGuard key={card.id} requiredPermission={card.requiredPermission} targetPath={card.link}>
          {/* CHANGE 1: Add 'h-full' and 'flex flex-col' to the Card */}
          <Card className="overflow-hidden shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-shadow h-full flex flex-col">
            
            {/* Image Container (No changes needed here) */}
            <div className="relative w-full h-48">
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* CHANGE 2: Make CardContent flex and grow to fill space */}
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              
              {/* CHANGE 3: Add 'flex-grow' to description to push the button down */}
              <p className="text-gray-600 mb-4 flex-grow">{card.description}</p>
              
              <Link href={card.link}>
                {/* Button now sits at the bottom automatically */}
                <Button variant="outline" className="w-full mt-auto">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </Card>
        </PermissionGuard>
      ))}
    </div>
  );
}
