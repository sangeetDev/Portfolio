import * as THREE from 'three';
import { GLTFLoader } from './CustomModelLoader/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { addTransformcontrols,detachTransformcontrols, hasTransformControlsAttached } from './transformControls/TransformContols.js';
import { createInfiniteGrid } from './GridHelper/Creategridhelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import { MeshBVH, acceleratedRaycast} from 'BVH';
import { mergeGeometries } from '../libs/mrdoob-three.js-a4dc70d/examples/jsm/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

let scene,Pcamera,Ocamera,renderer,orbitControls,transformControls;
const Paths=[];
let activecamera;
let cameraTracker=[];
let currentCamera;
let selectedObject;
let fileNames = [];
let index=-1;
let listIndex=-1;
let models=[];
let HDRI;

let Mixer=[];
const clock = new THREE.Clock();
let targetAzimuth = 0; // Horizontal rotation
let targetPolar = Math.PI / 2; // Vertical rotation (start at middle)
let azimuthVelocity = 0, polarVelocity = 0;
const dampingFactor = 0.95; // Controls how quickly inertia slows down
let sensitivity = 0.005;
let markers=[];
let showModels=[];
let orbit=false;
let rocket;
let stars, planets=[];
const pathPoints = [];
let pathCurve;
const tiltAngle = Math.PI / 6;
let targetPosition = [new THREE.Vector3(-3, -1.5, 0),new THREE.Vector3(1, 2, 0),new THREE.Vector3(3.5, -3, 0)],posIndex=0;
let isScrolling = false;
let scrollTimeout;
let progress = 0; // 0 to 1 (percentage of path)
const scrollSpeed = 0.00005; // Adjust for smoothness

