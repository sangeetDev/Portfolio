import * as THREE from 'three';
import {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,lights,traverseScene,
    lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
    EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials,getUVSets,UVsets,index,fileNames,
    loadGLBFromDrive,updateTimeline,Paths,updateCameraAttributes,Hotspots,onKeyDown,setSelectedObject} from  '../main.js';
import { addTransformcontrols } from '../transformControls/TransformContols.js';

function Hotspotcontrols()
{
    const HotspotFolder=gui.addFolder("Hotspot Controls");
    const hotspotParams={
        add_spot:function(){createHostspot()},
        config_hotspot:function(){confighotspot()}
    }
    const addSpot=HotspotFolder.add(hotspotParams,'add_spot').name('Add Hotspot');
    const confspot=HotspotFolder.add(hotspotParams,'config_hotspot').name('Configure Hotspots');
    HotspotFolder.close();
}
function confighotspot()
{
    const attr=document.getElementById('container');
    attr.innerHTML='';
    let selectedHostspot,selectedModel,selectedAnimation;
    if(Hotspots.includes(selectedObject));
    selectedHostspot=selectedObject;
    transformControls.detach();
    addTransformcontrols(selectedHostspot);
    
    if(models.length>0)
    {
        selectedModel=models[0];
        if(!selectedHostspot.userData.animationModel)
        selectedHostspot.userData.animationModel=selectedModel;
        if(selectedModel.animations.length>0)
        {
            selectedAnimation=selectedModel.animations[0].name;
            
            //selectedHostspot.userData.triggerAnimation=selectedAnimation;
        }
        
    }
    const mixer = new THREE.AnimationMixer(selectedModel);
   

    const div2=document.createElement('div');
    div2.innerHTML=`<strong>Enter Position<strong>`;

    const X=document.createElement('input');
    X.type='text';
    X.value=selectedHostspot.position.x;
    X.addEventListener('input', function(event){
        selectedHostspot.position.x=parseFloat(event.target.value);
    });
    const Y=document.createElement('input');
    Y.type='text';
    Y.value=selectedHostspot.position.y;
    Y.addEventListener('input', function(event){
        selectedHostspot.position.y=parseFloat(event.target.value);
    });
    const Z=document.createElement('input');
    Z.type='text';
    Z.value=selectedHostspot.position.z;
    Z.addEventListener('input', function(event){
        selectedHostspot.position.z=parseFloat(event.target.value);
    });
    attr.appendChild(div2);
    attr.appendChild(X);
    attr.appendChild(Y);
    attr.appendChild(Z);

    
    const div3=document.createElement('div');
    div3.innerHTML=`<strong>Enter Look At Position<strong>`;

    const X1=document.createElement('input');
    X1.type='text';
    X1.value=selectedHostspot.userData.lookAt.x;
    X1.addEventListener('input', function(event){
        selectedHostspot.userData.lookAt.x=parseFloat(event.target.value);
    });
    const Y1=document.createElement('input');
    Y1.type='text';
    Y1.value=selectedHostspot.userData.lookAt.y;
    Y1.addEventListener('input', function(event){
        selectedHostspot.userData.lookAt.y=parseFloat(event.target.value);
    });
    const Z1=document.createElement('input');
    Z1.type='text';
    Z1.value=selectedHostspot.userData.lookAt.z;
    Z1.addEventListener('input', function(event){
        selectedHostspot.userData.lookAt.z=parseFloat(event.target.value);
    });
    attr.appendChild(div3);
    attr.appendChild(X1);
    attr.appendChild(Y1);
    attr.appendChild(Z1);
    
    const div4=document.createElement('div');
    div4.innerHTML=`<strong>Enter final Camera Position<strong>`;

    const X4=document.createElement('input');
    X4.type='text';
    X4.value=selectedHostspot.userData.finalposition.x;
    X4.addEventListener('input', function(event){
        selectedHostspot.userData.finalposition.x=parseFloat(event.target.value);
    });
    const Y4=document.createElement('input');
    Y4.type='text';
    Y4.value=selectedHostspot.userData.finalposition.y;
    Y4.addEventListener('input', function(event){
        selectedHostspot.userData.finalposition.y=parseFloat(event.target.value);
    });
    const Z4=document.createElement('input');
    Z4.type='text';
    Z4.value=selectedHostspot.userData.finalposition.z;
    Z4.addEventListener('input', function(event){
        selectedHostspot.userData.finalposition.z=parseFloat(event.target.value);
    });
    attr.appendChild(div4);
    attr.appendChild(X4);
    attr.appendChild(Y4);
    attr.appendChild(Z4);

    const triggerDiv=document.createElement('div');
    triggerDiv.innerHTML=`<strong>Add Animation<strong>`;
    attr.appendChild(triggerDiv);

    const modeldiv=document.createElement('div');
    modeldiv.innerHTML=`Select Model`;
    attr.appendChild(modeldiv);
    const modelDropdown=document.createElement('select');
    if(models.length>0)
    {
        models.forEach((model,index)=>{
            const option = document.createElement('option');
                option.text = model.name;
                option.value = index;
                option.id='model'
                modelDropdown.appendChild(option);
        })
    }
    
    attr.appendChild(modelDropdown);
    
    const animationdiv=document.createElement('div');
    animationdiv.innerHTML=`Select Animation`;
    attr.appendChild(animationdiv);

    const animationDropDown=document.createElement('select');
    if(selectedModel.animations.length>0)
    {
        console.log(selectedModel.animations)
        selectedModel.animations.forEach((clip,index)=>{
            const option = document.createElement('option');
                option.textContent = clip.name;
                option.value = index;
                option.id='anim'
                animationDropDown.appendChild(option);
        })
    }
    
    attr.appendChild(animationDropDown);

    animationDropDown.addEventListener('change',(event)=>
    {
        selectedAnimation=selectedModel.animations[parseInt(event.target.value)].name;
        selectedHostspot.userData.triggerAnimation=selectedAnimation;

    });

    modelDropdown.addEventListener('change',(event)=>
    {
        Array.from(attr.children).forEach(child => {
            if (child ==animationDropDown) {
              attr.removeChild(child);
            }
          });
        selectedModel=models[parseInt(event.target.value)];
        selectedHostspot.userData.animationModel=selectedModel;
        const animationDropDown=document.createElement('select');
        if(selectedModel.animations.length>0)
        {
            console.log(selectedModel.animations)
            selectedModel.animations.forEach((clip,index)=>{
                const option = document.createElement('option');
                    option.textContent = clip.name;
                    option.value = index;
                    option.id='anim'
                    animationDropDown.appendChild(option);
            })
        }
        attr.appendChild(animationDropDown);

        animationDropDown.addEventListener('change',(event)=>
        {
            selectedAnimation=selectedModel.animations[parseInt(event.target.value)].name;
            selectedHostspot.userData.triggerAnimation=selectedAnimation;

        })
    });


   /* dropdown.addEventListener('change', (event) => 
    {
        selectedHostspot = Hotspots[parseInt(event.target.value)];
        transformControls.detach();
        addTransformcontrols(selectedHostspot);
        selectedHostspot.userData.animationModel=models[0];
        //const KeepElement=document.getElementById(dropdown);
        Array.from(attr.children).forEach(child => {
            if (child !== dropdown) {
              attr.removeChild(child);
            }
          });
        const div2=document.createElement('div');
        div2.innerHTML=`<strong>Enter Position<strong>`;
    
        const X=document.createElement('input');
        X.type='text';
        X.value=selectedHostspot.position.x;
        X.addEventListener('input', function(event){
            selectedHostspot.position.x=parseFloat(event.target.value);
        });
        const Y=document.createElement('input');
        Y.type='text';
        Y.value=selectedHostspot.position.y;
        Y.addEventListener('input', function(event){
            selectedHostspot.position.y=parseFloat(event.target.value);
        });
        const Z=document.createElement('input');
        Z.type='text';
        Z.value=selectedHostspot.position.z;
        Z.addEventListener('input', function(event){
            selectedHostspot.position.z=parseFloat(event.target.value);
        });
        attr.appendChild(div2);
        attr.appendChild(X);
        attr.appendChild(Y);
        attr.appendChild(Z);
    
        
        const div3=document.createElement('div');
        div3.innerHTML=`<strong>Enter Look At Position<strong>`;
    
        const X1=document.createElement('input');
        X1.type='text';
        X1.value=selectedHostspot.userData.lookAt.x;
        X1.addEventListener('input', function(event){
            selectedHostspot.userData.lookAt.x=parseFloat(event.target.value);
        });
        const Y1=document.createElement('input');
        Y1.type='text';
        Y1.value=selectedHostspot.userData.lookAt.y;
        Y1.addEventListener('input', function(event){
            selectedHostspot.userData.lookAt.y=parseFloat(event.target.value);
        });
        const Z1=document.createElement('input');
        Z1.type='text';
        Z1.value=selectedHostspot.userData.lookAt.z;
        Z1.addEventListener('input', function(event){
            selectedHostspot.userData.lookAt.z=parseFloat(event.target.value);
        });
        attr.appendChild(div3);
        attr.appendChild(X1);
        attr.appendChild(Y1);
        attr.appendChild(Z1);

        const div4=document.createElement('div');
        div4.innerHTML=`<strong>Enter final Camera Position<strong>`;
    
        const X4=document.createElement('input');
        X4.type='text';
        X4.value=selectedHostspot.userData.finalposition.x;
        X4.addEventListener('input', function(event){
            selectedHostspot.userData.finalposition.x=parseFloat(event.target.value);
        });
        const Y4=document.createElement('input');
        Y4.type='text';
        Y4.value=selectedHostspot.userData.finalposition.y;
        Y4.addEventListener('input', function(event){
            selectedHostspot.userData.finalposition.y=parseFloat(event.target.value);
        });
        const Z4=document.createElement('input');
        Z4.type='text';
        Z4.value=selectedHostspot.userData.finalposition.z;
        Z4.addEventListener('input', function(event){
            selectedHostspot.userData.finalposition.z=parseFloat(event.target.value);
        });
        attr.appendChild(div4);
        attr.appendChild(X4);
        attr.appendChild(Y4);
        attr.appendChild(Z4);

        const triggerDiv=document.createElement('div');
        triggerDiv.innerHTML=`<strong>Add Animation<strong>`;
        attr.appendChild(triggerDiv);
    
        const modeldiv=document.createElement('div');
        modeldiv.innerHTML=`Select Model`;
        attr.appendChild(modeldiv);
        const modelDropdown=document.createElement('select');
        if(models.length>0)
        {
            models.forEach((model,index)=>{
                const option = document.createElement('option');
                    option.text = model.name;
                    option.value = index;
                    option.id='model'
                    modelDropdown.appendChild(option);
            })
        }
        
        attr.appendChild(modelDropdown);
        
        const animationdiv=document.createElement('div');
        animationdiv.innerHTML=`Select Animation`;
        attr.appendChild(animationdiv);
    
        const animationDropDown=document.createElement('select');
        if(selectedModel.animations.length>0)
        {
            console.log(selectedModel.animations)
            selectedModel.animations.forEach((clip,index)=>{
                const option = document.createElement('option');
                    option.textContent = clip.name;
                    option.value = index;
                    option.id='anim'
                    animationDropDown.appendChild(option);
            })
        }
        attr.appendChild(animationDropDown);
    
        animationDropDown.addEventListener('change',(event)=>
        {
            selectedAnimation=selectedModel.animations[parseInt(event.target.value)].name;
            selectedHostspot.userData.triggerAnimation=selectedAnimation;
            console.log(selectedHostspot.userData.triggerAnimation);
            
    
        });
    
        modelDropdown.addEventListener('change',(event)=>
        {
            Array.from(attr.children).forEach(child => {
                if (child ==animationDropDown) {
                  attr.removeChild(child);
                }
              });
            selectedModel=models[parseInt(event.target.value)];
            selectedHostspot.userData.animationModel=selectedModel;
            const animationDropDown=document.createElement('select');
            if(selectedModel.animations.length>0)
            {
                console.log(selectedModel.animations)
                selectedModel.animations.forEach((clip,index)=>{
                    const option = document.createElement('option');
                        option.textContent = clip.name;
                        option.value = index;
                        option.id='anim'
                        animationDropDown.appendChild(option);
                })
            }
            attr.appendChild(animationDropDown);
    
            animationDropDown.addEventListener('change',(event)=>
            {
                selectedAnimation=selectedModel.animations[parseInt(event.target.value)].name;
                selectedHostspot.userData.triggerAnimation=selectedAnimation;
    
            })
        });
    });*/
}
function addHotspot()
{
    //selectedObject.userData.information="";
    const attr=document.getElementById('container');
    attr.innerHTML='';
    /*let Text;
    const div1=document.createElement('div');
    div1.innerHTML=`<strong>Enter Text for Hotspot<strong>`;
    const info=document.createElement('textarea');
    info.rows='5';
    info.cols='30';
    info.id='multiline-input-2D';
    info.addEventListener('input', function(event){
        document.removeEventListener('keydown',onKeyDown,true);
        Text=event.target.value;
        document.addEventListener('keydown',onKeyDown,true);
    });
    attr.appendChild(div1);
    attr.appendChild(info);*/

    const position=new THREE.Vector3(0,0,0);
    const div1=document.createElement('div');
    div1.innerHTML=`<strong>Enter Position<strong>`;

    const X=document.createElement('input');
    X.type='text';
    X.value=position.x;
    X.addEventListener('input', function(event){
        position.x=parseFloat(event.target.value);
    });
    const Y=document.createElement('input');
    Y.type='text';
    Y.value=position.y;
    Y.addEventListener('input', function(event){
        position.y=parseFloat(event.target.value);
    });
    const Z=document.createElement('input');
    Z.type='text';
    Z.value=position.z;
    Z.addEventListener('input', function(event){
        position.z=parseFloat(event.target.value);
    });
    attr.appendChild(div1);
    attr.appendChild(X);
    attr.appendChild(Y);
    attr.appendChild(Z);

    const finalposition=new THREE.Vector3(0,0,0);
    const div2=document.createElement('div');
    div2.innerHTML=`<strong>Enter final Camera Position<strong>`;

    const X2=document.createElement('input');
    X2.type='text';
    X2.value=finalposition.x;
    X2.addEventListener('input', function(event){
        finalposition.x=parseFloat(event.target.value);
    });
    const Y2=document.createElement('input');
    Y2.type='text';
    Y2.value=finalposition.y;
    Y2.addEventListener('input', function(event){
        finalposition.y=parseFloat(event.target.value);
    });
    const Z2=document.createElement('input');
    Z2.type='text';
    Z2.value=finalposition.z;
    Z2.addEventListener('input', function(event){
        finalposition.z=parseFloat(event.target.value);
    });
    attr.appendChild(div2);
    attr.appendChild(X2);
    attr.appendChild(Y2);
    attr.appendChild(Z2);

    const LookAtposition=new THREE.Vector3(0,0,0);
    const div3=document.createElement('div');
    div3.innerHTML=`<strong>Enter Look At Position<strong>`;

    const X1=document.createElement('input');
    X1.type='text';
    X1.value=LookAtposition.x;
    X1.addEventListener('input', function(event){
        LookAtposition.x=parseFloat(event.target.value);
    });
    const Y1=document.createElement('input');
    Y1.type='text';
    Y1.value=LookAtposition.y;
    Y1.addEventListener('input', function(event){
        LookAtposition.y=parseFloat(event.target.value);
    });
    const Z1=document.createElement('input');
    Z1.type='text';
    Z1.value=LookAtposition.z;
    Z1.addEventListener('input', function(event){
        LookAtposition.z=parseFloat(event.target.value);
    });
    attr.appendChild(div3);
    attr.appendChild(X1);
    attr.appendChild(Y1);
    attr.appendChild(Z1);

    const button=document.createElement('button');
    button.textContent='Create Hotspot';
    button.addEventListener('click',function()
    {
         createHostspot();
    });
    attr.appendChild(button);
}
function createHostspot()
{
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Draw a red circle
    ctx.strokeStyle = 'DodgerBlue';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, Math.PI * 2);
    ctx.stroke();

    // Draw a number inside the ring
    ctx.fillStyle = 'DodgerBlue';
    ctx.font = 'bold 60px Arial'; // Font size and style
    ctx.textAlign = 'center'; // Center align horizontally
    ctx.textBaseline = 'middle'; // Center align vertically
    ctx.fillText(Hotspots.length+1, canvas.width / 2, canvas.height / 2);

    const imageElement = document.getElementById('spriteImage');
    const texture = /*1new THREE.Texture(imageElement);*/ new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest:false,depthWrite:false});
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5,0.5,0.5);
    scene.add(sprite);

    const cameraDirection = new THREE.Vector3();
    currentCamera.getWorldDirection(cameraDirection);
    
    const raycaster = new THREE.Raycaster();
    // Set the raycaster from the camera's position and direction
    raycaster.set(currentCamera.position, cameraDirection);
    const mouse = new THREE.Vector2();
    // Get all objects in the scene
    const objects = [];
    scene.traverse((child) => {
        if (child.isMesh) objects.push(child);
    });

    // Find intersections
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        // Place object at the first intersection point
        const intersectionPoint = intersects[0].point;
        sprite.position.copy(intersectionPoint);
    } else {
        // Place object 1 unit in front of the camera
        const targetPosition = new THREE.Vector3();
        targetPosition.copy(currentCamera.position).add(cameraDirection.multiplyScalar(1));
        sprite.position.copy(targetPosition);
    }
    
    Hotspots.push(sprite);
    //sprite.position.copy(position);
    sprite.userData.lookAt=sprite.position.clone();
    sprite.userData.finalposition=currentCamera.position.clone();
    sprite.name='Hotspot_'+ Hotspots.length;
    const HContainer=document.getElementById('Hotspots-Container');
    const Button=document.createElement('button');
    Button.textContent=sprite.name;
    Button.addEventListener('click',function()
    {
        setSelectedObject(sprite);
        transformControls.detach();
        addTransformcontrols(sprite);
        confighotspot();
    });
    HContainer.appendChild(Button);
    //selectedObject.userData.Hotspot=sprite;
    
}
function createTextSprite(text, font = "30px Arial", color = "black", backgroundColor = "white") {
    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size based on the text
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const textHeight = ctx.measureText(text).height;
    canvas.width = textWidth + 20; // Padding
    canvas.height = 40; // Fixed height or adjust as needed

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = font;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create a sprite material and sprite
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Adjust the sprite scale based on the canvas size
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);

    return sprite;
}
function updateHotspotScale()
{
    if(Hotspots.length>0)
    {
        Hotspots.forEach((sprite)=>{
            const distance = sprite.position.distanceTo(currentCamera.position);
            sprite.scale.set(distance*0.2,distance*0.2,distance*0.2);
        })
        
    }

}



export {Hotspotcontrols,updateHotspotScale};