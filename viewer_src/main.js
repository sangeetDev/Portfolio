import * as THREE from 'three';
import { GLTFLoader } from './CustomModelLoader/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { addTransformcontrols,detachTransformcontrols, hasTransformControlsAttached } from './transformControls/TransformContols.js';
import { createInfiniteGrid } from './GridHelper/Creategridhelper.js';
import { deleteObject } from './ModelData/modelDdetails.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import { hdricontrols } from './HDRIcontrols/hdriControls.js';
import { createCameraControls, getSampledPoints } from './CameraControls/Cameracontrols.js';
import {addLightControls,updateAttributeEditorLight} from './lights/Lights.js'
import { CustomPointLightHelper } from './lights/CustomPointLightHelper.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import {CustomPlaneHelper} from './Text/twoDText/CustomPlaneHelper.js';
import { BoxHelperCustom } from './Text/ThreeDText/CustomBoxHelper.js';
import { create2DText,createTextControls, CreateCharVisAnimation,CreateWordVisAnimation,CreateCharZoomIn,CreateWordZoomIn,
         CreateCharOpacityAnim,CreateCharRotateAnim, CreateWordRotateAnim,CreateCharPositionAnim,CreateWordPositionAnim} from './Text/twoDText/TextCreator.js';
import {create3DText,create3DTextControls,SeparateCharacters,create3DWordPosAnim,create3DCharPosAnim,create3DCharRotAnim,create3DCharScaleAnim,
        create3DWordRotAnim,create3DWordScaleAnim,separateUnconnectedGeometries,separateWordGeometries} from './Text/ThreeDText/3DTextCreator.js';
import { createParticleControls } from './Particle_Systems/PartcleSystem.js';
import {animationControls,setKeyframe,interpolateTransforms,createAnimationCurveEditor} from './Animation&Keyframing/Iterpolate_Keyframing.js'
import { createMaterialControls,createNewMaterial } from './MaterialControls/materialControls.js';
import { displayDimensionControls, updateSpriteScale,textX,textY,textZ,arrowX,arrowY,arrowZ, dimensionGroup} from './Dimension/Dimension.js';
import {displayContents,displayModels,libraryControls} from './LibraryIntegration/library.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createPathControls,selectedCurve,updateCurve } from './SplinePath/Path.js';
import { Hotspotcontrols,updateHotspotScale } from './Event_System/Hotspot.js';

let scene,Pcamera,Ocamera,renderer,orbitControls,transformControls;
let mixer;
let composer,renderPass, outlinePass,effectFXAA,focusFlag=false;
const startEdgeStrength = 5; // Initial edge strength
const endEdgeStrength = 0; // Edge strength at the end of animation
const startEdgeGlow = 1; // Initial edge glow
const endEdgeGlow = 0; // Edge glow at the end of animation
const startEdgeThickness = 5; // Initial edge thickness
const endEdgeThickness = 0;
let glowTimer = 0;
const glowDuration = 10000000;
let heirarchyChanged=false;
const Paths=[];
let activecamera;
let cameraChanged=false;
let cameraTracker=[];
let currentCamera;
let isplaying=false
let PrevSelectedHotspot;
let selectedObject;
let selectedObjects=[];

let fileNames = [];
let index=-1;
let listIndex=-1;
let models=[];
let UVsets;

let HDRI;

let gui;
let x,y,z,rotx,roty,rotz,scalex,scaley,scalez;

let lights=[];
let lighttargets=[];

let Text2DList=[];
let Text3DList=[];
let startPoint = null;
let boxMesh = null;
let box=null;
let boxMesh3D=null;
let box3D=null;

let animationInterval;
let fps=60,totalFrames=200,numLines,timeline,currentframe,framesNumber,cursor,isDragging = false, initialX = 0;

let Hotspots=[];
const fonts = [
    'Arial', 
    'Courier New', 
    'Georgia',
    'Calibri',
    'NotoColorEmoji'
];
const folderStack = [];
const modelfolderStack=[];
const folderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
let currentFolderId = "16CuflzlOEdtzwBXqu18a81GuOk4fynKC";
const LibraryID="1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf";
let currentLibraryId="1Q4itLGGJQtvx-Qvfk-TsWTEjZrXGiFlf";
const apiKey = "AIzaSyCQHw9n69ZXzFGyIq9nKWB4-8c0qqfoPJ8";

const materials=[];

const clock = new THREE.Clock();

const EmitterShapes=['Shpere', 'cube', 'plane'];
let EmitterShape='Sphere';
let ParticleSystems=[]
let Emitters=[];

let axisHelper;
let axisHelperMode = false;
function init()
{
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    scene = new THREE.Scene();
    Pcamera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.001, 1000);
    Ocamera=new THREE.OrthographicCamera( -window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, 0.00001, 1000);
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement); 
    const ambientLight=new THREE.AmbientLight({color:0xffffff,intensity:1});
    scene.add(ambientLight);
    Pcamera.position.set(0,2,5);
    currentCamera=Pcamera;
    const grid=createInfiniteGrid();
    scene.add(grid);
    orbitControls = new OrbitControls(currentCamera, renderer.domElement);
    transformControls = new TransformControls(currentCamera, renderer.domElement );
    console.log(transformControls);
    //scene.add(transformControls);
    
    activecamera=currentCamera;
    
    const hdriTextureLoader = new RGBELoader().load('../Hdri/scythian_tombs_2_4k.hdr', texture => 
    {    
        const gen = new THREE.PMREMGenerator(renderer);
       //const gen2= new THREE.PMREMGenerator(Rrenderer);
        HDRI= gen.fromEquirectangular(texture).texture;
        //const envMap2 = gen2.fromEquirectangular(texture).texture;
        scene.environment = HDRI
        scene.background = HDRI
       // scene.background= new THREE.Color( 0xff0000 );
        //scene2.background = envMap2;
        
        texture.dispose();
        gen.dispose();
        //gen2.dispose();
    }); 

    timeline = document.getElementById('timeline');
    const framerate=document.getElementById("fps");
    
    framesNumber=document.getElementById('frames-number');
    updateLines();
    const frames=document.getElementById('total-frames');
    frames.addEventListener('input', function(event){
        totalFrames=event.target.value;
        updateLines();
        updateTimeline();
        
    });

    currentframe=document.getElementById('current-Frame');
    
    cursor = document.getElementById('cursor');
    timeline.appendChild(cursor);
    cursor.addEventListener('mousedown', function(event) {
        isDragging = true;
        // Calculate initial cursor position relative to container
        initialX = event.clientX  - cursor.getBoundingClientRect().left;
      
        // Add event listeners for mouse move and mouse up
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Prevent default behavior to avoid text selection while dragging
        event.preventDefault();
      });
      cursor.addEventListener('dblclick', function (event) {
        if (!selectedObject) return;
        const timelineRect = timeline.getBoundingClientRect();
        const position=event.clientX - timelineRect.left;
        const cursorX = cursor.getBoundingClientRect().left - timelineRect.left;
        const frame = Math.round(cursorX / (timelineRect.width / totalFrames));
        setKeyframe(selectedObject, frame);
        createKeyframeMarker(frame);
    });
    framerate.addEventListener('change', function(event){
        let old_fps=fps;
        let old_totalframes=totalFrames;
        fps=event.target.value;
        totalFrames=Math.round(old_totalframes/old_fps*fps);
        frames.value=totalFrames;
        updateLines();
        timeline.appendChild(cursor);
        scene.traverse(child=>{
            if(child.userData && child.userData.keyframes)
            {
                let keyframes = child.userData.keyframes;
                keyframes.forEach((keyframe) => {
                    keyframe.frame = Math.round(keyframe.frame / old_fps * fps);
                });
                child.userData.keyframes = keyframes;
                createAnimationCurveEditor(child);

            }
        })
        updateTimeline();
    });
    
    axisHelper = new THREE.AxesHelper(3);
    axisHelper.visible = false;
    scene.add(axisHelper);

    gui=new GUI();
    hdricontrols();
    createCameraControls();
    const gridfolder=gui.addFolder('Grid');
    const gridParams=
    {
        switch:true
    }
    const grid_on_off=gridfolder.add(gridParams,'switch').name('Show Grid').onChange(function(value)
    {
        if(value)
        {
            grid.visible=true;
        }
        else
        {
            grid.visible=false;
        }
    });
    gridfolder.close();
    addLightControls();
    createTextControls();
    create3DTextControls();
    createParticleControls();
    animationControls();
    Hotspotcontrols();
    createMaterialControls();
    libraryControls();
    createPathControls();
    let objectTransform;
    if(selectedObject)
    {
        objectTransform =
        { 
            x : selectedObject.position.x,
            y : selectedObject.position.y,
            z : selectedObject.position.z,
            rot_x : THREE.MathUtils.radToDeg(selectedObject.rotation.x),
            rot_y : THREE.MathUtils.radToDeg(selectedObject.rotation.y), 
            rot_z : THREE.MathUtils.radToDeg(selectedObject.rotation.z),
            scale_x:selectedObject.scale.x,
            scale_y:selectedObject.scale.y,
            scale_z:selectedObject.scale.z,
            show_curves:false
        }
    }
    else
    {
        objectTransform =
        { 
            x : 0,
            y : 0,
            z : 0,
            rot_x : 0,
            rot_y : 0, 
            rot_z : 0,
            scale_x:1,
            scale_y:1,
            scale_z:1,
            show_curves:false
        }

    } 
    const Tronsforms=gui.addFolder('Object Transforms');        
    x=Tronsforms.add(objectTransform, 'x').listen().onChange(function(event){ selectedObject.position.x=event; /*selectedObject.updateProjectionMatrix();*/ });
    y=Tronsforms.add(objectTransform, 'y').listen().onChange(function(event){ selectedObject.position.y=event; /*selectedObject.updateProjectionMatrix()*/ });
    z=Tronsforms.add(objectTransform, 'z').listen().onChange(function(event){ selectedObject.position.z=event; /*selectedObject.updateProjectionMatrix();*/ });
    rotx=Tronsforms.add(objectTransform, 'rot_x').listen().onChange(function(event){ selectedObject.rotation.x= THREE.MathUtils.degToRad ( event ); /*selectedObject.updateProjectionMatrix();*/ });
    roty=Tronsforms.add(objectTransform, 'rot_y').listen().onChange(function(event){ selectedObject.rotation.y= THREE.MathUtils.degToRad ( event ); /*selectedObject.updateProjectionMatrix()*/ });
    rotz=Tronsforms.add(objectTransform, 'rot_z').listen().onChange(function(event){ selectedObject.rotation.z= THREE.MathUtils.degToRad ( event ); /*selectedObject.updateProjectionMatrix()*/ });
    scalex=Tronsforms.add(objectTransform, 'scale_x').listen().onChange(function(event){ selectedObject.scale.x=event; /*selectedObject.updateProjectionMatrix()*/; });
    scaley=Tronsforms.add(objectTransform, 'scale_y').listen().onChange(function(event){ selectedObject.scale.y=event; /*selectedObject.updateProjectionMatrix();*/ });
    scalez=Tronsforms.add(objectTransform, 'scale_z').listen().onChange(function(event){ selectedObject.scale.z=event; /*selectedObject.updateProjectionMatrix();*/ });
    Tronsforms.close();
    gui.close();
    
}
function setSelectedObject(obj)
{
    selectedObject=obj;
}
async function loadGLBFromDrive(fileId,fileName) {
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

                        gltf.animations.forEach((clip) => {
                            // Loop through each track in the animation clip
                            clip.tracks.forEach((track) => {
                                // Extract the node name from the track name
                                const parts = track.name.split('.');
                                const nodeName = parts[0];
                                if(nodeName==child.name )
                                {
                                    const node = gltf.scene.getObjectByName(nodeName);
                                    if (node) {
                                    // Update the track name with the new node name
                                    const newTrackName = track.name.replace(nodeName, child.name+"_"+count);
                                    track.name = newTrackName;
                                }
                                }
                                // Check if the node with the original name exists in the GLTF scene
                                
                            });
                        });
                    
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
                    if(gltf.animations && gltf.animations.length>0)
                    {
                        models[index].animations=gltf.animations;
                    }
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
}
function updateLines() {
    // Get the new value of totalFrames
  
    // Calculate number of lines
    if (totalFrames <= 100) {
      numLines = totalFrames;
    } else if (totalFrames > 100 && totalFrames <= 1000) 
    {
      numLines = Math.floor(totalFrames / 10) + (totalFrames % 10);
    }
    else if (totalFrames > 1000 && totalFrames <= 10000) 
    {
        numLines = Math.floor(totalFrames / 100) + (totalFrames % 100);  
    }
  
    // Clear existing lines
    timeline.innerHTML = '';
    framesNumber.innerHTML='';
  
   
    for (let i = 0; i <= numLines; i++) {
      const line = document.createElement('div');
      line.classList.add('line');
      const p=document.createElement('div');
      if(totalFrames<=100)
      {
        p.innerHTML=i;
      }
      else if(totalFrames > 100 && totalFrames <= 1000)
      {
        p.innerHTML=i*10;
      }
      else if (totalFrames > 1000 && totalFrames <= 10000) 
      {
        p.innerHTML=i*100;
      }
      p.style.fontSize = '7px'
      p.classList.add('p')
      p.style.textAlign="center";
      p.style.transformOrigin = "center";
      //p.style.transform = "rotate(270deg)";
      timeline.appendChild(line);
      framesNumber.appendChild(p);
    }
  }
function createKeyframeMarker(frame) {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineWidth = timelineRect.width;
    const timelineHeight = timelineRect.height;

    const timelineLeft = timelineRect.left; // Left position of the timeline

    const percentage = (frame / totalFrames) * 100;
    const markerLeft = (percentage * timelineWidth) / 100;

    // Calculate the vertical position relative to the middle of the timeline
    const markerTop = timelineHeight / 2;

    // Create the marker element
    const marker = document.createElement('div');
    marker.classList.add('keyframe-marker');

    // Set the marker's left position relative to the timeline div
    marker.style.left = `${markerLeft + timelineLeft}px`;

    // Set the marker's top position relative to the timeline div
    marker.style.top = `${markerTop+timelineHeight}px`;

    // Append the marker to the timeline div
    timeline.appendChild(marker);
}
function moveCursor(frame) 
{
  const timelineRect = timeline.getBoundingClientRect();
const timelineWidth = timelineRect.width;
const timelineLeft = timelineRect.left;
const percentage = (frame / totalFrames) * 100;
let cursorLeft = (percentage * timelineWidth) / 100;

// Ensure cursor stays within the timeline div limits
cursorLeft = Math.max(cursorLeft, 0);
cursorLeft = Math.min(cursorLeft, timelineWidth);

cursor.style.left = cursorLeft + timelineLeft + 'px';
}
function updateTimeline()
{
  console.log('updating timeline');
  timeline.innerHTML='';
  framesNumber.innerHTML='';
  updateLines();
  timeline.appendChild(cursor);
  if(selectedObject && selectedObject.userData.keyframes)
  {
     let keyframes=selectedObject.userData.keyframes;
     for( let i=0; i < keyframes.length; i++)
      {
        createKeyframeMarker(keyframes[i].frame);

      }
  }

}
function updateSceneBasedOnCursor(frame)
{
    scene.traverse(child=>{
        interpolateTransforms(child, frame);
    });
    if(isplaying)
    {
        for(let i=0;i<cameraTracker.length;i++)
        {
            const obj=cameraTracker[i];
                
            const camera=obj.userData.camera;
            if(activecamera==camera && !obj.parent.userData.startframe && !obj.parent.userData.endframe)
            {
                break;

            }
            else
            {
                const startframe=obj.parent.userData.startframe;
                const endframe=obj.parent.userData.endframe;
                
                if(frame>=startframe && frame<=endframe)
                {
                    cameraChanged=true;
                    activecamera=camera;
                    //console.log(obj.name);
                    //console.log(startframe,endframe);
                    break;
                }
                else
                {
                    cameraChanged=false;
                    activecamera=currentCamera;
                }     

            }
              
        }
    }
}
function playAnimation() 
{
    isplaying=true;

    let currentFrame = parseInt(currentframe.value);

    animationInterval = setInterval(() => {
      currentFrame++;
      if (currentFrame > totalFrames) {
        stopAnimation();
        return;
      }
      
      currentframe.value = currentFrame;
      moveCursor(currentFrame);
      updateSceneBasedOnCursor(currentFrame);
    }, 1000 / fps);
}
function pauseAnimation() 
{
    clearInterval(animationInterval);

}
function updateGUIValues() 
{
    if(selectedObject)
    {
    {
    x.setValue(parseFloat((selectedObject.position.x).toFixed(3)));
    y.setValue(parseFloat((selectedObject.position.y).toFixed(3)));
    z.setValue(parseFloat((selectedObject.position.z).toFixed(3)));
    rotx.setValue(parseFloat((THREE.MathUtils.radToDeg(selectedObject.rotation.x)).toFixed(3)));
    roty.setValue(parseFloat((THREE.MathUtils.radToDeg(selectedObject.rotation.y)).toFixed(3)));
    rotz.setValue(parseFloat((THREE.MathUtils.radToDeg(selectedObject.rotation.z)).toFixed(3)));
    scalex.setValue(parseFloat((selectedObject.scale.x).toFixed(3)));
    scaley.setValue(parseFloat((selectedObject.scale.y).toFixed(3)));
    scalez.setValue(parseFloat((selectedObject.scale.z).toFixed(3)));
    }
    }
} 
function stopAnimation() 
{
    clearInterval(animationInterval);
    currentframe.value = 0;
    moveCursor(0);
    updateSceneBasedOnCursor(0);
    isplaying=false
    cameraChanged=false;
    activecamera=currentCamera;
}
  
  document.getElementById('play-button').addEventListener('click', playAnimation);
  document.getElementById('pause-button').addEventListener('click', pauseAnimation);
  document.getElementById('stop-button').addEventListener('click', stopAnimation);