async function init()
{
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    scene = new THREE.Scene();
    Pcamera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.001, 1000);
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 3; // Controls how much of the scene is visible

    Ocamera = new THREE.OrthographicCamera(
        -viewSize * aspect, // left
        viewSize * aspect,  // right
        viewSize,           // top
        -viewSize,          // bottom
        0.1,                // near (increase from 0.00001)
        100                 // far (adjust as needed)
    );
    Ocamera.position.set(0, 1.5, 3); // Move further back to avoid clipping
    Ocamera.zoom = 10; 
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
    Pcamera.position.set(0,1.5,3);
    Pcamera.lookAt(0,1.5,0);
    currentCamera=Pcamera;
    const grid=createInfiniteGrid();
    //scene.add(grid);
    //orbitControls = new OrbitControls(currentCamera, renderer.domElement);
    Pcamera.position.set(0,1.5,3);
    Pcamera.fov=30;
    //orbitControls.target.set(0,1.5,0);
    //orbitControls.update();
    transformControls = new TransformControls(currentCamera, renderer.domElement );

    //scene.add(transformControls);
    
    activecamera=currentCamera;
    
    const hdriTextureLoader = new RGBELoader().load('../Hdri/small_empty_room_3_4k.hdr', texture => 
    {    
        const gen = new THREE.PMREMGenerator(renderer);
       
        HDRI= gen.fromEquirectangular(texture).texture;
        //const envMap2 = gen2.fromEquirectangular(texture).texture;
        scene.environment = HDRI;
        //scene2.background = envMap2;
        
        texture.dispose();
        gen.dispose();
        //gen2.dispose();
    }); 
    const loader=new GLTFLoader();
    try 
    {
        let gltf0 = await loadGLB('../glb/Waving.glb');
        models.push(gltf0.scene);
        scene.add(models[0]);
        Mixer[0] = new THREE.AnimationMixer(models[0]);

        // Store the animations
        const animation0 = gltf0.animations;

         // Play the first animation (assuming there is at least one)
        if (animation0.length > 0) 
        {
            const action = Mixer[0].clipAction(animation0[0]);
            action.play();
        }
        
        let gltf1 = await loadGLB('../glb/Walking.glb');
        models.push(gltf1.scene);
        scene.add(models[1]);
        models[1].visible=false;
        
        Mixer[1] = new THREE.AnimationMixer(models[1]);

    // Store the animations
       let animation1= gltf1.animations;

    // Play the first animation (assuming there is at least one)
        if (animation1.length > 0) 
        {
            const action = Mixer[1].clipAction(animation1[1]);
            action.play();
        }
    
        let gltf2= await loadGLB('../glb/edu_marker.glb');
        models.push(gltf2.scene);
        scene.add(models[2]);
        models[2].position.set(-5,1,-8);

        let gltf3= await loadGLB('../glb/work_marker.glb');
        models.push(gltf3.scene);
        scene.add(models[3]);
        models[3].position.set(0,1,-8);

        let gltf4= await loadGLB('../glb/3D_marker.glb');
        models.push(gltf4.scene);
        scene.add(models[4]);
        models[4].position.set(5,1,-8);
    

    } catch (error) {
        console.error('Error loading GLBs:', error);
    }
    for(let i=0;i<3;i++)
    {
        const cylinder=new THREE.CircleGeometry(0.5,32);
        const material=new THREE.MeshBasicMaterial({color:0xffffff});
        const Marker=new THREE.Mesh(cylinder,material);
        Marker.rotation.x=-Math.PI/2;
        if(i==0)
            Marker.position.set(-4,0,-5);
        else if(i==1)
            Marker.position.set(0,0,-5);
        else
            Marker.position.set(4,0,-5);
        
        markers.push(Marker);
        scene.add(Marker);
    }
    
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 512; 
    canvas.height = 512;

    // Create a vertical gradient from sky (top) to ground (bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.01, "#48bfe3");  // Sky blue
    gradient.addColorStop(1, "#7400b8");  // Light beige

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert to a Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    scene.background = texture;




}
function loadGLB(url) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, 
            (gltf) => resolve(gltf), // Resolve when loaded
            undefined, 
            (error) => reject(error)  // Reject if there's an error
        );
    });
}
function switchCharacterForward(isWalking) {
    if (models[0] && models[1]) {
        models[0].visible = !isWalking;
        models[1].visible = isWalking;

        // Keep the position the same
        //models[1].position.copy(models[0].position);
        const cameraDirection = new THREE.Vector3();
        activecamera.getWorldDirection(cameraDirection);
        
        // Compute Y-axis rotation only
        const angleY = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Rotate the character to face opposite the camera
        models[1].rotation.set(0, angleY , 0);
        const direction = new THREE.Vector3();
        models[1].getWorldDirection(direction); // Get the character's forward direction

        // Move the character forward in the direction it's facing (only X & Z)
        models[1].position.x += direction.x * 0.035;
        models[1].position.z += direction.z * 0.035;
        activecamera.position.x+= direction.x * 0.035;
        activecamera.position.z += direction.z * 0.035;
    }
    if(isWalking==false)
    {
        models[0].position.copy(models[1].position);
       
    }
    for(let i=0; i<markers.length; i++)
    {
        if(isObjectInsideCircle(models[1],markers[i].position,0.25))
        {
            console.log("inside");
            showPanel(i);
            break;
        }
    }
}
async function showPanel(i)
{
    await fadeToBlackAndBack(i);
    if(i==2)
    {
        const btns=Array.from(document.querySelectorAll(".arrow"));
        console.log(btns);
        btns.forEach(b=>{
            b.style.display="flex";
        })
        try 
        {
            let gltf0 = await loadGLB('../glb/1000128101.glb');
            gltf0.scene.name="drill";
            let foundModel = showModels.find(model => model.name ===gltf0.scene.name);
            if(!foundModel)
            showModels.push(gltf0.scene);
            let gltf1=   await loadGLB('../glb/50203999.glb');
            gltf1.scene.name="sander";
            foundModel = showModels.find(model => model.name ===gltf1.scene.name);
            showModels.push(gltf1.scene);
            let gltf2=   await loadGLB('../glb/50150070.glb');
            gltf1.scene.name="sander2";
            foundModel = showModels.find(model => model.name ===gltf2.scene.name);
            showModels.push(gltf2.scene);
            let gltf3=   await loadGLB('../glb/1000801354.glb');
            gltf1.scene.name="showpiece";
            foundModel = showModels.find(model => model.name ===gltf3.scene.name);
            showModels.push(gltf3.scene);
            for(let i=0;i<showModels.length;i++)
            {
                if(i!=0)
                {
                    //showModels.position.x=i*9;
                    showModels[i].visible=false;
                }
                scene.add(showModels[i]);
            }
            let modelshowed=0;
            btns.forEach(b=>{
                b.addEventListener('click',function(){
                    if(b.id=="next")
                    {
                       showModels[modelshowed].visible=false;
                       if(modelshowed<showModels.length)
                       {
                            modelshowed++;
                            showModels[modelshowed].visible=true;
                       }
                    }
                    else if(b.id=='previous')
                    {
                        showModels[modelshowed].visible=false;
                        if(modelshowed>0)
                        {
                            modelshowed--;
                            showModels[modelshowed].visible=true;
                        }
                        
                    }
                })
            })
        } catch (error) {
            console.error('Error loading GLBs:', error);
        }
        const camera = new THREE.PerspectiveCamera(75,  window.innerWidth / window.innerHeight, 0.001, 1000);
        camera.position.set(0,0.1,0.25);
        activecamera=camera;
        orbitControls=new OrbitControls(activecamera,renderer.domElement);
        orbitControls.target.set(0,0.1,0);
        orbitControls.enableDamping=true;
        orbitControls.dampingFactor=0.01;
        orbitControls.update();
    }
    if(i==0 && planets.length==0 && !rocket)
    {
        try 
        {
            let rckt = await loadGLB('../glb/rocket.glb');
            rocket=rckt.scene;
            scene.add(rocket);
            rocket.position.set(-8,-4.5,0);

            let gltf0 = await loadGLB('../glb/Planet1.glb');
            gltf0.scene.name="Planet1";
            let foundModel = showModels.find(model => model.name ===gltf0.scene.name);
            (!foundModel)
            {
                planets.push(gltf0.scene);
                scene.add(planets[0]);
            }
            planets[0].position.set(-3,0,0);
            planets[0].rotation.x=-Math.PI/6;
            let gltf1 = await loadGLB('../glb/Planet2.glb');
            gltf1.scene.name="Planet2";
            foundModel = showModels.find(model => model.name ===gltf1.scene.name);
            (!foundModel)
            {
                planets.push(gltf1.scene);
                scene.add(planets[1]);
            }
            planets[1].position.set(1,4,0);
            planets[1].rotation.z=Math.PI/6;
            let gltf2 = await loadGLB('../glb/Planet3.glb');
            gltf2.scene.name="Planet3";
            foundModel = showModels.find(model => model.name ===gltf2.scene.name);
            (!foundModel)
            {
                planets.push(gltf2.scene);
                scene.add(planets[2]);
            }
            planets[2].position.set(5,-3,0);
            planets[2].rotation.x=Math.PI/6;
            planets[2].rotation.z=-Math.PI/6;
            let random=1;
            planets.forEach(planet=>{
                planet.scale.set(random,random,random);
                random++;

                const planetPos = planet.position;
                const orbitRadius = 0.5 * random; // Slightly outside the planet
                
                // Approach path (move towards the planet)
                if (i > 0) {
                    const prevPlanetPos = planets[i - 1].position;
                    pathPoints.push(new THREE.Vector3().lerpVectors(prevPlanetPos, planetPos, 0.8));
                }
            
                // Orbit points (spinning around the planet at an angle)
                const orbitDirection = (i === planets.length - 1) ? -1 : 1; // Reverse direction for last planet
            
                for (let j = 0; j < Math.PI * 2; j += Math.PI / 3) {
                    const angle = orbitDirection * j;
                    const orbitX = planetPos.x + orbitRadius * Math.cos(angle);
                    const orbitY = planetPos.y + orbitRadius * Math.sin(angle) * Math.cos(tiltAngle);
                    const orbitZ = planetPos.z + orbitRadius * Math.sin(angle) * Math.sin(tiltAngle);
                    pathPoints.push(new THREE.Vector3(orbitX, orbitY, orbitZ));
                
                    pathCurve = new THREE.CatmullRomCurve3(pathPoints, true);
                }
            })
            
        } catch (error) {
            console.error('Error loading GLBs:', error);
        }
        const aspect = window.innerWidth / window.innerHeight;
            const viewSize = 5; // Controls how much of the scene is visible

            const camera = new THREE.OrthographicCamera(
                -viewSize * aspect, // left
                viewSize * aspect,  // right
                viewSize,           // top
                -viewSize,          // bottom
                0.1,                // near (increase from 0.00001)
                100                 // far (adjust as needed)
            );
            camera.position.set(0, 0, 10); // Move further back to avoid clipping
            camera.zoom = 10; 
            orbitControls=new OrbitControls(camera,renderer.domElement);
            orbitControls.enableDamping=true;
            
            activecamera=camera;
            orbitControls.enableZoom=false;
            orbitControls.enablePan=false;
            orbitControls.enableDamping=true;
            orbitControls.dampingFactor=0.05;
            orbitControls.update();
            console.log(camera.position,camera.rotation)
            const grid=createInfiniteGrid();
            //scene.add(grid);

            const starCount = 500; // Number of stars
            stars = new THREE.Group(); // Group to hold all stars
            const starTexture = new THREE.TextureLoader().load('../textures/fx/star.png')
            for (let i = 0; i < starCount; i++) {
                const material = new THREE.SpriteMaterial({ 
                    map: starTexture, 
                    color: 0xffffff 
                });
                const star = new THREE.Sprite(material);
                
                // Randomly position stars in a sphere around the scene
                const radius = 10; // Spread radius
                const x = (Math.random() - 0.5) * 2 * radius;
                const y = (Math.random() - 0.5) * 2 * radius;
                const z = (Math.random() - 0.5) * 2 * radius;
                
                star.position.set(x, y, z);
                const randomScale = Math.random() * (0.1 - 0.05) + 0.05;
                star.scale.set(randomScale,randomScale,randomScale); // Adjust size of the star

                stars.add(star);
            }

            scene.add(stars);
    }
}
function fadeToBlackAndBack(i) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("fadeOverlay");

        // Fade to black
        overlay.style.opacity = 1;

        setTimeout(() => {
            // Fade back to normal
            overlay.style.opacity = 0;
            const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 512; 
        canvas.height = 512;

    // Create a vertical gradient from sky (top) to ground (bottom)
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if(i==2)
        {
            gradient.addColorStop(0.01, "#fefae0");  // Sky blue
            gradient.addColorStop(1, "#a44a3f");  // Light beige

        }
        if(i==0)
        {
            gradient.addColorStop(0.5, "#000814");
            gradient.addColorStop(0.9, "#3a0ca3");  // Sky blue
           
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert to a Three.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        scene.background = texture;

        markers.forEach(function(m){
            m.visible=false;
        });
        for( let i=0; i<models.length;i++)
        {
            models[i].visible=false;   
        }

            // Wait for the fade-out transition to complete before resolving
            setTimeout(resolve, 1000); // Adjust time based on CSS transition duration
        }, 1500); // Stay black for 1.5 seconds before fading back
    });
}
function isObjectInsideCircle(object, circleCenter, radius) {
    // Get the object's position (assuming it's a mesh)
    const objectPosition = object.position;

    // Calculate the distance in the X-Z plane (ignoring Y, since it's lying flat)
    const dx = objectPosition.x - circleCenter.x;
    const dz = objectPosition.z - circleCenter.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Return true if inside the circle, false otherwise
    return distance <= radius;
}
function switchCharacterBackward(isWalking) {
    if (models[0] && models[1]) {
        models[0].visible = !isWalking;
        models[1].visible = isWalking;

        // Keep the position the same
        //models[1].position.copy(models[0].position);
        const cameraDirection = new THREE.Vector3();
        activecamera.getWorldDirection(cameraDirection);
        
        // Compute Y-axis rotation only
        const angleY = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Rotate the character to face opposite the camera
        models[1].rotation.set(0, angleY +Math.PI, 0);
        const direction = new THREE.Vector3();
        models[1].getWorldDirection(direction); // Get the character's forward direction

        // Move the character forward in the direction it's facing (only X & Z)
        models[1].position.x += direction.x * 0.035;
        models[1].position.z += direction.z * 0.035;
        activecamera.position.x+= direction.x * 0.035;
        activecamera.position.z += direction.z * 0.035;

    }
    if(isWalking==false)
    {
        models[0].position.copy(models[1].position);
       
    }
}

