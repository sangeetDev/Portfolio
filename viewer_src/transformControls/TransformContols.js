import * as THREE from 'three'; 
import {scene,currentCamera,orbitControls,transformControls,selectedObject} from '../main.js';

 export function addTransformcontrols(object)
{
    //const c=camera;
    scene.add(transformControls.getHelper());
   // transformControls.layers.enable(0);
    transformControls.addEventListener( 'dragging-changed', function ( event ) 
    {
        orbitControls.enabled = ! event.value;
    } );
    document.addEventListener( 'keydown', function ( event ) {

        switch ( event.keyCode ) {

            case 81: // Q
            transformControls.setSpace( transformControls.space === 'local' ? 'world' : 'local' );
                break;

            case 16: // Shift
            transformControls.setTranslationSnap( 100 );
            transformControls.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
            transformControls.setScaleSnap( 0.25 );
                break;

            case 87: // W
            transformControls.setMode( 'translate' );
                break;

            case 69: // E
            transformControls.setMode( 'rotate' );
                break;

            case 82: // R
            transformControls.setMode( 'scale' );
                break;
            case 187:
            case 107: // +, =, num+
            transformControls.setSize( transformControls.size + 0.1 );
                break;

            case 189:
            case 109: // -, _, num-
            transformControls.setSize( Math.max( transformControls.size - 0.1, 0.1 ) );
                break;
            case 88: // X
            transformControls.showX = !transformControls.showX;
                break;

            case 89: // Y
            transformControls.showY = !transformControls.showY;
                break;

            case 90: // Z
            transformControls.showZ = ! transformControls.showZ;
                break;
            case 32: // Spacebar
            transformControls.enabled = !transformControls.enabled;
                break;

            case 27: // Escm
            transformControls.reset();
                break;
        }

    } );
    document.addEventListener( 'keydown', function ( event ) {

        switch ( event.keyCode ) {

            case 16: // Shift
            transformControls.setTranslationSnap( 1 );
            transformControls.setRotationSnap( THREE.MathUtils.degToRad(5));
            transformControls.setScaleSnap( 0.5);
                break;
        }
        

    } );
    
document.addEventListener( 'keyup', function ( event ) {

        switch ( event.keyCode ) {

            case 16: // Shift
                transformControls.setTranslationSnap( 0 );
                transformControls.setRotationSnap( 0);
                transformControls.setScaleSnap( 0);
                break;

        }
        

    } );
    if (hasTransformControlsAttached(object)) {
        console.log('Transform controls are already attached to the mesh.');
    } else {
        console.log('Transform controls are not attached to the mesh.');
        /*selectedObject.children.forEach(child => {
            if (child instanceof TransformControls) {
                selectedObject.remove(child);
            }
        });*/
        transformControls.attach(object);
        transformControls.getHelper().userData.isTransformControlsAttached = true;
        console.log('Transform controls are now attached to the mesh.');
    }
    //Tcontrol.attach(mesh);
    //mesh.userData.isTransformControlsAttached = true;
   
    
}
export function hasTransformControlsAttached(object) {
    return object.userData && object.userData.isTransformControlsAttached;
}

export function detachTransformcontrols()
{
  transformControls.detach(selectedObject);
  selectedObject.userData.isTransformControlsAttached = false;
  console.log('Transform controls are detached from the mesh.');
}
