// Main Application Controller - Orchestrates all components
class ARApp {
    constructor() {
        this.entityManager = null;
        this.calibrationManager = null;
        this.animationManager = null;
        this.photoGalleryManager = null;
        this.cameraManager = null;
        this.uiController = null;
        this.isInitialized = false;
    }

    init() {
        try {
            console.log('Initializing AR App...');
            
            // Initialize entity manager first
            this.entityManager = new EntityManager();
            
            // Validate required entities
            if (!this.entityManager.validateEntities()) {
                throw new Error('Required entities not found');
            }

            // Initialize calibration manager
            this.calibrationManager = new CalibrationManager(this.entityManager);
            
            // Initialize camera manager
            this.cameraManager = new CameraManager();
            
            // Initialize animation manager
            this.animationManager = new AnimationManager(this.entityManager);
            
            // Initialize photo gallery manager
            this.photoGalleryManager = new PhotoGalleryManager(this.entityManager, this.calibrationManager);
            
            // Initialize UI controller
            this.uiController = new UIController(
                this.calibrationManager, 
                this.entityManager, 
                this.photoGalleryManager,
                this.cameraManager
            );

            // Setup scene loading
            this.setupSceneLoading();
            
            this.isInitialized = true;
            console.log('AR App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize AR App:', error);
            this.handleInitializationError(error);
        }
    }

    setupSceneLoading() {
        const scene = this.entityManager.getEntity('scene');
        if (!scene) {
            console.error('Scene not found');
            return;
        }

        if (scene.hasLoaded) {
            this.onSceneLoaded();
        } else {
            scene.addEventListener('loaded', () => this.onSceneLoaded());
        }
    }

    async onSceneLoaded() {
        console.log('Scene loaded, creating photo gallery...');
        try {
            await this.photoGalleryManager.createImages();
            console.log('Photo gallery created successfully');
        } catch (error) {
            console.error('Failed to create photo gallery:', error);
        }
    }

    handleInitializationError(error) {
        console.error('AR App initialization failed:', error);
        // You could show a user-friendly error message here
        alert('Failed to initialize AR application. Please refresh the page.');
    }

    // Public API methods
    getEntityManager() {
        return this.entityManager;
    }

    getCalibrationManager() {
        return this.calibrationManager;
    }

    getAnimationManager() {
        return this.animationManager;
    }

    getPhotoGalleryManager() {
        return this.photoGalleryManager;
    }

    getCameraManager() {
        return this.cameraManager;
    }

    getUIController() {
        return this.uiController;
    }

    isReady() {
        return this.isInitialized;
    }

    // Utility methods for debugging
    debugInfo() {
        if (!this.isInitialized) {
            console.log('App not initialized');
            return;
        }

        console.log('AR App Debug Info:');
        console.log('- Entities found:', Object.keys(this.entityManager.entities).length);
        console.log('- Birds found:', this.entityManager.getAllBirds().length);
        console.log('- Images created:', this.photoGalleryManager.getImageCount());
        console.log('- Calibration data:', this.calibrationManager.getCalibrationData());
        console.log('- Cameras available:', this.cameraManager.getCameras().length);
        console.log('- Current camera:', this.cameraManager.getCurrentCamera()?.label || 'None');
    }
}

// Export for global access
window.ARApp = ARApp;
