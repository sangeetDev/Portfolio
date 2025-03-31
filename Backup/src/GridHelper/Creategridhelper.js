import * as THREE from 'three';
import {scene} from '../main.js'

// Create a function to generate the infinite grid
export function createInfiniteGrid(divisions = 100, spacing = 1, color = 0x60BCEA) {
    const gridGroup = new THREE.Group();

	const vertexShader = `
        varying float fadeFactor;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            fadeFactor = 1.0 - length(mvPosition.xyz) / 1000.0; // Adjust the value 1000.0 as needed
        }
    `;

	const fragmentShader = `
        varying float fadeFactor;
        uniform vec3 color;
        void main() {
            gl_FragColor = vec4(color * fadeFactor, 1.0);
        }
    `;

	const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });

    // Create grid lines along X axis
    for (let i = -divisions; i <= divisions; i++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-divisions * spacing, 0, i * spacing),
            new THREE.Vector3(divisions * spacing, 0, i * spacing)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: color });
        if(i==0)
        {
            lineMaterial.color=new THREE.Color(0xC33B27);
        }
        const line = new THREE.Line(lineGeometry, lineMaterial);
        gridGroup.add(line);
    }

    // Create grid lines along Z axis
    for (let i = -divisions; i <= divisions; i++) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i * spacing, 0, -divisions * spacing),
            new THREE.Vector3(i * spacing, 0, divisions * spacing)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: color });
        if(i==0)
        {
            lineMaterial.color= new THREE.Color(0xC33B27);
        }
        const line = new THREE.Line(lineGeometry, lineMaterial);
        gridGroup.add(line);
    }

    return gridGroup;
}

