import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,renderer,lights,traverseScene,
    lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
    EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials} from '../main.js';
import * as THREE from 'three';

let isCm=false,isInch=false,isMeter=true;
let arrowX,arrowY,arrowZ,textX,textY,textZ,dimensionGroup;
//const fonts=['Arial','Courier New', 'Georgia', 'Calibri']
function updateSpriteScale(sprite) 
{
    const distance = sprite.position.distanceTo(currentCamera.position);
    sprite.scale.set(distance*0.5,distance*0.2,0.5); // Adjust the scale factor (0.03) as needed
}
function displayObjectDimensions() 
{
    if(dimensionGroup)
    {
        dimensionGroup.remove(arrowX);
        dimensionGroup.remove(arrowY);
        dimensionGroup.remove(arrowZ);
        dimensionGroup.remove(textX);
        dimensionGroup.remove(textY);
        dimensionGroup.remove(textZ);
        scene.remove(dimensionGroup);
    }
    const bbox = new THREE.Box3().setFromObject(selectedObject);
    const dimensions = bbox.getSize(new THREE.Vector3());
    let color;
    if (selectedObject.userData.dimensioncolor)
    {
       color=selectedObject.userData.dimensioncolor;
    }
    else
    {
        color=new THREE.Color(0xff0000);
    }
    const geoX = new THREE.BoxGeometry(dimensions.x,0.005,0.005);
    const red = new THREE.MeshBasicMaterial({color:color});
    arrowX=new THREE.Mesh(geoX,red);
    arrowX.position.set(selectedObject.position.x,bbox.min.y,bbox.max.z);
    const geoY=new THREE.BoxGeometry(0.005,dimensions.y,0.005);
    arrowY=new THREE.Mesh(geoY,red);
    arrowY.position.set(bbox.min.x,bbox.min.y+dimensions.y/2,bbox.max.z);
    //scene.add(arrowY);
    const geoZ=new THREE.BoxGeometry(0.005,0.005,dimensions.z);
    arrowZ= new THREE.Mesh(geoZ,red);
    arrowZ.position.set(bbox.min.x,bbox.min.y,bbox.min.z+dimensions.z/2);
    dimensionGroup=new THREE.Group();
    scene.add(dimensionGroup);
    dimensionGroup.add(arrowX, arrowY, arrowZ);
    selectedObject.userData.lengthInches=(parseFloat(selectedObject.userData.lengthm)*39.37).toFixed(2);
    selectedObject.userData.widthInches=(parseFloat(selectedObject.userData.widthm)*39.37).toFixed(2);
    selectedObject.userData.heightInches=(parseFloat(selectedObject.userData.heightm)*39.37).toFixed(2);
    selectedObject.userData.lengthcm=(parseFloat(selectedObject.userData.lengthm)*100).toFixed(2);
    selectedObject.userData.widthcm=(parseFloat(selectedObject.userData.widthm)*100).toFixed(2);
    selectedObject.userData.heightcm=(parseFloat(selectedObject.userData.heightm)*100).toFixed(2);

    if(isMeter)
    {
        if(selectedObject.userData.affectSize)
        {
        textX = createTextLabel(dimensions.x);
        textY = createTextLabel(dimensions.y);
        textZ = createTextLabel(dimensions.z);
        document.getElementById('length').value=parseFloat(dimensions.z.toFixed(2));
        document.getElementById('width').value=parseFloat(dimensions.x.toFixed(2));
        document.getElementById('height').value=parseFloat(dimensions.y.toFixed(2));
        }
        else
        {
        textX = createTextLabel(parseFloat(selectedObject.userData.widthm));
        textY = createTextLabel(parseFloat(selectedObject.userData.heightm));
        textZ = createTextLabel(parseFloat(selectedObject.userData.lengthm));
        document.getElementById('length').value=parseFloat(selectedObject.userData.lengthm);
        document.getElementById('width').value=parseFloat(selectedObject.userData.widthm);
        document.getElementById('height').value=parseFloat(selectedObject.userData.heightm);
        }
        

    }
    if(isCm==true)
    {
        if(selectedObject.userData.affectSize)
        {
        textX = createTextLabel(Math.round(dimensions.x*100));
        textY = createTextLabel(Math.round(dimensions.y*100));
        textZ = createTextLabel(Math.round(dimensions.z*100));
        document.getElementById('length').value=parseFloat((Math.round(dimensions.z*100)).toFixed(2));
        document.getElementById('width').value=parseFloat((Math.round(dimensions.x*100)).toFixed(2));
        document.getElementById('height').value=parseFloat((Math.round(dimensions.y*100)).toFixed(2));
        }
        else
        {
        textX = createTextLabel(parseFloat(selectedObject.userData.widthcm));
        textY = createTextLabel(parseFloat(selectedObject.userData.heightcm));
        textZ = createTextLabel(parseFloat(selectedObject.userData.lengthcm));
        document.getElementById('length').value=parseFloat(selectedObject.userData.lengthcm);
        document.getElementById('width').value=parseFloat(selectedObject.userData.widthcm);
        document.getElementById('height').value=parseFloat(selectedObject.userData.heightcm);
        }
    }
    if(isInch==true)
    {
        textX = createTextLabel(parseFloat((parseFloat(dimensions.x.toFixed(2))* 39.37).toFixed(2)));
        textY = createTextLabel(parseFloat((parseFloat(dimensions.y.toFixed(2))* 39.37).toFixed(2)));
        textZ = createTextLabel(parseFloat((parseFloat(dimensions.z.toFixed(2))* 39.37).toFixed(2)));
        if(document.getElementById('width').value !=0)
            textX = createTextLabel(parseFloat(selectedObject.userData.widthInches));
        if(document.getElementById('length').value !=0)
            textZ = createTextLabel(parseFloat(selectedObject.userData.lengthInches));
        if(document.getElementById('height').value !=0)
            textY = createTextLabel(parseFloat(selectedObject.userData.heightInches));

    }
    textX.position.copy(arrowX.position);//.add(new THREE.Vector3(dimensions.x / 2, 0, 0));
    textY.position.copy(arrowY.position);//.add(new THREE.Vector3(0, dimensions.y / 2, 0));
    textZ.position.copy(arrowZ.position);//.add(new THREE.Vector3(0, 0, dimensions.z / 2));
        
    dimensionGroup.add(textX, textY, textZ);
    console.log(textX);
    /*arrowX.layers.set(1);
    arrowY.layers.set(1);
    arrowZ.layers.set(1);
    textX.layers.set(1);
    textY.layers.set(1);
    textZ.layers.set(1);*/

}
function createTextLabel(text) 
{
    const canvas = document.createElement('canvas');
    /*canvas.width = '20px';
    canvas.height='10px';*/
    const context = canvas.getContext('2d');
    context.font = '30px bold Arial';
    if(selectedObject.userData.dimensionFont)
    {
        context.font = '30px '+selectedObject.userData.dimensionFont;
    }
    context.fillStyle = 'red';
    if(selectedObject.userData.dimensioncolor)
    {
        const color = selectedObject.userData.dimensioncolor;
        context.fillStyle= `#${color.getHexString()}`;
    }
    if(isCm)
    context.fillText(text.toFixed(2)+"cm", canvas.width/2,canvas.height/2);
    else if(isInch)
    context.fillText(text.toFixed(2)+"inch", canvas.width/2,canvas.height/2);
    else if(isMeter)
    context.fillText(text.toFixed(2)+"m", canvas.width/2,canvas.height/2);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5,0.2,0.5); // Adjust scale as needed
    return sprite;
}
function displayDimensionControls()
{
    if(selectedObject)
    {
        if(selectedObject instanceof THREE.Group && models.includes(selectedObject))
        {
            const attr=document.getElementById('container');
            attr.innerHTML='';
            
            const labelD=document.createElement('label');
            const dimension=document.createElement('input');
            dimension.id='dimension';
            dimension.type='checkbox';
            if(selectedObject.userData.showdimension)
            dimension.checked=selectedObject.userData.showdimension;
            else
            dimension.checked=false;
            labelD.appendChild(dimension);
            labelD.appendChild(document.createTextNode("Show Dimension"));
            attr.appendChild(labelD);

            const labelSize=document.createElement('label');
            const affectSize=document.createElement('input');
            affectSize.type='checkbox';
            affectSize.id='affect_size';
            if(selectedObject.userData.affectSize!==undefined)
            {
                if(selectedObject.userData.affectSize)
                    affectSize.checked=true;
                else
                    affectSize.checked=false;
            }
            else
            {
            affectSize.checked=true;
            selectedObject.userData.affectSize=true;
            }
            labelSize.appendChild(document.createTextNode("Affect Size"));
            labelSize.appendChild(affectSize);
            attr.appendChild(labelSize);
            affectSize.addEventListener('change',function(){
                if(affectSize.checked)
                {
                    selectedObject.userData.affectSize=true;
                }
                else
                {
                    selectedObject.userData.affectSize=false;
                }
            });

            const radioData = [
                { id: 'cm', value: '1', label: 'In cm' },
                { id: 'inch', value: '2', label: 'In inches' },
                { id: 'm', value: '3', label: 'In Metres' }
            ];
         
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.id = 'colorPicker';
            //colorPicker.value = '#'+value.getHex().toString(16);
            colorPicker.addEventListener('input', function(event) 
            {
                const selectedColorValue = event.target.value;
                const selectedColor = new THREE.Color(selectedColorValue);
                selectedObject.userData.dimensioncolor=selectedColor;
                if(dimension.checked==true)
                {     
                    if(arrowX&&arrowY&&arrowZ)
                    {
                        scene.remove(arrowX);
                        scene.remove(arrowY);
                        scene.remove(arrowZ);
                        scene.remove(textX);
                        scene.remove(textY);
                        scene.remove(textZ);
                    }
                    displayObjectDimensions();
                    console.log("showing dimensions");
                    if(isCm||isInch||isMeter)
                    {
                        if(arrowX&&arrowY&&arrowZ)
                        {
                        scene.remove(arrowX);
                        scene.remove(arrowY);
                        scene.remove(arrowZ);
                        scene.remove(textX);
                        scene.remove(textY);
                        scene.remove(textZ);
                        }
                        displayObjectDimensions();
                    } 
                }
        
            });
            attr.appendChild(colorPicker);

            const fontDropdown = document.createElement('select');
            fontDropdown.id = 'fontDropdown';
    
            // Create and append option elements for each font
            fonts.forEach(font => 
            {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                fontDropdown.appendChild(option);
            });
            fontDropdown.addEventListener('change', function() 
            {
                const selectedFont = fontDropdown.value;
                selectedObject.userData.dimensionFont=selectedFont;
                if(dimension.checked==true)
                    {
                            
                        if(arrowX&&arrowY&&arrowZ)
                            {
                            scene.remove(arrowX);
                            scene.remove(arrowY);
                            scene.remove(arrowZ);
                            scene.remove(textX);
                            scene.remove(textY);
                            scene.remove(textZ);
                            }
                    displayObjectDimensions();
                    console.log("showing dimensions");
                   
                    if(isCm||isInch||isMeter)
                    {
                        if(arrowX&&arrowY&&arrowZ)
                        {
                        scene.remove(arrowX);
                        scene.remove(arrowY);
                        scene.remove(arrowZ);
                        scene.remove(textX);
                        scene.remove(textY);
                        scene.remove(textZ);
                        }
                        displayObjectDimensions();
                    }
                }
            });

            const labelLength=document.createElement('label');
            const length=document.createElement('input');
            length.id='length';
            length.type='number';
            length.step='any';
            //length.checked=true;
            labelLength.appendChild(document.createTextNode("Length"));
            labelLength.appendChild(length);

            const labelwidth=document.createElement('label');
            const width=document.createElement('input');
            width.id='width';
            width.type='number';
            width.step='any';
            //width.checked=true;
            labelwidth.appendChild(document.createTextNode("Width"));
            labelwidth.appendChild(width);

            const labelheight=document.createElement('label');
            const height=document.createElement('input');
            height.id='height';
            height.type='number';
            height.step='any';
            //height.checked=true;
            labelheight.appendChild(document.createTextNode("Height"));
            labelheight.appendChild(height);

            const labelInstruction=document.createElement('label');
            labelInstruction.appendChild(document.createTextNode("Input Dimensions in the unit selected"));

            radioData.forEach(item => 
            {
                // Create a label element
                const label = document.createElement('label');
                label.setAttribute('for', item.id);
                label.textContent = item.label;
        
                // Create a radio button input
                const radioButton = document.createElement('input');
                radioButton.type = 'radio';
                radioButton.id = item.id;
                radioButton.name = 'units';
                radioButton.value = item.value;
                if(item.value==3)
                {
                    radioButton.checked=true;
                    isMeter=true;
                }
                // Append the radio button and label to the container
                label.appendChild(radioButton);
                attr.appendChild(label);
                //attr.appendChild(document.createElement('br')); // Line break
            });

            attr.appendChild(labelInstruction);
            attr.appendChild(labelLength);
            attr.appendChild(labelwidth);
            attr.appendChild(labelheight);
            //attr.appendChild(colorPicker);
            attr.appendChild(fontDropdown);

            const bbox = new THREE.Box3().setFromObject(selectedObject);
            const dimensions = bbox.getSize(new THREE.Vector3());

            length.addEventListener('input', function(event){

                if(selectedObject.userData.affectSize)
              {  
                  
                  if(isMeter)
                  {
                      selectedObject.userData.lengthm=event.target.value;
                      if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                      
                      const factor=event.target.value/dimensions.z;
                      selectedObject.scale.z=factor;
                      displayObjectDimensions();
                  }
                  else if(isInch)
                  {
                      selectedObject.userData.lengthInches=event.target.value;
                      if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                      const dimension_inch = parseFloat((parseFloat(dimensions.z.toFixed(2))* 39.37).toFixed(2));
                      const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                      selectedObject.scale.z=factor;
                      displayObjectDimensions();
      
                  }
                  else if(isCm)
                  {
                      selectedObject.userData.lengthcm=event.target.value;
                      if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                      const dimension_cm = Math.round(dimensions.z * 100)
                      const factor=event.target.value/dimension_cm;
                      selectedObject.scale.z=factor;
                      displayObjectDimensions();
          
                  }
              }
              else
              {
                  if(isMeter)
                      {   
                          selectedObject.userData.lengthm=event.target.value;
                          if(dimensionGroup)
                            {
                                dimensionGroup.traverse(child=>{
                                    dimensionGroup.remove(child);
                                });
                                scene.remove(dimensionGroup);
                                
                            }
                          const factor=event.target.value/dimensions.z;
                          //selectedObject.scale.z=factor;
                          displayObjectDimensions();
                      }
                      else if(isInch)
                      {
                          selectedObject.userData.lengthInches=event.target.value;
                          if(dimensionGroup)
                            {
                                dimensionGroup.traverse(child=>{
                                    dimensionGroup.remove(child);
                                });
                                scene.remove(dimensionGroup);
                                
                            }
                          const dimension_inch =parseFloat((parseFloat(dimensions.z.toFixed(2))* 39.37).toFixed(2));
                          const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                          //selectedObject.scale.z=factor;
                          displayObjectDimensions();
          
                      }
                      else if(isCm)
                      {
                          selectedObject.userData.lengthcm=event.target.value;
                          if(dimensionGroup)
                            {
                                dimensionGroup.traverse(child=>{
                                    dimensionGroup.remove(child);
                                });
                                scene.remove(dimensionGroup);
                                
                            }
                          const dimension_cm = Math.round(dimensions.z * 100)
                          const factor=event.target.value/dimension_cm;
                          //selectedObject.scale.z=factor;
                          displayObjectDimensions();
              
                      }
      
              }
            });
            width.addEventListener('input', function(event)
            {
                if(selectedObject.userData.affectSize)
                {
                if(isMeter)
                {
                    selectedObject.userData.widthm=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const factor=event.target.value/dimensions.x;
                    selectedObject.scale.x=factor;
                    displayObjectDimensions();
                }
                else if(isInch)
                {
                    selectedObject.userData.widthInches=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const dimension_inch = parseFloat((parseFloat(dimensions.x.toFixed(2))* 39.37).toFixed(2));
                    const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                    selectedObject.scale.x=factor;
                    displayObjectDimensions();
    
                }
                else if(isCm)
                {
                    selectedObject.userData.widthcm=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const dimension_cm = Math.round(dimensions.x * 100)
                    const factor=event.target.value/dimension_cm;
                    selectedObject.scale.x=factor;
                    displayObjectDimensions();
        
                }
                }
                else
                {
                    if(isMeter)
                        {
                            if(dimensionGroup)
                                {
                                    dimensionGroup.traverse(child=>{
                                        dimensionGroup.remove(child);
                                    });
                                    scene.remove(dimensionGroup);
                                    
                                }
                            const factor=event.target.value/dimensions.x;
                            //selectedObject.scale.x=factor;
                            displayObjectDimensions();
                        }
                        else if(isInch)
                        {
                            selectedObject.userData.widthInches=event.target.value;
                            if(dimensionGroup)
                                {
                                    dimensionGroup.traverse(child=>{
                                        dimensionGroup.remove(child);
                                    });
                                    scene.remove(dimensionGroup);
                                    
                                }
                            const dimension_inch = parseFloat((parseFloat(dimensions.x.toFixed(2))* 39.37).toFixed(2));
                            const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                            //selectedObject.scale.x=factor;
                            displayObjectDimensions();
            
                        }
                        else if(isCm)
                        {
                            if(dimensionGroup)
                                {
                                    dimensionGroup.traverse(child=>{
                                        dimensionGroup.remove(child);
                                    });
                                    scene.remove(dimensionGroup);
                                    
                                }
                            const dimension_cm = Math.round(dimensions.x * 100)
                            const factor=event.target.value/dimension_cm;
                            //selectedObject.scale.x=factor;
                            displayObjectDimensions();
                
                        }  
                }
            });
            height.addEventListener('input', function(event)
            {
                if(selectedObject.userData.affectSize)
                {
                if(isMeter)
                {
                    selectedObject.userData.heightm=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const factor=event.target.value/dimensions.y;
                    selectedObject.scale.y=factor;
                    displayObjectDimensions();
                }
                else if(isInch)
                {
                    selectedObject.userData.heightInches=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const dimension_inch = parseFloat((parseFloat(dimensions.y.toFixed(2))* 39.37).toFixed(2));
                    const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                    selectedObject.scale.y=factor;
                    displayObjectDimensions();
    
                }
                else if(isCm)
                {
                    selectedObject.userData.heightcm=event.target.value;
                    if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                    const dimension_cm = Math.round(dimensions.y * 100)
                    const factor=event.target.value/dimension_cm;
                    selectedObject.scale.y=factor;
                    displayObjectDimensions();
        
                }
                }
                else
                    {
                    if(isMeter)
                    {
                        selectedObject.userData.heightm=event.target.value;
                        if(dimensionGroup)
                            {
                                dimensionGroup.traverse(child=>{
                                    dimensionGroup.remove(child);
                                });
                                scene.remove(dimensionGroup);
                                
                            }
                        const factor=event.target.value/dimensions.y;
                        //selectedObject.scale.y=factor;
                        displayObjectDimensions();
                    }
                    else if(isInch)
                    {
                        selectedObject.userData.heightInches=event.target.value;
                        if(dimensionGroup)
                            {
                                dimensionGroup.traverse(child=>{
                                    dimensionGroup.remove(child);
                                });
                                scene.remove(dimensionGroup);
                                
                            }
                        const dimension_inch = parseFloat((parseFloat(dimensions.y.toFixed(2))* 39.37).toFixed(2));
                        const factor=parseFloat((event.target.value/dimension_inch).toFixed(2));
                        //selectedObject.scale.y=factor;
                        displayObjectDimensions();
        
                    }
                    else if(isCm)
                    {
                        selectedObject.userData.heightcm=event.target.value;
                        if(dimensionGroup)
                        {
                            dimensionGroup.traverse(child=>{
                                dimensionGroup.remove(child);
                            });
                            scene.remove(dimensionGroup);
                            
                        }
                        const dimension_cm = Math.round(dimensions.y * 100)
                        const factor=event.target.value/dimension_cm;
                        //selectedObject.scale.y=factor;
                        displayObjectDimensions();
            
                    }
                    }
            });

            dimension.addEventListener('change',function()
            {
                if(dimension.checked==true)
                {
                    selectedObject.userData.showdimension=true;
                    if(dimensionGroup)
                    scene.remove(dimensionGroup);
                    displayObjectDimensions();
                    console.log("showing dimensions");
        
                    const radiobuttons=document.querySelectorAll("input[name='units']");
                    console.log(radiobuttons);
                    radiobuttons.forEach(radioButton=>
                    {
                        radioButton.addEventListener('change', event =>
                        {
                            if(event.target.checked)
                            {
                                console.log('unit changed');
                                const selectedvalue=event.target.value;
                                if(selectedvalue==='1')
                                {
                                    isCm=true;
                                    isInch=false;
                                    isMeter=false;
                                    scene.remove
                                    displayObjectDimensions();
                                    console.log('cm selected');
                                }
                                else if(selectedvalue==='2')
                                {
                                    isCm=false;
                                    isInch=true;
                                    isMeter=false;
                                    if(dimensionGroup)
                                    {
                                        scene.remove(dimensionGroup);
                                    }
                                    const bbox = new THREE.Box3().setFromObject(selectedObject);
                                    const dimensions = bbox.getSize(new THREE.Vector3());
                                    length.value=parseFloat((dimensions.z*39.37).toFixed(2));
                                    width.value=parseFloat((dimensions.x*39.37).toFixed(2));
                                    height.value=parseFloat((dimensions.y*39.37).toFixed(2));
                        
                                    if(selectedObject.userData.lengthInches)
                                        length.value=parseFloat(selectedObject.userData.lengthInches);
                                    if(selectedObject.userData.widthInches)
                                        width.value=parseFloat(selectedObject.userData.widthInches);
                                    if(selectedObject.userData.heightInches)
                                        height.value=parseFloat(selectedObject.userData.heightInches);
                                    displayObjectDimensions();
            
                                }
                                else if(selectedvalue==='3')
                                {
                                    isCm=false;
                                    isInch=false;
                                    isMeter=true;
                                    if(dimensionGroup)
                                        {
                                        scene.remove(dimensionGroup);
                                        }
                                        
                                        displayObjectDimensions();
                
                                }
                            }
                        });
                    });
                    if(isMeter) 
                    {
                    selectedObject.userData.lengthm=length.value;
                    selectedObject.userData.widthm=width.value;
                    selectedObject.userData.heightm=height.value;
                    }
                }
                else
                {
                    console.log("removing dimensions");
                    selectedObject.userData.showdimension=false;
                    if(dimensionGroup)
                    {
                       scene.remove(dimensionGroup);
                    }
                }
            });

        }
    }
}

export{displayDimensionControls,textX,textY,textZ,updateSpriteScale,arrowX,arrowY,arrowZ,dimensionGroup}