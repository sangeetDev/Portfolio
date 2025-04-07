import { LightShadow } from "three/src/lights/LightShadow.js";
import * as THREE from "three";
class CustomLightShadow extends LightShadow {
    constructor(camera) {
        super(camera);
        this.customPosition = new THREE.Vector3();  // Custom position for the shadow camera
    }

    update(light) {
        // Use the custom position instead of the light's position for the shadow camera
        this.camera.position.copy(this.customPosition);
        //this.camera.lookAt(light.target.position);
        this.camera.updateProjectionMatrix();
    }
}
export{CustomLightShadow};