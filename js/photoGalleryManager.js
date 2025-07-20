// Photo Data - Contains photo gallery data
const PhotoData = {
    "id": 4,
    "result": {
        "provider": "google-photos",
        "url": "https:\/\/photos.app.goo.gl\/aGYZ8szkrFYThMX78",
        "id": null,
        "title": "PUBLIC: DNA Wedding",
        "description": "10 new items added to shared album",
        "mediaItems": [
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/1.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/2.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/3.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/4.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/5.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/6.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/7.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/8.jpg",
                "mimetype": null,
                "mediaMetadata": null
            },
            {
                "id": "AF1QipMSoLHOj7FTKGsxgMm4GlLMW13syureHIkuMs3z",
                "description": null,
                "url": "/images/9.jpg",
                "mimetype": null,
                "mediaMetadata": null
            }
        ],
        "version": 1,
        "timestamp": 1727886887
    }
};

// Photo Gallery Manager - Handles dynamic creation and positioning of images
class PhotoGalleryManager {
    constructor(entityManager, calibrationManager) {
        this.entityManager = entityManager;
        this.calibrationManager = calibrationManager;
        this.images = [];
        this.photoData = PhotoData;
        this.imageCache = new Map(); // Cache for loaded image dimensions
        this.layoutMode = 'grid'; // Default layout mode
    }

    async createImages() {
        const mediaItems = this.photoData.result.mediaItems;
        if (!mediaItems || mediaItems.length === 0) {
            console.warn('No media items found in photo data.');
            return;
        }

        const nftMarker = this.entityManager.getEntity('nftMarker');
        if (!nftMarker) {
            console.error('NFT Marker not found for image creation');
            return;
        }

        // Clear existing images
        this.clearImages();

        const calibrationData = this.calibrationManager.getCalibrationData();

        // Create images with proper aspect ratios in a nice grid layout
        for (let i = 0; i < Math.min(mediaItems.length, 9); i++) { // Limit to 9 images for better performance
            const mediaItem = mediaItems[i];
            
            try {
                const imgEl = await this.createImageElement(mediaItem, i, calibrationData);
                this.images.push(imgEl);
                nftMarker.appendChild(imgEl);
            } catch (error) {
                console.error(`Failed to create image ${i}:`, error);
            }
        }

        console.log(`Created ${this.images.length} images in photo gallery`);
    }

    async createImageElement(mediaItem, index, calibrationData) {
        return new Promise((resolve, reject) => {
            // Create a temporary image to get dimensions
            const tempImg = new Image();
            
            tempImg.onload = () => {
                const aspectRatio = tempImg.width / tempImg.height;
                
                // Create A-Frame image element
                const imgEl = document.createElement('a-image');
                imgEl.setAttribute('src', mediaItem.url);
                
                // Set proper dimensions maintaining aspect ratio
                const baseWidth = 80; // Base width in AR units
                const width = baseWidth;
                const height = baseWidth / aspectRatio;
                
                imgEl.setAttribute('width', width);
                imgEl.setAttribute('height', height);
                
                // Calculate position based on layout mode
                const gridPos = this.layoutMode === 'cloud' 
                    ? this.calculateCloudPosition(index, width, height)
                    : this.calculateGridPosition(index, width, height);
                
                // Apply calibration position offsets
                const position = {
                    x: gridPos.x + calibrationData.positionOffset.x,
                    y: gridPos.y + calibrationData.positionOffset.y,
                    z: gridPos.z + calibrationData.positionOffset.z
                };
                
                imgEl.setAttribute('position', position);
                
                // Apply reasonable scale
                const scale = calibrationData.scaleMultiplier * 25;
                imgEl.setAttribute('scale', `${scale} ${scale} ${scale}`);
                
                // Set rotation to face the camera
                imgEl.setAttribute('rotation', '90 180 0');
                
                // Add a subtle material for better appearance
                imgEl.setAttribute('material', 'shader: flat; transparent: true; alphaTest: 0.5;');
                
                // Add hover effects
                imgEl.setAttribute('animation__mouseenter', 'property: scale; to: 1.1 1.1 1.1; startEvents: mouseenter; dur: 200');
                imgEl.setAttribute('animation__mouseleave', 'property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200');
                
                // Cache the dimensions
                this.imageCache.set(mediaItem.url, { width: tempImg.width, height: tempImg.height, aspectRatio });
                
                resolve(imgEl);
            };
            
            tempImg.onerror = () => {
                reject(new Error(`Failed to load image: ${mediaItem.url}`));
            };
            
            tempImg.src = mediaItem.url;
        });
    }

    calculateGridPosition(index, imageWidth, imageHeight) {
        // 3x3 grid layout
        const cols = 3;
        const rows = 3;
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Spacing between images
        const spacingX = imageWidth * 1.2; // 20% spacing
        const spacingY = imageHeight * 1.2;
        
        // Center the grid
        const offsetX = -(cols - 1) * spacingX / 2;
        const offsetY = -(rows - 1) * spacingY / 2;
        
        return {
            x: offsetX + col * spacingX,
            y: offsetY + row * spacingY + 50, // Raise above the marker
            z: 0
        };
    }

    clearImages() {
        this.images.forEach(img => {
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
        });
        this.images = [];
    }

    async updateImagesWithCalibration() {
        // Recreate images with new calibration data
        await this.createImages();
    }

    getImageCount() {
        return this.images.length;
    }

    // Get cached image dimensions
    getImageDimensions(url) {
        return this.imageCache.get(url);
    }

    // Alternative layout: Floating cloud layout
    // Alternative layout: Floating cloud layout
    calculateCloudPostion(index, imageWidth, imageHeight) {
        // Create a dynamic spiral-like arrangement
        const angle = index * (Math.PI * 0.5); // Increasing angle for each image
        const spacing = Math.max(imageWidth, imageHeight) * 1.2; // Use larger dimension for spacing
        const radius = spacing * (2 + index * 0.5); // Base radius on image size
        const heightOffset = spacing * 2 - (index * spacing * 0.3); // Vertical spacing
        
        return {
            x: Math.cos(angle) * radius,
            y: heightOffset + (Math.sin(angle) * spacing), // Vertical wave based on image size
            z: Math.sin(angle) * radius * 0.5 // Compress depth while maintaining spacing
        };
    }

    // Switch between grid and cloud layouts
    setLayoutMode(mode = 'grid') {
        this.layoutMode = mode;
        this.updateImagesWithCalibration();
    }
}

// Export for use in other modules
window.PhotoGalleryManager = PhotoGalleryManager;
