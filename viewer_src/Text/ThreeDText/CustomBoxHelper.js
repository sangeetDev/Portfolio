import * as THREE from 'three';

class BoxHelperCustom extends THREE.Object3D {
  constructor(box) 
  {
    super();

    this.box = box;

    // Ensure the box matrix is updated
    this.box.updateMatrixWorld(true);

    // Material for the lines
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the initial line geometry
    this.lines = new THREE.LineSegments(this.createLineGeometry(), material);

    // Add the lines to this helper object
    ;this.add(this.lines);

    // Track the current geometry reference
    this.previousGeometry = this.box.geometry;
    
    // Initial update to match the box's transformations
    this.update();
  }

    createLineGeometry() 
    {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const positionAttribute = this.box.geometry.attributes.position;
        //console.log(this.box.geometry.attributes.position);
        const transformedVertices = [];
        this.box.updateMatrixWorld(true);
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);

            // Apply the world matrix of the box to get the transformed vertex
            vertex.applyMatrix4(this.box.matrixWorld);

            transformedVertices.push(vertex);
        }
        const edges = [
            // Front face
            [0, 1], [1, 3], [2, 3], [2, 0],
            // Back face
            [4, 5], [5, 7], [6, 7], [6, 4],
            // Connect front and back
            [0, 5], [1, 4], [6, 3], [7, 2]
        ];
        edges.forEach(edge => {
            vertices.push(
                transformedVertices[edge[0]].x, transformedVertices[edge[0]].y, transformedVertices[edge[0]].z,
                transformedVertices[edge[1]].x, transformedVertices[edge[1]].y, transformedVertices[edge[1]].z
            );
        });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        return geometry;
    }
    update() {
      if (this.box) {
          // Ensure the box matrix is updated
          this.box.updateMatrixWorld(true);

          // Check if the box geometry has changed
          if (this.previousGeometry !== this.box.geometry) {
               
              this.lines.geometry.dispose();
              this.remove(this.lines);
              this.children.forEach(child => {
            child.geometry.dispose();
            child.material.dispose();
        });

              // Recreate geometry
              const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
              this.lines = new THREE.LineSegments(this.createLineGeometry(), material);

              // Re-add lines
              this.add(this.lines);
              console.log("changed");
              // Update previous geometry reference
              this.previousGeometry = this.box.geometry;
          } else {
              // No geometry change, simply update the lines' geometry
              this.lines.geometry.dispose();
              this.lines.geometry = this.createLineGeometry();
              console.log(" no change");
          }
      }
  }

    setBox(newBox) 
    {
        this.box = newBox;
        this.box.updateMatrixWorld(true);
        this.update();
    }

    // Dispose of the geometry and materials to prevent memory leaks
    dispose() {
        if (this.lines) {
            this.lines.geometry.dispose();
            this.lines.material.dispose();
        }

        // Ensure to dispose of any remaining children (if any)
        this.children.forEach(child => {
            child.geometry.dispose();
            child.material.dispose();
        });
    }
}

export { BoxHelperCustom };
