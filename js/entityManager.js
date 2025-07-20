// Entity Manager - Handles getting references to A-Frame entities
class EntityManager {
    constructor() {
        this.entities = {};
        this.initializeEntities();
    }

    initializeEntities() {
        // Cache all entity references
        this.entities = {
            scaleModel: document.querySelector('#ScaleModel'),
            bird1: document.querySelector('#bird1'),
            bird2: document.querySelector('#bird2'),
            bird3: document.querySelector('#bird3'),
            bird4: document.querySelector('#bird4'),
            bird5: document.querySelector('#bird5'),
            bird6: document.querySelector('#bird6'),
            nftMarker: document.querySelector('#nftMarker'),
            scene: document.querySelector('a-scene')
        };

        // Set initial visibility
        if (this.entities.scaleModel) {
            this.entities.scaleModel.setAttribute('visible', false);
        }
    }

    getEntity(name) {
        return this.entities[name];
    }

    getAllBirds() {
        return [
            this.entities.bird1,
            this.entities.bird2,
            this.entities.bird3,
            this.entities.bird4,
            this.entities.bird5,
            this.entities.bird6
        ].filter(bird => bird !== null);
    }

    getAllModels() {
        return [
            this.entities.scaleModel,
            ...this.getAllBirds()
        ].filter(model => model !== null);
    }

    validateEntities() {
        if (!this.entities.scaleModel) {
            console.error('ScaleModel entity not found');
            return false;
        }
        return true;
    }
}

// Export for use in other modules
window.EntityManager = EntityManager;
