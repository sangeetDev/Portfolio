
import * as THREE from 'three';

const _v1 = /*@__PURE__*/ new THREE.Vector3();
const _v2 = /*@__PURE__*/ new THREE.Vector3();
const _v3 = /*@__PURE__*/ new THREE.Vector3();

class CustomDirectionalLightHelper extends THREE.Object3D {

	constructor( light, size, color ) {

		super();

		this.light = light;

		this.matrix = light.matrixWorld;
		this.matrixAutoUpdate = false;

		this.color = color;

		this.type = 'DirectionalLightHelper';

		if ( size === undefined ) size = 1;

		let geometry = new THREE.CircleGeometry(size/2,32);
        
		const material = new THREE.MeshBasicMaterial( { color:this.color,fog: false, toneMapped: false,wireframe:true } );
        const lineMaterial=new THREE.LineBasicMaterial({color:this.color,fog: false, toneMapped: false})

		this.lightPlane = new THREE.Mesh( geometry, material );
		this.add( this.lightPlane );

		geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) );

		this.targetLine = new THREE.Line( geometry, lineMaterial );
		this.add( this.targetLine );

		this.update();

	}

	dispose() {

		this.lightPlane.geometry.dispose();
		this.lightPlane.material.dispose();
		this.targetLine.geometry.dispose();
		this.targetLine.material.dispose();

	}

	update() {

		this.light.updateWorldMatrix( true, false );
		this.light.target.updateWorldMatrix( true, false );

		_v1.setFromMatrixPosition( this.light.matrixWorld );
		_v2.setFromMatrixPosition( this.light.target.matrixWorld );
		_v3.subVectors( _v2, _v1 );

		this.lightPlane.lookAt( _v2 );

		if ( this.color !== undefined ) {

			this.lightPlane.material.color.set( this.color );
			this.targetLine.material.color.set( this.color );

		} 

		this.targetLine.lookAt( _v2 );
		this.targetLine.scale.z = _v3.length();

	}

}


export { CustomDirectionalLightHelper };