import * as THREE from 'three';
import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,renderer,lights,traverseScene,
    lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
    EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials,UVsets,getUVSets,index,fileNames,loadGLBFromDrive} from '../main.js';
import { GLTFLoader } from '../CustomModelLoader/GLTFLoader.js';
const folderStack = [];
const modelfolderStack=[];
const folderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
let currentFolderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
const LibraryID="1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf";
let currentLibraryId="1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf";
const apiKey = "AIzaSyCQHw9n69ZXzFGyIq9nKWB4-8c0qqfoPJ8";

async function fetchDriveContents(folderId) 
{
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)`;
    const response = await fetch(url);
    const data = await response.json();
    return data.files || [];
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
async function displayModels(libraryID)
{
    const texturePanel = document.getElementById("texture-panel");
    texturePanel.style.display="flex";
    const gridContainer = document.getElementById("grid-container");
    gridContainer.innerHTML = ""; // Clear previous grid contents

    // Show back button only if not in the root folder
    const backButton = document.getElementById("back-button");
    if (libraryID === "1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf") {
        backButton.style.display = "none";
    } else {
        backButton.style.display = "block";
        backButton.onclick = () => {
            console.log("clicked");
            if (modelfolderStack.length > 0) {
                currentLibraryId = modelfolderStack.pop();
                displayModels(currentLibraryId);
            }
        };
    }

    // Fetch files in the current folder
    const files = await fetchDriveContents(libraryID);

    files.forEach(file => {
        
        if (file.mimeType === "application/vnd.google-apps.folder") {
            const item = document.createElement("div");
            const folderIcon = document.createElement("img");
            folderIcon.src = "./icons/—Pngtree—vector folder icon_3788101.png"; // Folder icon
            folderIcon.alt = file.name;

            item.appendChild(folderIcon);
            item.appendChild(document.createTextNode(file.name));

            item.addEventListener("click", () => {
                modelfolderStack.push(currentLibraryId);
                currentLibraryId = file.id;
                displayModels(currentLibraryId);
            });
            gridContainer.appendChild(item);
        } else if (file.mimeType.startsWith("image/")) {
            const item = document.createElement("div");
            const img = document.createElement("img");
            img.src = file.thumbnailLink || `https://drive.google.com/uc?id=${file.id}`;
            img.alt = file.name;

            item.appendChild(img);
            //item.appendChild(document.createTextNode(file.name));

            img.addEventListener("click", () => {
                console.log(`Texture selected: ${file.name}`);
                const glbFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
                const glbFile = files.find(f => f.name.startsWith(glbFileName) && f.mimeType === "model/gltf-binary");

                if (glbFile) {
                    loadGLBFromDrive(glbFile.id,glbFileName+".glb");
                } else {
                    console.error(`GLB file for ${file.name} not found.`);
                }
                // Add logic to apply the texture
            });
            gridContainer.appendChild(item);
        }
        
    });
}
/*async function loadGLBFromDrive(fileId,fileName) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        const loader = new GLTFLoader();
        loader.parse(arrayBuffer, '', (gltf) => {
           // UVsets=getUVSets(gltf);
                    index++;
                    
                    listIndex++;
                    let count = 0;
                    let newFilename = fileName;
                
                    // Find existing filenames with the same prefix
                    const existingFilenames = fileNames.filter(name => name.startsWith(fileName));
                    
                    // If there are existing filenames with the same prefix
                    if (existingFilenames.length > 0) {
                        // Find the highest count among the existing filenames
                        const maxCount = existingFilenames.reduce((max, name) => {
                            const num = parseInt(name.substring(fileName.length+1));
                            return isNaN(num) ? max : Math.max(max, num);
                        }, 0);
                        
                        // Increment count to the next number
                        count = maxCount + 1;
                    }
                    
                    // If count is 1, no need to append number
                    newFilename = count === 0 ? fileName : `${fileName}_${count}`;
                    
                    // Push the unique filename into the array
                    fileNames.push(newFilename);
                    gltf.scene.traverse(obj=>{
                       
                            obj.castShadow=true;
                            obj.receiveShadow=true;
                        
                    });
                    gltf.scene.traverse(child =>{
                    
                        child.name=child.name+"_"+count;
                        if(child instanceof THREE.Mesh)
                        {
                            const physicalMaterial= new THREE.MeshPhysicalMaterial();
                            for (const key in child.material) 
                            {
                                if (child.material.hasOwnProperty(key)) 
                                { 
                                    physicalMaterial[key]=child.material[key];
                                }
                            }
                        const name=child.material.name+"_"+count;
                        child.material = physicalMaterial;
                        child.material.name=name; 
                            
                        }
                        
                        if (child.name.startsWith('Hips')) 
                        {
                            skeletonRoot = child;
                            if (skeletonRoot) 
                            {
                                const skeletonHelper = new THREE.SkeletonHelper(skeletonRoot);
                                skeletonHelper.visible = true;
                                skeletonHelper.material.linewidth = 2;
                                scene.add(skeletonHelper);
                            }
                        }
                    });
                    models[index] = gltf.scene;
                    models[index].name=gltf.scene.name;
                    models[index].userData.filename=newFilename;
                    scene.add(models[index]);
                    //console.log(models.length);
                    //const out=document.getElementById("outline-container");
                    const name=document.createElement('div');
                    name.id="name"+listIndex;
                    name.innerHTML=`<strong>${newFilename}:</strong>`;
                    const nameOutliner=document.createElement('div');
                    nameOutliner.id="name"+listIndex;
                    nameOutliner.innerHTML=`<strong>${newFilename}:</strong>`;
                    const sceneTree = document.getElementById('scene-tree');
                    const sceneTreeOutliner=document.getElementById('scene-tree-Outliner');
                    sceneTree.appendChild(name);
                    sceneTreeOutliner.appendChild(nameOutliner);
                    traverseScene(gltf.scene, sceneTree);
                    traverseScene(gltf.scene, sceneTreeOutliner);
        });
    } catch (error) {
        console.error("Error loading GLB file:", error);
    }
}*/
async function fetchDriveFiles() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)`;
    const response = await fetch(url);
    const data = await response.json();
    return data.files; // List of files
}

function loadAndApplyTexture(fileId,key) 
{
    const textureUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

    const loader = new THREE.TextureLoader();

    loader.load(
        textureUrl,
        (texture) => {
            console.log("Texture loaded:", texture);

            if (selectedObject && (selectedObject instanceof THREE.Mesh)) 
            {
                // Apply the texture to the object's material
                texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                texture.repeat.y=-1;
                selectedObject.material[key]=texture;
                selectedObject.material.needsUpdate=true;
                //child.userData[child.userData.currentUVSet][key]=child.materialk[key];
                selectedObject.userData.oldmaterial=selectedObject.material;
                //updateTextureMatrix(child.material[key]);
                selectedObject.userData['old'+key]=selectedObject.material[key];
                console.log(key,selectedObject.material[key]);
            } 
            else
            {
                console.warn("No object selected to apply the texture.");
            }
        },
        undefined,
        (error) => {
            console.error("Error loading texture:", error);
        }
    );
}
function libraryControls()
{
    const library=gui.addFolder("Library Integration");
    const modelParams={
        add_model:function(){displayModels(LibraryID)}
    }
    const addModel=library.add(modelParams,'add_model').name("Add model from library");
    library.close();
    
}
export{displayContents,displayModels,libraryControls};