/*function createRoomFromShape(height) {
    const boundaryPoints = getBoundaryVertices(Floor.geometry);
    const shape = new THREE.Shape(boundaryPoints);
    const extrudeSettings = {
        depth: height, // Height of the walls
        bevelEnabled: false, // No bevel for clean walls
    };

    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    extrudedGeometry.groups = extrudedGeometry.groups.filter(group => group.materialIndex !== 0);
    const material = [
        new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.BackSide }), // Walls
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0, side: THREE.BackSide })  // Top Cap
    ];
    const roomMesh = new THREE.Mesh(extrudedGeometry, material);
    roomMesh.rotation.x=-Math.PI/2
    scene.add(roomMesh)
    
}
function getBoundaryVertices(geometry) {
    geometry.computeVertexNormals(); // Ensure normals are calculated
    const pos = geometry.attributes.position.array;
    const index = geometry.index.array;

    const edges = new Map(); // Store edges with their frequency

    for (let i = 0; i < index.length; i += 3) {
        const v1 = index[i], v2 = index[i + 1], v3 = index[i + 2];

        // Add edges and track their occurrences
        addEdge(edges, v1, v2);
        addEdge(edges, v2, v3);
        addEdge(edges, v3, v1);
    }

    // Filter edges that only occur once (boundary edges)
    const boundaryEdges = [...edges.keys()].filter(key => edges.get(key) === 1);

    // Convert to ordered perimeter vertices
    return orderBoundaryEdges(boundaryEdges, pos);
}

// Helper function to track edge occurrences
function addEdge(edges, a, b) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`; // Store edge uniquely
    edges.set(key, (edges.get(key) || 0) + 1);
}

function orderBoundaryEdges(boundaryEdges, pos) {
    const orderedVertices = [];
    const edgeMap = new Map();

    boundaryEdges.forEach(edge => {
        const [a, b] = edge.split('-').map(Number);
        if (!edgeMap.has(a)) edgeMap.set(a, []);
        if (!edgeMap.has(b)) edgeMap.set(b, []);
        edgeMap.get(a).push(b);
        edgeMap.get(b).push(a);
    });

    // Start with any vertex
    let startVertex = parseInt(boundaryEdges[0].split('-')[0]);
    let currentVertex = startVertex;
    let prevVertex = null;

    do {
        orderedVertices.push(currentVertex);
        let neighbors = edgeMap.get(currentVertex);

        // Find next vertex (not the previous one)
        let nextVertex = neighbors.find(v => v !== prevVertex);
        prevVertex = currentVertex;
        currentVertex = nextVertex;
    } while (currentVertex !== startVertex && orderedVertices.length < boundaryEdges.length);

    // Convert to Vector2 points for Three.js Shape
    return orderedVertices.map(i => new THREE.Vector2(pos[i * 3], pos[i * 3 + 1]));
}*/

