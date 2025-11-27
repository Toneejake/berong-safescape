import fs from 'fs';
import path from 'path';

/**
 * Safely deletes a file from the public/uploads directory based on its URL.
 * @param fileUrl The URL of the file to delete (e.g., /uploads/image.jpg)
 * @returns boolean indicating if deletion was attempted
 */
export async function deleteUploadedFile(fileUrl: string | null | undefined): Promise<boolean> {
    if (!fileUrl) return false;

    try {
        // Extract the relative path from the URL
        // Assuming URLs start with /uploads/
        const uploadsDir = path.join(process.cwd(), 'public');

        // Remove query parameters if any
        const cleanUrl = fileUrl.split('?')[0];

        // Construct full file path
        const filePath = path.join(uploadsDir, cleanUrl);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            // Delete the file
            await fs.promises.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
            return true;
        } else {
            console.warn(`File not found for deletion: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error);
        return false;
    }
}
