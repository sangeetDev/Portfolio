import * as THREE from 'three';

class CustomPointLightHelper extends THREE.Mesh {

	constructor( light, color ) {

		const geometry = new THREE.IcosahedronGeometry( 0.2, 1);//IcosahedronGeometry(radius : Float, detail : Integer)
		const material = new THREE.MeshBasicMaterial( { wireframe: true, fog: false, toneMapped: false } );

		super( geometry, material );

		this.light = light;

		this.color = color;

		this.type = 'PointLightHelper';

		this.matrix = this.light.matrixWorld;
		this.matrixAutoUpdate = false;

		/*this.normalsHelper = new THREE.Group();
        this.add(this.normalsHelper);

        // Call the method to visualize the vertex normals
        this.addVertexNormals(geometry);*/

		this.update();

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

	update() {

		this.light.updateWorldMatrix( true, false );

		if ( this.color !== undefined ) {

			this.material.color.set( this.color );

		} else {

			this.material.color.copy( this.light.color );

		}

	}
	/*addVertexNormals(geometry) {
        geometry.computeVertexNormals();  // Ensure vertex normals are computed

        const position = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const normalLength = 0.3;  // Length of the normal lines

        // Iterate through each vertex and create a line representing the normal
        for (let i = 0; i < position.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
            const normal = new THREE.Vector3().fromBufferAttribute(normals, i);

            // Create line to represent the vertex normal
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                vertex,
                vertex.clone().add(normal.multiplyScalar(normalLength))
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ color: this.color });
            const normalLine = new THREE.Line(lineGeometry, lineMaterial);

            // Add the normal line to the group
            this.normalsHelper.add(normalLine);
        }
    }*/

}


export { CustomPointLightHelper };