function setSelectedObject(obj)
{
    selectedObject=obj;
}

function Filedrop(event)
{
	 event.preventDefault();

    const file = event.dataTransfer.files[0];
    const file_mtl=event.dataTransfer.files[1];
    const fileName=file.name.toLowerCase();
    
   
    if (fileName.endsWith('.glb')) 
    {
        const reader = new FileReader();
        reader.onload = function(event) 
        {
            const loader = new GLTFLoader();
            loader.parse(event.target.result, '', function(gltf) 
            {
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
                        child.userData.showNormals=false;
                        
                        if (!child.geometry.boundsTree) 
                        {
                            child.userData.boundsTree = new MeshBVH(child.geometry);
                        }
                        

                       
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
                
            });
        };
        reader.readAsArrayBuffer(file);
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
function onMouseClick(event) 
{
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
            
        }
        
    }   
}

  
function animate()
{
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateCameraRotation();
    if (Mixer.length>0) 
    {
        for(let i=0;i<Mixer.length;i++)
        {
            if(models[i])
            Mixer[i].update(delta);
        }
    }
    const time = clock.getElapsedTime(); // Get elapsed time
    if(models[1])
    {
        const cameraDirection = new THREE.Vector3();
        Pcamera.getWorldDirection(cameraDirection);
        
        // Compute Y-axis rotation only
        const angleY = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Rotate the character to face opposite the camera
        models[0].rotation.set(0, angleY+Math.PI , 0);
    }
    if(models.length>3)
    {
        models[2].position.y = 0.5 + Math.sin(time) * 0.5;
        models[2].rotation.y += 0.01;
        models[3].position.y = 0.5+ Math.sin(time+2) * 0.5;
        models[3].rotation.y -= 0.01;
        models[4].position.y = 0.5+ Math.sin(time+4) * 0.5;
        models[4].rotation.y -= 0.01;
    }
    if (showModels.length>0 && !orbit)
    {
        showModels.forEach(function(m){
            m.rotation.y += 0.001;
        })
    }
    if(orbitControls)
    {
        orbitControls.update();
        
    }
    if(stars)
    {
        stars.children.forEach((star, i) => {
            const speed = 0.5 + Math.random(); // Random twinkle speed
            star.material.opacity = 0.5 + 0.5 * Math.sin(time * speed + i); // Range 0 to 1
        });
    }
    if(planets.length>0)
    {
        planets.forEach(function(m){
            m.rotation.y += 0.005;
        });
    }
    
    if (isScrolling ) {
        updateRocketPosition();
    }
    
    renderer.render(scene,activecamera);
}

