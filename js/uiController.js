// UI Controller - Handles all user interface interactions
class UIController {
    constructor(calibrationManager, entityManager, photoGalleryManager, cameraManager) {
        this.calibrationManager = calibrationManager;
        this.entityManager = entityManager;
        this.photoGalleryManager = photoGalleryManager;
        this.cameraManager = cameraManager;
        this.moveAmount = 50; // Adjusted for better control
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.setupCalibrationControls();
        this.setupMenuControls();
        this.setupCameraControls();
    }

    setupCalibrationControls() {
        // Movement controls
        const moveLeft = document.getElementById('moveLeft');
        const moveRight = document.getElementById('moveRight');
        const moveUp = document.getElementById('moveUp');
        const moveDown = document.getElementById('moveDown');
        const scaleUp = document.getElementById('scaleUp');
        const scaleDown = document.getElementById('scaleDown');
        const saveCalibration = document.getElementById('saveCalibration');

        if (moveLeft) {
            moveLeft.addEventListener('click', async () => {
                this.calibrationManager.updatePosition('x', -0.1 * this.moveAmount);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (moveRight) {
            moveRight.addEventListener('click', async () => {
                this.calibrationManager.updatePosition('x', 0.1 * this.moveAmount);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (moveUp) {
            moveUp.addEventListener('click', async () => {
                this.calibrationManager.updatePosition('z', -0.1 * this.moveAmount);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (moveDown) {
            moveDown.addEventListener('click', async () => {
                this.calibrationManager.updatePosition('z', 0.1 * this.moveAmount);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (scaleUp) {
            scaleUp.addEventListener('click', async () => {
                this.calibrationManager.updateScale(1.1);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (scaleDown) {
            scaleDown.addEventListener('click', async () => {
                this.calibrationManager.updateScale(0.9);
                await this.photoGalleryManager.updateImagesWithCalibration();
            });
        }

        if (saveCalibration) {
            saveCalibration.addEventListener('click', () => {
                this.saveCalibration();
            });
        }
    }

    setupMenuControls() {
        // Hamburger menu
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const menuContent = document.getElementById('menuContent');
        
        if (hamburgerMenu && menuContent) {
            hamburgerMenu.addEventListener('click', () => {
                menuContent.classList.toggle('hidden');
            });
        }

        // Calibrate button
        const calibrateButton = document.getElementById('calibrateButton');
        const controlButtons = document.getElementById('controlButtons');
        
        if (calibrateButton && controlButtons) {
            calibrateButton.addEventListener('click', () => {
                this.toggleCalibrationMode(controlButtons, menuContent);
            });
        }

        // Select camera button
        const selectCameraButton = document.getElementById('selectCameraButton');
        if (selectCameraButton) {
            selectCameraButton.addEventListener('click', () => {
                this.showCameraModal();
                if (menuContent) {
                    menuContent.classList.add('hidden');
                }
            });
        }

        // Layout toggle button
        const layoutToggleButton = document.getElementById('layoutToggleButton');
        if (layoutToggleButton) {
            layoutToggleButton.addEventListener('click', async () => {
                await this.toggleLayout(layoutToggleButton);
                if (menuContent) {
                    menuContent.classList.add('hidden');
                }
            });
        }
    }

    setupCameraControls() {
        // Close camera modal
        const closeCameraModal = document.getElementById('closeCameraModal');
        const cameraModal = document.getElementById('cameraModal');
        
        if (closeCameraModal && cameraModal) {
            closeCameraModal.addEventListener('click', () => {
                this.hideCameraModal();
            });

            // Close modal when clicking outside
            cameraModal.addEventListener('click', (event) => {
                if (event.target === cameraModal) {
                    this.hideCameraModal();
                }
            });
        }
    }

    async showCameraModal() {
        const cameraModal = document.getElementById('cameraModal');
        const cameraList = document.getElementById('cameraList');
        
        if (!cameraModal || !cameraList) {
            console.error('Camera modal elements not found');
            return;
        }

        // Show modal
        cameraModal.classList.remove('hidden');
        
        // Show loading
        cameraList.innerHTML = '<div class="loading">Loading cameras...</div>';

        try {
            // Ensure camera manager is initialized
            if (!this.cameraManager.isReady()) {
                await this.cameraManager.initialize();
            }

            const cameras = this.cameraManager.getCameras();
            const currentCamera = this.cameraManager.getCurrentCamera();

            if (cameras.length === 0) {
                cameraList.innerHTML = '<div class="loading">No cameras found</div>';
                return;
            }

            // Populate camera list
            cameraList.innerHTML = '';
            cameras.forEach(camera => {
                const cameraItem = document.createElement('button');
                cameraItem.className = 'camera-item';
                if (currentCamera && currentCamera.id === camera.id) {
                    cameraItem.classList.add('active');
                }

                const icon = this.cameraManager.getCameraIcon(camera.facing);
                cameraItem.innerHTML = `
                    <span class="camera-icon">${icon}</span>
                    <span class="camera-name">${camera.label}</span>
                `;

                cameraItem.addEventListener('click', async () => {
                    await this.selectCamera(camera);
                });

                cameraList.appendChild(cameraItem);
            });

        } catch (error) {
            console.error('Error loading cameras:', error);
            cameraList.innerHTML = '<div class="loading">Error loading cameras</div>';
        }
    }

    hideCameraModal() {
        const cameraModal = document.getElementById('cameraModal');
        if (cameraModal) {
            cameraModal.classList.add('hidden');
        }
    }

    async selectCamera(camera) {
        try {
            // Update UI to show switching state
            const cameraList = document.getElementById('cameraList');
            if (cameraList) {
                cameraList.innerHTML = `
                    <div class="loading">
                        📷 Switching to ${camera.label}...<br>
                        <small style="opacity: 0.7; margin-top: 10px; display: block;">App will restart momentarily</small>
                    </div>
                `;
            }

            // Select camera (this will trigger page reload)
            await this.cameraManager.selectCamera(camera.id);

        } catch (error) {
            console.error('Error selecting camera:', error);
            this.showNotification('Failed to switch camera. Please try again.', 'error');
            
            // Refresh the camera list after a delay
            setTimeout(() => this.showCameraModal(), 2000);
        }
    }

    toggleCalibrationMode(controlButtons, menuContent) {
        const scaleModel = this.entityManager.getEntity('scaleModel');
        
        controlButtons.classList.toggle('hidden');
        if (menuContent) {
            menuContent.classList.add('hidden'); // Hide menu after clicking calibrate
        }
        
        if (scaleModel) {
            const currentVisibility = scaleModel.getAttribute('visible');
            scaleModel.setAttribute('visible', currentVisibility === false);
        }
    }

    saveCalibration() {
        const success = this.calibrationManager.saveCalibrationData();
        if (success) {
            alert('Calibration data saved.');
            const controlButtons = document.getElementById('controlButtons');
            if (controlButtons) {
                controlButtons.classList.add('hidden');
            }
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        // You could extend this to show visual notifications
    }

    setMoveAmount(amount) {
        this.moveAmount = amount;
    }

    getMoveAmount() {
        return this.moveAmount;
    }

    async toggleLayout(button) {
        try {
            // Get current layout mode from photo gallery manager
            const currentMode = this.photoGalleryManager.layoutMode;
            const newMode = currentMode === 'grid' ? 'cloud' : 'grid';
            
            // Update button text and icon
            const buttonText = button.querySelector('.button-text');
            const buttonIcon = button.querySelector('.button-icon');
            
            if (newMode === 'grid') {
                buttonText.textContent = 'Grid Layout';
                buttonIcon.textContent = '🎯';
            } else {
                buttonText.textContent = 'Cloud Layout';
                buttonIcon.textContent = '☁️';
            }
            
            // Apply the new layout
            await this.photoGalleryManager.setLayoutMode(newMode);
            
            console.log(`Layout switched to: ${newMode}`);
        } catch (error) {
            console.error('Failed to toggle layout:', error);
        }
    }
}

// Export for use in other modules
window.UIController = UIController;
