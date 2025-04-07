import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,renderer,lights,traverseScene,
    lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
    EmitterShapes,EmitterShape,ParticleSystems,Emitters,updateParticleSystem,setSelectedObject}from '../main.js'
import * as THREE from 'three';
import { ParticleEmitter } from './ParticleEmitter.js';
import { Particle } from './Particle.js';
import { addTransformcontrols } from '../transformControls/TransformContols.js';
const folderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
let currentFolderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
const apiKey = "AIzaSyCQHw9n69ZXzFGyIq9nKWB4-8c0qqfoPJ8";
const LibraryID="1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf";
const folderStack = [];
function createParticleControls()
{
    const ParticleSystem=gui.addFolder('Particle System');
    const EmitterParams={
        add_Emitter:function(){uploadTexture()},
        add_Emitter_drive:function(){displayContents(folderId,"map") }
    }
    ParticleSystem.add(EmitterParams,'add_Emitter').name('Particle image from local');
    ParticleSystem.add(EmitterParams,'add_Emitter_drive').name('Particle image from library');
    ParticleSystem.close();
}
async function displayContents(folderId,key) 
{
    console.log(key);
    const texturePanel = document.getElementById("texture-panel");
    texturePanel.style.display="flex";
    const gridContainer = document.getElementById("grid-container");
    gridContainer.innerHTML = ""; // Clear previous grid contents

    // Show back button only if not in the root folder
    const backButton = document.getElementById("back-button");
    if (folderId === "16CuflzlOEdtzwBXqu18a81GuOk4fynKC") {
        backButton.style.display = "none";
    } else {
        backButton.style.display = "block";
        backButton.onclick = () => {
            if (folderStack.length > 0) {
                currentFolderId = folderStack.pop();
                displayContents(currentFolderId,key);
            }
        };
    }

    // Fetch files in the current folder
    const files = await fetchDriveContents(folderId);

    files.forEach(file => {
        const item = document.createElement("div");
        if (file.mimeType === "application/vnd.google-apps.folder") {
            const folderIcon = document.createElement("img");
            folderIcon.src = "../../icons/—Pngtree—vector folder icon_3788101.png"; // Folder icon
            folderIcon.alt = file.name;

            item.appendChild(folderIcon);
            item.appendChild(document.createTextNode(file.name));

            item.addEventListener("click", () => {
                folderStack.push(currentFolderId);
                currentFolderId = file.id;
                displayContents(currentFolderId,key);
            });
        } else if (file.mimeType.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = file.thumbnailLink || `https://drive.google.com/uc?id=${file.id}`;
            img.alt = file.name;
            img.id=file.id;

            item.appendChild(img);
            

            img.addEventListener("click", () => {
                console.log(`Texture selected: ${file.name}`);
                loadAndApplyTexture(file.id,key);
                // Add logic to apply the texture
            });
        }
        gridContainer.appendChild(item);
    });
}
async function fetchDriveContents(folderId) 
{
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)`;
    const response = await fetch(url);
    const data = await response.json();
    return data.files || [];
}
function loadAndApplyTexture(fileId,key) 
{
    const textureUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

    const loader = new THREE.TextureLoader();

    loader.load(
        textureUrl,
        (texture) => 
        {
            console.log("Texture loaded:", texture);   
            texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
            texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
            // texture.repeat.y=-1;
            const ParticleParams={
                size: 0.5,
                sizeVariance:0,
                opacity: 1.0,
                color: '#ffffff',
                speed: 20,
                spawnArea: 10,
                lifespan: 3,
                maxParticles: 100,
                gravity:0,
                forces:[],
                vortex:{
                    position: new THREE.Vector3(0, 0, 0), // Center of the vortex
                    strength: 0.0,                          // Intensity of the vortex
                    axis: new THREE.Vector3(0, 1, 0)  
                },
                turbulenceStrength: 0, // Strength of the turbulence
                turbulenceFrequency: 0
            };
            let EmitterMesh;
            if(EmitterShape=='Sphere')
            {
                const geometry=new THREE.SphereGeometry(0.2,16,16);
                const material=new THREE.MeshBasicMaterial({color:0xff0000,wireframe:true});
                EmitterMesh=new THREE.Mesh(geometry,material);
                scene.add(EmitterMesh);
            }  
            let Emitter = new ParticleEmitter(ParticleParams, texture, EmitterMesh, scene);
            
            let ParticleSystem={
                name:null,
                Emitter:Emitter,
                Params:ParticleParams,
                mesh:EmitterMesh,
                map:texture
            }
            ParticleSystems.push(ParticleSystem);
            Emitters.push(EmitterMesh);
            ParticleSystem.name='Particle_System_'+ParticleSystems.length;
            ParticleSystem.mesh.name=ParticleSystem.name+"_EmitterMesh_"+ParticleSystems.length;
            console.log(ParticleSystems);  
            const PContainer=document.getElementById('Particles-Container');
            const Button=document.createElement('button');
            Button.textContent=ParticleSystem.name;
            PContainer.appendChild(Button);
            Button.addEventListener('click',function()
            {
                setSelectedObject(EmitterMesh);
                transformControls.detach();
                addTransformcontrols(EmitterMesh);
                updateParticleSystem();
            })
        },
        undefined,
        (error) => {
            console.error("Error loading texture:", error);
        }
    );
}
function uploadTexture() 
{
    // Trigger the file input click event
    const fileInput = document.getElementById('textureUpload');
    fileInput.click();

    // Once a file is selected, pass it to the createEmitter function
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            createEmitter('Sphere', file);
        }
    };
}
async function createEmitter(EmitterShape,textureFile)
{
    const ParticleParams={
        size: 0.5,
        sizeVariance:0,
        opacity: 1.0,
        color: '#ffffff',
        speed: 20,
        spawnArea: 10,
        lifespan: 3,
        maxParticles: 100,
        gravity:0,
        forces:[],
        vortex:{
            position: new THREE.Vector3(0, 0, 0), // Center of the vortex
            strength: 0.0,                          // Intensity of the vortex
            axis: new THREE.Vector3(0, 1, 0)  
        },
        turbulenceStrength: 0, // Strength of the turbulence
        turbulenceFrequency: 0
    };
    let EmitterMesh;
    if(EmitterShape=='Sphere')
    {
        const geometry=new THREE.SphereGeometry(0.2,16,16);
        const material=new THREE.MeshBasicMaterial({color:0xff0000,wireframe:true});
        EmitterMesh=new THREE.Mesh(geometry,material);
        scene.add(EmitterMesh);
    }
    
    let image;
    const url = URL.createObjectURL(textureFile);
    try {
        image = await loadTexture(url); // Wait for the texture to load
        let Emitter = new ParticleEmitter(ParticleParams, image, EmitterMesh, scene);
        
        let ParticleSystem={
            name:null,
            Emitter:Emitter,
            Params:ParticleParams,
            mesh:EmitterMesh,
            map:image
        }
        ParticleSystems.push(ParticleSystem);
        Emitters.push(EmitterMesh);
        ParticleSystem.name='Particle_System_'+ParticleSystems.length;
        ParticleSystem.mesh.name=ParticleSystem.name+"_EmitterMesh_"+ParticleSystems.length;
        console.log(ParticleSystems);
        const PContainer=document.getElementById('Particles-Container');
        const Button=document.createElement('button');
        Button.textContent=ParticleSystem.name;
        PContainer.appendChild(Button);
        Button.addEventListener('click',function()
        {
             setSelectedObject(EmitterMesh);
             transformControls.detach();
             addTransformcontrols(EmitterMesh);
             updateParticleSystem();
        })
      } catch (error) {
        console.error('Error loading texture:', error);
      }
    
    //Emitter.visible=false;

}

function loadTexture(url) {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        url,
        (texture) => {
          resolve(texture); // Resolve the promise with the loaded texture
        },
        undefined,
        (error) => {
          reject(error); // Reject the promise if there’s an error
        }
      );
    });
  }
export {createParticleControls}