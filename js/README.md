# JavaScript Module Organization

The JavaScript code has been organized into separate modules for better maintainability and code organization.

## Module Structure

### `/js/entityManager.js`
**Purpose**: Manages A-Frame entity references and validation
- Caches references to all 3D models (ScaleModel, birds, NFT marker, scene)
- Provides methods to get individual entities or groups
- Handles entity validation
- Sets initial entity properties (like visibility)

### `/js/calibrationManager.js`
**Purpose**: Handles position and scale calibration system
- Manages calibration data (position offsets and scale multipliers)
- Applies calibration to all 3D models
- Saves/loads calibration data to/from localStorage
- Provides methods to update position and scale

### `/js/animationManager.js`
**Purpose**: Manages bird animations and AR marker events
- Sets up animation listeners for bird groups
- Handles marker found/lost events
- Controls play/pause of bird animations
- Groups birds for coordinated animation control

### `/js/photoGalleryManager.js`
**Purpose**: Creates and manages the dynamic photo gallery
- Contains photo data structure
- Creates 3D image elements in a circular arrangement
- Applies calibration offsets to image positions
- Manages image lifecycle (create/clear/update)

### `/js/cameraManager.js`
**Purpose**: Handles camera detection and selection for AR
- Detects available cameras on the device
- Manages camera switching for AR.js
- Provides camera information (front/back, labels)
- Handles camera permissions and errors

### `/js/uiController.js`
**Purpose**: Handles all user interface interactions
- Sets up event listeners for calibration controls
- Manages hamburger menu and calibration mode
- Handles camera selection modal and UI
- Coordinates between UI actions and other managers
- Handles notifications and user feedback

### `/js/appController.js`
**Purpose**: Main application orchestrator
- Initializes all other modules in correct order
- Handles application lifecycle and error management
- Provides central access point to all managers
- Sets up scene loading and initialization

### `/js/main.js`
**Purpose**: Application entry point
- Waits for DOM content to load
- Creates and initializes the main AR application
- Sets up global debugging utilities

## Loading Order

The modules must be loaded in this specific order in the HTML:

1. `entityManager.js` - Core entity management
2. `calibrationManager.js` - Depends on EntityManager
3. `animationManager.js` - Depends on EntityManager
4. `photoGalleryManager.js` - Depends on EntityManager and CalibrationManager
5. `cameraManager.js` - Independent camera management
6. `uiController.js` - Depends on all managers
7. `appController.js` - Orchestrates everything
8. `main.js` - Application entry point

## Benefits of This Structure

- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Maintainability**: Easier to find and modify specific functionality
- **Testability**: Individual modules can be tested in isolation
- **Reusability**: Modules can be reused or replaced independently
- **Debugging**: Issues can be isolated to specific modules
- **Team Development**: Different developers can work on different modules

## Global Access

For debugging purposes, the application instance is available globally:
- `window.arApp` - Main application instance
- `window.debugAR()` - Function to display debug information

## Usage Example

```javascript
// Access specific managers
const calibration = arApp.getCalibrationManager();
const entities = arApp.getEntityManager();
const gallery = arApp.getPhotoGalleryManager();
const camera = arApp.getCameraManager();

// Debug information
debugAR();

// Check if app is ready
if (arApp.isReady()) {
    console.log('AR App is ready');
}

// Camera operations
const cameras = camera.getCameras();
const currentCamera = camera.getCurrentCamera();
```

## New Features

### Camera Selection
- **Beautiful Menu UI**: Gradient backgrounds, icons, and smooth animations
- **Camera Detection**: Automatically detects available cameras (front/back)
- **Camera Switching**: Switch between cameras in real-time
- **Modal Interface**: Clean modal popup for camera selection
- **AR Integration**: Seamlessly integrates with AR.js for camera switching

### Enhanced UI
- **Gradient Buttons**: Modern gradient button designs
- **Icons**: Emoji icons for better visual identification
- **Responsive Modal**: Full-screen modal with backdrop blur
- **Smooth Animations**: CSS transitions for professional feel