function create3DTextBox(startPoint, endPoint) 
{  
    let width = endPoint.x - startPoint.x;
    let height = endPoint.y - startPoint.y;
    if(width<0)
    width=-width;
    if(height<0)
    height=-height;
    const geometry = new THREE.BoxGeometry(width, height,1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    boxMesh3D = new THREE.Mesh(geometry, material);

    scene.add(boxMesh3D);
    boxMesh3D.position.set(0,0,0);
    boxMesh3D.visible=false;
    boxMesh3D.userData.width=width;
    boxMesh3D.userData.height=height;
    boxMesh3D.userData.depth=1;
    box3D=new BoxHelperCustom(boxMesh3D);
    scene.add(box3D); 
}
function onMouseUp() 
{
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
}
function onMousedrag(event)
{
    if (event.altKey) {
        // Disable OrbitControls
        orbitControls.enabled = false;
        startPoint = getMousePosition(event);
    }
    if (event.ctrlKey) {
        // Disable OrbitControls
        orbitControls.enabled = false;
        startPoint = getMousePosition(event);
    }

}
function onMouseMove(event) {
    if (event.altKey && startPoint) {
        // Remove previous box if exists
        if (boxMesh) {
            scene.remove(boxMesh);
            scene.remove(box);
        }

        const currentPoint = getMousePosition(event);
        createBox(startPoint, currentPoint);
    }
    else if (event.ctrlKey && startPoint) {
        // Remove previous box if exists
        if (box3D) {
            scene.remove(boxMesh3D);
            scene.remove(box3D);
            console.log("removed box3D");
        }

        const currentPoint = getMousePosition(event);
        create3DTextBox(startPoint, currentPoint);
    }
    //document.removeEventListener('click',onMouse,true);
    if (!isDragging) return;

    const timelineRect = timeline.getBoundingClientRect();
    let newX = event.clientX - initialX;

    newX = Math.max(timelineRect.left, Math.min(newX, timelineRect.right - cursor.offsetWidth));

    cursor.style.left = newX + 'px';
    const cursorX = cursor.getBoundingClientRect().left - timelineRect.left;
    const frame = Math.round(cursorX / (timelineRect.width / totalFrames));
    currentframe.value = frame;
    updateSceneBasedOnCursor(frame);
}

function onMouseup() 
{
    orbitControls.enabled = true;
    startPoint = null;
    isDragging = false;
    /*document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.addEventListener('click',onMouseDown,true);*/
}
function getMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(currentCamera);

    const dir = vector.sub(currentCamera.position).normalize();
    const distance = -currentCamera.position.z / dir.z;

    const pos = currentCamera.position.clone().add(dir.multiplyScalar(distance));

    return pos;
}
function createBox(startPoint, endPoint) {
    let width = endPoint.x - startPoint.x;
    let height = endPoint.y - startPoint.y;
    if(width<0)
    width=-width;
    if(height<0)
    height=-height;
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    boxMesh = new THREE.Mesh(geometry, material);

   

    scene.add(boxMesh);
    boxMesh.position.set(0,0,0);
    boxMesh.visible=false;
    boxMesh.userData.width=width;
    boxMesh.userData.height=height;
    

    box=new CustomPlaneHelper(boxMesh,0xff0000);
    scene.add(box);

}
function Filedrop(event)
{
	 event.preventDefault();

    const file = event.dataTransfer.files[0];
    const file_mtl=event.dataTransfer.files[1];
    const fileName=file.name.toLowerCase();
    
    if (fileName.endsWith('.fbx')) 
    {
        // Load FBX file
        const loader = new FBXLoader();
        loader.load(URL.createObjectURL(file), function (object) {
            // Add the loaded object to the scene
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
                object.traverse(child =>{
                    
                    child.name=child.name+"_"+count;
                    if(child instanceof THREE.Mesh)
                    {
                        
                            // Check if the material is of unknown type
                            //if (child.material.type === 'MeshPhongMaterial') {
                                // Create a new MeshStandardMaterial
                                const standardMaterial = new THREE.MeshStandardMaterial();
                
                                // Map properties from MeshPhongMaterial to MeshStandardMaterial
                                standardMaterial.color = child.material.color.clone();
                                standardMaterial.map = child.material.map ? child.material.map.clone() : null;
                                standardMaterial.metalness = 0.5; // Adjust as needed
                                standardMaterial.roughness = 0.5; // Adjust as needed
                
                                // Replace material with MeshStandardMaterial
                                const name=child.material.name+"_"+count;
                                child.material = standardMaterial;
                                child.material.name=name;
                                
                           // }
                        
                        /*else{
                        child.material.name=child.material.name+"_"+count;
                        }*/
                    }

                });
                
			models[index] =object;
            scene.add(models[index]);
            const sceneTree = document.getElementById('scene-tree');
            const name=document.createElement('div');
            name.id="name"+listIndex;
            name.innerHTML=`<strong>${newFilename}:</strong>`;
            sceneTree.appendChild(name);
            traverseScene(object, sceneTree);
        });
    }
    else if (fileName.endsWith('.glb')) 
    {
        const reader = new FileReader();
        reader.onload = function(event) {
            const loader = new GLTFLoader();
            loader.parse(event.target.result, '', function(gltf) {
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
                let skeletonRoot = null;
                gltf.scene.traverse(child =>{
                    
                    
                    gltf.animations.forEach((clip) => {
                        // Loop through each track in the animation clip
                        clip.tracks.forEach((track) => {
                            // Extract the node name from the track name
                            const parts = track.name.split('.');
                            const nodeName = parts[0];
                            if(nodeName==child.name )
                            {
                                const node = gltf.scene.getObjectByName(nodeName);
                                if (node) {
                                // Update the track name with the new node name
                                const newTrackName = track.name.replace(nodeName, child.name+"_"+count);
                                track.name = newTrackName;
                            }
                            }
                            // Check if the node with the original name exists in the GLTF scene
                            
                        });
                    });
                    child.name=child.name+"_"+count;
                    if(child instanceof THREE.Mesh)
                    {
                        child.castShadow=true;
                        child.receiveShadow=true;
                        child.material.side=2;
                       
                    const name=child.material.name+"_"+count;
                    //child.material = physicalMaterial;
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
                if(gltf.animations && gltf.animations.length>0)
                {
                    models[index].animations=gltf.animations;
                }
                models[index].name=gltf.scene.name;
                models[index].userData.filename=newFilename;
                scene.add(models[index]);
                //console.log(models.length);
                //const out=document.getElementById("outline-container");
                const name=document.createElement('div');
                name.id="name"+listIndex;
                name.innerHTML=`<strong>${newFilename}:</strong>`;
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.appendChild(name);
                traverseScene(gltf.scene, sceneTree);
            });
        };
        reader.readAsArrayBuffer(file);
    }
    else if (fileName.endsWith('.obj')) 
    {
        const files = event.dataTransfer.files;
        let objFile, mtlFile;

    for (let i = 0; i < files.length; i++) 
    {
        const file = files[i];
        if (file.name.endsWith('.obj')) 
        {
            objFile = file;
        } 
        else if (file.name.endsWith('.mtl')) 
        {
            mtlFile = file;
            console.log(mtlFile);
        }
    }
    const objReader = new FileReader();
    objReader.onload = function (event) 
    {
        const objLoader = new OBJLoader();
        const objText = event.target.result;

        const mtlReader = new FileReader();
        mtlReader.onload = function (event) {
        const mtlLoader = new MTLLoader();
        const materials = mtlLoader.parse(event.target.result);
        materials.preload();

        objLoader.setMaterials(materials);
        const object = objLoader.parse(objText);
        index++;
        listIndex++;
        let count = 0;
        let newFilename = fileName;
        
        const existingFilenames = fileNames.filter(name => name.startsWith(fileName));
        if (existingFilenames.length > 0) 
        {
            // Find the highest count among the existing filenames
            const maxCount = existingFilenames.reduce((max, name) => 
            {
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
        object.traverse(child =>
        {
                
        child.name=child.name+"_"+count;
        if(child instanceof THREE.Mesh)
        {
            const standardMaterial = new THREE.MeshPhysicalMaterial();
                
            // Map properties from MeshPhongMaterial to MeshStandardMaterial
            standardMaterial.color = child.material.color.clone();
            standardMaterial.map = child.material.map ? child.material.map.clone() : null;
            standardMaterial.metalness = 0.5; // Adjust as needed
            standardMaterial.roughness = 0.5; // Adjust as needed
    
            // Replace material with MeshStandardMaterial
            const name=child.material.name+"_"+count;
            child.material = standardMaterial;
            child.material.name=name;
            //child.material.name=child.material.name+"_"+count;
            console.log(child.material);
        }
        });
        models[index] = object;
        scene.add(models[index]);
        const sceneTree = document.getElementById('scene-tree');
        const name=document.createElement('div');
        name.id="name"+listIndex;
        name.innerHTML=`<strong>${newFilename}:</strong>`;   
        sceneTree.appendChild(name);
        traverseScene(object, sceneTree);
        // Assuming you have a scene object in scope
    
      };
      mtlReader.readAsText(mtlFile);
    };
    objReader.readAsText(objFile);
}
    
}
function handleDragOver(event) 
{
    event.preventDefault();
}
function handleDrop(event) 
{
    Filedrop(event);
}
function getUVSets(obj) 
{
    const uvSets = new Set();
    
    // Check for "uv" attribute (often referred to as "uv0")
    uvSets.add('uv');

    obj.traverse((child) => {
        if (child.isMesh && child.geometry.attributes.uv !== undefined) {
            // Assuming UV sets are named like "UVMap_1", "UVMap_2", etc.
            Object.keys(child.geometry.attributes).forEach((attribute) => {
                if (attribute.startsWith("uv") && attribute !== "uv") {
                    uvSets.add(attribute); // Add UV set name to the Set
                }
            });
        }
    });

    return Array.from(uvSets); // Convert Set to Array
}
function setUVSet(child, uvSetName) {
    if (child.isMesh && child.geometry.attributes.uv !== undefined) { // Copy the UV attribute array
        if (uvSetName === 'uv') {
            // Set the default UV set
            child.geometry.setAttribute('uv', new THREE.BufferAttribute(child.userData.defaultUVSet, 2));
            child.material.map=child.userData[uvSetName].colorMap;
            child.material.roughnessMap=child.userData[uvSetName].roughnessMap;
            child.material.metalnessMap=child.userData[uvSetName].metalnessMap;
            child.material.normalMap=child.userData[uvSetName].normalMap;

        } else {
            // Set the selected UV set
            if (child.geometry.attributes[uvSetName] !== undefined) {
                child.geometry.setAttribute('uv', child.geometry.attributes[uvSetName]);
                child.material.map=child.userData[uvSetName].colorMap;
                child.material.roughnessMap=child.userData[uvSetName].roughnessMap;
                child.material.metalnessMap=child.userData[uvSetName].metalnessMap;
                child.material.normalMap=child.userData[uvSetName].normalMap;
            } else {
                console.warn(`UV set ${uvSetName} not found.`);
            }
        }
        child.geometry.attributes.uv.needsUpdate = true; // Ensure attribute update is triggered
        console.log(child.geometry.attributes.uv );
    }
}
function traverseScene(object, parentElement) 
{
    
    const listItem = document.createElement('li');
    listItem.id="list_"+listIndex;
    //listItem.appendChild(name);
    const buttonContainer = document.createElement('div');
    const button = document.createElement('button');
    const toggleButton = document.createElement('button');
    
    button.classList.add('tree-button');
    
    if(!object.name||object.name.includes('Scene')||object.parent==scene)
    {
        console.log(object);
        object.name= object.userData.filename;
    }
    button.textContent = object.name || 'Unnamed Object';
    button.id=object.name||'Unnamed Object';
    button.draggable=true;
    
    if (object.children.length > 0)
    {
        toggleButton.textContent = '+';
        toggleButton.classList.add('toggle-button');
        toggleButton.addEventListener('click', function(event) {
            toggleChildrenVisibility(toggleButton);
            event.stopPropagation();
        });
        buttonContainer.appendChild(toggleButton);
    }
    buttonContainer.appendChild(button);
    listItem.appendChild(buttonContainer);
    parentElement.appendChild(listItem);
    scene.traverse(child => 
    {
        if(child instanceof THREE.Mesh )
        child.userData.Baseblendingmode=0;
        child.userData.NormalBlendingmode=0;
    }
    );   

    const buttons = document.querySelectorAll('.tree-button');
    let previousmesh;
    button.addEventListener('click', function() 
    {
        const meshName=button.textContent;
        buttons.forEach(button => 
        {
            button.style.border = ''; // Reset color to default (transparent)
        });
        button.style.border = '2px solid black';
        transformControls.detach()//detachTransformcontrols();
        const attr=document.getElementById('container');
        attr.innerHTML='';
        let locked=false;

        const hd= document.createElement('div');
        const lbl = document.createElement("label");
        const hidebutton = document.createElement('input');
        hidebutton.type = 'checkbox';
        hidebutton.id = 'hide';
        hidebutton.className= 'button';
        lbl.appendChild(hidebutton);
        lbl.appendChild(document.createTextNode("hide_Object"));
        hd.appendChild(lbl);

        scene.traverse(child => 
        {
            if(child.name==meshName )
            {
               if(child.visible)
               {
                hidebutton.checked=false;
               }
               else 
               {
                hidebutton.checked=true;
               }
            }
        });

        
    // Create two simple buttons
        const focusbutton = document.createElement('button');
        focusbutton.textContent = 'focus';
        focusbutton.className = 'button';

        const deletebutton = document.createElement('button');
        deletebutton.textContent = 'delete';
        deletebutton.className = 'button';
        
        const shadow= document.createElement('div');
        const lblcast = document.createElement("label");
        const castShadow = document.createElement('input');
        castShadow.type = 'checkbox';
        castShadow.id = 'castShadow';
        //castShadow.className= 'button';
        lblcast.appendChild(castShadow);
        lblcast.appendChild(document.createTextNode("Cast Shadows"));
        shadow.appendChild(lblcast);
        
        const lblrecieve = document.createElement("label");
        const receiveShadow = document.createElement('input');
        receiveShadow.type = 'checkbox';
        receiveShadow.id = 'receiveShadow';
        //receiveShadow.className= 'button';
        lblrecieve.appendChild(receiveShadow);
        lblrecieve.appendChild(document.createTextNode("Recieve Shadows"));
        shadow.appendChild(lblrecieve);

        scene.traverse(child => 
        {
            if(child.name==meshName)
            {
               if(child.castShadow)
               {
                castShadow.checked=true;
               }
               else 
               {
                castShadow.checked=false;
               }
            }

        });
        scene.traverse(child => 
        { 
            if(child.name==meshName)
            {
                if(child.receiveShadow)
                {
                    receiveShadow.checked=true;
                }
                else 
                {
                    receiveShadow.checked=false;
                }
            }

        });


        attr.appendChild(hd);
        attr.appendChild(focusbutton);
        attr.appendChild(deletebutton);
        attr.appendChild(shadow);

        const btns = attr.querySelectorAll('.button');
        btns.forEach(button => {
        // button.style.display = 'inline-block';
        });

        hidebutton.addEventListener('change', function() 
        {
            scene.traverse(child => 
            {
                if(child.name==meshName )
                {
                    if(child.visible)
                    {
                        child.visible=false;
                        child.traverse(child =>
                        {
                            child.visible=false;
                        });
                        scene.traverse(o=>
                        {
                            if(o instanceof THREE.SkeletonHelper && o.root==child)
                            {
                                o.visible=false;
                            }
                        })
                    }
                   else
                   {
                        child.visible=true;
                        child.traverse(child =>
                        {
                            child.visible=true;
                        });
                        scene.traverse(o=>  
                        {
                            if(o instanceof THREE.SkeletonHelper && o.root==child)
                            {
                                o.visible=true;
                            }
                        })
                   }
                }
            });
        });
        focusbutton.addEventListener('click', function() {
            scene.traverse(child => {
            
                if(child.name==meshName )
                {
                    focusFlag=true;
                    focusOnObject(child,currentCamera,orbitControls);
                    composer = new EffectComposer(renderer);
  
                    renderPass = new RenderPass(scene, currentCamera);
                    composer.addPass(renderPass);
    
                    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, currentCamera);
                    outlinePass.visibleEdgeColor.set( 0x00ff00 );
                    outlinePass.edgeStrength = Number( 5 );
                    outlinePass.edgeGlow = Number( 1);
                    outlinePass.edgeThickness = Number( 5 );
                    outlinePass.selectedObjects=[child];
                    composer.addPass( outlinePass );

                    const outputPass = new OutputPass();
                    composer.addPass( outputPass );

                    effectFXAA = new ShaderPass( FXAAShader );
                    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
                    composer.addPass( effectFXAA );
                }

            });
        });
        deletebutton.addEventListener('click',function(){
            scene.traverse(child => {
            
                if(child.name==meshName )
                {
                   /*bloomScene.traverse(obj=>{
                    if(obj.userData.cloneof==child)
                        bloomScene.remove(obj);
                   })*/
                   deleteObject(child);
                   document.getElementById(meshName).remove();
                   attr.innerHTML='';
                }

          });
        });
        castShadow.addEventListener('change', function() {
            scene.traverse(child => {
            
                if(child.name==meshName /*&& child instanceof THREE.Mesh*/ )
                {
                   if(child.castShadow)
                   {
                    child.castShadow=false;
                    child.traverse(c=>{
                        c.castShadow=false;
                    })
                    console.log(child.castShadow);
                   }
                   else
                   {
                    child.castShadow=true;
                    child.traverse(c=>{
                        c.castShadow=true;
                    })
                    console.log(child.castShadow);
                    
                   }
                }

          });
        });
        receiveShadow.addEventListener('change', function() {
            scene.traverse(child => {
            
                if(child.name==meshName /*&& child instanceof THREE.Mesh*/ )
                {
                   if(child.receiveShadow)
                   {
                    child.receiveShadow=false;
                    child.traverse(c=>{
                        c.receiveShadow=false;
                    })
                    console.log(child.receiveShadow);
                   }
                   else
                   {
                    child.receiveShadow=true;
                    child.traverse(c=>{
                        c.receiveShadow=true;
                    })
                    console.log(child.receiveShadow);
                    
                   }
                }

          });
        });

        scene.traverse(child => 
        {
            if(child.name==meshName)
            {
                selectedObject=child;
                addTransformcontrols(selectedObject);
                child.userData.oldmaterial=child.material;
                child.userData.oldImage=child.material.map;
                child.userData.oldnormal=child.material.normalMap;
                child.userData.oldroughness=child.material.roughnessMap;
                child.userData.oldanisotropy=child.material.anisotropyMap;
                child.userData.oldemissive=child.material.emissiveMap;
                child.userData.oldiridescence=child.material.iridescenceMap;
                child.userData.oldsheenRoughness=child.material.sheenRoughnessMap;
                child.userData.oldsheenColor=child.material.sheenColorMap;
                child.userData.oldthickness=child.material.thicknessMap;
                child.userData.oldtransmission=child.material.transmissionMap;
                updateTimeline();
                createAnimationCurveEditor(child);

            }
        });
        const divLock= document.createElement('div');
        const lbl1 = document.createElement("label");
        const lockTextures = document.createElement('input');
        lockTextures.type = 'checkbox';
        lockTextures.id = 'lock-textures';
        lockTextures.checked=false;
        lbl1.appendChild(lockTextures);
        lbl1.appendChild(document.createTextNode("All textures UnLinked"));
        divLock.appendChild(lbl1);
        attr.appendChild(divLock);
                 
        scene.traverse(child => 
        {
            if(child instanceof THREE.Mesh && child.name==meshName)
            {
                const properties=[];
                let selectedIndex;
                for(let i=0; i < models.length; i++)
                {
                    models[i].traverse(obj => {
                        if(meshName==obj.name)
                        {
                           selectedIndex=i;
                           
                        }
                    });
                }
                selectedObject=child;
                
                if(!child.userData.defaultUVSet)
                    child.userData.defaultUVSet = selectedObject.geometry.attributes.uv.array;
                if(!child.userData.currentUVSet)
                    child.userData.currentUVSet='uv';
                //console.log(defaultUVSet);
                const dropdown = document.createElement('select');
                dropdown.id = 'uvSetDropdown';
                
                UVsets=getUVSets(models[selectedIndex]);
                UVsets.forEach((uvSetName, index) => {
                const option = document.createElement('option');
                option.text = uvSetName;
                option.value = index;
                dropdown.appendChild(option);
                if(uvSetName!='uv' && !child.userData[uvSetName])
                {
                    child.userData[uvSetName]=
                    {
                        colorMap: null,
                        roughnessMap:null,
                        metalnessMap:null,
                        normalMap:null,
                        anisotropyMap:null,
                        emissiveMap:null,
                        iridescenceMap:null,
                        sheenRoughnessMap:null,
                        sheenColorMap:null,
                        thicknessMap:null,
                        transmissionMap:null,
                        clearcoatMap:null,
                        clearcoatNormalMap:null,
                        clearcoatRoughnessMap:null,
                        aoMap:null

                    };
                }
                });
                dropdown.addEventListener('change', (event) => 
                {
                    const selectedUVSetName = UVsets[parseInt(event.target.value)];
                    setUVSet(child, selectedUVSetName);
                    child.userData.currentUVSet=selectedUVSetName;
                    child.material.map=child.userData[child.userData.currentUVSet].colorMap;
                    child.material.roughnessMap=child.userData[child.userData.currentUVSet].roughnessMap;
                    child.material.metalnessMap=child.userData[child.userData.currentUVSet].metalnessMap;
                    child.material.normalMap=child.userData[child.userData.currentUVSet].normalMap;
                    child.material.anisotropyMap=child.userData[child.userData.currentUVSet].anisotropyMap;
                    child.material.emissiveMap=child.userData[child.userData.currentUVSet].emissiveMap;
                    child.material.iridescenceMap=child.userData[child.userData.currentUVSet].iridescenceMap;
                    child.material.sheenRoughnessMap=child.userData[child.userData.currentUVSet].sheenRoughnessMap;
                    child.material.sheenColorMap=child.userData[child.userData.currentUVSet].sheenColorMap;
                    child.material.thicknessMap=child.userData[child.userData.currentUVSet].thicknessMap;
                    child.material.transmissionMap=child.userData[child.userData.currentUVSet].transmissionMap;
                 });
                attr.appendChild(dropdown);
                if(child.userData.currentUVSet)
                    {
                        for (let i = 0; i < dropdown.options.length; i++) {
                            if (dropdown.options[i].text === child.userData.currentUVSet) 
                            {
                                dropdown.selectedIndex = i;
                                if(i==0)
                                break;
                                setUVSet(child,child.userData.currentUVSet);
                                child.material.map=child.userData[child.userData.currentUVSet].colorMap;
                                child.material.roughnessMap=child.userData[child.userData.currentUVSet].roughnessMap;
                                child.material.metalnessMap=child.userData[child.userData.currentUVSet].metalnessMap;
                                child.material.normalMap=child.userData[child.userData.currentUVSet].normalMap;
                                child.material.anisotropyMap=child.userData[child.userData.currentUVSet].anisotropyMap;
                                child.material.emissiveMap=child.userData[child.userData.currentUVSet].emissiveMap;
                                child.material.iridescenceMap=child.userData[child.userData.currentUVSet].iridescenceMap;
                                child.material.sheenRoughnessMap=child.userData[child.userData.currentUVSet].sheenRoughnessMap;
                                child.material.sheenColorMap=child.userData[child.userData.currentUVSet].sheenColorMap;
                                child.material.thicknessMap=child.userData[child.userData.currentUVSet].thicknessMap;
                                child.material.transmissionMap=child.userData[child.userData.currentUVSet].transmissionMap;
                                break;
                            }
                        }
                    }
                if(!child.userData.uv)
                {
                   child.userData.uv=
                   {
                        colorMap:null,
                        roughnessMap:null,
                        metalnessMap:null,
                        normalMap:null,
                        anisotropyMap:null,
                        emissiveMap:null,
                        iridescenceMap:null,
                        sheenRoughnessMap:null,
                        sheenColorMap:null,
                        thicknessMap:null,
                        transmissionMap:null
                   };
                }
                console.log(child.material);
                for(const key in child.material)
                {   let value,propertyElement;
                    if(key.toLowerCase().endsWith('color')||key.toLowerCase().endsWith('emissive'))	
                    {
                        const div=document.createElement('div');
                        div.id='div'+key;
                        value = child.material[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `<strong>${key}:</strong> `;
                        div.appendChild(propertyElement);
                        const colorPicker = document.createElement('input');
                        colorPicker.type = 'color';
                        colorPicker.id = key;
                        colorPicker.value = '#'+value.getHex().toString(16);
                        div.appendChild(colorPicker); 
                        //attr.appendChild(div);
                        properties.push(div);
                        colorPicker.addEventListener('input', function(event) {
                            const selectedColorValue = event.target.value;
                            const selectedColor = new THREE.Color(selectedColorValue);
                            child.material[key]=new THREE.Color(selectedColor);
                            //propertyElement.innerHTML = `<strong>${key}:</strong> ${'0x'+selectedColor.getHex().toString(16)}`;
                        });
                    }
                    else if(key=='name')
                    {
                        const div=document.createElement('div');
                        div.id='div'+key;
                        value = child.material[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value.toUpperCase()}`; 
                        div.appendChild(propertyElement);
                        //attr.appendChild(div);
                        properties.push(div);
                    }	    
                }
                for(const key in child.material)
                {   
                    let value,propertyElement;
                    if(key.toLowerCase().endsWith('ness')||key.toLowerCase().endsWith('intensity')||key.toLowerCase().endsWith('ior')||key.toLowerCase().endsWith('opacity')||key.toLowerCase().endsWith('transmission'))	
                    {
                        const div=document.createElement('div');
                        div.id='div'+key;
                        value = child.material[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `<strong>${key}:</strong>`;
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.id = key;
                        input.value= `${value}`;
                        div.appendChild(propertyElement);
                        div.appendChild(input);
                        //attr.appendChild(div);
                        properties.push(div);
                        input.addEventListener('input', function(event) {
                            child.material[key]=parseFloat(event.target.value);
                            if(key=='opacity')
                            {
                                child.material.transparent=true;
                            }
                        });
                    }
                       
                }
                for (const key in child.material) 
                {
                    if(child.material.hasOwnProperty(key))  
                    {
                        let value, propertyElement;
                        if(key.toLowerCase().endsWith('map'))
                        {
                            const div=document.createElement('div');
                            div.id='div'+key;
                            value = child.material[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `<strong>${key}:</strong>`;

                            const labelsequence=document.createElement('label');
                            labelsequence.appendChild(document.createTextNode("Image sequence"));
                            const sequenceCheck=document.createElement('input');
                            sequenceCheck.type="checkbox";
                            if(child.userData.isSequence)
                            {
                                sequenceCheck.checked=child.userData.isSequence;
                            }
                            else
                            {
                                sequenceCheck.checked=false;
                            }
                            sequenceCheck.addEventListener("click",function()
                            {
                                if(sequenceCheck.checked)
                                {
                                    child.userData.isSequence=true;
                                }
                                else
                                {
                                    child.userData.isSequence=false;
                                }
                            });

                            const startlabel=document.createElement('label');
                            startlabel.appendChild(document.createTextNode("Start frame"));
                            const startframe=document.createElement('input');
                            startframe.type='text';
                            if(child.userData.sequenceStart)
                            {
                                startframe.value=child.userData.sequenceStart;
                            }
                            else
                            {
                                startframe.value='0';
                            }
                            startframe.addEventListener('input',function(event)
                            {
                                child.userData.sequenceStart=parseInt(startframe.value);
                            });
                            
                            const endlabel=document.createElement('label');
                            endlabel.appendChild(document.createTextNode("End frame"));
                            const endframe=document.createElement('input');
                            endframe.type='text';
                            if(child.userData.sequenceEnd)
                            {
                                endframe.value=child.userData.sequenceEnd;
                            }
                            else
                            {
                                endframe.value='0';
                            }
                            endframe.addEventListener('input',function(event)
                            {
                                child.userData.sequenceEnd=parseInt(endframe.value);
                            });


                            if(key=="map")
                            {
                                labelsequence.appendChild(sequenceCheck)
                                div.appendChild(labelsequence);
                                startlabel.appendChild(startframe);
                                div.appendChild(startlabel);
                                endlabel.appendChild(endframe);
                                div.appendChild(endlabel);
                            }
                            
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept='image/*,video/*';
                            fileInput.multiple=true;
                            fileInput.id = key;
                            div.appendChild(propertyElement);
                            div.appendChild(fileInput);
                            fileInput.addEventListener('input', function(event) 
                            {
                                var file = event.target.files[0];
                                var files=event.target.files;
                                if (files.length==1) 
                                {
                                    var reader = new FileReader();
                                    reader.onload = function(e) 
                                    {
                                        var image = document.createElement('img');
                                        image.src = e.target.result;
                                        
                                        if(file.type.startsWith('image/'))
                                        {
                                            
                                            var textureLoader = new THREE.TextureLoader();
                                            textureLoader.load(image.src, function(texture) 
                                            {
                                                texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                                                texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                                                texture.repeat.y=-1; 
                                                child.material[key]=texture;
                                                child.material.needsUpdate=true;
                                                //child.userData[child.userData.currentUVSet][key]=child.materialk[key];
                                                child.userData.oldmaterial=child.material;
                                                //updateTextureMatrix(child.material[key]);
                                                child.userData['old'+key]=child.material[key]
                                                //updateTextureMatrix(child.userData['old'+key]);
                                            });   
                                            
                                            
                                        }
                                        else if(file.type.startsWith('video/'))
                                        {
                                            const video=document.createElement('video');
                                            video.src=image.src
                                            video.play();
                                            video.loop=true;
                                            var texture = new THREE.VideoTexture(video);
                                            texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                                            texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                                            texture.repeat.y=-1; 
                                            child.material[key]=texture;
                                            child.material.needsUpdate=true;
                                            //child.userData[child.userData.currentUVSet][key]=child.materialk[key];
                                            child.userData.oldmaterial=child.material;
                                            //updateTextureMatrix(child.material[key]);
                                            child.userData['old'+key]=child.material[key]
                                            console.log(child.material.map);
                                            //updateTextureMatrix(child.userData['old'+key]);
                                              
                                        }
                                        
                                    };
                                    reader.readAsDataURL(file);
                                }
                                if(files.length>1)
                                {
                                    if(child.userData.isSequence && key=="map")
                                    {
                                        if(child.userData.imageSequence==undefined)
                                        {
                                            child.userData.imageSequence=[];
                                        }
                                        
                                        for(let i=0;i<files.length;i++)
                                        {
                                            const file = files[i];
                                            var reader=new FileReader();
                                            reader.onload=function(e)
                                            {
                                                var image = document.createElement('img');
                                                image.src = e.target.result;
                                                var textureLoader = new THREE.TextureLoader();
                                                textureLoader.load(image.src, function(texture) 
                                                {
                                                    texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                                                    texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                                                    texture.repeat.y=-1; 
                                                    if(i==0)
                                                    {
                                                        child.material[key]=texture;
                                                        child.material.needsUpdate=true;
                                                    }
                                                    child.userData.imageSequence.push(texture);
                                                }); 

                                            };
                                            reader.readAsDataURL(file);
                                            
                                        }
                                        

                                    }
                                    
                                }
                            });
                        
                            const btn=document.createElement('button');
                            btn.textContent='remove';
                            div.appendChild(btn);
                    
                            btn.addEventListener('click', function() 
                            {
                                child.material[key]=null;
                                //propertyElement.innerHTML = `<strong>${key}:</strong>null`;
                                child.material.needsUpdate=true;
                                child.userData[child.userData.currentUVSet][key]=child.material[key];
                                child.userData.oldmaterial=child.material;
                                child.userData['old'+key]=child.material[key];
                                //updateTextureMatrix(child.userData['old'+key]);
                            });
                            
                            const btnLibrary=document.createElement('button');
                            btnLibrary.textContent="choose from library";
                            div.appendChild(btnLibrary);
                            btnLibrary.addEventListener('click',function(){
                                console.log(key);
                                displayContents(folderId,key);
            
                            });


                            const slider1=document.createElement('input');
                            slider1.type="range";
                            slider1.min="1";
                            slider1.max="16";
                            slider1.value="1";
                            slider1.step="0.1"
                            slider1.id="tiling";
                                
                            const slider2=document.createElement('input');
                            slider2.type="range";
                            slider2.min="0";
                            slider2.max="360";
                            slider2.value="0";
                            slider2.id="rotation";
                            slider2.step="0.1"
                            
                            const p1=document.createElement('p');
                            p1.innerHTML=`tiling:`;
                            const p2=document.createElement('p');
                            p2.innerHTML=`rotation:`;
                            
                            div.appendChild(p1);
                            div.appendChild(slider1);
                            div.appendChild(p2);
                            div.appendChild(slider2);
                            attr.appendChild(div);
                    
                            slider1.addEventListener("change", function() 
                            {
                                child.material[key].repeat.set(this.value,-this.value);
                                child.material[key].needsUpdate = true;
                                child.userData[child.userData.currentUVSet][key]=child.material[key];
                                child.userData.oldmaterial=child.material;
                                //updateTextureMatrix(child.material[key]);
                                child.userData['old'+key]=child.material[key]
                                //updateTextureMatrix(child.userData['old'+key]);
                            });
                            
                            slider2.addEventListener("change", function() 
                            {
                                child.material[key].rotation = this.value * Math.PI / 180;
                                child.material[key].needsUpdate = true;
                                child.userData[child.userData.currentUVSet][key]=child.material[key];
                                child.userData.oldmaterial=child.material;
                                //updateTextureMatrix(child.material[key]);
                                child.userData['old'+key]=child.material[key]
                                //updateTextureMatrix(child.userData['old'+key]);
                            });
                            properties.push(div);
                            //child.userData[child.userData.currentUVSet][key]=child.material[key];	
                        }                   
                    }
                }
                const mainElements=document.createElement('div');
                mainElements.id='mainElements';
                const otherElements=document.createElement('div');
                otherElements.id='otherElements';
                otherElements.style.display='none';
                const lbl2 = document.createElement("label");
                const show = document.createElement('input');
                show.type = 'checkbox';
                show.id = 'showElements';
                show.checked=false;
                lbl2.appendChild(show);
                lbl2.appendChild(document.createTextNode("Show other parameters"));
               
                attr.appendChild(mainElements);
                attr.appendChild(lbl2);
                attr.appendChild(otherElements)

                for(let i=0;i<properties.length;i++)
                {
                    const prop=properties[i];
                    const name=properties[i].id;
                    if(name=='divmap'||name=='divroughnessMap'||name=='divmetalnessMap'||name=='divnormalMap'||name=='divcolor'||name=='divmetalness'||name=='divroughness'||name=='divaoMap'||name=='divname')
                    {
                        mainElements.appendChild(prop);
                    }
                    else
                    {
                        otherElements.appendChild(prop);
                    }


                }
                show.addEventListener('change',function(event){
                    if(show.checked)
                    {
                        otherElements.style.display="block";
                    }
                    else
                    {
                        
                        otherElements.style.display="none";
                    }
                })

               
               
            }
            
        });
    });
    const outliner = document.getElementById('outline-container');
         let draggedButton = null;
         
         // Event listener for drag start
         outliner.addEventListener('dragstart', (event) => {
           if (event.target.classList.contains('tree-button')) {
             draggedButton = event.target;
             event.target.classList.add('dragging');
           }
         });
         
         // Event listener for drag end
         outliner.addEventListener('dragend', (event) => {
           if (event.target.classList.contains('tree-button')) {
             event.target.classList.remove('dragging');
             draggedButton = null;
           }
         });
         
         // Event listener for drag over (allow drop)
         outliner.addEventListener('dragover', (event) => {
           event.preventDefault(); // Allow drop
           if (event.target.classList.contains('tree-button') && event.target !== draggedButton) {
             event.target.classList.add('hovered');
           }
         });
         
         // Event listener for drag leave (remove hover effect)
         outliner.addEventListener('dragleave', (event) => {
           if (event.target.classList.contains('tree-button')) {
             event.target.classList.remove('hovered');
           }
         });
         
         // Event listener for drop
         outliner.addEventListener('drop', async function (event) 
         {
            
           event.preventDefault();
           if (event.target.classList.contains('tree-button') && event.target !== draggedButton) {
             event.target.classList.remove('hovered');
         
             // Get the names of the objects
             const draggedObjectName = draggedButton.textContent;
             const targetObjectName = event.target.textContent;
         
             // Find the corresponding objects in the scene
             const draggedObject = scene.getObjectByName(draggedObjectName);
             const targetObject = scene.getObjectByName(targetObjectName);
             console.log(targetObject);
             if (draggedObject && targetObject) 
            {
                if(draggedObject.userData.keyframes||targetObject.userData.keyframes)
                {
                    showCustomAlert().then((result) => {
                        if (result) 
                        {
                          console.log("Yes was clicked, executing code...");
                          targetObject.add(draggedObject);
                          console.log(`${draggedObjectName} is now a child of ${targetObjectName}`);
                          for(let i=0; i<models.length;i++)
                          {
                          if(models[i].parent!=scene)
                          {
                            models.splice(i,1);
                          }
                          }
                          heirarchyChanged=true;                    
                          // Execute your code here if Yes was clicked
                        } else 
                        {
                          console.log("No or close was clicked, no action taken.");
                          // No action if No or Close was clicked
                        }
                      });
                }
                else
                {
                    // Add the dragged object as a child of the target object
                    targetObject.add(draggedObject);
                    console.log(`${draggedObjectName} is now a child of ${targetObjectName}`);
                    for(let i=0; i<models.length;i++)
                    {
                        if(models[i].parent!=scene)
                        {
                            models.splice(i,1);
                        }
                    }
                    heirarchyChanged=true;                 
                }
                
             }
             else if(draggedObject && !targetObject)
             {
                console.log('no target object, reverting to scene');
                draggedObject.parent.remove(draggedObject);
                draggedObject.userData.filename=draggedObject.name;
                models.push(draggedObject);
                scene.add(draggedObject);
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for(let i=0; i<models.length;i++)
                {
                    if(models[i].parent!=scene)
                    {
                        models.splice(i,1);
                    }
                }
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }
             }
           }
         });

    // Recursively traverse children
    if (object.children.length > 0) {
        const childList = document.createElement('ul');
        childList.classList.add('hidden');
        listItem.appendChild(childList);
        object.children.forEach(child => traverseScene(child, childList));
    }
}
function focusOnObject (object,camera,controls)
{

 const boundingBox = new THREE.Box3().setFromObject(object);

    // Calculate the center of the bounding box
    const center = boundingBox.getCenter(new THREE.Vector3());

    // Calculate the size of the bounding box
    const size = boundingBox.getSize(new THREE.Vector3());

    // Calculate the distance from the camera to fit the bounding box in view
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = Math.abs(0.5* (maxDim / Math.sin(fov / 2)));

    // Calculate camera position relative to the object's position
    const direction = camera.position.clone().sub(center).normalize();
    const newPosition = center.clone().add(direction.multiplyScalar(distance));


    // Set the camera position and target to focus on the center of the bounding box
    camera.position.copy(newPosition);
    camera.lookAt(center);
    controls.target.copy(center);    
}
function update2DTextattribute()
{
    const Textgroup=selectedObject;
    Textgroup.userData.startframe=0;
    Textgroup.userData.endframe=0;
    let TextMesh=selectedObject.children[0];
    let boxMesh=Textgroup.userData.box;
    if(box)
    {
        scene.remove(box);
    }
    box=new CustomPlaneHelper(boxMesh,0xff0000);
    scene.add(box);

    const attr=document.getElementById('container');
    attr.innerHTML="";

    const propertyElement = document.createElement('div');
    propertyElement.innerHTML = `<strong>Text Name:</strong> ${Textgroup.name.toUpperCase()}`; 
    attr.appendChild(propertyElement); 

   
    const div= document.createElement('div');
    const lbl1 = document.createElement("label");
    const textarea=document.createElement("textarea");
    textarea.rows='5';
    textarea.cols='30';
    textarea.id='multiline-input-2D';
    textarea.value=Textgroup.userData.TextParams.text;
    lbl1.appendChild(document.createTextNode("Enter 2D Text"));
    lbl1.appendChild(textarea);
    div.appendChild(lbl1);
    attr.appendChild(div);
    
    textarea.addEventListener('input',function(event){
        Textgroup.userData.TextParams.text=event.target.value; 
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        TextMesh.addEventListener('synccomplete',() => {
            const textHeight = TextMesh.textRenderInfo.blockBounds[3] - TextMesh.textRenderInfo.blockBounds[1]; // Get text height
            
            // Update the height of the box based on the text height
            if (textHeight > boxMesh.userData.height) 
            {
                boxMesh.userData.height = textHeight;
                boxMesh.geometry.parameters.height=textHeight;
                box.update();
                let cloneMesh=boxMesh.clone()
                Textgroup.userData.box=cloneMesh;
                cloneMesh.userData.width=boxMesh.userData.width;
                cloneMesh.userData.height=boxMesh.userData.height;
 // Adjust box scale
            }
        });
        Textgroup.add(TextMesh); 
        let sceneTree=document.getElementById('scene-tree');
        sceneTree.innerHTML='';
        for(let i=0; i<models.length;i++)
            {
                console.log('adding to outliner');
                const name=document.createElement('div');
                name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.appendChild(name);
                traverseScene(models[i], sceneTree);
            }  
    });
    attr.appendChild(textarea);

    const lblboxWidth=document.createElement('label');
    const boxWidth=document.createElement('input');
    boxWidth.id='boxWidth';
    boxWidth.value=boxMesh.userData.width;
    lblboxWidth.appendChild(document.createTextNode(" Text Box Width:"));
    lblboxWidth.appendChild(boxWidth);
    boxWidth.addEventListener('input',function(event){
        let width=event.target.value;
        let height=boxMesh.userData.height;
        boxMesh.geometry.parameters.width=width;
        scene.remove(box);
        boxMesh.position.copy(selectedObject.position);
        boxMesh.visible=false;
        boxMesh.userData.width=width;
        boxMesh.userData.height=height;
        box=new CustomPlaneHelper(boxMesh,0xff0000);
        scene.add(box);
        let cloneMesh=boxMesh.clone()
        Textgroup.userData.box=cloneMesh;
        cloneMesh.userData.width=boxMesh.userData.width;
        cloneMesh.userData.height=boxMesh.userData.height;

        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lblboxWidth); 

    const dropdown = document.createElement('select');
    dropdown.id = 'fonts';
    fonts.forEach((font, index) => {
        const option = document.createElement('option');
        option.text = font;
        option.value = index;
        dropdown.appendChild(option);
    });
    dropdown.addEventListener('change', (event) => {
        const selectedfont = fonts[parseInt(event.target.value)];
        Textgroup.userData.TextParams.font=selectedfont;
        textarea.style.fontFamily=selectedfont;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);
        
    });
        
   
    attr.appendChild(dropdown);

    const lbl2=document.createElement('label');
    const Bold=document.createElement('input');
    Bold.type='checkbox';
    Bold.checked=Textgroup.userData.TextParams.Bold;
    lbl2.appendChild(document.createTextNode("Bold"));
    lbl2.appendChild(Bold);
    Bold.addEventListener('change',function(){
        if(Bold.checked)
        {
            Textgroup.userData.TextParams.Bold=true;
            textarea.style.fontWeight='bold';
        }
        else
        {
            Textgroup.userData.TextParams.Bold=false;
            textarea.style.fontWeight='normal';
        }
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);

    });
    attr.appendChild(lbl2);

    const lbl3=document.createElement('label');
    const Italic=document.createElement('input');
    Italic.type='checkbox';
    Italic.checked=Textgroup.userData.TextParams.Italic;
    lbl2.appendChild(document.createTextNode("Italic"));
    lbl2.appendChild(Italic);
    Italic.addEventListener('change',function(){
        if(Italic.checked)
        {
            Textgroup.userData.TextParams.Italic=true;
            textarea.style.fontStyle='italic';
        }
        else
        {
            Textgroup.userData.TextParams.Italic=false;
            textarea.style.fontStyle='normal';
        }
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);    
    });
    attr.appendChild(lbl3);
    
    const right=document.createElement('button');
    right.textContent='right Align';
    right.class='alignment-button';
    right.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="right";
        textarea.style.textAlign='right';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(right);

    const left=document.createElement('button');
    left.textContent='left Align';
    left.class='alignment-button';
    left.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="left";
        textarea.style.textAlign='left';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(left);

    const center=document.createElement('button');
    center.textContent='center Align';
    center.class='alignment-button';
    center.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="center";
        textarea.style.textAlign='center';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(center);

    const justify=document.createElement('button');
    justify.textContent='justify';
    justify.class='alignment-button';
    justify.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="justify";
        //textarea.style.textAlign='justify';
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(justify);

    const lblColor=document.createElement('label');
    const Color=document.createElement('input');
    Color.id='Color';
    Color.type = 'color';
    Color.value = Textgroup.userData.TextParams.color;
    lblColor.appendChild(document.createTextNode("Color:"));
    lblColor.appendChild(Color);
    Color.addEventListener('input', function(event) {
        Textgroup.userData.TextParams.color = event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);                                   
    });
    attr.appendChild(lblColor);

    const lbl4=document.createElement('label');
    const size=document.createElement('input');
    size.id='size';
    size.value=Textgroup.userData.TextParams.fontSize;
    lbl4.appendChild(document.createTextNode("Size:"));
    lbl4.appendChild(size);
    size.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fontSize=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lbl4);

    const lblHeight=document.createElement('label');
    const lineHeight=document.createElement('input');
    lineHeight.id='lineHeight';
    lineHeight.value=Textgroup.userData.TextParams.lineHeight;
    lblHeight.appendChild(document.createTextNode("Line Height:"));
    lblHeight.appendChild(lineHeight);
    lineHeight.addEventListener('input',function(event){
        Textgroup.userData.TextParams.lineHeight=event.target.value;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lblHeight);
    
    const lblSpacing=document.createElement('label');
    const letterSpacing=document.createElement('input');
    letterSpacing.id='letterSpacing';
    letterSpacing.value=Textgroup.userData.TextParams.letterSpacing;
    lblSpacing.appendChild(document.createTextNode("Letter Spacing:"));
    lblSpacing.appendChild(letterSpacing);
    letterSpacing.addEventListener('input',function(event){
        Textgroup.userData.TextParams.letterSpacing=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblSpacing);

    const lblopacity=document.createElement('label');
    const fillOpacity=document.createElement('input');
    fillOpacity.id='fillOpacity';
    fillOpacity.value=Textgroup.userData.TextParams.fillOpacity;
    lblopacity.appendChild(document.createTextNode("Fill Opacity:"));
    lblopacity.appendChild(fillOpacity);
    fillOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fillOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblopacity);

    const lblstrcolor=document.createElement('label');
    const strokeColor=document.createElement('input');
    strokeColor.id='strokeColor';
    strokeColor.type='color';
    strokeColor.value=Textgroup.userData.TextParams.strokeColor;
    lblstrcolor.appendChild(document.createTextNode("Stroke Color:"));
    lblstrcolor.appendChild(strokeColor);
    strokeColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    
    attr.appendChild(lblstrcolor);

    const lblstrwidth=document.createElement('label');
    const strokeWidth=document.createElement('input');
    strokeWidth.id='strokeWidth';
    strokeWidth.value=Textgroup.userData.TextParams.strokeWidth;
    lblstrwidth.appendChild(document.createTextNode("Stroke Width:"));
    lblstrwidth.appendChild(strokeWidth);
    strokeWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstrwidth);

    const lblstropacity=document.createElement('label');
    const strokeOpacity=document.createElement('input');
    strokeOpacity.id='strokeWidth';
    strokeOpacity.value=Textgroup.userData.TextParams.strokeOpacity;
    lblstropacity.appendChild(document.createTextNode("Stroke Opacity:"));
    lblstropacity.appendChild(strokeOpacity);
    strokeOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeOpacity=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstropacity);

    const lbloutcolor=document.createElement('label');
    const outlineColor=document.createElement('input');
    outlineColor.id='outlineColor';
    outlineColor.type='color';
    outlineColor.value=Textgroup.userData.TextParams.outlineColor;
    lbloutcolor.appendChild(document.createTextNode("Outline Color:"));
    lbloutcolor.appendChild(outlineColor);
    outlineColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutcolor);

    const lbloutopacity=document.createElement('label');
    const outlineOpacity=document.createElement('input');
    outlineOpacity.id='outlineOpacity';
    outlineOpacity.value=Textgroup.userData.TextParams.outlineOpacity;
    lbloutopacity.appendChild(document.createTextNode("Outline Opacity:"));
    lbloutopacity.appendChild(outlineOpacity);
    outlineOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutopacity); 
    
    const lbloutwidth=document.createElement('label');
    const outlineWidth=document.createElement('input');
    outlineWidth.id='outlineWidth';
    outlineWidth.value=Textgroup.userData.TextParams.outlineWidth;
    lbloutwidth.appendChild(document.createTextNode("Outline Width:"));
    lbloutwidth.appendChild(outlineWidth);
    outlineWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutwidth); 

    const lbloutblur=document.createElement('label');
    const outlineBlur=document.createElement('input');
    outlineBlur.id='outlineBlur';
    outlineBlur.value=Textgroup.userData.TextParams.outlineBlur;
    lbloutblur.appendChild(document.createTextNode("Outline Blur:"));
    lbloutblur.appendChild(outlineBlur);
    outlineBlur.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineBlur=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutblur); 

    const lbloutoffX=document.createElement('label');
    const outlineOffsetX=document.createElement('input');
    outlineOffsetX.id='outlineOffsetX';
    outlineOffsetX.value=Textgroup.userData.TextParams.outlineOffsetX;
    lbloutoffX.appendChild(document.createTextNode("Outline X Offset:"));
    lbloutoffX.appendChild(outlineOffsetX);
    outlineOffsetX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffX); 

    const lbloutoffY=document.createElement('label');
    const outlineOffsetY=document.createElement('input');
    outlineOffsetY.id='outlineOffsetY';
    outlineOffsetY.value=Textgroup.userData.TextParams.outlineOffsetY;
    lbloutoffY.appendChild(document.createTextNode("Outline Y Offset:"));
    lbloutoffY.appendChild(outlineOffsetY);
    outlineOffsetY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffY); 

    const lblcurveRadius=document.createElement('label');
    const curveRadius=document.createElement('input');
    curveRadius.id='curveRadius';
    curveRadius.value=Textgroup.userData.TextParams.curveRadius;
    lblcurveRadius.appendChild(document.createTextNode("Curve Radius:"));
    lblcurveRadius.appendChild(curveRadius);
    curveRadius.addEventListener('input',function(event){
        Textgroup.userData.TextParams.curveRadius=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblcurveRadius); 

    const lblanchorX=document.createElement('label');
    const anchorX=document.createElement('input');
    anchorX.id='anchorX';
    anchorX.value=Textgroup.userData.TextParams.anchorX;
    lblanchorX.appendChild(document.createTextNode("anchorX:"));
    lblanchorX.appendChild(anchorX);
    anchorX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorX); 

    const lblanchorY=document.createElement('label');
    const anchorY=document.createElement('input');
    anchorY.id='anchorY';
    anchorY.value=Textgroup.userData.TextParams.anchorY;
    lblanchorY.appendChild(document.createTextNode("anchorY:"));
    lblanchorY.appendChild(anchorY);
    anchorY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorY);
    
    const animationElement = document.createElement('div');
    const element='TEXT ANIMATIONS';
    animationElement.innerHTML = `<strong>${element}</strong>` ; 
    attr.appendChild(animationElement); 
    
    const SeparateCharacters1=document.createElement('button');
    SeparateCharacters1.textContent='separate Characters';
    SeparateCharacters1.addEventListener('click',function(){
        Separate2DCharacters();
    });
    attr.appendChild(SeparateCharacters1);


    const lblstartframe=document.createElement('label');
    const startframe=document.createElement('input');
    startframe.id='startframe';
    lblstartframe.appendChild(document.createTextNode("start frame:"));
    lblstartframe.appendChild(startframe);
    startframe.addEventListener('input',function(event){
        Textgroup.userData.startframe=parseInt(event.target.value);
        console.log(Textgroup.userData.startframe);
    });
    attr.appendChild(lblstartframe);

    const lblendframe=document.createElement('label');
    const endframe=document.createElement('input');
    endframe.id='endframe';
    lblendframe.appendChild(document.createTextNode("end frame:"));
    lblendframe.appendChild(endframe);
    endframe.addEventListener('input',function(event){
        Textgroup.userData.endframe=parseInt(event.target.value);
        console.log(Textgroup.userData.endframe);
    });
    attr.appendChild(lblendframe);

    const CreateAnimation=document.createElement('button');
    CreateAnimation.textContent='Create Characters Visibility Animation';
    CreateAnimation.addEventListener('click',function(){
         CreateCharVisAnimation();
    });
    attr.appendChild(CreateAnimation); 
    
    const CreateAnimation1=document.createElement('button');
    CreateAnimation1.textContent='Create Words Visibility Animation';
    CreateAnimation1.addEventListener('click',function(){
         CreateWordVisAnimation();
    });
    attr.appendChild(CreateAnimation1);

    const CreateAnimation2=document.createElement('button');
    CreateAnimation2.textContent='Create characters Scale Animation';
    CreateAnimation2.addEventListener('click',function(){
        CreateCharZoomIn();
    });
    attr.appendChild(CreateAnimation2);

    const CreateAnimation3=document.createElement('button');
    CreateAnimation3.textContent='Create Words Scale Animation';
    CreateAnimation3.addEventListener('click',function(){
        CreateWordZoomIn();
    });
    attr.appendChild(CreateAnimation3);

    const CreateAnimation4=document.createElement('button');
    CreateAnimation4.textContent='Create Characters Opacity Animation';
    CreateAnimation4.addEventListener('click',function(){
        CreateCharOpacityAnim();
    });
    attr.appendChild(CreateAnimation4);

    const CreateAnimation5=document.createElement('button');
    CreateAnimation5.textContent='Create Words Opacity Animation';
    CreateAnimation5.addEventListener('click',function(){
        CreateWordOpacityAnim();
    });
    attr.appendChild(CreateAnimation5);

    const CreateAnimation6=document.createElement('button');
    CreateAnimation6.textContent='Create char rot Animation';
    CreateAnimation6.addEventListener('click',function(){
        CreateCharRotateAnim();
    });
    attr.appendChild(CreateAnimation6);

    const CreateAnimation7=document.createElement('button');
    CreateAnimation7.textContent='Create Word rot Animation';
    CreateAnimation7.addEventListener('click',function(){
        CreateWordRotateAnim();
    });
    attr.appendChild(CreateAnimation7);

    const CreateAnimation8=document.createElement('button');
    CreateAnimation8.textContent='Create Char Position Animation';
    CreateAnimation8.addEventListener('click',function(){
        CreateCharPositionAnim();
    });
    attr.appendChild(CreateAnimation8);

    const CreateAnimation9=document.createElement('button');
    CreateAnimation9.textContent='Create Word Position Animation';
    CreateAnimation9.addEventListener('click',function(){
        CreateWordPositionAnim();
    });
    attr.appendChild(CreateAnimation9);
}
function update3DTextattribute()
{
    const Textgroup=selectedObject;
    Textgroup.userData.startframe=0;
    Textgroup.userData.endframe=0;
    let TextMesh=selectedObject.children[0];
    let Textbox3D=selectedObject.userData.box3D;
    if(box3D)
    {
            scene.remove(box3D);
    }
    box3D=new BoxHelperCustom(Textbox3D);
    scene.add(box3D);
    
    const attr=document.getElementById('container');
    attr.innerHTML="";

    const propertyElement = document.createElement('div');
    propertyElement.innerHTML = `<strong>Text Name:</strong> ${Textgroup.name.toUpperCase()}`; 
    attr.appendChild(propertyElement); 

    const div= document.createElement('div');
    const lbl1 = document.createElement("label");
    const textarea=document.createElement("textarea");
    textarea.rows='5';
    textarea.cols='30';
    textarea.value=Textgroup.userData.TextParams.text;
    textarea.id='multiline-input';
    lbl1.appendChild(document.createTextNode("Enter 3D Text"));
    lbl1.appendChild(textarea);
    div.appendChild(lbl1);
    attr.appendChild(div);
    //Text3DList.push(group);
    textarea.addEventListener('input',function(event){
        Textgroup.userData.TextParams.text=event.target.value; 
        create3DText(Textgroup.userData.TextParams,Textbox3D ).then((Text)=>
        {
            if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=Text;
            Textgroup.add(TextMesh);
            TextMesh.geometry.computeBoundingBox();
            let textHeight=TextMesh.geometry.boundingBox.max.y-TextMesh.geometry.boundingBox.min.y;
            //console.log(textHeight);
            if(textHeight>Textbox3D.userData.height)
            {
                
                Textbox3D.userData.height = textHeight;
                const geometry=new THREE.BoxGeometry(Textbox3D.userData.width,textHeight,Textbox3D.userData.depth);
                Textbox3D.geometry.dispose();
                Textbox3D.geometry=geometry;
                //box3D.update();
                //box3D=new BoxHelperCustom(boxMesh3D);
                box3D.update();
                const cloneMesh=Textbox3D.clone();
                Textgroup.userData.box3D=cloneMesh;
                cloneMesh.userData.width=Textbox3D.userData.width;
                cloneMesh.userData.height=Textbox3D.userData.height;
                cloneMesh.userData.depth=Textbox3D.userData.depth;

            }
            let sceneTree=document.getElementById('scene-tree');
            sceneTree.innerHTML='';
            for(let i=0; i<models.length;i++)
                {
                    console.log('adding to outliner');
                    const name=document.createElement('div');
                    name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
                    const sceneTree = document.getElementById('scene-tree');
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree);
                }
        }).catch((error) => {
            console.error('Error adding text to scene:', error);
        });
    })
    attr.appendChild(textarea);

    const lblboxWidth=document.createElement('label');
    const boxWidth=document.createElement('input');
    boxWidth.id='boxWidth';
    boxWidth.value=Textbox3D.userData.width;
    lblboxWidth.appendChild(document.createTextNode(" Text Box Width:"));
    lblboxWidth.appendChild(boxWidth);
    boxWidth.addEventListener('input',function(event)
    {
        Textbox3D.userData.width = event.target.value;
        const geometry=new THREE.BoxGeometry(Textbox3D.userData.width,Textbox3D.userData.height,Textbox3D.userData.depth);
        Textbox3D.geometry.dispose();
        Textbox3D.geometry=geometry;
        box3D.update();
        const cloneMesh=Textbox3D.clone();
        Textgroup.userData.box3D=cloneMesh;
        cloneMesh.userData.width=Textbox3D.userData.width;
        cloneMesh.userData.height=Textbox3D.userData.height;
        cloneMesh.userData.depth=Textbox3D.userData.depth;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
        {
            TextMesh=Text;
            Textgroup.add(TextMesh);  
        }).catch((error) => {
            console.error('Error adding text to scene:', error);
        });
    });
    attr.appendChild(lblboxWidth); 

    const dropdown = document.createElement('select');
    dropdown.id = 'fonts';
    fonts.forEach((font, index) => {
        const option = document.createElement('option');
        option.text = font;
        option.value = index;
        dropdown.appendChild(option);
        if(Textgroup.userData.TextParams.font==font)
        {
            dropdown.value=index;
        }
    });
    
    dropdown.addEventListener('change', (event) => {
        const selectedfont = fonts[parseInt(event.target.value)];
        Textgroup.userData.TextParams.font=selectedfont;
        textarea.style.fontFamily=selectedfont;
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(dropdown);

    const lbl2=document.createElement('label');
    const Bold=document.createElement('input');
    Bold.type='checkbox';
    Bold.checked=Textgroup.userData.TextParams.Bold;
    lbl2.appendChild(document.createTextNode("Bold"));
    lbl2.appendChild(Bold);
    Bold.addEventListener('change',function(){
        if(Bold.checked)
        {
            Textgroup.userData.TextParams.Bold=true;
            textarea.style.fontWeight='bold';
        }
        else
        {
            Textgroup.userData.TextParams.Bold=false;
            textarea.style.fontWeight='normal';
        }
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(lbl2);

    const lbl3=document.createElement('label');
    const Italic=document.createElement('input');
    Italic.type='checkbox';
    Italic.checked=Textgroup.userData.TextParams.Italic;
    lbl2.appendChild(document.createTextNode("Italic"));
    lbl2.appendChild(Italic);
    Italic.addEventListener('change',function(){
        if(Italic.checked)
        {
            Textgroup.userData.TextParams.Italic=true;
            textarea.style.fontStyle='italic';
        }
        else
        {
            Textgroup.userData.TextParams.Italic=false;
            textarea.style.fontStyle='normal';
        }
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(lbl3);
    
    const right=document.createElement('button');
    right.textContent='right Align';
    right.class='alignment-button';
    right.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="right";
        document.getElementById('multiline-input').style.textAlign='right';
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(right);

    const left=document.createElement('button');
    left.textContent='left Align';
    left.class='alignment-button';
    left.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="left";
        document.getElementById('multiline-input').style.textAlign='left';
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(left);

    const center=document.createElement('button');
    center.textContent='center Align';
    center.class='alignment-button';
    center.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="center";
        document.getElementById('multiline-input').style.textAlign='center';
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(center);

    const lblColor=document.createElement('label');
    const Color=document.createElement('input');
    Color.id='Color';
    Color.type = 'color';
    Color.value = Textgroup.userData.TextParams.color;
    lblColor.appendChild(document.createTextNode("Color:"));
    lblColor.appendChild(Color);
    Color.addEventListener('input', function(event) {
        Textgroup.userData.TextParams.color = event.target.value;
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });                                        
    });
    attr.appendChild(lblColor);

    const lbl4=document.createElement('label');
    const size=document.createElement('input');
    size.id='size';
    size.value=Textgroup.userData.TextParams.size;
    lbl4.appendChild(document.createTextNode("Size:"));
    lbl4.appendChild(size);
    size.addEventListener('input',function(event){
        Textgroup.userData.TextParams.size=event.target.value;
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl4);

    const lbl5=document.createElement('label');
    const depth=document.createElement('input');
    depth.id='depth';
    depth.value=Textgroup.userData.TextParams.depth;
    lbl5.appendChild(document.createTextNode("Depth:"));
    lbl5.appendChild(depth);
    depth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.depth=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl5);
    
    const lblCurve=document.createElement('label');
    const curveSegments=document.createElement('input');
    curveSegments.id='curve-segments';
    curveSegments.value=Textgroup.userData.TextParams.curveSegments;
    lblCurve.appendChild(document.createTextNode("Curve Segments:"));
    lblCurve.appendChild(curveSegments);
    curveSegments.addEventListener('input',function(event){
        Textgroup.userData.TextParams.curveSegments=parseInt(event.target.value);
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lblCurve);
    
    const lblbevel=document.createElement('label');
    const Bevel=document.createElement('input');
    Bevel.type='checkbox';
    Bevel.checked=Textgroup.userData.TextParams.bevelEnabled;
    lblbevel.appendChild(document.createTextNode("Enable Bevel"));
    lblbevel.appendChild(Bevel);
    Bevel.addEventListener('change',function(){
        if(Bevel.checked)
        {
            Textgroup.userData.TextParams.bevelEnabled=true;
           
        }
        else
        {
            Textgroup.userData.TextParams.bevelEnabled=false;
           
        }
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(lblbevel);

    const lbl6=document.createElement('label');
    const BevelThickness=document.createElement('input');
    BevelThickness.id='BevelThickness';
    BevelThickness.value=Textgroup.userData.TextParams.bevelThickness;
    lbl6.appendChild(document.createTextNode("Bevel Thickness:"));
    lbl6.appendChild(BevelThickness);
    BevelThickness.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelThickness=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl6);

    const lbl7=document.createElement('label');
    const BevelSize=document.createElement('input');
    BevelSize.id='BevelSize';
    BevelSize.value=Textgroup.userData.TextParams.bevelSize;
    lbl7.appendChild(document.createTextNode("Bevel Size:"));
    lbl7.appendChild(BevelSize);
    BevelSize.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelSize=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl7);

    const lbl8=document.createElement('label');
    const BevelOffset=document.createElement('input');
    BevelOffset.id='BevelOffset';
    BevelOffset.value=Textgroup.userData.TextParams.bevelOffset;
    lbl8.appendChild(document.createTextNode("Bevel Offset:"));
    lbl8.appendChild(BevelOffset);
    BevelOffset.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelOffset=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,Textbox3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl8);

    const SeparateCharacters1=document.createElement('button');
    SeparateCharacters1.textContent='Separate Into Characters';
    SeparateCharacters1.addEventListener('click',function(){
        SeparateCharacters();
    });
    attr.appendChild(SeparateCharacters1);

    const lblstartframe=document.createElement('label');
    const startframe=document.createElement('input');
    startframe.id='startframe';
    lblstartframe.appendChild(document.createTextNode("start frame:"));
    lblstartframe.appendChild(startframe);
    startframe.addEventListener('input',function(event){
        Textgroup.userData.startframe=parseInt(event.target.value);
        console.log(Textgroup.userData.startframe);
    });
    attr.appendChild(lblstartframe);

    const lblendframe=document.createElement('label');
    const endframe=document.createElement('input');
    endframe.id='endframe';
    lblendframe.appendChild(document.createTextNode("end frame:"));
    lblendframe.appendChild(endframe);
    endframe.addEventListener('input',function(event){
        Textgroup.userData.endframe=parseInt(event.target.value);
        console.log(Textgroup.userData.endframe);
    });
    attr.appendChild(lblendframe);

    const CreateAnimation1=document.createElement('button');
    CreateAnimation1.textContent='Create Characters Pos Animation';
    CreateAnimation1.addEventListener('click',function(){
        create3DCharPosAnim();
    });
    attr.appendChild(CreateAnimation1);

    const CreateAnimation2=document.createElement('button');
    CreateAnimation2.textContent='Create Characters Rot Animation';
    CreateAnimation2.addEventListener('click',function(){
        create3DCharRotAnim();
    });
    attr.appendChild(CreateAnimation2);

    const CreateAnimation3=document.createElement('button');
    CreateAnimation3.textContent='Create Characters scale Animation';
    CreateAnimation3.addEventListener('click',function(){
        create3DCharScaleAnim();
    });
    attr.appendChild(CreateAnimation3);

    const CreateAnimation4=document.createElement('button');
    CreateAnimation4.textContent='Create Words Pos Animation';
    CreateAnimation4.addEventListener('click',function(){
        create3DWordPosAnim();
    });
    attr.appendChild(CreateAnimation4);

    const CreateAnimation5=document.createElement('button');
    CreateAnimation5.textContent='Create Words Rot Animation';
    CreateAnimation5.addEventListener('click',function(){
        create3DWordRotAnim();
    });
    attr.appendChild(CreateAnimation5);

    const CreateAnimation6=document.createElement('button');
    CreateAnimation6.textContent='Create Words Scale Animation';
    CreateAnimation6.addEventListener('click',function(){
        create3DWordScaleAnim();
    });
    attr.appendChild(CreateAnimation6);
    
}
function updateCameraAttributes()
{
    if(selectedObject && selectedObject.userData.camera)
    {
        const attr=document.getElementById("container")
        attr.innerHTML='';
        const selectedCamera=selectedObject.userData.camera;
        
        
        const nameElement = document.createElement('div');
        nameElement.innerHTML = `<strong>${selectedObject.name.toUpperCase()}:</strong>`; 
        attr.appendChild(nameElement); 

        for (const key in selectedCamera) {
            if (selectedCamera.hasOwnProperty(key)) 
            {  
                let value, propertyElement;
                switch(key)
                {   
                    case 'fov':
                        value = selectedCamera[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `${key}:`; 
                        attr.appendChild(propertyElement); 

                        const fovfield=document.createElement("input");
                        fovfield.id="fov";
                        fovfield.type="number";
                        fovfield.value=value;
                        fovfield.addEventListener('input',function(event){
                            selectedCamera.fov=parseFloat(event.target.value);
                            console.log(selectedCamera.fov);
                        })
                        propertyElement.appendChild(fovfield);

                        break;
                    case 'near':
                        value = selectedCamera[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `${key}:`; 
                        attr.appendChild(propertyElement); 

                        const nearfield=document.createElement("input");
                        nearfield.id="near";
                        nearfield.type="number";
                        nearfield.value=value;
                        nearfield.addEventListener('input',function(event){
                            selectedCamera.near=parseFloat(event.target.value);
                            //console.log(selectedCamera.fov);
                        })
                        propertyElement.appendChild(nearfield);

                        break;
                    case 'far':
                        value = selectedCamera[key];
                        propertyElement = document.createElement('div');
                        propertyElement.innerHTML = `${key}:`; 
                        attr.appendChild(propertyElement); 

                        const farfield=document.createElement("input");
                        farfield.id="far";
                        farfield.type="number";
                        farfield.value=value;
                        farfield.addEventListener('input',function(event){
                            selectedCamera.far=parseFloat(event.target.value);
                            //console.log(selectedCamera.fov);
                        })
                        propertyElement.appendChild(farfield);

                        break;
                    
                }
            }
        }
        
        const targetlabel=document.createElement('label');
        targetlabel.appendChild(document.createTextNode('Set Target'));
        const setTarget=document.createElement('input');
        setTarget.type='checkbox';
        setTarget.checked=selectedObject.userData.enableTarget;
        setTarget.addEventListener('click',function()
        {
            if(setTarget.checked)
            {
                selectedObject.userData.originalquaternion=selectedObject.quaternion;
                selectedObject.userData.enableTarget=true;
                const objectPosition = selectedObject.position.clone();
                const oppositePosition = objectPosition.clone().multiplyScalar(2).sub(selectedObject.userData.targetPosition);
                selectedObject.lookAt(oppositePosition);
                //selectedObject.lookAt(selectedObject.userData.targetPosition);
            }
            else
            {
                selectedObject.userData.enableTarget=false;
                selectedObject.quaternion=selectedObject.userData.originalquaternion;
            }
        });
        targetlabel.appendChild(setTarget);
        attr.appendChild(targetlabel);
        
        const labelX=document.createElement('label');
        labelX.appendChild(document.createTextNode("X:"));
        const X=document.createElement('input');
        X.type='number';
        X.value=selectedObject.userData.targetPosition.x;
        X.addEventListener('input', function(event){
            selectedObject.userData.targetPosition.x=parseFloat(event.target.value);
        });
        labelX.appendChild(X);
        attr.appendChild(labelX);

        const labelY=document.createElement('label');
        labelY.appendChild(document.createTextNode("Y:"));
        const Y=document.createElement('input');
        Y.type='number';
        Y.value=selectedObject.userData.targetPosition.y;
        Y.addEventListener('input', function(event){
            selectedObject.userData.targetPosition.y=parseFloat(event.target.value);
        });
        labelY.appendChild(Y);
        attr.appendChild(labelY);

        const labelZ=document.createElement('label');
        labelZ.appendChild(document.createTextNode("Z:"));
        const Z=document.createElement('input');
        Z.type='number';
        Z.value=selectedObject.userData.targetPosition.z;
        Z.addEventListener('input', function(event){
            selectedObject.userData.targetPosition.z=parseFloat(event.target.value);
        });
        labelZ.appendChild(Z);
        attr.appendChild(labelZ);

        const Pathdiv=document.createElement('div');
        Pathdiv.innerHTML=`<strong>Path Following<strong>`
        attr.appendChild(Pathdiv);

        const PathFollow=document.createElement('label');
        PathFollow.appendChild(document.createTextNode('select Path'));
        const Pathdropdown = document.createElement('select');
        Pathdropdown.id = 'Pathdropdown';
        
        Paths.forEach((path, index) => 
        {
            const option = document.createElement('option');
            option.text = path.name;
            option.value = index;
            Pathdropdown.appendChild(option);
        });
        Pathdropdown.addEventListener('change', (event) => 
        {
            selectedObject.userData.path=Paths[parseInt(event.target.value)];
            console.log(selectedObject.userData.path)
        });
        PathFollow.appendChild(Pathdropdown);
        attr.appendChild(PathFollow);

        const startlabel=document.createElement('label');
        startlabel.appendChild(document.createTextNode('Path start frame:'));
        const pathstart=document.createElement('input');
        pathstart.type='number';
        pathstart.value=selectedObject.userData.pathStartframe;
        pathstart.addEventListener('input',function(event){
            selectedObject.userData.pathStartframe=parseInt(event.target.value);
        });
        startlabel.appendChild(pathstart);
        attr.appendChild(startlabel);

        const endlabel=document.createElement('label');
        endlabel.appendChild(document.createTextNode('Path end frame:'));
        const pathend=document.createElement('input');
        pathend.type='number';
        pathend.value=selectedObject.userData.pathEndframe;
        pathend.addEventListener('input',function(event){
            selectedObject.userData.pathEndframe=parseInt(event.target.value);
        });
        endlabel.appendChild(pathend);
        attr.appendChild(endlabel);

        const sampleslabel=document.createElement('label');
        sampleslabel.appendChild(document.createTextNode('Path samples:'));
        const samples=document.createElement('input');
        samples.type='number';
        samples.value=selectedObject.userData.samplingFactor;
        samples.addEventListener('input',function(event){
            selectedObject.userData.samplingFactor=parseInt(event.target.value);
        });
        sampleslabel.appendChild(samples);
        attr.appendChild(sampleslabel);


        const labelPathenable=document.createElement('label');
        labelPathenable.appendChild(document.createTextNode('Enable Path Following'));
        const enablePath=document.createElement('input');
        enablePath.type='checkbox';
        enablePath.checked=selectedObject.userData.followPath;
        enablePath.addEventListener('click',function()
        {
            if(enablePath.checked)
            {
                selectedObject.userData.followPath=true;
                selectedObject.position.copy(selectedObject.userData.path.userData.controlPoints[0].position);
                getSampledPoints();
                updateTimeline();
                updateCurve();
            }
            else
            {
                selectedObject.userData.followPath=false;
                selectedObject.userData.keyframes=[];
            }
        });
        labelPathenable.appendChild(enablePath);
        attr.appendChild(labelPathenable);




        const depthHeader=document.createElement('div');
        depthHeader.innerHTML=`<strong>DOF controls<strong>`;
        attr.appendChild(depthHeader);


        const DOFlabel=document.createElement('label');
        DOFlabel.appendChild(document.createTextNode('Enable DOF:'));
        const isDOF=document.createElement('input');
        isDOF.type='checkbox';
        isDOF.checked=false;

        if(selectedObject.userData.enableDOF)
        {
            isDOF.checked=true;
        }
        else
        {
            isDOF.checked=false;
        }
        isDOF.addEventListener('click',function(){
            if(isDOF.checked==true)
            {
                selectedObject.userData.enableDOF=true;
            }
            else
            {
                selectedObject.userData.enableDOF=false;
            }

        });
        DOFlabel.appendChild(isDOF);
        attr.appendChild(DOFlabel);

        const focuslabel=document.createElement('label');
        focuslabel.appendChild(document.createTextNode('focus Distance:'))
        const focus=document.createElement('input');
        focus.type='number';
        focus.value=selectedObject.userData.focus;
        focus.addEventListener('input',function(event)
        {
            selectedObject.userData.focus=parseFloat(event.target.value);
            selectedObject.userData.composer.removePass(selectedObject.userData.outputpass);
            selectedObject.userData.composer.removePass(selectedObject.userData.bokehpass);
            selectedObject.userData.bokehpass=new BokehPass(scene,selectedCamera,
                                                            {
                                                                focus: selectedObject.userData.focus, // distance from camera where things are in focus
                                                                aperture: selectedObject.userData.aperture, // gap in the camera shutter.
                                                                maxblur: selectedObject.userData.maxblur, // amount of blur
                                                                width: window.innerWidth,
                                                                height: window.innerHeight,
                                                                farFocusDistance: selectedObject.userData.farFocusDistance
                                                            }
                                                            );
            selectedObject.userData.composer.addPass(selectedObject.userData.bokehpass);
            selectedObject.userData.composer.addPass(selectedObject.userData.outputpass);

        });
        focuslabel.appendChild(focus);
        attr.appendChild(focuslabel);

        const blurlabel=document.createElement('label');
        blurlabel.appendChild(document.createTextNode('Maximum blur:'))
        const maxblur=document.createElement('input');
        maxblur.type='number';
        maxblur.value=selectedObject.userData.maxblur;
        maxblur.addEventListener('input',function(event)
        {
            selectedObject.userData.maxblur=parseFloat(event.target.value);
            selectedObject.userData.composer.removePass(selectedObject.userData.outputpass);
            selectedObject.userData.composer.removePass(selectedObject.userData.bokehpass);
            selectedObject.userData.bokehpass=new BokehPass(scene,selectedCamera,
                                                            {
                                                                focus: selectedObject.userData.focus, // distance from camera where things are in focus
                                                                aperture: selectedObject.userData.aperture, // gap in the camera shutter.
                                                                maxblur: selectedObject.userData.maxblur, // amount of blur
                                                                width: window.innerWidth,
                                                                height: window.innerHeight,
                                                                farFocusDistance: selectedObject.userData.farFocusDistance
                                                            }
                                                            );
            selectedObject.userData.composer.addPass(selectedObject.userData.bokehpass);
            selectedObject.userData.composer.addPass(selectedObject.userData.outputpass);

        });
        blurlabel.appendChild(maxblur);
        attr.appendChild(blurlabel);
        

        const sequenceHeader = document.createElement('div');
        sequenceHeader.innerHTML = `<strong>Sequence framing<strong>`; 
        attr.appendChild( sequenceHeader); 

        if(selectedObject.userData.startframe ===undefined)
        selectedObject.userData.startframe=null;
        if(selectedObject.userData.endframe===undefined)
        selectedObject.userData.endframe=null;

        const framediv1=document.createElement("div");
        framediv1.innerHTML=`Start frame:`
        attr.appendChild(framediv1);
        const startfield= document.createElement("input");
        startfield.id="start_frame";
        startfield.type="text";
        startfield.value=selectedObject.userData.startframe;
        startfield.addEventListener("input",function(event){
            selectedObject.userData.startframe=parseInt(event.target.value);
            //console.log( selectedObject.userData.startfield)
        });
        framediv1.appendChild(startfield);
        
        const framediv2=document.createElement("div");
        framediv2.innerHTML=`End frame:`
        attr.appendChild(framediv2);
        const endfield= document.createElement("input");
        endfield.id="end_frame";
        endfield.type="text";
        endfield.value=selectedObject.userData.endframe;
        endfield.addEventListener("input",function(event){
            selectedObject.userData.endframe=parseInt(event.target.value);
            //console.log( selectedObject.userData.endfield)
        });
        framediv2.appendChild(endfield);

        const Btn=document.createElement("button");
        Btn.textContent="Use Selected Camera";
        Btn.id="camera-change";
        
        Btn.addEventListener("click",function(){
            if(cameraChanged==false)
            {
                cameraChanged=true;
                Btn.textContent="Change back";
                activecamera=selectedCamera;
            }
            else
            {
                cameraChanged=false;
                Btn.textContent="Use Selected Camera";
                activecamera=currentCamera;
            }
             
             
        });

        attr.appendChild(Btn);


    }
}
function updateParticleSystem()
{
    let attr=document.getElementById('container');
    attr.innerHTML='';
    if(selectedObject.name.includes('Particle_System'))
    {
        let selectedPSystem;
        let index;
        for(let i=0;i<ParticleSystems.length;i++)
        {
            if(selectedObject.name.includes(ParticleSystems[i].name))
            {
                selectedPSystem=ParticleSystems[i];
                console.log(selectedPSystem);
                index=i;
            }
        }
        const name=document.createElement('div');
        name.id="name"+index;
        name.innerHTML=`<strong>${selectedPSystem.name}</strong>`;
        attr.appendChild(name);

        for(const key in selectedPSystem.Params)
        {
            let value, propertyElement;
            switch(key)
            {
                
                case 'size':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>${key}:</strong>`; 
                    attr.appendChild(propertyElement); 
                    const size=document.createElement('input');
                    size.id='Particle_size'
                    size.type='text';
                    size.value=value;
                    size.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.size=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ size: parseFloat(event.target.value)});
                    });
                    attr.appendChild(size);
                    break;
                case 'lifespan':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>${key}(in seconds):</strong>`; 
                    attr.appendChild(propertyElement);
                    const lifespan=document.createElement('input');
                    lifespan.id='Particle_lifespan'
                    lifespan.type='text';
                    lifespan.value=value;
                    lifespan.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.lifespan=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ lifespan:parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(lifespan);
                    break;  
                case 'opacity':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>Particle ${key}:</strong>`; 
                    attr.appendChild(propertyElement);
                    const opacity=document.createElement('input');
                    opacity.id='Particle_opacity'
                    opacity.type='text';
                    opacity.value=value;
                    opacity.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.opacity=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ opacity: parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(opacity);
                    break;  
                case 'speed':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>${key}:</strong>`; 
                    attr.appendChild(propertyElement);
                    const speed=document.createElement('input');
                    speed.id='Particle_speed'
                    speed.type='text';
                    speed.value=value;
                    speed.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.speed=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ speed: parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(speed);
                    break;  
                case 'maxParticles':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong> Max Particles(discrete numbers):</strong>`; 
                    attr.appendChild(propertyElement);
                    const maxParticles=document.createElement('input');
                    maxParticles.id='Particle_maxParticles'
                    maxParticles.type='text';
                    maxParticles.value=value;
                    maxParticles.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.maxParticles=parseInt(event.target.value);
                        selectedPSystem.Emitter.updateParams({ maxParticles: parseInt(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(maxParticles);
                    break;
                case 'gravity':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>${key}:</strong>`; 
                    attr.appendChild(propertyElement);
                    const gravity=document.createElement('input');
                    gravity.id='gravity';
                    gravity.type='text';
                    gravity.value=value;
                    gravity.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.gravity=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ gravity: parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(gravity);
                    break;
                case 'color':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>${key}:</strong>`; 
                    attr.appendChild(propertyElement);
                    const colorPicker = document.createElement('input');
                    colorPicker.type = 'color';
                    colorPicker.id = 'colorPicker';
                    colorPicker.value = value;
                    attr.appendChild(colorPicker); 
                    colorPicker.addEventListener('input', function(event) {
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        const selectedColorValue = event.target.value;
                        const selectedColor = new THREE.Color(selectedColorValue);
                        selectedPSystem.Params.color='#'+selectedColor.getHex().toString(16);
                        selectedPSystem.Emitter.updateParams({ color: '#'+selectedColor.getHex().toString(16)});
                    });
                    break;
                case 'sizeVariance':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>Size Variance:</strong>`; 
                    attr.appendChild(propertyElement);
                    const sliderVariance=document.createElement('input');
                    sliderVariance.type="range";
                    sliderVariance.min="0";
                    sliderVariance.max="1";
                    sliderVariance.value=value;
                    sliderVariance.id="Size Variation";
                    sliderVariance.step="0.01";
                    attr.appendChild(sliderVariance);
                    sliderVariance.addEventListener('change',function(){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.sizeVariance=parseFloat(this.value);
                        selectedPSystem.Emitter.updateParams({ sizeVariance: parseFloat(this.value)});

                        
                    });
                    break;
                case 'turbulenceStrength':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>Turbulence Strength:</strong>`; 
                    attr.appendChild(propertyElement);
                    const TurbulenceStrength=document.createElement('input');
                    TurbulenceStrength.id='TurbulenceStrength';
                    TurbulenceStrength.type='text';
                    TurbulenceStrength.value=value;
                    TurbulenceStrength.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.turbulenceStrength=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ turbulenceStrength: parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(TurbulenceStrength);
                    break;
                case 'turbulenceFrequency':
                    value = selectedPSystem.Params[key];
                    propertyElement = document.createElement('div');
                    propertyElement.innerHTML = `<strong>Turbulence Frequency:</strong>`; 
                    attr.appendChild(propertyElement);
                    const TurbulenceFrequency=document.createElement('input');
                    TurbulenceFrequency.id='TurbulenceFrequency';
                    TurbulenceFrequency.type='text';
                    TurbulenceFrequency.value=value;
                    TurbulenceFrequency.addEventListener('input',function(event){
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        //selectedPSystem.Emitter=null;
                        selectedPSystem.Params.turbulenceFrequency=parseFloat(event.target.value);
                        selectedPSystem.Emitter.updateParams({ turbulenceFrequency: parseFloat(event.target.value)});
                        //selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,selectedPSystem.map,selectedPSystem.EmitterMesh,scene);
                    });
                    attr.appendChild(TurbulenceFrequency);
                    break;
                    
            }
        }
        const propertyElementVortex = document.createElement('div');
        propertyElementVortex.innerHTML = `<strong>Vortex:</strong>`; 
        attr.appendChild(propertyElementVortex);

        const propertyElementPX=document.createElement('div');
        propertyElementPX.innerHTML = `Pos_X:`;
        attr.appendChild(propertyElementPX);
        const PX=document.createElement('input');
        PX.type='text'
        PX.value=selectedPSystem.Params.vortex.position.x;
        propertyElementPX.appendChild(PX);

        const propertyElementPY=document.createElement('div');
        propertyElementPY.innerHTML = `Pos_Y:`;
        attr.appendChild(propertyElementPY);
        const PY=document.createElement('input');
        PY.type='text';
        PY.value=selectedPSystem.Params.vortex.position.y;
        propertyElementPY.appendChild(PY);

        const propertyElementPZ=document.createElement('div');
        propertyElementPZ.innerHTML = `Pos_Z:`;
        attr.appendChild(propertyElementPZ);
        const PZ=document.createElement('input');
        PZ.type='text';
        PZ.value=selectedPSystem.Params.vortex.position.z;
        propertyElementPZ.appendChild(PZ);

        PX.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.position.x=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });
        PY.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.position.y=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });
        PZ.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.position.z=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });

        const propertyElementAxis=document.createElement('div');
        propertyElementAxis.innerHTML = `Axis`;
        attr.appendChild(propertyElementPY);

        const propertyElementAxisX=document.createElement('div');
        propertyElementAxisX.innerHTML = `X(0-1):`;
        attr.appendChild( propertyElementAxisX);
        const X=document.createElement('input');
        X.type='text';
        X.value=selectedPSystem.Params.vortex.axis.x;
        propertyElementAxisX.appendChild(X);

        const propertyElementAxisY=document.createElement('div');
        propertyElementAxisY.innerHTML = `Y(0-1):`;
        attr.appendChild( propertyElementAxisY);
        const Y=document.createElement('input');
        Y.type='text';
        Y.value=selectedPSystem.Params.vortex.axis.y;
        propertyElementAxisY.appendChild(Y);

        const propertyElementAxisZ=document.createElement('div');
        propertyElementAxisZ.innerHTML = `Z(0-1):`;
        attr.appendChild( propertyElementAxisZ);
        const Z=document.createElement('input');
        Z.type='text';
        Z.value=selectedPSystem.Params.vortex.axis.z;
        propertyElementAxisZ.appendChild(Z);

        X.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.axis.x=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });
        Y.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.axis.y=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });
        Z.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.axis.z=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });


        const propertyElementStrength=document.createElement('div');
        propertyElementStrength.innerHTML = `Strength:`;
        attr.appendChild(propertyElementStrength);
        const strength=document.createElement('input');
        strength.type='text'
        strength.value=selectedPSystem.Params.vortex.strength;
        propertyElementStrength.appendChild(strength);

        strength.addEventListener('input',function(event){
            selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
            selectedPSystem.Params.vortex.strength=parseFloat(event.target.value);
            let vortex=selectedPSystem.Params.vortex;
            selectedPSystem.Emitter.updateParams({vortex:vortex});
        });

       /* const propertyElement = document.createElement('div');
        propertyElement.innerHTML = `<strong>Map:</strong>`; 
        attr.appendChild(propertyElement); 
        const map=document.createElement('input');
        map.type = 'file';
        map.accept='image/*';
        map.id = 'colorMap';
        attr.appendChild(map);
        map.addEventListener('input', function(event) {
            var file = event.target.files[0];
            
            // Check if file is selected
            if (file) {
                // Read the selected file
                var reader = new FileReader();
                reader.onload = function(e) {
                    // Create an image element
                    var image = document.createElement('img');
                    // Set the image source to the data URL
                    image.src = e.target.result;
                    var textureLoader = new THREE.TextureLoader();
                    textureLoader.load(image.src, function(texture) {
                        selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                        selectedPSystem.Emitter=null;
                        selectedPSystem.Emitter=new ParticleEmitter(selectedPSystem.Params,texture,selectedPSystem.EmitterMesh,scene)
                        
                    });
                    
                    
                    
                    // Append the image to the document body or any other container
                    
                };
                // Read the file as data URL
                reader.readAsDataURL(file);
            }
            
            // Perform actions with the selected color
        });  */      
        const ForceButton = document.createElement('button');
        ForceButton.textContent='Add force';
        attr.appendChild(ForceButton);
        ForceButton.addEventListener('click', function()
        {
            let force={
                name:'',
                X:0,
                Y:0,
                Z:0,
            }
            selectedPSystem.Params.forces.push(force);
            let i=selectedPSystem.Params.forces.length-1;
                for(const key in selectedPSystem.Params.forces[i])
                {
                    let value, propertyElement;
                    switch(key)
                    {
                            
                        case 'name':
                                value = selectedPSystem.Params.forces[i][key];
                                propertyElement = document.createElement('div');
                                propertyElement.innerHTML = `<strong>${key}:</strong>`; 
                                attr.appendChild(propertyElement); 
                                const name=document.createElement('input');
                                name.id='force_name'+i
                                name.type='text';
                                name.value=value;
                                name.addEventListener('input',function(event){
                                    //selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                                    //selectedPSystem.Params.size=parseFloat(event.target.value);
                                    //selectedPSystem.Emitter.updateParams({ lifespan: parseFloat(event.target.value)});
                                    selectedPSystem.Params.forces[i].name=event.target.value;
                                    //selectedPSystem.Emitter.updateParams({ lifespan: parseFloat(event.target.value)});
                                });
                                attr.appendChild(name);
                                break;
                        case 'X':
                                value = selectedPSystem.Params.forces[i][key];
                                propertyElement = document.createElement('div');
                                propertyElement.innerHTML = `<strong>Direction ${key}:</strong>`; 
                                attr.appendChild(propertyElement); 
                                const X =document.createElement('input');
                                X.id='force_X'+i
                                X.type='text';
                                X.value=value;
                                X.addEventListener('input',function(event){
                                    selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                                    //selectedPSystem.Params.size=parseFloat(event.target.value);
                                    selectedPSystem.Params.forces[i].X=parseFloat(event.target.value);
                                    let forces=selectedPSystem.Params.forces;
                                    console.log(forces);
                                    selectedPSystem.Emitter.updateParams({ forces:forces});


                                });
                                attr.appendChild(X);
                                break;
                        case 'Y':
                                value = selectedPSystem.Params.forces[i][key];
                                propertyElement = document.createElement('div');
                                propertyElement.innerHTML = `<strong>Direction ${key}:</strong>`; 
                                attr.appendChild(propertyElement); 
                                const Y =document.createElement('input');
                                Y.id='force_Y'+i
                                Y.type='text';
                                Y.value=value;
                                Y.addEventListener('input',function(event){
                                    //selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                                    //selectedPSystem.Params.size=parseFloat(event.target.value);
                                    //selectedPSystem.Emitter.updateParams({ lifespan: parseFloat(event.target.value)});
                                    selectedPSystem.Params.forces[i].Y=parseFloat(event.target.value);
                                    let forces=selectedPSystem.Params.forces;
                                    selectedPSystem.Emitter.updateParams({ forces:forces});

                                });
                                attr.appendChild(Y);
                                break;
                        case 'Z':
                                value = selectedPSystem.Params.forces[i][key];
                                propertyElement = document.createElement('div');
                                propertyElement.innerHTML = `<strong>Direction ${key}:</strong>`; 
                                attr.appendChild(propertyElement); 
                                const Z =document.createElement('input');
                                Z.id='force_Z'+i
                                Z.type='text';
                                Z.value=value;
                                Z.addEventListener('input',function(event){
                                    //selectedPSystem.Emitter.particles.forEach(p=>{scene.remove(p.points)});
                                    //selectedPSystem.Params.size=parseFloat(event.target.value);
                                    //selectedPSystem.Emitter.updateParams({ lifespan: parseFloat(event.target.value)});
                                    selectedPSystem.Params.forces[i].Z=parseFloat(event.target.value);
                                    let forces=selectedPSystem.Params.forces;
                                    selectedPSystem.Emitter.updateParams({ forces:forces});

                                });
                                attr.appendChild(Z);
                                break;   
                    }            
                }
            
        });
        
    }


}
function toggleChildrenVisibility(button) 
{
    let i
    const childList = button.parentElement.nextElementSibling;
    if (childList) 
    {
        const isVisible = !childList.classList.contains('hidden');
        childList.classList.toggle('hidden');
    
    const toggleButton = button.parentElement.querySelector('.toggle-button');
    if (toggleButton) 
    {
        toggleButton.textContent = isVisible ? '+' : '-';
    }
    } 
}
function onMouseClick(event) 
{
    document.removeEventListener('click',spriteClick,true);
    const panel=document.getElementById('texture-panel');
    panel.style.display="none";
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, currentCamera);
    let clicked = false;
    let shouldbreak=false;
    transformControls.detach();
    selectedObject=null;
    if(models.length>0)
    {
        const intersects = raycaster.intersectObjects(models,true);
        if (intersects.length > 0) 
        {
            
            selectedObject=intersects[0].object; 
            console.log(selectedObject);            
            while(selectedObject.parent!=scene) 
            {
                selectedObject=selectedObject.parent;
                
            }
            
            console.log(selectedObject.name); 
            addTransformcontrols(selectedObject);
            displayDimensionControls();
            
        }
        
    }
    if(lights.length>0)
    {
        const intersects = raycaster.intersectObjects(lights);
        //console.log(intersects.length );                             
        if (intersects.length > 0) 
        {
            if(intersects[0].object instanceof RectAreaLightHelper||intersects[0].object instanceof CustomPointLightHelper)
            {
                selectedObject = intersects[0].object.light;
                console.log('light ' + selectedObject.name + ' clicked');
            }
            else if(intersects[0].object.parent.parent!=scene)
            {
                console.log('light ' + intersects[0].object.parent.parent.name + ' clicked');          
                selectedObject = intersects[0].object.parent.parent;
                /*selectedObject.userData.light.quaternion.w=selectedObject.quaternion.w;
                selectedObject.userData.light.quaternion.x=selectedObject.quaternion.x;
                selectedObject.userData.light.quaternion.y=selectedObject.quaternion.y;
                selectedObject.userData.light.quaternion.z=selectedObject.quaternion.z;
                selectedObject.userData.light.shadow.camera.position.set(selectedObject.position)
                selectedObject.userData.light.shadow.camera.quaternion.copy(selectedObject.quaternion);
                selectedObject.userData.light.shadow.camera.updateProjectionMatrix();*/
            }
            else if(intersects[0].object.parent.parent==scene)
            {
                selectedObject = intersects[0].object.parent.light;
                console.log('light ' + selectedObject.name + ' clicked');
            }
                    
            console.log(selectedObject);
           // transformControls.layers.set(0);
            transformControls.detach();
            addTransformcontrols(selectedObject);
            updateAttributeEditorLight();
        } 
        /*else
        {
            detachTransformcontrols()
        }*/
    }
    if(lighttargets.length>0)
    {
        //transformControls.detach();
        const intersects = raycaster.intersectObjects(lighttargets);
        if (intersects.length > 0) 
        {
            console.log(selectedObject);
            selectedObject=intersects[0].object;
            transformControls.detach();
            addTransformcontrols(selectedObject);
                    //selectedObject.userData.light.target.position.copy(selectedObject.positon);
        }
                        
    }
    if(Text2DList.length>0)
    {
        const intersects=raycaster.intersectObjects(Text2DList);
        if(intersects.length > 0)
        {
            transformControls.detach();
            selectedObject=intersects[0].object.parent;
            console.log(selectedObject);
            addTransformcontrols(selectedObject);
            update2DTextattribute();    
        }
        else
        {
            if(box)
            {
                scene.remove(box);
            }
        }
    }  
    if(Text3DList.length>0)
    {
        console.log(Text3DList);
        const intersects=raycaster.intersectObjects(Text3DList);
        if(intersects.length > 0)
        {
            transformControls.detach();
            selectedObject=intersects[0].object.parent;
            console.log(selectedObject);
            addTransformcontrols(selectedObject);
            update3DTextattribute();    
        }
        else
        {
            if(box3D)
            {
                scene.remove(box3D);
            }
        }

    }
    if(cameraTracker.length>0)
    {
        const cameraselect=raycaster.intersectObjects(cameraTracker);
        //console.log(cameraselect);
        if (cameraselect.length>0)
        {   
            console.log(cameraselect[0].object)
            selectedObject=cameraselect[0].object.userData.pivot;
            console.log(selectedObject);
            addTransformcontrols(selectedObject);
            cameraselect[0].object.userData.camera.updateProjectionMatrix();
            console.log("Selected Camera "+cameraselect[0].object.name);
            //console.log(pivot.position);
            //console.log(rendercamera.position);
            //console.log(rendercamera.fov);
            //createAnimationCurveEditor(selectedObject)  
            //updatevalues(x,y,z,rotx,roty,rotz,scalex,scaley,scalez);
            //updateTimeline();  
            updateCameraAttributes();
            //scene.add(transformControls);
        }
    }
    if(Emitters.length>0)
    {
        const intersects=raycaster.intersectObjects(Emitters);
        if(intersects.length>0)
        {
            console.log(intersects[0].object);
            transformControls.detach();
            selectedObject=intersects[0].object;
            addTransformcontrols(selectedObject);
            updateParticleSystem();
        }
    }
    if(Paths.length>0)
    {
        if(selectedCurve)
        {
            const intersects=raycaster.intersectObjects(selectedCurve.userData.controlPoints,true)
            {
                if(intersects.length>0)
                {
                    selectedObject=intersects[0].object;
                    addTransformcontrols(selectedObject);
                }
            }
        }     
    }
    if(Hotspots.length>0)
    {
       
        const intersects=raycaster.intersectObjects(Hotspots,true);
        if(intersects.length>0)
        {
            selectedObject=intersects[0].object;
            addTransformcontrols(selectedObject);
        }
        document.addEventListener('click',spriteClick,true);
    }
    
}
function spriteClick(event)
{
    const panel=document.getElementById('texture-panel');
    panel.style.display="none";
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, currentCamera);
    if(Hotspots.length>0)
    {
        const intersects=raycaster.intersectObjects(Hotspots,true);
        let model,anim,clip,action;
        if(intersects.length>0)
        {
            const sprite=intersects[0].object;
            if(PrevSelectedHotspot==sprite && activecamera.position.equals(sprite.userData.finalposition))
            {
                mixer=null;
                return;
            }
            else
            {
                if(sprite.userData.animationModel&&sprite.userData.triggerAnimation)
                {
                    model=sprite.userData.animationModel;
                    anim=sprite.userData.triggerAnimation;
                    mixer=new THREE.AnimationMixer(model);
                    clip = THREE.AnimationClip.findByName(model.animations, anim);
                    action = mixer.clipAction(clip).setLoop(THREE.LoopOnce);
                }
                //console.log(model,anim);
                //mixer = new THREE.AnimationMixer(model);
                
                const position=sprite.userData.finalposition;
                const LookAtposition=sprite.userData.lookAt;
                const arcPath=calculateArcPath(position);
                const duration=3000;
                animateCameraLerp( arcPath, duration,LookAtposition,()=>
                {
                    if(action)
                    {
                        console.log('Camera movement complete. Playing animation.');
                        action.reset().play(); 
                        action.clampWhenFinished = true;
                    }
                    
                });

                PrevSelectedHotspot=sprite;  
            } 
        }
        
    }
}
function calculateArcPath(hotspotPosition) {
    const cameraPosition=activecamera.position;
    const sceneObjects=[];
    scene.traverse(obj=>{
        if(obj instanceof THREE.Mesh);
        sceneObjects.push(obj);
    })
    const MAX_ITERATIONS = 10; // Prevent infinite loops
    const radiusFactor = 0.5; // Base arc curvature factor
    const collisionOffset = 5; // Offset to avoid collisions

    // Calculate midpoint
    const midpoint = new THREE.Vector3()
        .addVectors(cameraPosition, hotspotPosition)
        .multiplyScalar(0.5);

    // Add variation to the offset
    const randomVariation = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize().multiplyScalar(cameraPosition.distanceTo(hotspotPosition) * radiusFactor);

    midpoint.add(randomVariation);

    // Avoid collisions
    let iteration = 0;
    while (iteration < MAX_ITERATIONS) {
        let collisionDetected = false;

        for (const obj of sceneObjects) {
            const bbox = new THREE.Box3().setFromObject(obj);

            if (bbox.containsPoint(midpoint)) {
                collisionDetected = true;

                // Move midpoint dynamically in a random direction
                const randomDirection = new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize();
                midpoint.add(randomDirection.multiplyScalar(collisionOffset));
                break;
            }
        }

        if (!collisionDetected) {
            break;
        }

        iteration++;
    }

    // Optional: Add a secondary control point for more dynamic curves
    const secondaryControlPoint = new THREE.Vector3()
        .addVectors(midpoint, hotspotPosition)
        .multiplyScalar(0.5)
        .add(randomVariation);

    // Return all control points for the path
    return [cameraPosition.clone(), midpoint,secondaryControlPoint ,hotspotPosition.clone()];
}
function animateCameraLerp( arcPath, duration,lookatposition,onComplete) 
{
    const curve = new THREE.QuadraticBezierCurve3(
        arcPath[0], // Start
        arcPath[1], // Control point
        //arcPath[2],
        arcPath[3] // End
    );

    const startTime = performance.now();

    function moveCamera() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize time (0 to 1)

        // Get position along the curve
        const position = curve.getPoint(t);

        if(position.y>=0)
        {
            activecamera.position.copy(position);
        }
        else
        {
            position.y=0;
            activecamera.position.copy(position);
        }
        

        // Focus on the target hotspot
        activecamera.lookAt(lookatposition);

        // Stop animation when t reaches 1
        if (t < 1) {
            requestAnimationFrame(moveCamera);
            console.log(activecamera.position);
        } else if (onComplete) {
            onComplete(); // Call the callback when animation completes
        }   
    }
    moveCamera();
}

