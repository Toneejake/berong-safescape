import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Define the type for a featured card item
type FeaturedCardItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
};

// Mock data for featured cards - this will be replaced by dynamic data fetching
const mockFeaturedCards: FeaturedCardItem[] = [
  {
    id: 1,
    title: 'For Professionals',
    description: 'Access comprehensive fire safety codes, standards, and professional training materials.',
    imageUrl: '/professional_card.png', // Professional card image
    link: '/professional',
  },
  {
    id: 2,
    title: 'For Adults',
    description: 'Learn essential fire safety practices for your home, family, and workplace.',
    imageUrl: '/adults_card.png', // Adult card image
    link: '/adult',
  },
  {
    id: 3,
    title: 'For Kids',
    description: 'Fun and interactive modules to teach children about fire safety.',
    imageUrl: '/kids_card.png', // Kids card image
    link: '/kids',
  },
];

export function FeaturedCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-4">
      {mockFeaturedCards.map((card) => (
        <Card key={card.id} className="overflow-hidden shadow-lg rounded-lg">
          <div className="relative w-full h-48">
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-gray-600 mb-4">{card.description}</p>
            <Link href={card.link}>
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
