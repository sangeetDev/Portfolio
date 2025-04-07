import * as THREE from'three';
class CustomPlaneHelper extends THREE.Line {
    constructor(planeMesh, color = 0xffff00) {
        super();

        this.planeMesh = planeMesh; // Store the reference to the plane mesh
        this.color = color;

        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.LineBasicMaterial({ color: color, toneMapped: false });

        // Initial geometry setup
        this.updateGeometry();
        this.add(new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({
            color: color,
            opacity: 0.2,
            transparent: true,
            depthWrite: false,
            toneMapped: false
        })));

        this.type = 'CustomPlaneHelper';
        this.update();
    }

    updateGeometry() {
        const width = this.planeMesh.userData.width;
        const height = this.planeMesh.userData.height;

        const positions = [
            width / 2, height / 2, 0,    // Top right
            -width / 2, height / 2, 0,   // Top left
            -width / 2, -height / 2, 0,  // Bottom left
            width / 2, -height / 2, 0    // Bottom right
        ];

        const indices = [
            0, 1,  // Top edge
            1, 2,  // Left edge
            2, 3,  // Bottom edge
            3, 0   // Right edge
        ];

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setIndex(indices);
        this.geometry.computeBoundingSphere();
    }

    updateMatrixWorld(force) {
        // Follow the plane mesh's position, rotation, and scale
        this.position.copy(this.planeMesh.position);
        this.quaternion.copy(this.planeMesh.quaternion);
        this.scale.copy(this.planeMesh.scale);

        // Update the geometry to match the current plane dimensions
        this.updateGeometry();

        super.updateMatrixWorld(force);
    }
    update()
    {
        this.position.copy(this.planeMesh.position);
        this.quaternion.copy(this.planeMesh.quaternion);
        this.scale.copy(this.planeMesh.scale);

        // Update the geometry to match the current plane dimensions
        this.updateGeometry();

        super.updateMatrixWorld();
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.children.forEach(child => {
            child.geometry.dispose();
            child.material.dispose();
        });
    }
}

export{CustomPlaneHelper}