import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PermissionGuard } from '@/components/permission-guard';

// Define the type for a two-column block item
type TwoColumnBlockItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  requiredPermission: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
};

// Mock data for the two-column block - updated to show simulation content instead of blog
const mockTwoColumnBlock: TwoColumnBlockItem = {
  id: 1,
  title: 'Exit Drill In The Home (EDITH)',
  description: 'Interactive tool to visualize how fire spreads in different environments and conditions. Experience our AI-powered evacuation simulation.',
  imageUrl: '/Fire Spread Simulation.png', // Replace with a relevant simulation image
  link: '/adult', // Link to the adult section
  requiredPermission: 'accessAdult',
};

export function TwoColumnBlock() {
  const { title, description, imageUrl, link, requiredPermission } = mockTwoColumnBlock;

  return (
    <PermissionGuard requiredPermission={requiredPermission} targetPath={link}>
      <div className="max-w-7xl mx-auto p-4">
        <Card className="overflow-hidden shadow-lg rounded-lg flex flex-col md:flex-row">
          {/* Image Column */}
          <div className="relative w-full md:w-1/2 h-64 md:h-auto">
            <Image
              src={imageUrl || '/placeholder.svg?height=400&width=600&text=Fire+Simulation'}
              alt={title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Text Column */}
          <div className="w-full md:w-1/2 flex-col justify-center p-6">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-gray-600 mb-6">{description}</p>
              <Link href={link}>
                <Button variant="default">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>
      </div>
    </PermissionGuard>
  );
}
