import * as THREE from 'three';
import { GLTFLoader } from './CustomModelLoader/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createInfiniteGrid } from './GridHelper/Creategridhelper.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

let scene,Pcamera,Ocamera,renderer,orbitControls,transformControls;
let nowShowing;
let activecamera;
let currentCamera;
let selectedObject;
let listIndex=-1;

const loadingManager = new THREE.LoadingManager();
const gltfLoader=new GLTFLoader(loadingManager);
const manualSteps = 8;
const expectedAssets = 19;
const totalItems = manualSteps + expectedAssets;
let manualProgress = 0;
let assetProgress = 0;


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
let waterplane;
const waterShaderMaterial =  new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 }, // Animation time
        opacity: { value: 0.8 }, // Overall opacity (adjustable)
        colors: { value: [
            new THREE.Color("#3a0ca3"), // Deep blue (lowest)
            new THREE.Color("#3f37c9"),
            new THREE.Color("#4361ee"),
            new THREE.Color("#4895ef"),
            new THREE.Color("#4cc9f0"),
            new THREE.Color("#ffffff")  // White (highest)
        ]}
    },
    vertexShader: `
        uniform float time;
        varying float vWaveHeight;
        varying vec2 vUv; // Pass UV coordinates

        void main() {
        vec3 pos = position;

        // Define a threshold where transition starts
        float transitionStart = -2.0; // Adjust as needed
        float transitionEnd = 2.0; // Adjust for where simple wave takes over

        // Compute the complex wave function
        float complexWave = sin(pos.x * 3.0 - time * 2.0) * 0.1 + cos(pos.y * 3.0 - time) * 0.1;

        // Compute the final simple sine wave moving along X
        float simpleWave = sin(pos.x * 3.0 - time * 2.0) * 0.1;

        // Transition factor based on X position
        float transition = smoothstep(transitionStart, transitionEnd, pos.x);

        // Interpolate between complex and simple wave
        float wave = mix(complexWave, simpleWave, transition);
        pos.z += wave;

        vWaveHeight = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `,
    fragmentShader: `
        uniform vec3 colors[6]; 
        uniform float opacity; // Single opacity value
        uniform float time;  // Time for animation
        varying float vWaveHeight;
        varying vec2 vUv; // Pass UV coordinates

        // Random function for white blob positions
        float random(vec2 uv) {
            return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // High-frequency noise function for blob generation
        float noise(vec2 uv) {
            vec2 i = floor(uv);
            vec2 f = fract(uv);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            // Normalize wave height (-0.2 to 0.2) to (0.0 to 1.0)
            float t = (vWaveHeight + 0.2) / 0.4;

            // Blend between the 6 colors based on height
            vec3 color;
            if (t < 0.2) {
                color = mix(colors[0], colors[1], smoothstep(0.0, 0.2, t));
            } else if (t < 0.4) {
                color = mix(colors[1], colors[2], smoothstep(0.2, 0.4, t));
            } else if (t < 0.6) {
                color = mix(colors[2], colors[3], smoothstep(0.4, 0.6, t));
            } else if (t < 0.8) {
                color = mix(colors[3], colors[4], smoothstep(0.6, 0.8, t));
            } else {
                color = mix(colors[4], colors[5], smoothstep(0.8, 1.0, t));
            }

            vec2 uv = gl_FragCoord.xy * 0.01;
            float blobNoise = noise(uv * 10.0 + time * 5.0) * noise(uv * 10.0 - time );

        // Create size variation using another noise function
        float sizeFactor = noise(uv * 3.0 + time * 2.0); // Generates different blob sizes
        float blobThreshold = mix(0.6, 0.85, sizeFactor); // Smaller blobs appear at lower threshold

        // Create blobs with varying sizes
        float blob = step(blobThreshold, blobNoise);

        // Apply blobs to final color
        color = mix(color, vec3(1.0), blob);

        gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true
});

let composer,outlinePass;
let moveSpeed=0.035;
let option=0;
let sceneLights=[];
let sceneAmbient=new THREE.AmbientLight(0xffffff,2);
sceneAmbient.userData.isAdded=false;
let curtainMesh,sound,texture;
let flipped = false;
let currentIndex=0;
let marker1, marker2,marker3,marker4;

const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const book = document.querySelector("#book");

const paper1 = document.querySelector("#p1");
const paper2 = document.querySelector("#p2");
const paper3 = document.querySelector("#p3");
const paper4 = document.querySelector("#p4");
const paper5 = document.querySelector("#p5");

let currentLocation = 1;
let numOfPapers = 5;
let maxLocation = numOfPapers + 1;

function openBook() {
    book.style.transform = "translateX(50%)";
   // prevBtn.style.transform = "translateX(-180px)";
    //nextBtn.style.transform = "translateX(180px)";
}

function closeBook(isAtBeginning) {
    if(isAtBeginning) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
    
    prevBtn.style.transform = "translateX(0px)";
    nextBtn.style.transform = "translateX(0px)";
}

function goNextPage() {
    if(currentLocation < maxLocation) {
        switch(currentLocation) {
            case 1:
                console.log('next1');
                openBook();
                paper1.classList.add("flipped");
                paper1.style.zIndex = 1;
                break;
            case 2:
                console.log('next2');
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                break;
            case 3:
                console.log('next3');
                paper3.classList.add("flipped");
                paper3.style.zIndex = 3;
                break;
            case 4:
                console.log('next4');
                paper4.classList.add("flipped");
                paper4.style.zIndex = 4;
                break;
            case 5:
                console.log('next5');
                paper5.classList.add("flipped");
                paper5.style.zIndex = 5;
                closeBook(false);
                break;
            default:
                throw new Error("unkown state");
        }
        currentLocation++;
    }
}

function goPrevPage() {
    if(currentLocation > 1) {
        switch(currentLocation) {
            case 2:
                closeBook(true);
                paper1.classList.remove("flipped");
                paper1.style.zIndex = 5;
                break;
            case 3:
                paper2.classList.remove("flipped");
                paper2.style.zIndex = 4;
                break;
            case 4:
                paper3.classList.remove("flipped");
                paper3.style.zIndex = 3;
                break;
            case 5:
                paper4.classList.remove("flipped");
                paper4.style.zIndex = 2;
                break;
            case 6:
                openBook();
                paper5.classList.remove("flipped");
                paper5.style.zIndex = 1;
                break;
            default:
                throw new Error("unkown state");
        }

        currentLocation--;
    }
}
function isSoftwareRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true; // No WebGL at all

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo 
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

    console.log("WebGL Renderer:", renderer);

    // Check for known software renderers
    return (
        renderer.toLowerCase().includes('swiftshader') ||
        renderer.toLowerCase().includes('software') ||
        renderer.toLowerCase().includes('angle (software adapter)')
    );
}   
function detectBrowser() {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
        return "Chrome";
    } else if (ua.includes("Firefox")) {
        return "Firefox";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
        return "Safari";
    } else if (ua.includes("Edge")) {
        return "Edge";
    } else if (ua.includes("OPR") || ua.includes("Opera")) {
        return "Opera";
    } else {
        return "Unknown";
    }
}
function createFace(color, transform, direction) {
    const face = document.createElement('div');
    face.textContent = '3D-viewer';
    face.style.fontSize = '15px';
    face.style.fontWeight = 'bold';
    face.style.display = 'flex';                      // ✅ Use flex to center content
    face.style.alignItems = 'center';                 // ✅ Center vertically
    face.style.justifyContent = 'center'; 
    face.style.fontFamily = 'sans-serif';
    face.style.color = 'linear-gradient(145deg, #2196f3, #1976d2)';
    face.style.position = 'absolute';
    face.style.width = '100px';
    face.style.height = '100px';
    face.style.borderRadius = '20px';
    face.style.transform = transform;
    face.style.background = `linear-gradient(${direction}, ${color}, ${shadeColor(color, -50)})`;
    return face;
  }
  function shadeColor(color, percent) {
    let num = parseInt(color.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
async function showLoadingScreen() {

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let mobileMessage;
   

    // Create the loading screen container
    const loadingScreen = document.createElement("div");
    loadingScreen.style.position = "fixed";
    loadingScreen.style.top = "0";
    loadingScreen.style.left = "0";
    loadingScreen.style.width = "100%";
    loadingScreen.style.height = "100%";
    loadingScreen.style.background = 'linear-gradient(145deg,rgb(247, 2, 255),rgb(0, 98, 255))';
    loadingScreen.style.color = "white";
    loadingScreen.style.display = "flex";
    loadingScreen.style.alignItems = "center";
    loadingScreen.style.justifyContent = "center";
    loadingScreen.style.flexDirection = "column";
    loadingScreen.style.zIndex = "9999";
    loadingScreen.style.fontFamily = "Arial, sans-serif";
    loadingScreen.style.transition = "opacity 1s ease-in-out";
    loadingScreen.style.perspective= '1000px';
    document.body.appendChild(loadingScreen);

    if (isMobile) {
        mobileMessage = document.createElement("div");
        mobileMessage.style.position = "fixed";
        mobileMessage.style.top = "0";
        mobileMessage.style.left = "0";
        mobileMessage.style.width = "100%";
        mobileMessage.style.height = "100%";
        mobileMessage.style.background = "linear-gradient(145deg, #ff416c, #ff4b2b)";
        mobileMessage.style.color = "white";
        mobileMessage.style.display = "flex";
        mobileMessage.style.alignItems = "center";
        mobileMessage.style.justifyContent = "center";
        mobileMessage.style.flexDirection = "column";
        mobileMessage.style.zIndex = "9999";
        mobileMessage.style.fontFamily = "Arial, sans-serif";
        mobileMessage.style.textAlign = "center";
        mobileMessage.innerHTML = `
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">⚠️ Not Supported</div>
            <div style="font-size: 18px; max-width: 90%; line-height: 1.5;">
                This website is not optimized for mobile devices. <br>Please visit from a desktop or laptop for the best experience.
            </div>
        `;
        loadingScreen.appendChild(mobileMessage);
        return;
    }
    
    if (isSoftwareRenderer()) {
        const warning = document.createElement("div");
        warning.innerText = "⚠️ Your system is using software rendering.\n\nFor an optimal experience, please enable graphics acceleration in browser settings.";
        warning.style.background = "#eae2b7";
        warning.style.color = "#000";
        warning.style.padding = "20px";
        warning.style.borderRadius = "10px";
        warning.style.marginTop = "30px";
        warning.style.maxWidth = "400px";
        warning.style.textAlign = "center";
        loadingScreen.appendChild(warning);
        
        // Optional: Add a link to Chrome settings
        const browserLink = document.createElement("a");
        const browser = detectBrowser();
        switch (browser) {
            case "Chrome":
                browserLink.href = "chrome://settings/system";
                //browserLink.innerText = "Open Chrome Settings";
                break;
            case "Edge":
                browserLink.href = "edge://settings/system";
                //browserLink.innerText = "Open Edge Settings";
                break;
            case "Firefox":
                browserLink.href = "about:preferences";
                //browserLink.innerText = "Open Firefox Settings";
                break;
            case "Safari":
                browserLink.href = "#";
                //browserLink.innerText = "Change preferences";
                browserLink.style.pointerEvents = "none";
                break;
            default:
                browserLink.href = "#";
                browserLink.innerText = "Unsupported browser";
                browserLink.style.pointerEvents = "none";
        }
        browserLink.innerText = "Enable graphics acceleration";
        browserLink.style.color = "#00f";
        browserLink.style.marginTop = "10px";
        browserLink.style.display = "block";
        loadingScreen.appendChild(browserLink);

        // Optional: Delay init() or load a lighter fallback scene
        // return; // Uncomment this if you want to skip loading the full scene
    }
    // Create the loading text
    const loadingText = document.createElement("div");
    loadingText.innerText = "Loading...";
    loadingText.style.fontSize = "24px";
    loadingText.style.letterSpacing = "2px";
    loadingText.style.textShadow = "0px 0px 10px rgba(255, 255, 255, 0.6)";
    loadingText.style.animation = "blink 1s infinite alternate";
    loadingScreen.appendChild(loadingText);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.bottom = '100px';
    wrapper.style.left = '40%';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';
    wrapper.style.transformStyle = 'preserve-3d';
    wrapper.style.transition = 'transform 1s ease';
    wrapper.style.cursor = 'pointer';
  
    // === Use only two rotations to make it stand on vertex ===
    const baseRotation = 'rotateZ(45deg) rotateX(45deg)';
    wrapper.style.transform = baseRotation;
  
    // === Hover: rotate around the vertex-to-vertex axis (1,1,1) ===
    let rotated = false;
    wrapper.addEventListener('mouseenter', () => {
      if (!rotated) {
        wrapper.style.transform += ' rotate3d(1, 1, 1, 360deg)';
        rotated = true;
      }
    });
  
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = baseRotation;
      rotated = false;
    });
  
    wrapper.addEventListener('click', () => {
      window.open('./alt.html', '_blank');
    });
    // === Create Cube Container ===
    const cube = document.createElement('div');
    cube.style.width = '100px';
    cube.style.height = '100px';
    cube.style.position = 'relative';
    cube.style.transformStyle = 'preserve-3d';
    cube.style.borderRadius = '12px';
    wrapper.appendChild(cube);
    const baseColor = '#80ed99';

    cube.appendChild(createFace(baseColor, 'translateZ(50px)', 'to top left'));          // front
    cube.appendChild(createFace(baseColor, 'rotateY(180deg) translateZ(50px)', 'to bottom right')); // back
    cube.appendChild(createFace(baseColor, 'rotateY(90deg) translateZ(50px)', 'to top right'));     // right
    cube.appendChild(createFace(baseColor, 'rotateY(-90deg) translateZ(50px)', 'to bottom left'));  // left
    cube.appendChild(createFace(baseColor, 'rotateX(90deg) translateZ(50px)', 'to top'));           // top
    cube.appendChild(createFace(baseColor, 'rotateX(-90deg) translateZ(50px)', 'to bottom'));  
    loadingScreen.appendChild(wrapper);


    const cvText = document.createElement('div');
  cvText.textContent = 'cv';
  cvText.style.fontSize = '50px';
  cvText.style.fontWeight = 'bold';
  cvText.style.fontFamily = 'sans-serif';
  cvText.style.color="white";
  cvText.style.background = 'rgba(255, 255, 255, 0)';
  cvText.style.padding = '20px 40px';
  cvText.style.borderRadius = '12px';
  cvText.style.transformStyle = 'preserve-3d';
  cvText.style.cursor = 'pointer';
  cvText.style.textShadow = `
    1px 1px 0 #00000022,
    2px 2px 4px rgba(0,0,0,0.3)
  `;
  cvText.style.transition = 'transform 1s ease-in-out';
  cvText.style.position = 'absolute';
  cvText.style.bottom = '100px';
  cvText.style.left = '50%';

  // Hover rotation effect
  cvText.addEventListener('mouseenter', () => {
    cvText.style.transform = 'rotateY(360deg)';
  });

  cvText.addEventListener('mouseleave', () => {
    cvText.style.transform = 'rotateY(0deg)';
  });

  // Open PDF on click
  cvText.onclick = () => {
    window.open('./cv/Sangeet Dey.pdf', '_blank'); // Replace with your actual PDF path
  };

  loadingScreen.appendChild(cvText);

  const QuickLinks = document.createElement("div");
  QuickLinks.innerText = "Quick Links";
  QuickLinks.id="quick-Links";
    loadingScreen.appendChild(QuickLinks);
    // Blinking animation
    const style = document.createElement("style");
    style.innerHTML = `

        @keyframes blink {
            0% { opacity: 1; }
            100% { opacity: 0.5; }
        }
        
        .click-text {
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.5s, transform 0.3s;
            padding: 10px 20px;
            border: 2px solid white;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
            text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.4);
            margin-top: 20px;
        }
        
        .click-text:hover {
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.3);
        }
        
        .fade-in {
            opacity: 1 !important;
        }

        .welcome-text {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0px 0px 15px rgba(255, 255, 255, 0.6);
        }

        .controls-text {
            font-size: 16px;
            margin-top: 5px;
            opacity: 0.8;
        }
        #quick-Links {
            font-size: 16px;
            margin-top: 5px;
            opacity: 0.8;
            position:absolute;
            bottom:270px;
        }
         #loading-bar-container {
            width: 60%;
            height: 20px;
            background: #333;
            margin-bottom: 10px;
            border-radius: 10px;
            overflow: hidden;
        }

        #loading-bar {
            height: 100%;
            width: 0%;
            background: #4caf50;
            transition: width 0.2s ease;
        }
    `;
    document.head.appendChild(style);

    const barContainer = document.createElement('div');
    barContainer.id = 'loading-bar-container';
  
    const bar = document.createElement('div');
    bar.id = 'loading-bar';

    barContainer.appendChild(bar);
    loadingScreen.appendChild(barContainer);
    
    
   
    
    
    
    await init();

    // Remove loading text
    loadingText.innerText = "";
    loadingText.classList.remove("loading-text");

    // Welcome text
    const welcomeText = document.createElement("div");
    welcomeText.innerText = "Welcome to Sangeet's Portfolio";
    welcomeText.classList.add("welcome-text");
    loadingScreen.appendChild(welcomeText);

    // Controls text
    const controlsText = document.createElement("div");
    controlsText.innerText = "Press W or S to move around, and mouse move to turn. Look for cues to interactive props.";
    controlsText.classList.add("controls-text");
    loadingScreen.appendChild(controlsText);

    // Click to Start Button
    const clickToStart = document.createElement("div");
    clickToStart.innerText = "Click to Start";
    clickToStart.classList.add("click-text");
    loadingScreen.appendChild(clickToStart);
    
    // Fade in elements after 500ms
    setTimeout(() => {
        welcomeText.classList.add("fade-in");
        controlsText.classList.add("fade-in");
        clickToStart.classList.add("fade-in");
    }, 500);

    // Wait for user interaction
    clickToStart.addEventListener("click", () => {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(loadingScreen);
            const canvas = renderer.domElement;
            if(activecamera==Pcamera)
            canvas.requestPointerLock();
            document.addEventListener('click', (event)=>
            {
                if(activecamera.name=='interaction')
                {
                    if(option==0)
                    {
                        console.log(event);
                        checkMouseClick(event);
                    }
                    
                } 
        });
            document.addEventListener("mousemove", (event) => {
                if(activecamera==Pcamera)
                {
                    azimuthVelocity = -event.movementX * sensitivity; // Left/right rotation
                    polarVelocity = -event.movementY * sensitivity; 
                }
                else
                {
                        if(option==0)
                        
                        checkMouseOver(event);
            
                    
                }  
            });
            if(sound)
            {
                sound.play();
            }
        }, 1000);
    });
}
function updateLoadingBar() {
    if (totalItems > 0) {
        const percent = ((assetProgress + manualProgress) / totalItems) * 100;
        document.getElementById('loading-bar').style.width = `${percent}%`;
      }
  }
async function init()
{
    loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
        //totalItems = itemsTotal + manualSteps;
      };
      
      loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        assetProgress = itemsLoaded;
        updateLoadingBar();
      };
      
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    scene = new THREE.Scene();
    Pcamera = new THREE.PerspectiveCamera(50,  window.innerWidth / window.innerHeight, 0.1, 1000);
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
    renderer.toneMapping = THREE.CineonToneMapping; // Ensure tone mapping is enabled
    //renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement); 
    //container.style.perspective= '1000px';

    renderer.domElement.addEventListener('click', () => {
        if(activecamera==Pcamera)
            renderer.domElement.requestPointerLock(); // Lock cursor on click
    });
    manualProgress++;
    updateLoadingBar();
    const hdriTextureLoader = new RGBELoader(loadingManager).load('./Hdri/small_empty_room_3_4k.hdr', texture => 
    {    
        const gen = new THREE.PMREMGenerator(renderer);
        HDRI= gen.fromEquirectangular(texture).texture;
        scene.environment = HDRI;
        scene.environmentIntensity=0;
        texture.dispose();
        gen.dispose();
        
    }); 
    const textureLoader=new THREE.TextureLoader(loadingManager);
    
     
    try 
    {
        const map1=textureLoader.load("../icons/3D_models.png");
        const map2=textureLoader.load("../icons/Work-Exp.png");
        const map3=textureLoader.load("../icons/Sketches.png");
        const map4=textureLoader.load("../icons/ContactMe.png");
        const spmat1=new THREE.SpriteMaterial({map:map1,color:0xffffff,transparent:true});
        const spmat2=new THREE.SpriteMaterial({map:map2,color:0xffffff,transparent:true,depthTest:false,depthWrite:false});
        const spmat3=new THREE.SpriteMaterial({map:map3,color:0xffffff,transparent:true,depthTest:false,depthWrite:false});
        const spmat4=new THREE.SpriteMaterial({map:map4,color:0xffffff,transparent:true,depthTest:false,depthWrite:false});

        marker1=new THREE.Sprite(spmat1);
        marker2=new THREE.Sprite(spmat2);
        marker3=new THREE.Sprite(spmat3);
        marker4=new THREE.Sprite(spmat4);

        //marker1.scale.set(0.5,0.5,0.5);
        //marker2.scale.set(0.5,0.5,0.5);
        //marker3.scale.set(0.5,0.5,0.5);

        let gltf0 = await loadGLB('../glb/Waving.glb');
        models.push(gltf0.scene);
        scene.add(models[0]);
        models[0].scale.set(1.1,1.1,1.1);
        models[0].rotation.y=Math.PI/2;
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
        models[1].scale.set(1.1,1.1,1.1);
        models[0].rotation.y=Math.PI/2;
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
        let gltf2= await loadGLB('../glb/room2.glb');
        
        gltf2.scene.traverse(m=>{
            if(m.name=='screen')
            {
                curtainMesh=m;
            }
        })
        curtainMesh.material.onBeforeCompile = (shader) => {
            // Add custom uniforms
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uFrequency = { value: new THREE.Vector2(4.0, 1) }; // Controls waves
            shader.uniforms.uAmplitude = { value: 0.03 }; // Controls wave height
            shader.uniforms.uWindStrength = { value: 0.02 }; // Controls slight sway in X direction
        
            // Inject uniforms
            shader.vertexShader = shader.vertexShader.replace(
                "#include <common>",
                `
                #include <common>
                uniform float uTime;
                uniform vec2 uFrequency;
                uniform float uAmplitude;
                uniform float uWindStrength;
                `
            );
        
            // Apply waves in Z direction & slight sway in X
            shader.vertexShader = shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                #include <begin_vertex>
                // Waves in Z direction (based on Y position)
                transformed.z += sin(position.y * uFrequency.x + uTime) * uAmplitude;
                
                // Slight wind sway in X direction (based on Y and X)
                transformed.x += sin(position.y * uFrequency.y + uTime * 0.5) * uWindStrength;
                `
            );
        
            // Store shader reference for animation
            curtainMesh.userData.shader = shader;
        };
        models.push(gltf2.scene);
        console.log(gltf2.scene);
        scene.add(models[2]);
        models[2].position.set(0,0,0);
        
        const material  = new THREE.ShaderMaterial({
            vertexShader: `
                attribute vec3 barycentric;
                varying vec3 vBarycentric;
                void main() {
                    vBarycentric = barycentric;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vBarycentric;
                
                float edgeFactor(vec3 bary) {
                    vec3 d = fwidth(bary);
                    vec3 a3 = smoothstep(vec3(0.0), d * 1.5, bary);
                    return min(min(a3.x, a3.y), a3.z);
                }
                
                void main() {
                    float edge = edgeFactor(vBarycentric);
                    vec3 color = mix(vec3(0.5,0.5,0.5), vec3(0.0), edge); // White lines, black fill
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: {},
            transparent: true
        });
           
        let show1=await loadGLB('../glb/1000128101.glb');
        showModels.push(show1.scene);
        showModels[0].scale.set(0.1,0.1,0.1);
        showModels[0].position.set(-0.04,0.5,-1.92);
        showModels[0].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[0].userData.info="This is a model of a drill I made for Lowe's. A lot of detailed texture work was required for it. It also had to be under 5mb, so it is fully optimised for web applications."

        let show2=await loadGLB('../glb/Masterforce_drill.glb');
        showModels.push(show2.scene);
        showModels[1].scale.set(0.06,0.06,0.06);
        showModels[1].position.set(-0.04,0.5,-1.92);
        showModels[1].visible=false;
        showModels[1].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[1].userData.info="This was made for Masterforce. There are a lot of complex shapes in this model, and so it was a good challenge for me. This model also required a lot of detailed texture work. "

        let show3=await loadGLB('../glb/50203999.glb');
        showModels.push(show3.scene);
        showModels[2].scale.set(0.1,0.1,0.1);
        showModels[2].position.set(-0.04,0.505,-1.92);
        showModels[2].visible=false;
        showModels[2].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[2].userData.info="This was made for Lowe's. It is an electric sander. Looking at references, understanding the shapes and planning out the topology is an important part of 3D modelling, and I improved that skill a lot while working on this. "

        let show4=await loadGLB('../glb/1000801354.glb');
        showModels.push(show4.scene);
        showModels[3].scale.set(0.2,0.2,0.2);
        showModels[3].position.set(-0.04,0.502,-1.92);
        showModels[3].visible=false;
        showModels[3].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[3].userData.info="This was also made for Lowe's in their home decor category. I modelled it in Zbrush, and later did its reptopology in Maya. This was a fun project."

        let show5=await loadGLB('../glb/nike_shoe.glb');
        showModels.push(show5.scene);
        showModels[4].scale.set(0.04,0.04,0.04);
        showModels[4].position.set(-0.04,0.507,-1.92);
        showModels[4].visible=false;
        showModels[4].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[4].userData.info="This was made for Nike. Understanding how the different parts are connected and stitched, figuring out topology and shapes and my overall modelling skills leveled up in this project. The fabric textures on this was also a lot of detiail work on Substance Painter, a mix of procedural and hand-painting."

        let show6=await loadGLB('../glb/sandal.glb');
        showModels.push(show6.scene);
        showModels[5].scale.set(0.09,0.09,0.09);
        showModels[5].position.set(-0.04,0.51,-1.92);
        showModels[5].visible=false;
        showModels[5].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[5].userData.info="This was for Birkenstock, a sandal made from recycled cork and rubber. The most  challenging and fun part abput this project was its sole. I modelled out one repeating unit, duplicated and connected them together on a plane, and then cut out the shoe shape from it. This too was a fun project."

        let show7=await loadGLB('../glb/grenade.glb');
        showModels.push(show7.scene);
        showModels[6].scale.set(0.2,0.2,0.2);
        showModels[6].position.set(-0.04,0.505,-1.92);
        showModels[6].visible=false;
        showModels[6].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[6].userData.info="This is a sci-fi concept grenade. it has a blast radius of 50m, and has three ordinance modes. Fun fact-if you rotate the model, you can see that the ordinance switch is completely done in texture. "

        let show8=await loadGLB('../glb/alien.glb');
        showModels.push(show8.scene);
        showModels[7].scale.set(0.05,0.05,0.05);
        showModels[7].position.set(-0.04,0.505,-1.92);
        showModels[7].visible=false;
        showModels[7].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[7].userData.info="This was an alien concept. I took inspiration from the Avatar and Predator movies. I sculpted it in Z-brush, retopo in Maya and textured it in substance."
        

        let show9=await loadGLB('../glb/velvet_chair1.glb');
        showModels.push(show9.scene);
        showModels[8].scale.set(0.03,0.03,0.03);
        showModels[8].position.set(-0.04,0.501,-1.92);
        showModels[8].visible=false;
        showModels[8].traverse(m=>{
            if(m.isMesh )
            {   
                m.userData.clone=m.clone();
                m.userData.clone.geometry=addBarycentricCoordinates(m.userData.clone.geometry);
                m.userData.clone.material=material;
               // m.userData.clone.visible=false;
                
            }
        });
        showModels[8].userData.info="This is a velvet chair and ottoman set, made for Amazon. Took a lot of hand-painting textures to match the velvet shine amd patches, as Amazon is very strict about models matching the references."
    
        const listener = new THREE.AudioListener();
        models[1].add( listener );
        sound = new THREE.PositionalAudio( listener );
        const audioLoader = new THREE.AudioLoader(loadingManager);
        audioLoader.load( '../sounds/bgm.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setRefDistance(0.5); // Distance where volume is at 100%
        sound.setMaxDistance(15); // Distance where volume fades out completely
        sound.setVolume(3);
        //sound.play();
        });


        
        scene.add(marker1,marker2,marker3,marker4);
        scene.traverse(m=>{
            if(m.name==='boombox_Boombox_0')
            {
                m.add(sound);
               
            }
            if(m.name==='Laptop')
            {
                marker2.position.copy(m.position);
                marker2.position.y+=0.2;
            }
            if(m.name==='RubixCube_RubixCube_0')
            {
                marker1.position.copy(m.position);
                marker1.position.y+=0.12;
                //marker1.position.x+=0.2;
            }
            if(m.name==='sketchBook')
            {
                marker3.position.copy(m.position);
                marker3.position.y+=0.01;
            }
            if(m.name=='Fridge')
            {
                marker4.position.copy(m.position);
                marker4.position.x-=0.1;
                marker4.position.z-=0.1;
                marker4.position.y=1.6;
            }
        });
        manualProgress++;
  updateLoadingBar();


    } catch (error) {
        console.error('Error loading GLBs:', error);
    }
    
    // Create Wavy Top Face
    const planeGeometry = new THREE.PlaneGeometry(7,7, 100, 100);
   /* const planeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4cc9f0,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9, 
    reflectivity: 0.9,
    side: THREE.DoubleSide,
    transparent:true
    });*/
    waterplane = new THREE.Mesh(planeGeometry, waterShaderMaterial);
    waterplane.rotation.x = -Math.PI / 2;
    waterplane.position.set(7,-0.5,0) // Slightly above the cube
    waterplane.castShadow=true;
    waterplane.receiveShadow=true;
    scene.add(waterplane);
    manualProgress++;
  updateLoadingBar();

    const sunlight=new THREE.DirectionalLight({color:0xffffff,intensity:10});
    scene.add(sunlight);
    sunlight.castShadow=true;
    sunlight.position.set(10,2,0);
    sunlight.shadow.mapSize.width =2048; // default
    sunlight.shadow.mapSize.height = 2048; // default
    sunlight.shadow.camera.near = 0.1; // default
    sunlight.shadow.camera.far = 10;
    sunlight.shadow.bias=-0.0005;
    sunlight.shadow.blurSamples=10; // default
    sceneLights.push(sunlight);
    manualProgress++;
  updateLoadingBar();

    const width = 2;
    const height = 2;
    const rectLight = new THREE.RectAreaLight( 0xffffff, 1,  width, height );
    rectLight.position.set( -0.4, 2, -3.8 );
    rectLight.rotation.y=-Math.PI;
    scene.add( rectLight );
    sceneLights.push(rectLight);
    const Light2 = new THREE.PointLight( 0xffffff, 1,10,0.5);
    Light2.castShadow=true;
    Light2.position.set( -3.6, 3.7, 0.55);
    Light2.rotation.y=-Math.PI/2;
    scene.add( Light2 );
    sceneLights.push(Light2);
    Light2.shadow.mapSize.width =2048; // default
    Light2.shadow.mapSize.height = 2048; // default
    Light2.shadow.camera.near = 0.1; // default
    Light2.shadow.camera.far = 1;
    Light2.shadow.bias=-0.01;
    Light2.shadow.blurSamples=10; // default
    manualProgress++;
  updateLoadingBar();

    const rectLight3 = new THREE.RectAreaLight( 0xffffff, 1,  10, 10);
    rectLight3.position.set( 0,6,0);
    rectLight3.rotation.x=-Math.PI/2;
    scene.add( rectLight3 );
    sceneLights.push(rectLight3);
    manualProgress++;
  updateLoadingBar();

    const rectLight4= new THREE.RectAreaLight( 0xffffff, 1,  10, 10 );
    rectLight4.position.set( 0,5.5,0 );
    rectLight4.rotation.x=Math.PI/2;
    scene.add( rectLight4 );
    sceneLights.push(rectLight4);
   manualProgress++;
  updateLoadingBar();

    Pcamera.position.set(0,1.5,3);
    Pcamera.lookAt(0,1.5,0);
    currentCamera=Pcamera;
    activecamera=currentCamera;
    const grid=createInfiniteGrid();
    Pcamera.position.set(2,1.5,3);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 512; 
    canvas.height = 512;

    // Create a vertical gradient from sky (top) to ground (bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0.01, "#48bfe3");  
    gradient.addColorStop(1, "#7400b8");  

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert to a Three.js texture
    texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    scene.background = texture;

    const lightGeometry = new THREE.ConeGeometry(2.6,15,4,1,true);
    const lightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffddaa, 
        transparent: true,
        opacity: 0.1, // Adjust for hazy effect
        depthWrite: false,
        side: THREE.DoubleSide
    });
    manualProgress++;
  updateLoadingBar();


  document.getElementById('loading-bar-container').style.display = 'none';
}

function updateSize(obj) {
    const distance = activecamera.position.distanceTo(obj.position);
    const scaleFactor = distance * 0.3; // Adjust this factor as needed
    obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
function loadGLB(url) {
    return new Promise((resolve, reject) => {
        
        gltfLoader.load(url, 
                (gltf) => {
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                           
                            if (child.material) {
                               
                                child.material.needsUpdate = true; // Ensure material updates for shadows
                            }
                        }
                    });
                    resolve(gltf);
                }, // Resolve when loaded
            undefined, 
            (error) => reject(error)  // Reject if there's an error
        );
    });
}






function switchCharacterForward(isWalking) {
    scene.traverse(m=>{
        if(m.name=="Beach boombox_Boombox_0")
        {
            console.log(m);
        }
    })
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
       /* models[1].position.x += direction.x * 0.035;
        models[1].position.z += direction.z * 0.035;
        activecamera.position.x+= direction.x * 0.035;
        activecamera.position.z += direction.z * 0.035;*/
        if (!checkCollision(models[1], direction)) {
            const bbox = new THREE.Box3().setFromObject(models[2]);
            
            if(models[1].position.x<bbox.max.x-0.5 &&models[1].position.x>bbox.min.x+0.5)
            models[1].position.x += direction.x * moveSpeed;
            if(models[1].position.z<bbox.max.z-0.5&&models[1].position.z>bbox.min.z+0.5)
            models[1].position.z += direction.z * moveSpeed;
            activecamera.position.x += direction.x * moveSpeed;
            activecamera.position.z += direction.z * moveSpeed;
           
           
            
        } else {
            //console.log("Collision detected! Can't move forward.");
        }
    }
    if(isWalking==false)
    {
        models[0].position.copy(models[1].position);
       
    }
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
        if (!checkCollision(models[1], direction)) {
            const bbox = new THREE.Box3().setFromObject(models[2]);
           
            if(models[1].position.x<bbox.max.x-0.4 &&models[1].position.x>bbox.min.x+0.4)
                models[1].position.x += direction.x * moveSpeed;
            if(models[1].position.z<bbox.max.z-0.4&&models[1].position.z>bbox.min.z+0.4)
                models[1].position.z += direction.z * moveSpeed;
                activecamera.position.x += direction.x * moveSpeed;
                activecamera.position.z += direction.z * moveSpeed;
            
        } else {
            console.log("Collision detected! Can't move forward.");
        }
    }
    if(isWalking==false)
    {
        models[0].position.copy(models[1].position);
       
    }
}

function checkCollision(character, direction) 
{
    const characterBox = new THREE.Box3().setFromObject(character);
    
    // Move the box slightly forward in the movement direction
    const nextPosition = character.position.clone().add(direction.clone().multiplyScalar(0.035));
    characterBox.translate(nextPosition.sub(character.position)); 

    // Filter objects for collision detection
    const objectsToCheck=[];
    models[2].traverse(m=>{
        if(m.isMesh && m.name!='room' && m.name!='sand')
        {
            
            objectsToCheck.push(m)
            
        }
    });
    //console.log(objectsToCheck);
    for (let obj of objectsToCheck) 
    {
        const objBox = new THREE.Box3().setFromObject(obj);
        if (characterBox.intersectsBox(objBox)) {
            console.log(obj.name);
            if(obj.name=='chair'||obj.parent.name=='modern_coffee_table_01_modern_coffee_table_01_0'||obj.name=="Coolbox_Coolbox_0"||obj.name=='Fridge')
            {
                
                showPanel(obj);
            }
            return true; // 🚧 Collision detected!
        }
    }
    return false; // ✅ No collision, safe to move
}

function showPanel(obj)
{
    
    document.exitPointerLock();
    if(obj.parent.name=='modern_coffee_table_01_modern_coffee_table_01_0')
    { 
      const camera=new THREE.PerspectiveCamera(35,  window.innerWidth / window.innerHeight, 0.001, 1000);
      const bbox = new THREE.Box3().setFromObject(obj);
      const CentreX=(bbox.max.x-Math.abs(bbox.min.x))/2;
      const CentreZ=(bbox.max.z-Math.abs(bbox.min.z))/2
      camera.position.x=bbox.max.x;
      camera.position.z=bbox.max.z;
      camera.position.y=1;
      camera.name='interaction'
      activecamera=camera;
      camera.userData.animateFlag=false;
      const lookAtPos=new THREE.Vector3(CentreX,bbox.max.y,CentreZ);
      camera.lookAt(lookAtPos);
      console.log('changed')
    }
    if(obj.name=='chair')
    { 
        const camera=new THREE.PerspectiveCamera(50,  window.innerWidth / window.innerHeight, 0.1, 1000);
        const bbox = new THREE.Box3().setFromObject(obj);
        const CentreX=(bbox.max.x-Math.abs(bbox.min.x))/2;
        const CentreZ=(bbox.max.z-Math.abs(bbox.min.z))/2
        camera.position.x=bbox.max.x;
        camera.position.z=bbox.max.z;
        camera.position.y=2;
        camera.name='interaction';
        activecamera=camera;
        const lookAtPos=new THREE.Vector3(CentreX,bbox.max.y,CentreZ);
        camera.lookAt(lookAtPos);
        
    }
    if(obj.name=='Coolbox_Coolbox_0')
    { 
        const camera=new THREE.PerspectiveCamera(50,  window.innerWidth / window.innerHeight, 0.1, 1000);
        const bbox = new THREE.Box3().setFromObject(obj);
        const CentreX=(bbox.max.x-Math.abs(bbox.min.x))/2;
        const CentreZ=(bbox.max.z-Math.abs(bbox.min.z))/2
        camera.position.x=2.1;
        camera.position.z=0.9;
        camera.position.y=0.8;
        camera.name='interaction';
        activecamera=camera;
        const lookAtPos=new THREE.Vector3(CentreX,bbox.max.y,CentreZ);
        camera.lookAt(obj.position);
        console.log(obj.name);
        
    }
    if(obj.name=='Fridge')
    { 
        const camera=new THREE.PerspectiveCamera(50,  window.innerWidth / window.innerHeight, 0.1, 1000);
        const bbox = new THREE.Box3().setFromObject(obj);
        const CentreX=(bbox.max.x-Math.abs(bbox.min.x))/2;
        const CentreZ=(bbox.max.z-Math.abs(bbox.min.z))/2
        camera.position.x=obj.position.x-0.05;
        camera.position.z=obj.position.z-0.3;
        camera.position.y=1.6;
        camera.name='interaction';
        activecamera=camera;
        const lookAtPos=new THREE.Vector3(obj.position.x-0.05,1.6,obj.position.z);
        camera.lookAt(lookAtPos);
        console.log(obj.name);
        
    }
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, activecamera);
    composer.addPass(renderPass)
    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, activecamera);
    outlinePass.edgeStrength = 5;  // Outline thickness
    outlinePass.edgeGlow = 0.5;    // Glow intensity
    outlinePass.edgeThickness = 2; // Outline width
    outlinePass.pulsePeriod = 0;   // Disable pulsing effect
    outlinePass.visibleEdgeColor.set('#ff0000'); // Outline color
    outlinePass.hiddenEdgeColor.set('#190a05');  // Hidden part outline color
    composer.addPass(outlinePass);

    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(fxaaPass);


    const outputPass = new OutputPass();
    composer.addPass( outputPass );
}
function updateCameraRotation() {
    const radius = 2.7; // Distance from target

    let target;
    if (models[1]) {
        target = models[1].position;
    } else {
        target = new THREE.Vector3(0, 1.5, 3);
    }

    // Apply velocity to angles
    targetAzimuth +=azimuthVelocity;
    targetPolar += polarVelocity;

    // Clamp vertical angle to prevent flipping
    targetPolar = Math.max(Math.PI / 3, Math.min(Math.PI / 2, targetPolar));

    // Apply damping (reduce velocity over time for inertia effect)
    azimuthVelocity *= dampingFactor;
    polarVelocity *= dampingFactor;

    // Calculate new camera position
    Pcamera.position.x = target.x + radius * Math.sin(targetPolar) * Math.sin(targetAzimuth+Math.PI/2);
    Pcamera.position.y = target.y + 2 //+ radius * Math.cos(targetPolar);
    Pcamera.position.z = target.z + radius * Math.sin(targetPolar) * Math.cos(targetAzimuth+Math.PI/2);
    
    const bbox = new THREE.Box3().setFromObject(models[2]);
    if(Pcamera.position.x>bbox.max.x)
       Pcamera.position.x=bbox.max.x-0.5;
    if(Pcamera.position.x<bbox.min.x)
        Pcamera.position.x=bbox.min.x+0.5;
    if(Pcamera.position.z>bbox.max.z)
        Pcamera.position.z=bbox.max.z-0.5;
    if(Pcamera.position.z<bbox.min.z)
        Pcamera.position.z=bbox.min.z+0.5;

    // Make camera look at the target
    Pcamera.lookAt(new THREE.Vector3(target.x, 1.5, target.z));
}
function checkMouseOver(event)
{
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, activecamera);
   
    // Get objects in the scene
    const intersects = raycaster.intersectObjects(scene.children,true); // `true` to check inside groups

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name=='Laptop'||intersects[i].object.parent.name=='sketchBook'||intersects[i].object.name=='RubixCube_RubixCube_0') {
            if(intersects[i].object.name=='RubixCube_RubixCube_0'||intersects[i].object.name=='Laptop')
            {
                if(option==0)
                outlinePass.selectedObjects=[intersects[i].object];
                //console.log(outlinePass.selectedObjects)
            }
           
            else
            {
                if(option==0)
                outlinePass.selectedObjects=[intersects[i].object.parent];
                
            }
            return;
            
        }
        else
        {
            outlinePass.selectedObjects=[];
        }
    }
}
function checkMouseClick(event)
{
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, activecamera);
   
    // Get objects in the scene
    const intersects = raycaster.intersectObjects(scene.children,true); // `true` to check inside groups

    if(intersects.length>0)
    {
        //if (intersects[0].object.name=='Laptop'||intersects[0].object.parent.name=='sketchBook'||intersects[0].object.name=='RubixCube_RubixCube_0') 
        {
            if(intersects[0].object.name=='RubixCube_RubixCube_0'||intersects[0].object==marker1)
            {
                option=1;
                activecamera.userData.animateFlag=true;
                console.log(intersects[0].object.name);
                let cube;
                scene.traverse(m=>{
                    if(m.name=='RubixCube_RubixCube_0')
                        cube=m;
                })
                animateForCube(cube);
            }
            else if(intersects[0].object.name=='Laptop'||intersects[0].object==marker2)
            {
                option=2;
                activecamera.userData.animateFlag=true;
                animateForLaptop();
            }
            else if(intersects[0].object.parent.name=='sketchBook'||intersects[0].object==marker3)
            {
                option=3;
                animateforSketchbook();
            }
            
        }

    }
    
}
function animateForCube(obj)
{
    orbitControls = new OrbitControls( activecamera, renderer.domElement );
    orbitControls.target.set(-0.04,0.51,-1.92);
    orbitControls.minDistance=0.005;
    orbitControls.maxDistance=0.05;
    orbitControls.enablePan=false;
    orbitControls.enableDamping=true;
    orbitControls.dampingFactor=0.07;
    orbitControls.maxPolarAngle=Math.PI/2;
    setTimeout(() => { 
        scene.background = new THREE.Color(1,1,1) // Smoothly fade in
    }, 1000);
    const geo=new THREE.BoxGeometry(0.105,0.105,0.105);
    const material=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true});
    material.map = new THREE.TextureLoader().load('../textures/grid2.png');
    const Cube=new THREE.Mesh(geo,material);
    scene.add(Cube);
    Cube.name="Grid";
    Cube.position.copy(obj.position);
    //Cube.position.y=Cube.position.y+0.06;
    Cube.rotation.y=Math.PI/4; // Smoothly fade in
    
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.style.display = "flex";  // Ensure it's visible
        setTimeout(() => { 
            arrow.style.opacity = "1"; // Smoothly fade in
        }, 1000); // Small delay to allow display change before opacity transition
    });
    document.querySelectorAll('.renderModes').forEach(renderMode => {
        renderMode.style.display = "flex";  // Ensure it's visible
        setTimeout(() => { 
            renderMode.style.opacity = "1"; // Smoothly fade in
        }, 1000); // Small delay to allow display change before opacity transition
    });
    document.querySelectorAll('.navigation').forEach(btn => {
        btn.style.display = "flex";  // Ensure it's visible
        setTimeout(() => { 
            btn.style.opacity = "1"; // Smoothly fade in
        }, 1000); // Small delay to allow display change before opacity transition
    });
    document.querySelectorAll('.threeD-box1').forEach(btn => {
        btn.style.display = "flex";  // Ensure it's visible
        setTimeout(() => { 
            btn.style.opacity = "1"; // Smoothly fade in
        }, 1000); // Small delay to allow display change before opacity transition
    });
    document.querySelectorAll('.threeD-box2').forEach(btn => {
        btn.style.display = "flex";  // Ensure it's visible
        setTimeout(() => { 
            btn.style.opacity = "1"; // Smoothly fade in
        }, 1000); // Small delay to allow display change before opacity transition
    });
    const info=document.getElementById('info');
    info.innerHTML=showModels[0].userData.info;
    scene.environmentIntensity=1;
    nowShowing=showModels[0];
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
        m.userData.baseColor=m.material.map;
        m.userData.normal=m.material.normalMap;
        m.userData.roughness=m.material.roughnessMap;
        m.userData.metalness=m.material.metalnessMap;
        m.userData.rough=m.material.roughness;
        m.userData.metal=m.material.metalness;
        m.userData.occlusion=m.material.aoMap;
        }
       
    });
    showModels.forEach(m=>{
        scene.add(m);
    });
    
    const back=document.getElementById('back');
    back.addEventListener('click',function(){
        models[0].position.x+=0.2;
        models[0].position.z+=0.2;
        models[1].position.copy(models[0].position); 
        activecamera=Pcamera;
        scene.environmentIntensity=0;
        scene.background=texture;
        if(sceneAmbient.userData.isAdded==true)
        {
            scene.remove(sceneAmbient);
            sceneAmbient.userData.isAdded=false;
            sceneLights.forEach(light=>{
                scene.add(light);
            })
        };
        showModels.forEach(m=>{
            scene.remove(m);
        });
        scene.traverse(m=>
            {
                if(m.isMesh||m.isSprite)
                {
                    {
                       m.visible=true;
                    }
                   
                }
                
            })
        models[0].visible=true;
        document.querySelectorAll('.arrow').forEach(arrow => {
            arrow.style.display = "none";  
        });
        document.querySelectorAll('.renderModes').forEach(renderMode => {
            renderMode.style.display = "none";  
        });
        document.querySelectorAll('.navigation').forEach(btn => {
            btn.style.display = "none";  
        });
        document.querySelectorAll('.threeD-box1').forEach(btn => {
            btn.style.display = "none";  // Ensure it's visible
        });
        document.querySelectorAll('.threeD-box2').forEach(btn => {
            btn.style.display = "none";  // Ensure it's visible
        });
        option=0;
        console.log(currentIndex);
        scene.remove(Cube);
        obj.material.opacity=1;
        const canvas = renderer.domElement;
        if(activecamera==Pcamera)
        canvas.requestPointerLock();
    })
   
}

function animateForLaptop()
{
    const exp = document.querySelector(".experience-container");
    exp.style.display="flex";
    // Timeout gives the browser a moment to register initial opacity
    setTimeout(() => {
      exp.style.opacity = "1";
    }, 1000); // Delay ensures transition kicks in
  
    const close=document.getElementById('close');
    close.addEventListener('click',function(){
        activecamera.position.set(-2.1,2,-1);
        activecamera.userData.animateFlag=false;
        option=0;
        activecamera=Pcamera;
        models[0].position.x+=0.2;
        models[0].position.z+=0.2;
        models[1].position.copy(models[0].position);  // Ensure it's visible
     // Small delay to allow display change before opacity transition
     
    // Timeout gives the browser a moment to register initial opacity
    setTimeout(() => {
      exp.style.opacity = "1";
       exp.style.display="none"
    }, 1000);
        

    })
}
function animateforSketchbook()
{
    document.querySelectorAll('.bookdiv').forEach(element=>{
        element.style.display='flex';
        setTimeout(() => { 
            element.style.opacity = "1"; // Smoothly fade in
        }, 1000); 
    });
}

function extractChannel(texture, channelIndex) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = texture.image;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const channelValue = data[i + channelIndex]; // Extract the correct channel (G = 1)
        data[i] = data[i + 1] = data[i + 2] = channelValue; // Convert to grayscale
        data[i + 3] = 255; // Set alpha to fully opaque
    }

    ctx.putImageData(imageData, 0, 0);

    const newTexture = new THREE.Texture(canvas);
    newTexture.wrapS=THREE.RepeatWrapping;
    newTexture.wrapT=THREE.RepeatWrapping;
    newTexture.repeat.y=-1;
    newTexture.needsUpdate = true;
    return newTexture;
}
function addBarycentricCoordinates(geometry) {
    if (geometry.index) {
        geometry = geometry.toNonIndexed(); // Convert indexed geometry
    }

    const count = geometry.attributes.position.count;
    const barycentric = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 3) {
        barycentric.set([1, 0, 0, 0, 1, 0, 0, 0, 1], i * 3);
    }

    geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentric, 3));
    return geometry;
}

function setSelectedObject(obj)
{
    selectedObject=obj;
}
function animate()
{
    waterShaderMaterial.uniforms.time.value += 0.01;
    requestAnimationFrame(animate);
    updateSize(marker1);
    updateSize(marker2);
    updateSize(marker3);
    updateSize(marker4);
    const delta = clock.getDelta();
    if (curtainMesh.userData.shader) {
        curtainMesh.userData.shader.uniforms.uTime.value += 0.02;
    }
    if(activecamera==Pcamera)
    updateCameraRotation();
   // animateWaves();
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
    
   if(activecamera==Pcamera)
   renderer.render(scene,activecamera);
   else
   {
    if(option==1)
    {
        if(activecamera.position.distanceTo(new THREE.Vector3(-0.04,0.51,-1.88)) > 0.01 &&activecamera.userData.animateFlag)
        {
            activecamera.position.lerp(new THREE.Vector3(-0.04,0.51,-1.88), 0.02);
            activecamera.lookAt(new THREE.Vector3(-0.04,0.51,-1.92));
            scene.traverse(m=>
                {
                    if(m.isMesh||m.isSprite)
                    {
                        if(m.name !== 'RubixCube_RubixCube_0' && !m.name.startsWith("geo")&& m.name!=="Grid")
                        {
                            
                            m.visible=false;
                        }
                        if(m.name == 'RubixCube_RubixCube_0')
                        {
                            m.material.transparent=true;
                            m.material.opacity=THREE.MathUtils.lerp(m.material.opacity, 0, 0.02);
                            if (m.material.opacity < 0.25) 
                            { 
                                console.log('invisible')
                                m.visible = false;  
                            }
                        }
                        
                    }
                    
                    
                })
                models[0].visible=false;
        }
        else
        {
            activecamera.userData.animateFlag=false;
            if(orbitControls)
            {
                orbitControls.update();
                
            }
        }
  
    }
    if(option==2)
    {
        activecamera.position.lerp(new THREE.Vector3(-3.35,1.515,-2.45),0.04);
        /*scene.traverse(m=>
        {
            if(m.isMesh)
            {
                m.material.transparent=true;
                m.material.opacity=THREE.MathUtils.lerp(m.material.opacity,0.05,0.04);
            }
        }
        )*/
        //activecamera.lookAt(-3.4,1.47,-2.5)
    }
    
    composer.render();
   }
  
}
await showLoadingScreen();
document.addEventListener("keydown", (event) => {
    if(option==0)
    {
    if (event.key === "w"|| event.key==="W") {
        console.log("w");
        event.preventDefault();
        activecamera=Pcamera
        switchCharacterForward(true);
        
    }
   else if (event.key === "s"||event.key === "S") {
        event.preventDefault();
        activecamera=Pcamera
        switchCharacterBackward(true);
    }
    else
    {
        console.log(event)
    }
    }
    
    
});
document.addEventListener("keyup", (event) => {
    if(option==0)
    {
    if (event.key === "w"|| event.key==="W") {
        switchCharacterForward(false);
    }
    else if (event.key === "s"||event.key === "S")  {
        switchCharacterBackward(false);
    }
}
});
const next=document.getElementById("next");
next.addEventListener('click',function()
{
    if(showModels[currentIndex].visible==true)
    {
        if(currentIndex+1<showModels.length)
        {
            showModels[currentIndex].visible=false;
            showModels[currentIndex].traverse(m=>{
                m.visible=false;
                if(m.isMesh )
                {
                    if(m.material.isMeshStandardMaterial)
                    {
                        m.material.map=m.userData.baseColor;
                        m.material.normalMap=m.userData.normal;
                        m.material.roughnessMap=m.userData.roughness;
                        m.material.metalnessMap=m.userData.metalness;
                        m.material.roughness=m.userData.rough;
                        m.material.metalness=m.userData.metal;
                        m.material.aoMap=m.userData.occlusion;
                        m.material.needsUpdate=true;
                    }   
                }
            });
            currentIndex++;
            showModels[currentIndex].visible=true;
            nowShowing=showModels[currentIndex];
            showModels[currentIndex].traverse(m=>
            {
                m.visible=true;
                if(m.isMesh)
                {
                    if(m.material.isMeshStandardMaterial)
                    {
                        m.userData.baseColor=m.material.map;
                        m.userData.normal=m.material.normalMap;
                        m.userData.roughness=m.material.roughnessMap;
                        m.userData.metalness=m.material.metalnessMap;
                        m.userData.rough=m.material.roughness;
                        m.userData.metal=m.material.metalness;
                        m.userData.occlusion=m.material.aoMap;
                        m.visible=true;
                    }
                    else
                    {
                        m.visible=false;
                    }
                    
                }
                    
            }); 
            document.getElementById('info').innerHTML=showModels[currentIndex].userData.info;
        console.log(currentIndex);        
        }
        scene.environmentIntensity=1; 
            
    }
    
    
});
const previous=document.getElementById("previous");
previous.addEventListener('click',function()
{
    if(showModels[currentIndex].visible==true)
    {
        if(currentIndex>0)
        {
            showModels[currentIndex].visible=false;
            showModels[currentIndex].traverse(m=>{
                m.visible=false;
                if(m.isMesh && m.material.isMeshStandardMaterial)
                    {
                        m.material.map=m.userData.baseColor;
                        m.material.normalMap=m.userData.normal;
                        m.material.roughnessMap=m.userData.roughness;
                        m.material.metalnessMap=m.userData.metalness;
                        m.material.roughness=m.userData.rough;
                        m.material.metalness=m.userData.metal;
                        m.material.aoMap=m.userData.occlusion;
                        m.material.needsUpdate=true;
                    }
            });
            showModels[currentIndex-1].visible=true;
            nowShowing=showModels[currentIndex-1];
            showModels[currentIndex-1].traverse(m=>{
                m.visible=true;
                if(m.isMesh)
                {
                    if(m.material.isMeshStandardMaterial)
                    {
                        m.userData.baseColor=m.material.map;
                        m.userData.normal=m.material.normalMap;
                        m.userData.roughness=m.material.roughnessMap;
                        m.userData.metalness=m.material.metalnessMap;
                        m.userData.rough=m.material.roughness;
                        m.userData.metal=m.material.metalness;
                        m.userData.occlusion=m.material.aoMap;
                        m.visible=true;
                    }
                    else
                    {
                        m.visible=false;
                    }
                }
                    

            });
            document.getElementById('info').innerHTML=showModels[currentIndex-1].userData.info;
            currentIndex=currentIndex-1;

        }
        scene.environmentIntensity=1;
        
    }
        
});
const baseColor=document.getElementById('basecolor');
baseColor.addEventListener('click',function(){
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.material.map=m.userData.baseColor;
            m.material.normalMap=null;
            m.material.roughnessMap=null;
            m.material.metalnessMap=null;
            m.material.aoMap=null;
            m.material.roughness=1;
            m.material.metalness=0;
            m.material.needsUpdate=true;
            m.visible=true;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=false;
            }    
        }
            
    })
    if(sceneAmbient.userData.isAdded==false)
    {
        scene.add(sceneAmbient);
        sceneAmbient.userData.isAdded=true;
        sceneLights.forEach(light=>{
            scene.remove(light);
        })
    }
    scene.environmentIntensity=0; 
})
const normal=document.getElementById('normal');
normal.addEventListener('click',function(){
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.material.map=m.userData.normal;
            m.material.normalMap=null;
            m.material.roughnessMap=null;
            m.material.metalnessMap=null;
            m.material.aoMap=null;
            m.material.roughness=1;
            m.material.metalness=0;
            m.material.needsUpdate=true;
            m.visible=true;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=false;
            }  

        }
            
    })
    if(sceneAmbient.userData.isAdded==false)
    {
        scene.add(sceneAmbient);
        sceneAmbient.userData.isAdded=true;
        sceneLights.forEach(light=>{
            scene.remove(light);
        })
    }
    scene.environmentIntensity=0; 
});
const metal=document.getElementById('metal');
metal.addEventListener('click',function(){
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.material.map=extractChannel(m.userData.metalness,2);
            m.material.normalMap=null;
            m.material.roughnessMap=null;
            m.material.metalnessMap=null;
            m.material.aoMap=null;
            m.material.roughness=1;
            m.material.metalness=0;
            m.material.needsUpdate=true;
            m.visible=true;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=false;
            }  

        }
            
    })
    if(sceneAmbient.userData.isAdded==false)
    {
        scene.add(sceneAmbient);
        sceneAmbient.userData.isAdded=true;
        sceneLights.forEach(light=>{
            scene.remove(light);
        })
    }
    scene.environmentIntensity=0; 
});
const rough=document.getElementById('rough');
rough.addEventListener('click',function(){
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.material.map=extractChannel(m.userData.roughness,1);
            m.material.map.needsUpdate=true;
            m.material.normalMap=null;
            m.material.roughnessMap=null;
            m.material.metalnessMap=null;
            m.material.aoMap=null;
            m.material.roughness=1;
            m.material.metalness=0;
            m.material.needsUpdate=true;
            m.visible=true;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=false;
            }  

        }
            
    })
    if(sceneAmbient.userData.isAdded==false)
    {
        scene.add(sceneAmbient);
        sceneAmbient.userData.isAdded=true;
        sceneLights.forEach(light=>{
            scene.remove(light);
        })
    }
    scene.environmentIntensity=0; 
});
const shaded=document.getElementById('shaded');
shaded.addEventListener('click',function(){
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.material.map=m.userData.baseColor;
            m.material.normalMap=m.userData.normal;
            m.material.roughnessMap=m.userData.roughness;
            m.material.metalnessMap=m.userData.metalness;
            m.material.roughness=m.userData.rough;
            m.material.metalness=m.userData.metal;
            m.material.aoMap=m.userData.occlusion;
            m.visible=true;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=false;
            }  

        }
            
    })
    if(sceneAmbient.userData.isAdded==true)
    {
        scene.remove(sceneAmbient);
        sceneAmbient.userData.isAdded=false;
        sceneLights.forEach(light=>{
            scene.add(light);
        })
    }
    scene.environmentIntensity=1; 
});
const wireframe=document.getElementById('wireframe');
wireframe.addEventListener('click',function()
{
    nowShowing.traverse(m=>{
        if(m.isMesh && m.material.isMeshStandardMaterial)
        {
            m.visible=false;
            if(m.userData.clone!=null)
            {
                m.userData.clone.visible=true;
                m.parent.add(m.userData.clone);
            }
            else
            console.log(m);
            
        }
            
    })
    if(sceneAmbient.userData.isAdded==true)
    {
        scene.remove(sceneAmbient);
        sceneAmbient.userData.isAdded=false;
        sceneLights.forEach(light=>{
            scene.add(light);
        })
    }
    scene.environmentIntensity=1; 
});
const closebtn=document.getElementById('closebutton')
closebtn.addEventListener('click',function(){
    document.querySelectorAll('.bookdiv').forEach(element=>{
        element.style.display='none';
    });
    option=0;
    activecamera=Pcamera;
    const canvas = renderer.domElement;
    if(activecamera==Pcamera)
    canvas.requestPointerLock();
})

prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);




animate();
export {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,HDRI,
       models,setSelectedObject};