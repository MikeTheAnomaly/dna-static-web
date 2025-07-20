// Calibration Manager - Handles position and scale calibration
class CalibrationManager {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.calibrationData = {
            positionOffset: { x: 0, y: 0, z: 0 },
            scaleMultiplier: 1
        };
        
        // Store initial position and scale
        const scaleModel = this.entityManager.getEntity('scaleModel');
        if (scaleModel) {
            this.initialPosition = Object.assign({}, scaleModel.getAttribute('position'));
            this.initialScale = Object.assign({}, scaleModel.getAttribute('scale'));
        }
        
        this.loadCalibrationData();
    }

    loadCalibrationData() {
        const savedCalibration = localStorage.getItem('calibrationData');
        if (savedCalibration) {
            this.calibrationData = JSON.parse(savedCalibration);
            this.applyCalibrationData();
        }
    }

    saveCalibrationData() {
        localStorage.setItem('calibrationData', JSON.stringify(this.calibrationData));
        return true;
    }

    applyCalibrationData() {
        const models = this.entityManager.getAllModels();
        
        // Calculate new position
        const position = {
            x: this.initialPosition.x + this.calibrationData.positionOffset.x,
            y: this.initialPosition.y + this.calibrationData.positionOffset.y,
            z: this.initialPosition.z + this.calibrationData.positionOffset.z
        };

        // Calculate new scale
        const scale = {
            x: this.initialScale.x * this.calibrationData.scaleMultiplier,
            y: this.initialScale.y * this.calibrationData.scaleMultiplier,
            z: this.initialScale.z * this.calibrationData.scaleMultiplier
        };

        // Apply to all models
        models.forEach(model => {
            if (model) {
                model.setAttribute('position', position);
                model.setAttribute('scale', scale);
            }
        });
    }

    updatePosition(axis, delta) {
        this.calibrationData.positionOffset[axis] += delta;
        this.applyCalibrationData();
        console.log('Updated Position Offset:', this.calibrationData.positionOffset);
    }

    updateScale(factor) {
        this.calibrationData.scaleMultiplier *= factor;
        this.applyCalibrationData();
        console.log('Updated Scale Multiplier:', this.calibrationData.scaleMultiplier);
    }

    getCalibrationData() {
        return this.calibrationData;
    }
}

// Export for use in other modules
window.CalibrationManager = CalibrationManager;
