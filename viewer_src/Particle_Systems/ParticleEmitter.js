import { Particle } from "./Particle.js";
import * as THREE from 'three';
class ParticleEmitter {
    constructor(params, particleTexture, mesh = null,scene) {
      this.particleTexture = particleTexture; // Texture for particles
      this.params = params;
      this.mesh = mesh; // Optional mesh for emission area
      this.particles = [];
      this.scene=scene;
    }
    updateParams(newParams) {
      // Update specific parameters dynamically
      Object.assign(this.params, newParams);
    }
  
    emitParticle() {
      // Determine particle position based on mesh if available
      for (let i=-1;i<Math.floor((Math.random()*10/this.params.maxParticles));i++)
      {
        const particlePosition = this.mesh
        ? this.mesh.position.clone().add(this.randomPointInMesh())
        : this.randomPointInArea(); // Fallback to random area if no mesh is provided
  
      // Create a new particle with the specified parameters and texture
      const particle = new Particle(this.particleTexture,this.params,this.scene,particlePosition)
      //this.scene.add(particle);
      this.particles.push(particle);
      }
    
    }
  
      
    randomPointInMesh() {
      // Generate a random point within the mesh’s bounds
      return new THREE.Vector3(
        (Math.random()-0.5) * this.mesh.scale.x,
        (Math.random()-0.5 ) * this.mesh.scale.y,
        (Math.random()-0.5 ) * this.mesh.scale.z
      );
    }
  
    randomPointInArea() {
      // Generate a random point within a defined spawn area (if no mesh is specified)
      return new THREE.Vector3(
        (Math.random() - 0.5) * this.params.spawnArea,
        (Math.random() - 0.5) * this.params.spawnArea,
        (Math.random() - 0.5) * this.params.spawnArea
      );
    }
  
    update(delta) {
      // Update existing particles and remove expired ones
      this.particles = this.particles.filter(particle => particle.update(delta));
  
      // Emit new particles if the maximum number is not yet reached
      if (this.particles.length < (this.params.maxParticles)*(1000000)) {
       
          this.emitParticle();

      }
    }
  }
  
  export{ParticleEmitter};