init();
document.addEventListener('dragover', handleDragOver, false);
document.addEventListener('drop', handleDrop, false);
document.addEventListener('dblclick', onMouseClick,true);
document.addEventListener("keydown", (event) => {
    if (event.key === "w") {
        event.preventDefault();
        switchCharacterForward(true);
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "w") {
        switchCharacterForward(false);
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "s") {
        event.preventDefault();
        switchCharacterBackward(true);
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "s") {
        switchCharacterBackward(false);
    }
});
animate();
document.addEventListener("mousemove", (event) => {
   

    azimuthVelocity = -event.movementX * sensitivity; // Left/right rotation
    polarVelocity = -event.movementY * sensitivity; 
});
document.addEventListener('mousedown',()=>{
   orbit=true;
});
document.addEventListener('mouseup',()=>{
    orbit=false;
 });
document.addEventListener("wheel", (event) => {
    
    isScrolling = true; // Enable movement

    // Clear previous timeout and reset it
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false; // Stop movement after scrolling stops
    }, 2000); // Adjust delay to match natural scroll stop

    progress += event.deltaY * scrollSpeed;
    progress = Math.max(0, Math.min(1, progress));
});
function updateCameraRotation() {
    const radius = 3; // Distance from target

    let target;
    if (models[1]) {
        target = models[1].position;
    } else {
        target = new THREE.Vector3(0, 1.5, 3);
    }

    // Apply velocity to angles
    targetAzimuth += azimuthVelocity;
    targetPolar += polarVelocity;

    // Clamp vertical angle to prevent flipping
    targetPolar = Math.max(Math.PI / 3, Math.min(Math.PI / 2, targetPolar));

    // Apply damping (reduce velocity over time for inertia effect)
    azimuthVelocity *= dampingFactor;
    polarVelocity *= dampingFactor;

    // Calculate new camera position
    Pcamera.position.x = target.x + radius * Math.sin(targetPolar) * Math.sin(targetAzimuth);
    Pcamera.position.y = target.y + 1.5 + radius * Math.cos(targetPolar);
    Pcamera.position.z = target.z + radius * Math.sin(targetPolar) * Math.cos(targetAzimuth);

    // Make camera look at the target
    Pcamera.lookAt(new THREE.Vector3(target.x, 1.5, target.z));
}
function updateRocketPosition() {
    if(!rocket)
        return;
    const pointOnPath = pathCurve.getPointAt(progress);
    rocket.position.copy(pointOnPath);

    // Get next point to determine orientation
    const nextProgress = Math.min(progress + 0.01, 1);
    const nextPoint = pathCurve.getPointAt(nextProgress);

    // Make rocket face the next point
    rocket.lookAt(nextPoint);
    rocket.rotateX(Math.PI / 2);

}
export {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,HDRI,
       models,setSelectedObject};