document.addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key === 'g') 
    {
        event.preventDefault();
        console.log('grouping')
        let obj = selectedObjects[0].parent;
        let flag=true;
        for(let i=1;i<selectedObjects.length;i++)
        {
            if(obj==selectedObjects[i].parent)
            {
                flag=true;
            }
            else
            {
                flag=false;
                break;
            }
        }
        let userInput;

        if (selectedObjects.length > 0) 
        {
            const group = new THREE.Group();

            // Open dialog and wait for user input
            try {
                userInput = await openDialog(); // Wait for user input
                group.name = userInput; // Set the group name after getting input
            } catch (error) {
                console.log('User canceled input or an error occurred:', error);
                return; // Exit if the user cancels or input fails
            }

            // Add group to scene
            scene.add(group);
            for (let i = 0; i < selectedObjects.length; i++) {
                group.add(selectedObjects[i]);
            }
            if(flag)
            {
                if(obj!=scene)
                {
                obj.add(group);

                // Clear selected objects
                selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }
                }
                else
                {
                    group.userData.filename=group.name;
                    let i=0;
                    while(i<models.length)
                    {
                        let index=0;
                        while(index<selectedObjects.length)
                        {
                            if(models[i]==selectedObjects[index])
                            {
                                models.splice(i,1);
                                index++;
                            }
                            
                        }
                        i++;
                    }

                    models.push(group);
                    let j=0;
                    while(j<models.length)
                    {
                       if(models[j].children[0].length==0)
                       {
                        console.log('removing');
                        models.splice(j,1);
                       }
                        j++;
                    }
                    selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }
                }
            }
            else
            {
                group.userData.filename=group.name;
                models.push(group);
                selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }

            }
            
        }
    }
});
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'p') 
    {
        event.preventDefault();
        console.log('ungrouping');
        const group=selectedObjects[0].parent;
        const obj = selectedObjects[0].parent.parent;
        if(obj==scene)
        {
            alert('Ungrouping not possible, Scene is the parent');
            selectedObjects=[];
            return;
        }
       
        
        
            for (let i = 0; i < selectedObjects.length; i++) 
            {
                group.remove(selectedObjects[i]);
                obj.add(selectedObjects[i]);
            }
            //obj.remove(group);
            selectedObjects = [];

            // Update the scene tree
            const sceneTree = document.getElementById('scene-tree');
            sceneTree.innerHTML = ''; // Clear existing content
            for (let i = 0; i < models.length; i++) {
                const name = document.createElement('div');
                name.id = "name" + i;
                const newFilename = models[i].userData.filename;
                name.innerHTML = `<strong>${newFilename}:</strong>`;
                sceneTree.appendChild(name);
                traverseScene(models[i], sceneTree); // Rebuild scene tree
            }
            console.log('ungrouped');
    }
});
function onKeyDown(event) {
    const isInputFocused = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';
    
    if (isInputFocused) {
        // Do nothing if typing in a text box
        return;
    }
    //mesh and group
    if (event.key === 'd' || event.key === 'D') {
        if (axisHelperMode) {
            // Hide axis helper and reattach transform controls
            axisHelperMode = false;
            axisHelper.visible = false;

            if (selectedObject) {
                const offset = new THREE.Vector3().subVectors(axisHelper.position, selectedObject.position);
                selectedObject.position.add(offset);
                

                if (selectedObject instanceof THREE.Group) {
                    selectedObject.children.forEach(child => {
                        child.position.sub(offset);
                        if(child.geometry && child.userData.iscloned==true)
                            {
                                bloomScene.traverse(obj=>{
                                    if(obj.userData.cloneof==child)
                                    {
                                        const geometry1 = obj.geometry.clone();
                                        geometry1.applyMatrix4(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z));
                                        obj.geometry.dispose();
                                        obj.geometry = geometry1;
                                        console.log(obj.position);
                                    }
                                })
                            }
                        
                    });
                } else if (selectedObject.geometry) {
                    const geometry = selectedObject.geometry.clone();
                    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
                    selectedObject.geometry.dispose();
                    selectedObject.geometry = geometry;
                    /*if(selectedObject.userData.iscloned!==undefined&&selectedObject.userData.iscloned==true)
                        {
                            bloomScene.traverse(obj=>{
                                if(obj.userData.cloneof==selectedObject)
                                {
                                    const geometry1 = obj.geometry.clone();
                                    geometry1.applyMatrix4(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
                                    obj.geometry.dispose();
                                    obj.geometry = geometry1;
                                }
                            })
                        }*/
                }

                selectedObject.updateMatrixWorld();
                transformControls.attach(selectedObject);
                console.log(selectedObject.position);
            }
        } else if (selectedObject) {
            // Detach transform controls and show axis helper
            selectedObject.updateMatrixWorld();
            transformControls.detach();
            console.log(selectedObject.position);
            axisHelper.position.copy(selectedObject.position);
            axisHelper.visible = true;
            axisHelperMode = true;
            transformControls.attach(axisHelper);
        }
    }
    if (event.key === 's' || event.key === 'S') {
        if (!selectedObject) return;
        const timelineRect = timeline.getBoundingClientRect();
        const position=event.clientX - timelineRect.left;
        const cursorX = cursor.getBoundingClientRect().left - timelineRect.left;
        const frame = Math.round(cursorX / (timelineRect.width / totalFrames));
        setKeyframe(selectedObject, frame);
        createKeyframeMarker(frame);
        
    }
   
}
function openDialog() {
    return new Promise((resolve, reject) => {
        // Get elements
        const dialogBox = document.getElementById('dialogBox');
        const closeDialogBtn = document.getElementById('closeDialog');
        const submitBtn = document.getElementById('submitBtn');
        const userInputField = document.getElementById('userInput');

        // Show the dialog box
        dialogBox.style.display = 'flex';

        // Handle dialog submission
        submitBtn.addEventListener('click', function() {
            const userInput = userInputField.value;
            if (userInput.trim() !== '') {
                resolve(userInput); // Resolve with the user's input
                dialogBox.style.display = 'none'; // Close dialog
            } else {
                alert('Please enter a valid name!');
            }
        });

        // Handle dialog cancellation
        closeDialogBtn.addEventListener('click', function() {
            reject('User canceled the dialog'); // Reject if user cancels
            dialogBox.style.display = 'none'; // Close dialog
        });
    });
}
function showCustomAlert() {
    return new Promise((resolve) => {
      document.getElementById("customAlert").style.display = "flex";
  
      // Event listener for the Yes button
      document.getElementById("yesButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(true); // Resolves the promise with `true` if Yes is clicked
      });
  
      // Event listener for the No button
      document.getElementById("noButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(false); // Resolves the promise with `false` if No is clicked
      });
  
      // Event listener for the Close button
      document.getElementById("closeButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(false); // Also resolves as `false` if closed without Yes
      });
    });
}
function animate(timestamp)
{

    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateGUIValues();
    //const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta); // Update animations
    }
    renderer.render(scene,currentCamera);
    if(heirarchyChanged)
    {
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.innerHTML = ''; // Clear existing content
        for (let i = 0; i < models.length; i++) 
        {
            const name = document.createElement('div');
            name.id = "name" + i;
            const newFilename = models[i].userData.filename;
            name.innerHTML = `<strong>${newFilename}:</strong>`;
            sceneTree.appendChild(name);
            console.log("outliner updated");
            traverseScene(models[i], sceneTree); // Rebuild scene tree
        }
            heirarchyChanged=false;
            
    }
    if(focusFlag)
    {
        if (glowTimer <= glowDuration) 
        {
            const progress = Math.min(glowTimer / glowDuration, 1); // Ensure progress is between 0 and 1
            outlinePass.edgeStrength = startEdgeStrength * (1 - progress) + endEdgeStrength * progress;
            outlinePass.edgeGlow = startEdgeGlow * (1 - progress) + endEdgeGlow * progress;
            outlinePass.edgeThickness = startEdgeThickness * (1 - progress) + endEdgeThickness * progress;
            glowTimer += timestamp;
            composer.render()
        } 
        else 
        {
            outlinePass.selectedObjects = [];
            glowTimer = 0;
            focusFlag=false;
            renderer.render(scene,currentCamera);

        }
    }
    
    ParticleSystems.forEach(Psystem=>
    {
        Psystem.Emitter.update(delta);
        Psystem.Emitter.particles.forEach(p=>{p.points.lookAt(activecamera.position)});
    });

    scene.traverse(obj=>{  //spotlight update
        if(obj instanceof THREE.SpotLight)
        {
            obj.userData.helper.update();
        }
    });
    for(let i=0;i<lighttargets.length;i++) //light target update
    {
        const target=lighttargets[i];
        target.userData.light.target.position.copy(target.position);
        target.userData.light.userData.helper.update();
    }
    if(selectedObject)//2d and 3d box handling
    {
        if(selectedObject instanceof THREE.Group && (selectedObject.name.includes('3D')||selectedObject.name.includes('2D')))
        {
            if(selectedObject.userData.box)
            {
                const worldPosition = new THREE.Vector3();
                selectedObject.getWorldPosition(worldPosition);
                selectedObject.userData.box.position.copy(worldPosition);
                selectedObject.userData.box.quaternion.copy(selectedObject.quaternion);
                if(box)
                {
                    box.update();
                }
                else
                {
                    box=new CustomPlaneHelper( selectedObject.userData.box,0xff0000);
                    box.update();
    
                }
                
            }
            else if(selectedObject.userData.box3D)
            {
                //console.log(selectedObject.userData.box3D)
                const worldPosition = new THREE.Vector3();
                selectedObject.getWorldPosition(worldPosition);
                selectedObject.userData.box3D.position.copy(worldPosition);
                selectedObject.userData.box3D.quaternion.copy(selectedObject.quaternion);
                //console.log(selectedObject.userData.box3D.position);
                if(box3D)
                {
                    box3D.update();
                    //console.log(selectedObject.userData.box3D.position);
                }
                else
                {
                    box3D=new BoxHelperCustom( selectedObject.userData.box3D);
                    box3D.update();
            
                }
                        
            }
            else
            {
                if(box||box3D)
                {
                    scene.remove(box);
                    scene.remove(box3D);
                }
            }
        }

    }
    for(let i=0;i<cameraTracker.length;i++)
    {
        const obj=cameraTracker[i].parent;
        if( obj.userData.enableTarget==true)
        {
                const objectPosition = obj.position.clone();
                const oppositePosition = objectPosition.clone().multiplyScalar(2).sub(obj.userData.targetPosition);
                obj.lookAt(oppositePosition);
        }
    }
    
    if(cameraChanged)//camera change
    {
        
        if((selectedObject!=null && selectedObject.userData.camera)&&(activecamera!=currentCamera))
        {
            if(selectedObject.userData.camera)
            {
                const worldPosition=new THREE.Vector3();
                selectedObject.userData.camera.getWorldPosition(worldPosition);
                ParticleSystems.forEach(Psystem=>
                    {
                        Psystem.Emitter.update(delta);
                        Psystem.Emitter.particles.forEach(p=>{p.points.lookAt(worldPosition)});
                    });
                if(selectedObject.userData.enableDOF)
                {
                    selectedObject.userData.composer.render();
                }
                else
                {
                    renderer.render(scene,selectedObject.userData.camera);
                }
                
            }
           
            
        }
        else if(activecamera==currentCamera) 
        {
            console.log(activecamera);
            const worldPosition=new THREE.Vector3();
            activecamera.getWorldPosition(worldPosition);
            ParticleSystems.forEach(Psystem=>
                {
                    Psystem.Emitter.update(delta);
                    Psystem.Emitter.particles.forEach(p=>{p.points.lookAt(worldPosition)});
                });
            const pivot=activecamera.parent;
            if( pivot.userData.enableDOF)
            {
                pivot.userData.composer.render();
            }
            else
            {
                renderer.render(scene,activecamera);
            }
            

        }
        else
        {
            console.log(activecamera);
            const worldPosition=new THREE.Vector3();
            activecamera.getWorldPosition(worldPosition);
            ParticleSystems.forEach(Psystem=>
            {
                Psystem.Emitter.update(delta);
                Psystem.Emitter.particles.forEach(p=>{p.points.lookAt(worldPosition)});
               
            });
            renderer.render(scene,activecamera);
        }
        
    
    }
    if(textX&&textY&&textZ&&arrowX)
    {
        updateSpriteScale(textX);
        updateSpriteScale(textY);
        updateSpriteScale(textZ); 
    }
    
    if(dimensionGroup && models.includes(selectedObject))
    {
        dimensionGroup.position.copy(selectedObject.position)
    }
    updateCurve();
    updateHotspotScale();
    if(activecamera==currentCamera)
    {
        if(document.getElementById("camera-change"))
        document.getElementById("camera-change").textContent="Use Selected Camera";
    }
}


init();
document.addEventListener('dragover', handleDragOver, false);
document.addEventListener('drop', handleDrop, false);
//document.addEventListener('mouseup', onMouseUp);
document.addEventListener('dblclick', onMouseClick,true);
document.addEventListener('click',spriteClick,true);
document.addEventListener('keydown',onKeyDown,true);
document.addEventListener('mousedown', onMousedrag);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseup);
window.addEventListener('mousedown', (event) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
    }
  });
  
  window.addEventListener('mousemove', (event) => {
    if (event.buttons === 4) { // Middle mouse button is pressed
      event.preventDefault();
    }
  });
  
  window.addEventListener('mouseup', (event) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
    }
  });
animate();
export {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,lights,traverseScene,
        lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
        EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials,getUVSets,UVsets,index,fileNames,
        loadGLBFromDrive,updateTimeline,Paths,updateAttributeEditorLight,updateCameraAttributes,Hotspots,onKeyDown,setSelectedObject,updateParticleSystem};