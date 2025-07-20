// Main Script - Entry point for the AR application
// This replaces the original script.js with a modular approach

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the AR application
    const app = new ARApp();
    
    app.init();

    // Make app globally available for debugging
    window.arApp = app;
    
    // Optional: Add debugging commands to console
    window.debugAR = () => app.debugInfo();
    
    // Camera debugging utilities
    window.clearStoredCamera = () => {
        if (app.getCameraManager()) {
            app.getCameraManager().clearStoredCamera();
            console.log('Stored camera cleared. Reload to use default camera.');
        }
    };
    
    window.showStoredCamera = () => {
        if (app.getCameraManager()) {
            const stored = app.getCameraManager().getStoredCameraInfo();
            console.log('Stored camera:', stored);
        }
    };
    
    console.log('AR Application loaded. Available commands:');
    console.log('- window.arApp: Access the app instance');
    console.log('- debugAR(): Show debug information');
    console.log('- clearStoredCamera(): Clear stored camera selection');
    console.log('- showStoredCamera(): Show current stored camera');
});
