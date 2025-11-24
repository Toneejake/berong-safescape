import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { prisma } from '@/lib/prisma'; // Import the prisma client instance
import Image from 'next/image';

// Define the type for CarouselImage
type CarouselImage = {
  id: number;
  title: string;
  altText: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

async function getCarouselImages(): Promise<CarouselImage[]> {
  // Fetch data from the database using Prisma
  const dbImages = await prisma.carouselImage.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Map the database result to the CarouselImage type
  return dbImages.map((img) => ({
    id: img.id,
    title: img.title,
    altText: img.altText,
    imageUrl: img.imageUrl,
    order: img.order,
    isActive: img.isActive,
  }));
}

export async function HeroCarousel() {
  const images = await getCarouselImages();

  if (images.length === 0) {
    return <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Carousel Images Available</div>;
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-opacity duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">{image.title}</h2>
                    <p className="text-lg opacity-90">Learn more about fire safety with BFP Berong.</p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>
    </div>
  );
}
