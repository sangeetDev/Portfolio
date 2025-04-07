import * as THREE from 'three';
import {currentCamera,orbitControls,gui,cameraTracker,scene,selectedObject,transformControls,cameraChanged,activecamera,totalFrames,renderer,Paths,setSelectedObject,updateCameraAttributes} from '../main.js'
import { addTransformcontrols } from '../transformControls/TransformContols.js';
import { setKeyframe } from '../Animation&Keyframing/Iterpolate_Keyframing.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
function createCameraControls()
{
    let CameraControls=gui.addFolder('Camera Controls');

    let obj = { View: 'Perspective' };
    const options = ['Top', 'Bottom', 'Left', 'Right', 'Front', 'Back', 'Perspective'];
    CameraControls.add(obj, 'View',options).onChange(function(option){
        console.log('selected:', option);
        OnViewChange(currentCamera,option,orbitControls);
    });
    const cameraParams={
        add_camera:function(){
            addCamera();
        }
    }
    const shot_Params=
    {
        show_sequencer:function()
        {
            const sequencer=document.getElementById('Shot-Sequencer');
            if(sequencer.style.display="none")
            {
                sequencer.style.display="flex";
                showcameras();
                const closebtn=document.getElementById('close-button-sequencer');
                closebtn.addEventListener("click",function(){
                    sequencer.style.display="none";  
                });

            }
            else
            {
                sequencer.style.display="none";
            }
        }
    }
        
    const add_Camera=CameraControls.add(cameraParams,'add_camera').name("Add New Camera");
    const seq=CameraControls.add(shot_Params,"show_sequencer").name("Camera Sequencer");
    CameraControls.close();
}
function addCamera()
{
    const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    newCamera.fov=35;
    newCamera.position.z=-1;
    scene.add(newCamera);

    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 4);
    coneGeometry.rotateX(Math.PI / 2);
    coneGeometry.rotateZ(Math.PI / 4);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()), wireframe: true })
    const helper = new THREE.Mesh(coneGeometry, coneMaterial);
    helper.position.set(0,0,-0.5);
    const pivot=new THREE.Group();
    pivot.position.set(0,0,0);
    pivot.add(helper);
    pivot.add(newCamera);
    //helper.layers.set(1);
    //currentCamera.layers.enable(1);
    newCamera.layers.enable(0);
    scene.add(pivot);
    pivot.userData.progress = 0; // Initialize progress
    pivot.userData.speed = 1;
    pivot.userData.enableDOF=false; 
    cameraTracker.push(helper);
    helper.userData.pivot=pivot;
    helper.userData.camera=newCamera;
    helper.name="Camera"+cameraTracker.length;
    pivot.userData.camera=newCamera;
    pivot.name=helper.name;
    pivot.userData.followPath=false;
    pivot.userData.path=null;
    if(Paths.length>0)
    pivot.userData.path=Paths[0];
    else
    pivot.userData.path=null;
    pivot.userData.focus=0.5;
    pivot.userData.aperture=0.025;
    pivot.userData.maxblur=0.01;
    pivot.userData.farFocusDistance=5;
    pivot.userData.targetPosition=new THREE.Vector3(0,0,0);
    pivot.userData.enableTarget=false;
    pivot.userData.originalQuaternion=pivot.quaternion;
    pivot.userData.pathStartframe=0;
    pivot.userData.pathEndframe=0;
    pivot.userData.samplingFactor=4;
    pivot.userData.bokehpass=new BokehPass(scene, newCamera,
                             {
                                focus: pivot.userData.focus, // distance from camera where things are in focus
                                aperture: pivot.userData.aperture, // gap in the camera shutter.
                                maxblur: pivot.userData.maxblur, // amount of blur
                                width: window.innerWidth,
                                height: window.innerHeight,
                                farFocusDistance: pivot.userData.farFocusDistance
                             });
    pivot.userData.outputpass= new OutputPass();
    pivot.userData.composer= new EffectComposer(renderer);
    pivot.userData.renderpass=new RenderPass(scene,newCamera);
    pivot.userData.composer.addPass(pivot.userData.renderpass);
    pivot.userData.composer.addPass(pivot.userData.bokehpass);
    pivot.userData.composer.addPass(pivot.userData.outputpass);
    pivot.userData.enableDOF=false;

    const PContainer=document.getElementById('Cameras-Container');
    const Button=document.createElement('button');
    Button.textContent=pivot.name;
    PContainer.appendChild(Button);
    Button.addEventListener('click',function()
    {
        setSelectedObject(pivot);
        transformControls.detach();
        addTransformcontrols(pivot);
        updateCameraAttributes();
    })

    //showcameras();
}
function showcameras()
{
   const sequencer=document.getElementById('Shot-Sequencer');
   const cameralist=document.getElementById('Camera-List');
   
   cameralist.innerHTML="";
   
   const listhead=document.createElement('div');
   listhead.innerHTML=`<strong>Cameras:<strong>`;
   listhead.style.fontSize="12px";
   listhead.style.color="black";
   cameralist.appendChild(listhead);
   if(sequencer.style.display=="flex")
   {
       if(cameraTracker.length>0) 
       {
            for(let i=0;i<cameraTracker.length;i++)
            {
                const helper=cameraTracker[i];
                //const camera=helper.userData.camera;
                const name=helper.name;
                console.log(name);
                const div=document.createElement('div');
                cameralist.appendChild(div);
                const cameraname=document.createElement('div');
                cameraname.innerHTML=`<strong>${name}<strong`;
                cameraname.style.color='black';
                cameraname.style.fontSize="12px";
                div.appendChild(cameraname);
                div.style.padding="10px"


            }
       }
   }
   const shotBlock=document.getElementById("Shot-Blocks");
   let numLines;
   shotBlock.innerHTML="";
   if (totalFrames <= 100) 
    {
    numLines = totalFrames;
    } 
    else if (totalFrames > 100 && totalFrames <= 1000) 
    {
    numLines = Math.floor(totalFrames / 10) + (totalFrames % 10);
    }
    else if (totalFrames > 1000 && totalFrames <= 10000) 
    {
      numLines = Math.floor(totalFrames / 100) + (totalFrames % 100);  
    }

  // Clear existing lines
  const framesnumber=document.createElement('div');
  framesnumber.innerHTML='';
  framesnumber.style.display="flex";
  framesnumber.style.alignItems="stretch";
  framesnumber.style.justifyContent= "space-between";
  framesnumber.style.width="100%";
  framesnumber.style.height="5%";
  framesnumber.style.backgroundColor= "bisque";
  //shotBlock.style.display="flex";
  shotBlock.appendChild(framesnumber);
  
  const timeline=document.createElement('div');
  timeline.style.display="flex";
  timeline.style.alignItems="stretch";
  timeline.style.justifyContent="space-between";
  timeline.style.width="100%";
  timeline.style.height="95%";
  shotBlock.appendChild(timeline);
 
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
    p.style.fontSize = '7px';

    p.style.color="black";
    //p.style.transform = "rotate(270deg)";
    //p.style.transformOrigin = "center";
    p.classList.add('p')
    p.style.textAlign="center";
    timeline.appendChild(line);
    framesnumber.appendChild(p);
  }
  for (let i = 0; i < cameraTracker.length; i++) {
    const helper = cameraTracker[i];
    const pivot=helper.parent;
    const rectangle = document.createElement('div');
    rectangle.classList="rectangle";
    rectangle.style.position = 'absolute';
    rectangle.style.backgroundColor = '#4682b4';
    rectangle.style.border = '1px solid #004080';
    rectangle.style.height = '20px';
    rectangle.style.top = `${i * 40 + 20}px`; // Example positioning
    rectangle.style.overflow = 'hidden';
    rectangle.style.cursor = 'default';
    rectangle.dataset.cameraName = helper.name; 
    let startframe,endframe;// Store camera name
    if(pivot.userData.startframe&&pivot.userData.endframe)
    {
        startframe=pivot.userData.startframe;
        endframe=pivot.userData.endframe;
        const shotBlockRect = shotBlock.getBoundingClientRect();
        const frameWidth = shotBlockRect.width / totalFrames; 
        const width=(endframe-startframe+1)*frameWidth;
        const left=startframe*frameWidth;
        rectangle.style.width=`${width}px`;
        rectangle.style.left=`${left}px`;
    }
    else
    {
        rectangle.style.width = '100%';
        rectangle.style.left = '0px';

    }
    if(i==0)
        rectangle.style.top = '20px'; // Spread out for visualization
        else
        {
            rectangle.style.top = `${(i+ 1)* 20+(i*15)}px`;
        }
        rectangle.dataset.cameraName = helper.name; // Store camera name


    shotBlock.appendChild(rectangle);
   
    
        // Left input for frame number
        const leftInput = document.createElement('input');
        leftInput.type = 'text';
        leftInput.style.position = 'absolute';
        leftInput.style.left = '0px'; // Offset to the left of the rectangle
        leftInput.style.top = '5px';
        leftInput.style.width = '12px';
        leftInput.style.height = '10px';
        leftInput.style.border = '1px solid #004080';
        leftInput.style.textAlign = 'center';
        leftInput.style.fontSize='7px';
        leftInput.value=startframe;
    
        // Right input for frame number
        const rightInput = document.createElement('input');
        rightInput.type = 'text';
        rightInput.style.position = 'absolute';
        rightInput.style.right = '0px'; // Offset to the right of the rectangle
        rightInput.style.top = '5px';
        rightInput.style.width = '12px';
        rightInput.style.height = '10px';
        rightInput.style.border = '1px solid #004080';
        rightInput.style.textAlign = 'center';
        rightInput.style.fontSize='7px';
        rightInput.value=endframe;
    
        // Add inputs to the rectangle
        rectangle.appendChild(leftInput);
        rectangle.appendChild(rightInput);
    
        // Event listener for left input
        leftInput.addEventListener('change', () => {
            const shotBlockRect = shotBlock.getBoundingClientRect();
            const frameWidth = shotBlockRect.width / totalFrames; // Assuming 200 frames
            const frameNumber = parseInt(leftInput.value);
            pivot.userData.startframe=frameNumber;
    
            if (!isNaN(frameNumber)) {
                const newLeft = frameWidth * frameNumber;
                const rect = rectangle.getBoundingClientRect();
                const newWidth = rect.right - (shotBlockRect.left + newLeft);
                
                if (newWidth > 10) { // Minimum width
                    rectangle.style.left = `${newLeft}px`;
                    rectangle.style.width = `${newWidth}px`;
                }
            }
        });
    
        // Event listener for right input
        rightInput.addEventListener('change', () => {
            const shotBlockRect = shotBlock.getBoundingClientRect();
            const frameWidth = shotBlockRect.width / totalFrames; // Assuming 200 frames
            const frameNumber = parseInt(rightInput.value);
           
            if (!isNaN(frameNumber)) 
            {
                const newWidth=frameNumber*frameWidth-pivot.userData.startframe*frameWidth;
                rectangle.style.width = `${newWidth}px`;   
            }
            pivot.userData.endframe=frameNumber;
        });   
}   
}
function OnViewChange(camera,selectedOption,controls)
{
   
    
    let position = new THREE.Vector3();
    let target = new THREE.Vector3();
    const width= window.innerWidth;
    const height= window.innerHeight;
    switch(selectedOption)
    {
        case 'Top':
            //console.log('top');
            position.set(0, 10, 0);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Bottom':
            //console.log('bottom');
            position.set(0, -10, 0);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Left':
            //console.log('left');
            position.set(-10, 0, 0);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Right':
            //console.log('right');
            position.set(10, 0, 0);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Front':
            //console.log('front');
            position.set(0, 0, 10);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Back':
            //console.log('back');
            position.set(0, 0, -10);
            target.set(0, 0, 0);
            controls.enableRotate=false;
            break;
        case 'Perspective':
            position.set(5,5,5);
            target.set(0, 0, 0);
            controls.enableRotate=true;
            break; 
    }
    camera.position.copy(position);
    camera.lookAt(target);
    controls.target.copy(target);
    controls.update();
    
}
function getSampledPoints()
{
    const initialFrame=selectedObject.userData.pathStartframe;
    const finalFrame=selectedObject.userData.pathEndframe;
    const samplingfactor=selectedObject.userData.samplingFactor;
    const frameduration=finalFrame-initialFrame+1
    const increment=Math.round(frameduration/samplingfactor);
    const spline=selectedObject.userData.path.userData.spline;
    let frame=initialFrame
    if(initialFrame>0)
    {
        setKeyframe(selectedObject,0);
    }
    for (let i = 0; i <= samplingfactor; i++) 
    {
        const t = i / samplingfactor;
        const point = spline.getPointAt(t);
        selectedObject.position.copy(point);
        if(i==0)
        {   
            
            setKeyframe(selectedObject,initialFrame);
            setKeyframe(selectedObject,initialFrame);
            setKeyframe(selectedObject,finalFrame);
            setKeyframe(selectedObject,finalFrame);
        }
        else
        {
            frame=frame+increment;
            setKeyframe(selectedObject,frame);
        }    
    }
    selectedObject.position.copy(spline.getPointAt(0).clone());
}
export{createCameraControls,showcameras,getSampledPoints}