// Script to assign default orders to existing carousel images
// Run this once: node prisma/assign-carousel-orders.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function assignDefaultOrders() {
    try {
        console.log('Fetching existing carousel images...')

        const images = await prisma.carouselImage.findMany({
            orderBy: { id: 'asc' }
        })

        if (images.length === 0) {
            console.log('No carousel images found.')
            return
        }

        console.log(`Found ${images.length} carousel images. Assigning orders...`)

        // Assign order based on ID (ascending)
        for (let i = 0; i < images.length; i++) {
            await prisma.carouselImage.update({
                where: { id: images[i].id },
                data: { order: i }
            })
            console.log(`✓ Assigned order ${i} to image: ${images[i].title}`)
        }

        console.log('\n✅ Successfully assigned default orders to all carousel images!')
    } catch (error) {
        console.error('❌ Error assigning orders:', error)
    } finally {
        await prisma.$disconnect()
    }
}

assignDefaultOrders()
