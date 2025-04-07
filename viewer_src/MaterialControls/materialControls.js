import * as THREE from'three';
import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,renderer,lights,traverseScene,
        lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
        EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials} from '../main.js';
let materialFolder;
let materialdropdown;
let materialnames=['none'];
function createMaterialControls()
{
   // const materialFolder=gui.addFolder('Material Controls');
   materialFolder=gui.addFolder('Material Controls');
    const material_Params={
        add_mat:function(){createNewMaterial()}
    };
    console.log(materials);
    const addMaterial=materialFolder.add(material_Params,'add_mat').name('Create new Material');
    const mat={
        selectedOption:'none'
    };
    materialdropdown=materialFolder.add(mat,'selectedOption',materialnames).name('Materials').onChange(function(option){
        updateMaterial(option);
    })
    materialFolder.close();
}
function createNewMaterial()
{
    const newMaterial=new THREE.MeshPhysicalMaterial();
    materials.push(newMaterial);
    console.log(materials);
    newMaterial.name="New_Material_"+materials.length;
    const attr=document.getElementById('container');
    
    attr.innerHTML='';
    const properties=[];
    const button=document.createElement('button');
    button.textContent="Assign Material to object";
    attr.appendChild(button);
    button.addEventListener('click',function(event)
    {
        if(selectedObject)
        {
            if(selectedObject instanceof THREE.Mesh)
            {
                selectedObject.userData.originalMaterial=selectedObject.material;
                selectedObject.material=newMaterial;
                selectedObject.material.update=true;
            }
            else
            {
                alert("selected object is not a mesh");
            }
        }
        else
        {
            alert("no selected object");
        }
    });
    for(const key in newMaterial)
    {   let value,propertyElement;
        if(key.toLowerCase().endsWith('color')||key.toLowerCase().endsWith('emissive'))	
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value = newMaterial[key];
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
                newMaterial[key]=new THREE.Color(selectedColor);
                //propertyElement.innerHTML = `<strong>${key}:</strong> ${'0x'+selectedColor.getHex().toString(16)}`;
            });
        }
        else if(key=='name')
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value =newMaterial[key];
            propertyElement = document.createElement('div');
            propertyElement.innerHTML = `<strong>${key}:</strong>`; 
            div.appendChild(propertyElement);
            const input=document.createElement('input');
            input.id=key;
            input.type='text';
            input.value=value;
            div.appendChild(input);
            input.addEventListener('input',function(event){
                newMaterial.name=event.target.value;
            })
            //attr.appendChild(div);
            properties.push(div);
        }	    
    }
    for(const key in newMaterial)
    {   
        let value,propertyElement;
        if(key.toLowerCase().endsWith('ness')||key.toLowerCase().endsWith('intensity')||key.toLowerCase().endsWith('ior')||key.toLowerCase().endsWith('opacity')||key.toLowerCase().endsWith('transmission'))	
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value = newMaterial[key];
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
                newMaterial[key]=parseFloat(event.target.value);
            });
        }
            
    }
    for(const key in newMaterial) 
    {
        if(newMaterial.hasOwnProperty(key))  
        {
            let value, propertyElement;
            if(key.toLowerCase().endsWith('map'))
            {
                const div=document.createElement('div');
                div.id='div'+key;
                value = newMaterial[key];
                propertyElement = document.createElement('div');
                propertyElement.innerHTML = `<strong>${key}:</strong>`;
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept='image/*';
                fileInput.id = key;
                div.appendChild(propertyElement);
                div.appendChild(fileInput);
                fileInput.addEventListener('input', function(event) 
                {
                    var file = event.target.files[0];
                    if (file) 
                    {
                        var reader = new FileReader();
                        reader.onload = function(e) 
                        {
                            var image = document.createElement('img');
                            image.src = e.target.result;
                            var textureLoader = new THREE.TextureLoader();
                            textureLoader.load(image.src, function(texture) 
                            {
                                texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                                texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                                texture.repeat.y=-1; 
                                newMaterial[key]=texture;
                                newMaterial.needsUpdate=true;
                            });   
                        };
                        reader.readAsDataURL(file);
                    }
                });
            
                const btn=document.createElement('button');
                btn.textContent='remove';
                div.appendChild(btn);
        
                btn.addEventListener('click', function() 
                {
                    newMaterial[key]=null;
                    //propertyElement.innerHTML = `<strong>${key}:</strong>null`;
                    newMaterial.needsUpdate=true;
                    //updateTextureMatrix(child.userData['old'+key]);
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
                    newMaterial[key].repeat.set(this.value,-this.value);
                    newMaterial[key].needsUpdate = true;
                });
                
                slider2.addEventListener("change", function() 
                {
                    newMaterial[key].rotation = this.value * Math.PI / 180;
                    newMaterial[key].needsUpdate = true;
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
    attr.appendChild(otherElements);
    
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
    });
    updateOptions();
    //updateGUI();
}
function updateOptions()
{
    materialnames=[];
    for (let i=0;i<materials.length;i++)
    {
        materialnames[i]=materials[i].name;

    }
    const mat={
        selectedOption:'none'
    };
    materialdropdown.destroy();
    materialdropdown=materialFolder.add(mat,'selectedOption',materialnames).name('Materials').onChange(function(option){
        updateMaterial(option);
    });
}
function updateMaterial(option)
{
    let newMaterial;
    for (let i=0;i<materials.length;i++)
    {
        if(materials[i].name==option)
        {
            newMaterial=materials[i];
        }
    }
    const attr=document.getElementById('container');
    attr.innerHTML='';
    const properties=[];
    const button=document.createElement('button');
    button.textContent="Assign Material to object";
    attr.appendChild(button);
    button.addEventListener('click',function(event)
    {
        if(selectedObject)
        {
            if(selectedObject instanceof THREE.Mesh)
            {
                selectedObject.userData.originalMaterial=selectedObject.material;
                selectedObject.material=newMaterial;
                selectedObject.material.update=true;
            }
            else
            {
                alert("selected object is not a mesh");
            }
        }
        else
        {
            alert("no selected object");
        }
    });
    for(const key in newMaterial)
    {   
        let value,propertyElement;
        if(key.toLowerCase().endsWith('color')||key.toLowerCase().endsWith('emissive'))	
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value = newMaterial[key];
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
                newMaterial[key]=new THREE.Color(selectedColor);
                //propertyElement.innerHTML = `<strong>${key}:</strong> ${'0x'+selectedColor.getHex().toString(16)}`;
            });
        }
        else if(key=='name')
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value =newMaterial[key];
            propertyElement = document.createElement('div');
            propertyElement.innerHTML = `<strong>${key}:</strong>`; 
            div.appendChild(propertyElement);
            const input=document.createElement('input');
            input.id=key;
            input.type='text';
            input.value=value;
            div.appendChild(input);
            input.addEventListener('input',function(event){
                newMaterial.name=event.target.value;
            })
            //attr.appendChild(div);
            properties.push(div);
        }	    
    }
    for(const key in newMaterial)
    {   
        let value,propertyElement;
        if(key.toLowerCase().endsWith('ness')||key.toLowerCase().endsWith('intensity')||key.toLowerCase().endsWith('ior')||key.toLowerCase().endsWith('opacity')||key.toLowerCase().endsWith('transmission'))	
        {
            const div=document.createElement('div');
            div.id='div'+key;
            value = newMaterial[key];
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
                newMaterial[key]=parseFloat(event.target.value);
            });
        }
            
    }
    for(const key in newMaterial) 
    {
        if(newMaterial.hasOwnProperty(key))  
        {
            let value, propertyElement;
            if(key.toLowerCase().endsWith('map'))
            {
                const div=document.createElement('div');
                div.id='div'+key;
                value = newMaterial[key];
                propertyElement = document.createElement('div');
                propertyElement.innerHTML = `<strong>${key}:</strong>`;
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept='image/*';
                fileInput.id = key;
                div.appendChild(propertyElement);
                div.appendChild(fileInput);
                fileInput.addEventListener('input', function(event) 
                {
                    var file = event.target.files[0];
                    if (file) 
                    {
                        var reader = new FileReader();
                        reader.onload = function(e) 
                        {
                            var image = document.createElement('img');
                            image.src = e.target.result;
                            var textureLoader = new THREE.TextureLoader();
                            textureLoader.load(image.src, function(texture) 
                            {
                                texture.wrapS = THREE.RepeatWrapping; // Wraps texture horizontally
                                texture.wrapT = THREE.RepeatWrapping; // Wraps texture vertically
                                texture.repeat.y=-1; 
                                newMaterial[key]=texture;
                                newMaterial.needsUpdate=true;
                            });   
                        };
                        reader.readAsDataURL(file);
                    }
                });
            
                const btn=document.createElement('button');
                btn.textContent='remove';
                div.appendChild(btn);
        
                btn.addEventListener('click', function() 
                {
                    newMaterial[key]=null;
                    //propertyElement.innerHTML = `<strong>${key}:</strong>null`;
                    newMaterial.needsUpdate=true;
                    //updateTextureMatrix(child.userData['old'+key]);
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
                    newMaterial[key].repeat.set(this.value,-this.value);
                    newMaterial[key].needsUpdate = true;
                });
                
                slider2.addEventListener("change", function() 
                {
                    newMaterial[key].rotation = this.value * Math.PI / 180;
                    newMaterial[key].needsUpdate = true;
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
    attr.appendChild(otherElements);
    
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
    }) ;
    updateOptions();  
}

export {createMaterialControls,createNewMaterial};