import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { CustomPointLightHelper } from './CustomPointLightHelper.js';
import { DLight } from './directionalLight.js';
import  {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,lights,traverseScene,
    lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
    EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials,getUVSets,UVsets,index,fileNames,
    loadGLBFromDrive,updateTimeline,Paths,updateCameraAttributes,Hotspots,onKeyDown,setSelectedObject} from '../main.js'
import { CustomDirectionalLightHelper } from './CustomDirectionalLightHelper.js';
import { addTransformcontrols } from '../transformControls/TransformContols.js';

function addPointLight()
{
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const hexColor = `#${randomColor.padStart(6, '0x')}`;
    const PointLight=new THREE.PointLight(0xffffff, 5, 100);
    PointLight.power=100;
    PointLight.castShadow=true;
    PointLight.shadow.mapSize.width = 2048; // Set to appropriate values for your scene
    PointLight.shadow.mapSize.height = 2048;
    PointLight.shadow.camera.near = 0.5;
    PointLight.shadow.camera.far = 500;
    PointLight.shadow.bias=-0.0001;
    const PointLightHelper=new CustomPointLightHelper(PointLight,hexColor);
    PointLight.userData.helper=PointLightHelper;
    scene.add(PointLightHelper,PointLight);
    lights.push(PointLightHelper);
    PointLight.name="PointLight"+lights.length;
    PointLight.userData.helper=PointLightHelper;
    const LightPanel=document.getElementById("Lights-Container");
    const Button=document.createElement('button');
    Button.textContent=PointLight.name;
    LightPanel.appendChild(Button);
    Button.addEventListener('click',function()
    {
        const attr=document.getElementById('container');
        attr.innerHTML="";
        setSelectedObject(PointLight);
        transformControls.detach();
        addTransformcontrols(selectedObject);
        updateAttributeEditorLight();

    });

}

