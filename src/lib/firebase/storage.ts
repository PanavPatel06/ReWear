import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isMockMode } from "./firebase";
import { v4 as uuidv4 } from 'uuid';

export async function uploadImages(images: File[], userId: string): Promise<string[]> {
    if (isMockMode) {
        return images.map((_, index) => {
            const imagesPool = [
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1887", // Summer dress
                "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=1887", // T-shirt
                "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1935", // Silk scarf
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000", // Outerwear
                "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000"  // Casual jacket
            ];
            return imagesPool[index % imagesPool.length];
        });
    }
    const imageUrls: string[] = [];

    const uploadPromises = images.map(image => {
        const imageRef = ref(storage, `items/${userId}/${uuidv4()}-${image.name}`);
        return uploadBytes(imageRef, image).then(snapshot => {
            return getDownloadURL(snapshot.ref);
        });
    });

    try {
        const urls = await Promise.all(uploadPromises);
        imageUrls.push(...urls);
        return imageUrls;
    } catch (error) {
        console.error("Error uploading images: ", error);
        throw new Error("Could not upload images.");
    }
}
