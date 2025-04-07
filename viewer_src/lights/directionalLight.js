import { DirectionalLight } from "three/src/lights/DirectionalLight.js";
import { DirectionalLightShadow } from 'three/src/lights/DirectionalLightShadow.js';
import { Object3D } from 'three/src/core/Object3D.js';
import * as THREE from 'three';

class DLight extends DirectionalLight{

    constructor( color, intensity ) {

		super( color, intensity );

		this.isDirectionalLight = true;

		this.type = 'DirectionalLight';

		this.position.copy(Object3D.DEFAULT_UP );
		this.updateMatrix();

		this.target = new Object3D();
        //this.target.position.copy(Object3D.DEFAULT_UP)
		this.shadow = new DirectionalLightShadow();

        this.distance=super.distance;
        this.decay=super.decay;

	}

dispose() {

    this.shadow.dispose();

}
copy( source ) {

    super.copy( source );

    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;

}
updateMatrixWorld(force) {
    // Always reset the position to origin before updating the matrix
    this.position.set(0, 0, 0);

        
        const direction = new THREE.Vector3(0, -1, 0); 
        const newDirection=direction.clone().applyQuaternion(this.quaternion); 

        
        this.target.position.copy(newDirection);
        this.target.updateMatrixWorld(force); 

        // Call the parent method to update the matrix
        super.updateMatrixWorld(force);
}

}
export { DLight };