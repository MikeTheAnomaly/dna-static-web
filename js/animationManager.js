// Animation Manager - Handles bird animations and marker events
class AnimationManager {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.setupAnimationListeners();
    }

    setupAnimationListeners() {
        const nftMarker = this.entityManager.getEntity('nftMarker');
        const birds = this.entityManager.getAllBirds();
        
        if (!nftMarker || birds.length === 0) {
            console.warn('NFT Marker or birds not found for animation setup');
            return;
        }

        // Group birds for different animation sets
        const birdGroup1 = [birds[0], birds[1], birds[2]].filter(bird => bird);
        const birdGroup2 = [birds[3], birds[4], birds[5]].filter(bird => bird);

        // Setup first group of birds
        this.setupBirdGroup(birdGroup1, nftMarker);
        
        // Setup second group of birds
        this.setupBirdGroup(birdGroup2, nftMarker);
    }

    setupBirdGroup(birdGroup, nftMarker) {
        if (birdGroup.length === 0) return;

        // Initially pause all birds in the group
        birdGroup.forEach(bird => {
            if (bird && bird.pause) {
                bird.pause();
            }
        });

        // Setup animation loop listener for the first bird in the group
        const firstBird = birdGroup[0];
        if (firstBird && firstBird.addEventListener) {
            firstBird.addEventListener('animation-loop', () => {
                console.log('Animation Finished');
                this.playBirdGroup(birdGroup);
            });
        }

        // Setup marker found/lost events
        nftMarker.addEventListener('markerFound', () => {
            console.log('Marker Found');
            this.playBirdGroup(birdGroup);
        });

        nftMarker.addEventListener('markerLost', () => {
            console.log('Marker Lost');
            this.pauseBirdGroup(birdGroup);
        });
    }

    playBirdGroup(birdGroup) {
        birdGroup.forEach(bird => {
            if (bird && bird.play) {
                bird.play();
            }
        });
    }

    pauseBirdGroup(birdGroup) {
        birdGroup.forEach(bird => {
            if (bird && bird.pause) {
                bird.pause();
            }
        });
    }

    pauseAllAnimations() {
        const birds = this.entityManager.getAllBirds();
        birds.forEach(bird => {
            if (bird && bird.pause) {
                bird.pause();
            }
        });
    }

    playAllAnimations() {
        const birds = this.entityManager.getAllBirds();
        birds.forEach(bird => {
            if (bird && bird.play) {
                bird.play();
            }
        });
    }
}

// Export for use in other modules
window.AnimationManager = AnimationManager;