function addSpotLight()
{
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const hexColor = `#${randomColor.padStart(6, '0x')}`;
    const spotlight=new THREE.SpotLight(0xffffff,5,2,Math.PI/6);
    const spotLightHelper=new THREE.SpotLightHelper(spotlight,hexColor);
    const spheregeo=new THREE.SphereGeometry(0.1,16,16);
    const material=new THREE.MeshBasicMaterial({color:hexColor,wireframe:true});
    const targetMesh=new THREE.Mesh(spheregeo,material);
    spotlight.castShadow=true;
    spotlight.shadow.mapSize.width = 2048; // Set to appropriate values for your scene
    spotlight.shadow.mapSize.height = 2048;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = 500;
    spotlight.shadow.bias = -0.001;
    spotlight.shadow.focus=1;
    spotlight.userData.helper=spotLightHelper;
    spotlight.userData.targethelper=targetMesh;
    targetMesh.userData.light=spotlight;
    scene.add(spotlight)
    scene.add(spotLightHelper)
    lights.push(spotLightHelper);
    spotlight.name="SpotLight"+lights.length;
    spotlight.userData.helper=spotLightHelper;
    
    scene.add(spotlight.target);
    spotlight.userData.targethelper=targetMesh;
    targetMesh.userData.light=spotlight;
    lighttargets.push(targetMesh);
    scene.add(targetMesh);

    const LightPanel=document.getElementById("Lights-Container");
    const Button=document.createElement('button');
    Button.textContent=spotlight.name;
    LightPanel.appendChild(Button);
    Button.addEventListener('click',function()
    {
        const attr=document.getElementById('container');
        attr.innerHTML="";
        setSelectedObject(spotlight);
        transformControls.detach();
        addTransformcontrols(selectedObject);
        updateAttributeEditorLight();

    });
}
function addRectAreaLight()
{
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const hexColor = `#${randomColor.padStart(6, '0x')}`;
    const rectAreaLight=new THREE.RectAreaLight(0xffffff,3,2,2);
    const rectAreaLightHelper=new RectAreaLightHelper(rectAreaLight,hexColor);
    rectAreaLight.userData.helper=rectAreaLightHelper;
    scene.add(rectAreaLight);
    scene.add(rectAreaLightHelper);
    lights.push(rectAreaLightHelper);
    rectAreaLight.name="RectAreaLight"+lights.length;
    rectAreaLight.userData.helper=rectAreaLightHelper;
    const LightPanel=document.getElementById("Lights-Container");
    const Button=document.createElement('button');
    Button.textContent=rectAreaLight.name;
    LightPanel.appendChild(Button);
    Button.addEventListener('click',function()
    {
        const attr=document.getElementById('container');
        attr.innerHTML="";
        setSelectedObject(rectAreaLight);
        transformControls.detach();
        addTransformcontrols(selectedObject);
        updateAttributeEditorLight();

    });
    
}
function addHemisphereLight()
{
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const hexColor = `#${randomColor.padStart(6, '0x')}`;
    const hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    const hemilightHelper=new THREE.HemisphereLightHelper(hemilight,20,hexColor);

    hemilight.userData.helper=hemilightHelper;
    scene.add(hemilight);
    scene.add(hemilightHelper);
    lights.push(hemilightHelper);
    hemilight.name="HemisphereLight"+lights.length;
    hemilight.userData.helper=hemilightHelper;
    const LightPanel=document.getElementById("Lights-Container");
    const Button=document.createElement('button');
    Button.textContent=hemilight.name;
    LightPanel.appendChild(Button);
    Button.addEventListener('click',function()
    {
        const attr=document.getElementById('container');
        attr.innerHTML="";
        setSelectedObject(hemilight);
        transformControls.detach();
        addTransformcontrols(selectedObject);
        updateAttributeEditorLight();

    });
}
function addDirectionalLight()
{
    const DirectionalLight=new THREE.DirectionalLight(0xffffff,3);
    const color=new THREE.Color(Math.random(),Math.random(),Math.random());
    const directionalhelper=new CustomDirectionalLightHelper(DirectionalLight,1,color);
    const spheregeo=new THREE.SphereGeometry(0.1,16,16);
    const material=new THREE.MeshBasicMaterial({color:color,wireframe:true});
    const targetMesh=new THREE.Mesh(spheregeo,material);
    DirectionalLight.position.set(0,1,0);
    scene.add(DirectionalLight.target);
    DirectionalLight.target.position.set(0,0,0);
    DirectionalLight.castShadow=true;
    DirectionalLight.shadow.mapSize.width = 2048; // Set to appropriate values for your scene
    DirectionalLight.shadow.mapSize.height = 2048;
   // DirectionalLight.shadow.camera.near = 0.005;
    //DirectionalLight.shadow.camera.far = 500;
      DirectionalLight.shadow.bias = -0.0001;
    //DirectionalLight.shadow.focus=1;
    DirectionalLight.userData.helper=directionalhelper;
    DirectionalLight.userData.targethelper=targetMesh;
    targetMesh.userData.light=DirectionalLight;
    scene.add(DirectionalLight)
    scene.add(directionalhelper)
    lights.push(directionalhelper);
    DirectionalLight.name="DirectionalLight"+lights.length;
    DirectionalLight.userData.helper=directionalhelper;
    
    DirectionalLight.userData.targethelper=targetMesh;
    targetMesh.userData.light=DirectionalLight;
    lighttargets.push(targetMesh);
    scene.add(targetMesh);
    const LightPanel=document.getElementById("Lights-Container");
    const Button=document.createElement('button');
    Button.textContent=DirectionalLight.name;
    LightPanel.appendChild(Button);
    Button.addEventListener('click',function()
    {
        const attr=document.getElementById('container');
        attr.innerHTML="";
        setSelectedObject(DirectionalLight);
        transformControls.detach();
        addTransformcontrols(selectedObject);
        updateAttributeEditorLight();

    });

}
function addLightControls()
{
    const Lightcontrols=gui.addFolder('Light Controls')
    const Params=
    {
        add_point:function(){addPointLight()},
        add_SpotLight:function(){addSpotLight()},
        add_rectLight:function(){addRectAreaLight()},
        add_hemiLight:function(){addHemisphereLight()},
        add_directionalLight:function(){addDirectionalLight()}
    }
    const pointLight=Lightcontrols.add(Params,'add_point').name('Add Point Light');
    const spotLight=Lightcontrols.add(Params,'add_SpotLight').name('Add SpotLight');
    const rectLight=Lightcontrols.add(Params,'add_rectLight').name('Add Rectangular Area light');
    const hemiLight=Lightcontrols.add(Params,'add_hemiLight').name('Add Hemisphere Light');
    const directLight=Lightcontrols.add(Params,'add_directionalLight').name('Add Directional Light');
    Lightcontrols.close();

}
function updateAttributeEditorLight()
{
    const attr=document.getElementById("container")
    if(selectedObject)
    {
        if(selectedObject instanceof THREE.DirectionalLight)//directionalLight
        {
            let obj=selectedObject;
            console.log(obj);
            attr.innerHTML="";
            const LightName=document.createElement('div');
            LightName.innerHTML = `<strong>${selectedObject.name.toUpperCase()}`;
            attr.appendChild(LightName);
            for(const key in obj)
            {
                if (obj.hasOwnProperty(key)) 
                {
                    let value, propertyElement;
                    switch(key)
                    {   
                        case 'color':
                                    value = obj[key];
                                    propertyElement = document.createElement('div');
                                    propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                                    attr.appendChild(propertyElement);
                                    const colorPicker = document.createElement('input');
                                    colorPicker.type = 'color';
                                    colorPicker.id = 'colorPicker';
                                    colorPicker.value = '#'+value.getHex().toString(16);
                                    attr.appendChild(colorPicker); 
                                    colorPicker.addEventListener('input', function(event)
                                    {
                                        const selectedColorValue = event.target.value;
                                        const selectedColor = new THREE.Color(selectedColorValue);
                                        obj.color=new THREE.Color(selectedColor);
                                        propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                                    });
                                    break;
                        case 'castShadow':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const shadow=document.createElement('input');
                                    shadow.type='checkbox';
                                    shadow.id='enable-shadow';
                                    shadow.checked=value;
                                    shadow.addEventListener('change',function()
                                    {
                                        if(shadow.checked)
                                        {
                                            obj.castShadow=true;
                                        }
                                        else
                                        {
                                            obj.castShadow=false;
                                        }
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(shadow);
                                    break;
                        case 'intensity':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const intensity=document.createElement('input');
                                    intensity.type='text';
                                    intensity.id='Intensity';
                                    intensity.value=value;
                                    intensity.addEventListener('change',function(event)
                                    {
                                        obj.intensity=event.target.value;
                                        console.log(obj.power);
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(intensity);
                                    break;
                        
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const distance=document.createElement('input');
                                    distance.type='text';
                                    distance.id='distance';
                                    distance.value=value;
                                    distance.addEventListener('change',function(event)
                                    {
                                        obj.distance=parseFloat(event.target.value);
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(distance);
                                    break;
                                    
                    }
                                
                }
                        
            }  
        }
        if(selectedObject instanceof THREE.PointLight)
        {
            let obj=selectedObject;
            attr.innerHTML="";
            const LightName=document.createElement('div');
            LightName.innerHTML = `<strong>${selectedObject.name.toUpperCase()}`;
            attr.appendChild(LightName);
            for(const key in obj)
            {
                if (obj.hasOwnProperty(key)) 
                {
                    let value, propertyElement;
                    switch(key)
                    {   
                        case 'color':
                                    value = obj[key];
                                    propertyElement = document.createElement('div');
                                    propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                                    attr.appendChild(propertyElement);
                                    const colorPicker = document.createElement('input');
                                    colorPicker.type = 'color';
                                    colorPicker.id = 'colorPicker';
                                    colorPicker.value = '#'+value.getHex().toString(16);
                                    attr.appendChild(colorPicker); 
                                    colorPicker.addEventListener('input', function(event) 
                                    {
                                        const selectedColorValue = event.target.value;
                                        const selectedColor = new THREE.Color(selectedColorValue);
                                        obj.color=new THREE.Color(selectedColor);
                                        propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                                    });
                                    break;
                        case 'castShadow':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const shadow=document.createElement('input');
                                    shadow.type='checkbox';
                                    shadow.id='enable-shadow';
                                    shadow.checked=value;
                                    shadow.addEventListener('change',function()
                                    {
                                    if(shadow.checked)
                                    {
                                        obj.castShadow=true;
                                    }
                                    else
                                    {
                                        obj.castShadow=false;
                                    }
                                    
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(shadow);
                                    break;
                        case 'intensity':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const intensity=document.createElement('input');
                                    intensity.type='text';
                                    intensity.id='Intensity';
                                    intensity.value=value;
                                    intensity.addEventListener('change',function(event)
                                    {
                                        obj.intensity=event.target.value;
                                        console.log(obj.power);
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(intensity);
                                    break;
                        case 'decay':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const decay=document.createElement('input');
                                    decay.type='text';
                                    decay.id='decay';
                                    decay.value=value;
                                    decay.addEventListener('change',function(event)
                                    {
                                        obj.decay=event.target.value;
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(decay);
                                    break;
                        case 'distance':
                                    propertyElement=document.createElement('div');
                                    propertyElement.innerHTML=`${key.toUpperCase()}`;
                                    value=obj[key];
                                    const distance=document.createElement('input');
                                    distance.type='text';
                                    distance.id='distance';
                                    distance.value=value;
                                    distance.addEventListener('change',function(event)
                                    {
                                        obj.distance=parseFloat(event.target.value);
                                    });
                                    attr.appendChild(propertyElement);
                                    attr.appendChild(distance);
                                    break;    
                                }       
                        }   
                    }  

        }
        if(selectedObject instanceof THREE.SpotLight)
        {
            const obj=selectedObject;
            attr.innerHTML="";
            const LightName=document.createElement('div');
            LightName.innerHTML = `<strong>${selectedObject.name.toUpperCase()}`;
            attr.appendChild(LightName);
                
            for(const key in obj)
            {
                if (obj.hasOwnProperty(key)) 
                {
                    let value, propertyElement;
                    switch(key)
                    {   
                        case 'color':
                            value = obj[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                            attr.appendChild(propertyElement);
                            const colorPicker = document.createElement('input');
                            colorPicker.type = 'color';
                            colorPicker.id = 'colorPicker';
                            colorPicker.value = '#'+value.getHex().toString(16);
                            attr.appendChild(colorPicker); 
                            colorPicker.addEventListener('input', function(event) {
                            const selectedColorValue = event.target.value;
                            const selectedColor = new THREE.Color(selectedColorValue);
                            obj.color=new THREE.Color(selectedColor);
                            propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                            });
                            break;
                        case 'map':
                            value=obj[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `${key}:${value}`;
                            const map = document.createElement('input');
                            map.type = 'file';
                            map.accept='image/*';
                            map.id = 'colorMap';
                            propertyElement.appendChild(map);
                            map.addEventListener('input', function(event) {
                            var file = event.target.files[0]; 
                            if (file)
                            {  
                                const reader=new FileReader();
                                reader.onload = function(e)
                                {
                                    const image=document.createElement('img');
                                    image.src=e.target.result;
                                    const textureLoader = new THREE.TextureLoader();
                                    textureLoader.load(image.src, function(texture)
                                    {
                                        texture.minFilter = THREE.LinearFilter;
                                        texture.magFilter = THREE.LinearFilter;
                                        texture.colorSpace = THREE.SRGBColorSpace;
                                        obj.map=texture;
                                        });
                                };
                                reader.readAsDataURL(file);
                                }
                                        //obj.map.update
                                });
                            attr.appendChild(propertyElement);
                            break;
                        case 'castShadow':
                            propertyElement=document.createElement('div');
                            propertyElement.innerHTML=`${key.toUpperCase()}`;
                            value=obj[key];
                            const shadow=document.createElement('input');
                            shadow.type='checkbox';
                            shadow.id='enable-shadow';
                            shadow.checked=value;
                            shadow.addEventListener('change',function(){
                                if(shadow.checked)
                                {
                                    obj.castShadow=true;
                                }
                                else
                                {
                                    obj.castShadow=false;
                                }
                            });
                            attr.appendChild(propertyElement);
                            attr.appendChild(shadow);
                            break;
                        case 'intensity':
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
                                        value=obj[key];
                                        const intensity=document.createElement('input');
                                        intensity.type='text';
                                        intensity.id='Intensity';
                                        intensity.value=value;
                                        intensity.addEventListener('change',function(event){
                                            obj.intensity=event.target.value;
                                            console.log(obj.power);
    
                                        });
                                        attr.appendChild(propertyElement);
                                        attr.appendChild(intensity);
                                    break;
                                    case 'decay':
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
                                        value=obj[key];
                                        const decay=document.createElement('input');
                                        decay.type='text';
                                        decay.id='decay';
                                        decay.value=value;
                                        decay.addEventListener('change',function(event){
                                            obj.decay=event.target.value;
    
                                        });
                                        attr.appendChild(propertyElement);
                                        attr.appendChild(decay);
                                    break;
                                    case 'distance':
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
                                        value=obj[key];
                                        const distance=document.createElement('input');
                                        distance.type='text';
                                        distance.id='distance';
                                        distance.value=value;
                                        distance.addEventListener('change',function(event){
                                            obj.distance=parseFloat(event.target.value);
                                            obj.userData.helper.update();
    
                                        });
                                        attr.appendChild(propertyElement);
                                        attr.appendChild(distance);
                                    break;
                                    case 'penumbra':
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
                                        value=obj[key];
                                        const penumbra=document.createElement('input');
                                        penumbra.type='text';
                                        penumbra.id='penumbra';
                                        penumbra.value=value;
                                        penumbra.addEventListener('change',function(event){
                                            obj.penumbra=event.target.value;
    
                                        });
                                        attr.appendChild(propertyElement);
                                        attr.appendChild(penumbra);
                                    break; 
                                    case 'target':
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
                                        value=obj[key].position;
                                        const lblx = document.createElement("label");
                                        const x=document.createElement('input');
                                        x.type='text';
                                        x.id='target-x';
                                        x.value=value.x;
                                        x.addEventListener('change',function(event){
                                            obj.target.position.x=event.target.value;
                                            obj.userData.helper.update();
                                            obj.userData.targethelper.position.x=obj.target.position.x
                                            //obj.parent.lookAt(new THREE.Vector3(event.target.value,obj.target.position.y,obj.target.position.z));
    
                                        });
                                        lblx.appendChild(document.createTextNode("X"));
                                        lblx.appendChild(x);
                                        
                                        const lbly = document.createElement("label");
                                        const y=document.createElement('input');
                                        y.type='text';
                                        y.id='target-y';
                                        y.value=value.y;
                                        y.addEventListener('change',function(event){
                                            obj.target.position.y=event.target.value;
                                            obj.userData.helper.update();
                                            obj.userData.targethelper.position.y=obj.target.position.y
                                            //obj.parent.lookAt(new THREE.Vector3(obj.target.position.x,event.target.value,obj.target.position.z));
    
                                        });
                                        lbly.appendChild(document.createTextNode("Y"));
                                        lbly.appendChild(y);
    
                                        const lblz = document.createElement("label");
                                        const z=document.createElement('input');
                                        z.type='text';
                                        z.id='target-z';
                                        z.value=value.x;
                                        z.addEventListener('change',function(event){
                                            obj.target.position.z=event.target.value;
                                            obj.userData.helper.update();
                                            obj.userData.targethelper.position.z=obj.target.position.z
                                            //obj.parent.lookAt(new THREE.Vector3(obj.target.position.x,obj.target.position.y,event.target.value));
                                        });
                                        lblz.appendChild(document.createTextNode("Z"));
                                        lblz.appendChild(z);
    
                                        attr.appendChild(propertyElement);
                                        attr.appendChild(lblx);
                                        attr.appendChild(lbly);
                                        attr.appendChild(lblz);
                                    break;
                                    case 'angle':
                                        value=THREE.MathUtils.radToDeg(obj[key]);
                                        propertyElement=document.createElement('div');
                                        propertyElement.innerHTML=`${key.toUpperCase()}`;
    
                                        const lblangle = document.createElement("label");
                                        const angle=document.createElement('input');
                                        angle.type='text';
                                        angle.id='target-z';
                                        angle.value=value;
                                        angle.addEventListener('change',function(event){
                                            obj.angle=THREE.MathUtils.degToRad(event.target.value);
                                            obj.userData.helper.update();
                                        });
                                        lblangle.appendChild(document.createTextNode("In degrees (0-90)"));
                                        lblangle.appendChild(angle);
                                        attr.appendChild(lblangle);
                                    break;
                                }       
                                
                        }
                    }
        }
        if(selectedObject instanceof THREE.RectAreaLight)
        {
            const obj=selectedObject;
            attr.innerHTML="";
            const LightName=document.createElement('div');
            LightName.innerHTML = `<strong>${selectedObject.name.toUpperCase()}`;
            attr.appendChild(LightName);
                        
            for(const key in obj)
            {
                if (obj.hasOwnProperty(key)) 
                {
                    let value, propertyElement;
                    switch(key)
                    {   
                        case 'color':
                            value = obj[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                            attr.appendChild(propertyElement);
                            const colorPicker = document.createElement('input');
                            colorPicker.type = 'color';
                            colorPicker.id = 'colorPicker';
                            colorPicker.value = '#'+value.getHex().toString(16);
                            attr.appendChild(colorPicker); 
                            colorPicker.addEventListener('input', function(event) {
                            const selectedColorValue = event.target.value;
                            const selectedColor = new THREE.Color(selectedColorValue);
                            obj.color=new THREE.Color(selectedColor);
                            propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                            });
                            break;
                        case 'intensity':
                            propertyElement=document.createElement('div');
                            propertyElement.innerHTML=`${key.toUpperCase()}`;
                            value=obj[key];
                            const intensity=document.createElement('input');
                            intensity.type='text';
                            intensity.id='Intensity';
                            intensity.value=value;
                            intensity.addEventListener('change',function(event){
                                obj.intensity=event.target.value;
                                console.log(obj.power);
                            });
                            attr.appendChild(propertyElement);
                            attr.appendChild(intensity);
                            break;
                        case 'width':
                            propertyElement=document.createElement('div');
                            propertyElement.innerHTML=`${key.toUpperCase()}`;
                            value=obj[key];
                            const width=document.createElement('input');
                            width.type='text';
                            width.id='width';
                            width.value=value;
                            width.addEventListener('change',function(event){
                                obj.width=event.target.value;
                                
                            });
                            attr.appendChild(propertyElement);
                            attr.appendChild(width);
                        break; 
                        case 'height':
                            propertyElement=document.createElement('div');
                            propertyElement.innerHTML=`${key.toUpperCase()}`;
                            value=obj[key];
                            const height=document.createElement('input');
                            height.type='text';
                            height.id='height';
                            height.value=value;
                            height.addEventListener('change',function(event){
                                obj.height=event.target.value;
                                
                            });
                            attr.appendChild(propertyElement);
                            attr.appendChild(height);
                        break;       
                    }       
                                        
                }
            }
        }
        if(selectedObject instanceof THREE.HemisphereLight)
        {
            const obj=selectedObject;
            attr.innerHTML="";
            const LightName=document.createElement('div');
            LightName.innerHTML = `<strong>${selectedObject.name.toUpperCase()}`;
            attr.appendChild(LightName);
                        
            for(const key in obj)
            {
                if (obj.hasOwnProperty(key)) 
                {
                    let value, propertyElement;
                    switch(key)
                    {   
                        case 'color':
                            value = obj[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                            attr.appendChild(propertyElement);
                            const colorPicker = document.createElement('input');
                            colorPicker.type = 'color';
                            colorPicker.id = 'skycolor';
                            colorPicker.value = '#'+value.getHex().toString(16);
                            attr.appendChild(colorPicker); 
                            colorPicker.addEventListener('input', function(event) {
                            const selectedColorValue = event.target.value;
                            const selectedColor = new THREE.Color(selectedColorValue);
                            obj.color=new THREE.Color(selectedColor);
                            propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                            });
                            break;
                        case 'groundColor':
                            value = obj[key];
                            propertyElement = document.createElement('div');
                            propertyElement.innerHTML = `${key} ${'0x'+value.getHex().toString(16)}`;
                            attr.appendChild(propertyElement);
                            const colorPicker2 = document.createElement('input');
                            colorPicker2.type = 'color';
                            colorPicker2.id = 'groundcolor';
                            colorPicker2.value = '#'+value.getHex().toString(16);
                            attr.appendChild(colorPicker2); 
                            colorPicker2.addEventListener('input', function(event) {
                            const selectedColorValue = event.target.value;
                            const selectedColor = new THREE.Color(selectedColorValue);
                            obj.groundColor=new THREE.Color(selectedColor);
                            propertyElement.innerHTML = `${key}: ${'0x'+selectedColor.getHex().toString(16)}`;
                            });
                            break;
                        case 'intensity':
                            propertyElement=document.createElement('div');
                            propertyElement.innerHTML=`${key.toUpperCase()}`;
                            value=obj[key];
                            const intensity=document.createElement('input');
                            intensity.type='text';
                            intensity.id='Intensity';
                            intensity.value=value;
                            intensity.addEventListener('change',function(event){
                                obj.intensity=event.target.value;
                                console.log(obj.power);
                            });
                            attr.appendChild(propertyElement);
                            attr.appendChild(intensity);
                            break;
                        
                    }       
                                        
                }
            }
        }
    }
        
        
    
    
}
export {addPointLight,addSpotLight,addRectAreaLight,addHemisphereLight,addLightControls,updateAttributeEditorLight};