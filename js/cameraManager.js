// Camera Manager - Handles camera detection and selection
class CameraManager {
    constructor() {
        this.cameras = [];
        this.currentCamera = null;
        this.arjsContext = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            await this.detectCameras();
            await this.initializeWithStoredCamera();
            this.isInitialized = true;
            console.log('Camera Manager initialized with', this.cameras.length, 'cameras');
            console.log('Current camera:', this.currentCamera?.label || 'None');
        } catch (error) {
            console.error('Failed to initialize camera manager:', error);
        }
    }

    async detectCameras() {
        try {
            // Request permission to access cameras
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the test stream

            // Get list of available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.cameras = devices
                .filter(device => device.kind === 'videoinput')
                .map((device, index) => ({
                    id: device.deviceId,
                    label: device.label || `Camera ${index + 1}`,
                    facing: this.detectCameraFacing(device.label)
                }));

            return this.cameras;
        } catch (error) {
            console.error('Error detecting cameras:', error);
            throw error;
        }
    }

    detectCameraFacing(label) {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('back') || lowerLabel.includes('rear') || lowerLabel.includes('environment')) {
            return 'back';
        } else if (lowerLabel.includes('front') || lowerLabel.includes('user') || lowerLabel.includes('selfie')) {
            return 'front';
        }
        return 'unknown';
    }

    async selectCamera(cameraId) {
        const camera = this.cameras.find(cam => cam.id === cameraId);
        if (!camera) {
            throw new Error('Camera not found');
        }

        try {
            // Update current camera
            this.currentCamera = camera;
            
            // Apply camera to AR.js
            await this.applyCameraToARJS(camera);
            
            console.log('Camera selected:', camera.label);
            return true;
        } catch (error) {
            console.error('Error selecting camera:', error);
            throw error;
        }
    }

    async applyCameraToARJS(camera) {
        try {
            console.log('Switching to camera:', camera.label);
            
            // Store the selected camera in localStorage for persistence
            localStorage.setItem('selectedCameraId', camera.id);
            localStorage.setItem('selectedCameraLabel', camera.label);
            
            // Show a brief notification before reload
            this.showCameraSwitchNotification(camera.label);
            
            // Wait a moment for the notification to be visible, then reload with camera parameter
            setTimeout(() => {
                // Add deviceId as URL parameter for proper AR.js initialization
                const url = new URL(window.location);
                url.searchParams.set('deviceId', camera.id);
                window.location.href = url.toString();
            }, 1000);
            
        } catch (error) {
            console.error('Error switching camera:', error);
            throw error;
        }
    }

    showCameraSwitchNotification(cameraLabel) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            z-index: 20000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        `;
        notification.innerHTML = `
            <div>📷 Switching to:</div>
            <div style="margin-top: 5px; font-size: 14px; opacity: 0.9;">${cameraLabel}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after a short delay (it will be removed by page reload anyway)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 800);
    }

    // Initialize with previously selected camera if available
    async initializeWithStoredCamera() {
        const storedCameraId = localStorage.getItem('selectedCameraId');
        const storedCameraLabel = localStorage.getItem('selectedCameraLabel');
        
        if (storedCameraId && this.cameras.length > 0) {
            const storedCamera = this.cameras.find(cam => cam.id === storedCameraId);
            if (storedCamera) {
                this.currentCamera = storedCamera;
                console.log('Initialized with stored camera:', storedCamera.label);
                
                // Apply the camera settings to AR.js via URL parameters or scene attributes
                this.applyStoredCameraSettings(storedCamera);
                return;
            }
        }
        
        // Fallback to default camera selection
        if (this.cameras.length > 0) {
            this.currentCamera = this.cameras.find(cam => cam.facing === 'back') || this.cameras[0];
        }
    }

    applyStoredCameraSettings(camera) {
        // Apply the deviceId to AR.js scene configuration
        this.configureARJSWithCamera(camera.id);
    }

    configureARJSWithCamera(deviceId) {
        // Get the AR.js scene element
        const scene = document.querySelector('a-scene');
        if (!scene) {
            console.warn('AR.js scene not found');
            return;
        }

        // Get current arjs attribute
        let arjsAttr = scene.getAttribute('arjs') || '';
        
        // Remove any existing deviceId parameter
        arjsAttr = arjsAttr.replace(/;\s*deviceId:\s*[^;]*/, '');
        
        // Add the new deviceId parameter
        arjsAttr += `; deviceId: ${deviceId}`;
        
        // Set the updated attribute
        scene.setAttribute('arjs', arjsAttr);
        
        console.log('AR.js configured with deviceId:', deviceId);
        console.log('AR.js attribute:', arjsAttr);
    }

    // Static method to initialize camera from URL parameter or localStorage before AR.js starts
    static initializeBeforeARJS() {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        let deviceId = urlParams.get('deviceId');
        
        // Fall back to localStorage if no URL parameter
        if (!deviceId) {
            deviceId = localStorage.getItem('selectedCameraId');
        }
        
        if (deviceId) {
            // Configure AR.js with the deviceId before it initializes
            const scene = document.querySelector('a-scene');
            if (scene) {
                let arjsAttr = scene.getAttribute('arjs') || '';
                
                // Clean up any existing deviceId parameter
                arjsAttr = arjsAttr.replace(/;\s*deviceId:\s*[^;]*/g, '');
                
                // Add the new deviceId parameter (AR.js expects this format)
                if (!arjsAttr.includes('deviceId')) {
                    arjsAttr += `; deviceId: ${deviceId}`;
                }
                
                scene.setAttribute('arjs', arjsAttr);
                
                console.log('Pre-initialized AR.js with deviceId:', deviceId);
                console.log('Full AR.js config:', arjsAttr);
                
                // Also set a data attribute for debugging
                scene.setAttribute('data-camera-id', deviceId);
            }
        } else {
            console.log('No stored camera found, using AR.js default');
        }
    }

    getCameras() {
        return this.cameras;
    }

    getCurrentCamera() {
        return this.currentCamera;
    }

    getCameraIcon(facing) {
        switch (facing) {
            case 'back':
                return '📱';
            case 'front':
                return '🤳';
            default:
                return '📷';
        }
    }

    isReady() {
        return this.isInitialized;
    }

    // Refresh camera list (useful when permissions change)
    async refresh() {
        await this.detectCameras();
        console.log('Camera list refreshed');
    }

    // Clear stored camera selection (useful for debugging)
    clearStoredCamera() {
        localStorage.removeItem('selectedCameraId');
        localStorage.removeItem('selectedCameraLabel');
        console.log('Stored camera selection cleared');
    }

    // Get stored camera info without applying it
    getStoredCameraInfo() {
        return {
            id: localStorage.getItem('selectedCameraId'),
            label: localStorage.getItem('selectedCameraLabel')
        };
    }
}

// Export for use in other modules
window.CameraManager = CameraManager;
