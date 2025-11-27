"use client"

import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Maximize2 } from "lucide-react"
import { ImageViewerModal } from "@/components/image-viewer-modal"

type CarouselImage = {
    id: number;
    title: string;
    altText: string;
    imageUrl: string;
    order: number;
    isActive: boolean;
};

interface HeroCarouselClientProps {
    images: CarouselImage[];
}

export function HeroCarouselClient({ images }: HeroCarouselClientProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null)

    const handleImageClick = (image: CarouselImage) => {
        setSelectedImage(image)
        setIsViewerOpen(true)
    }

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            <Carousel className="w-full">
                <CarouselContent>
                    {images.map((image) => (
                        <CarouselItem key={image.id}>
                            <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg group/slide">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.altText}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="transition-opacity duration-500 ease-in-out"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8 pointer-events-none">
                                    <div className="text-white">
                                        <h2 className="text-3xl font-bold mb-2">{image.title}</h2>
                                        <p className="text-lg opacity-90">Learn more about fire safety with BFP Berong.</p>
                                    </div>
                                </div>

                                {/* Transparent Clickable Overlay Button */}
                                <button
                                    onClick={() => handleImageClick(image)}
                                    className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent hover:bg-white/5 transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                                    aria-label={`View full screen image: ${image.title}`}
                                >
                                    {/* Maximize Icon (Top Right) */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300">
                                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white shadow-sm">
                                            <Maximize2 className="h-5 w-5" />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20" />
            </Carousel>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <ImageViewerModal
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                    imageUrl={selectedImage.imageUrl}
                    imageTitle={selectedImage.title}
                    imageAlt={selectedImage.altText}
                />
            )}
        </div>
    );
}
