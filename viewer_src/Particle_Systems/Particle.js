import * as THREE from 'three'

class Particle {
    constructor(texture, params,scene,initialPosition) {
        const size =  params.size * (1 +(Math.random()-0.5) * params.sizeVariance);
      this.geometry = new THREE.PlaneGeometry(size,size);
      this.material = new THREE.MeshBasicMaterial({
        map: texture,
        //size: params.size,
        transparent: true,
        opacity: params.opacity,
        depthWrite: false,
        //blending: THREE.SubtractiveBlending,
        color: params.color
      });
      
      this.position = initialPosition.clone();
  
      this.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * params.speed,
        (Math.random() - 0.5) * params.speed,
        (Math.random() - 0.5) * params.speed
      );
     
      this.gravity = new THREE.Vector3(0, params.gravity, 0);
      this.forces=params.forces; 
      if(params.gravity!=0||this.forces.length>0)
      this.velocity = new THREE.Vector3(0,0,0);
      this.vortex = params.vortex; 
      this.turbulenceStrength = params.turbulenceStrength;
      this.turbulenceFrequency = params.turbulenceFrequency;
      this.lifespan = params.lifespan;
      this.age = 0;
      const mesh=new THREE.Mesh(this.geometry, this.material,1);
      mesh.castShadow=true;
      this.points = mesh;
      this.points.position.copy(this.position);
      this.scene=scene;
      this.scene.add(this.points);
      this.scale=mesh.scale;
      this.color=this.material.color;
    }

    applyVortexForce(delta) {
        if (!this.vortex) return;
    
        const { position: vortexPos, strength, axis } = this.vortex;
        const directionToVortex = new THREE.Vector3().subVectors(this.position, vortexPos);
        const distance = directionToVortex.length();
    
        if (distance > 0) {
          const rotationAxis = new THREE.Vector3().crossVectors(directionToVortex, axis).normalize();
          const rotationForce = rotationAxis.multiplyScalar(strength / distance);
    
          this.velocity.add(rotationForce.multiplyScalar(delta));
        }
    }
    applyTurbulence(delta) {
        const turbulence = new THREE.Vector3(
            (Math.random() - 0.5) * this.turbulenceStrength,
            (Math.random() - 0.5) * this.turbulenceStrength,
            (Math.random() - 0.5) * this.turbulenceStrength
        );

        // Adjust turbulence based on frequency
        turbulence.multiplyScalar(this.turbulenceFrequency * delta);

        // Apply turbulence to velocity
        this.velocity.add(turbulence);
    }
    update(delta) {
        this.applyTurbulence(delta);
      this.velocity.add(this.gravity.clone().multiplyScalar(delta));
      this.position.add(this.velocity.clone().multiplyScalar(delta));
      this.scale.add(this.scale.clone().multiplyScalar(-delta));
      this.age += delta;
      for (let i=0; i<this.forces.length;i++)
      {
        let force=new THREE.Vector3(this.forces[i].X,this.forces[i].Y,this.forces[i].Z);
        this.velocity.add(force.clone().multiplyScalar(delta));
        //this.position.add(this.velocity.clone().multiplyScalar(delta));
      }
      this.applyVortexForce(delta);
      this.material.opacity = Math.max(0, 1 - this.age / this.lifespan);

      

      if (this.age >= this.lifespan) {
        this.scene.remove(this.points);
        return false; // Indicates particle has expired
      }
      
      this.points.position.copy(this.position);
      return true;
    }
  }
  export {Particle};  