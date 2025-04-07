import * as THREE from'three';
import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,renderer,lights,traverseScene,
        lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
        EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,updateTimeline} from '../main.js';
import * as Troika from '../Text/twoDText/troika-three-text/dist/troika-three-text.esm.js';
import * as d3 from 'd3';

function animationControls()
{
    var showCurves={
        mark: false
    }
    const showanimationcurves=gui.addFolder('animation curves')
    document.getElementById('d3-container').style.display = 'none';
    showanimationcurves.add(showCurves, "mark").name("Show Animation Curve").onChange(function(value) {
        // Perform actions based on the switch value
        if (value) {
            // Switch is checked
            document.getElementById('d3-container').style.display = 'block';
        } else {
            document.getElementById('d3-container').style.display = 'none';
            
        }
    });
    showanimationcurves.close();
}
function setKeyframe(object, frame) 
{
    const keyframes = object.userData.keyframes || [];

    let transform = {
        position: object.position.clone(),
        rotation: {
            x: object.rotation.x,
            y: object.rotation.y,
            z: object.rotation.z,
        },
        scale: object.scale.clone(),
        uvset: object.userData.currentUVSet
    };
    if(object instanceof THREE.Light)
    {
        transform = {
                        color:object.color,
                        intensity:object.intensity,
                        position: object.position.clone(),
                        rotation: {
                            x: object.rotation.x,
                            y: object.rotation.y,
                            z: object.rotation.z,
                        },
                        scale: object.scale.clone(),
                    };
        if(object instanceof THREE.SpotLight)
        {
            transform.distance=object.distance;
            transform.decay=object.decay;
            transform.angle=object.angle;
            transform.penumbra=object.penumbra;
        }
        if(object instanceof THREE.PointLight)
        {
            transform.distance=object.distance;
            transform.decay=object.decay;
        }
        if(object instanceof THREE.RectAreaLight)
        {
            transform.width=object.width;
            transform.height=object.height;
        }
        if(object instanceof THREE.DirectionalLight)
        {
            
        }
    }
    if(object.isMesh && object.material instanceof THREE.MeshPhysicalMaterial )
    {
        transform = {
            position: object.position.clone(),
            rotation: {
                x: object.rotation.x,
                y: object.rotation.y,
                z: object.rotation.z,
            },
            scale: object.scale.clone(),
            uvset: object.userData.currentUVSet,
            glow: object.userData.isGlow,
            material:object.material
            
        };
        for(const key in object.material)
        {
            transform[key]=object.material[key];
        }

    }
    if(object instanceof THREE.Group && object.children[0] instanceof Troika.Text)
    {
        transform = 
        {
            position: object.position.clone(),
            rotation: {
                            x: object.rotation.x,
                            y: object.rotation.y,
                            z: object.rotation.z,
                    },
                
            scale: object.scale.clone(),
            text:object.userData.TextParams.text,
            font:object.userData.TextParams.font,
            fontSize:object.userData.TextParams.fontSize,
            Bold:object.userData.TextParams.Bold,
            Italic:object.userData.TextParams.Italic,
            Alignment:object.userData.TextParams.Alignment,
            color:object.userData.TextParams.color,
            lineHeight:object.userData.TextParams.lineHeight,
            letterSpacing:object.userData.TextParams.letterSpacing,
            fillOpacity:object.userData.TextParams.fillOpacity,
            direction:object.userData.TextParams.direction,
            curveRadius:object.userData.TextParams.curveRadius,
            //clipRect:selectedObject.userData.TextParams.font,
            anchorY:object.userData.TextParams.anchorY,
            anchorX:object.userData.TextParams.anchorX,
            outlineBlur:object.userData.TextParams.outlineBlur,
            outlineColor:object.userData.TextParams.outlineColor,
            outlineOffsetX:object.userData.TextParams.outlineOffsetX,
            outlineOffsetY:object.userData.TextParams.outlineOffsetY,
            outlineOpacity:object.userData.TextParams.outlineOpacity,
            outlineWidth:object.userData.TextParams.outlineWidth,
            strokeColor:object.userData.TextParams.strokeColor,
            strokeOpacity:object.userData.TextParams.strokeOpacity,
            strokeWidth:object.userData.TextParams.strokeWidth,
            //textIndent:selectedObject.userData.TextParams.font,
            };
        }
        if( object instanceof Troika.Text)
        {
            transform = {
                position: object.position.clone(),
                rotation: {
                    x: object.rotation.x,
                    y: object.rotation.y,
                    z: object.rotation.z,
                },
                
                scale: object.scale.clone(),
                fillOpacity:object.fillOpacity,
            
            };
        }

    
    
    keyframes.push({ frame, transform });

    // Sort keyframes by frame number
    keyframes.sort((a, b) => a.frame - b.frame);

    // Assign the updated keyframes array to userData
    object.userData.keyframes = keyframes;
    console.log(object.userData.keyframes);
    createAnimationCurveEditor(object);
}
function interpolateTransforms(object, frame) 
{
    const keyframes = object.userData.keyframes;
    if(object instanceof THREE.Mesh && object.userData.isSequence!=undefined && object.userData.isSequence==true)
    {
        //console.log('1');
        if(object.userData.imageSequence.length>0)
        {
           // console.log('2');
            if(object.userData.sequenceStart<frame && frame<=object.userData.sequenceEnd)
            {
                console.log(frame);
                //object.material.map.dispose();
                object.material.map=object.userData.imageSequence[frame-object.userData.sequenceStart];
                object.material.map.needsUpdate=true;
                console.log(object.material.map);
            }
        }
    }
    if (!keyframes || keyframes.length === 0) return;

    if (keyframes.length === 1) {
        const firstKeyframe = keyframes[0];
        object.position.copy(firstKeyframe.transform.position);
        object.rotation.set(
            firstKeyframe.transform.rotation.x,
            firstKeyframe.transform.rotation.y,
            firstKeyframe.transform.rotation.z
        );
        object.scale.copy(firstKeyframe.transform.scale);
        //setUVSet(object,firstKeyframe.transform.uvset);
        
    } 
    else if (keyframes.length >= 2)
    {
        let curvedata=object.userData.curveData;
        for(let i=0; i <=keyframes[keyframes.length-1].frame; i++)
        {
            if(i==frame)
            {
                object.position.x=curvedata.positionX[frame].value;
                object.position.y=curvedata.positionY[frame].value;
                object.position.z=curvedata.positionZ[frame].value;
                object.rotation.x=THREE.MathUtils.degToRad(curvedata.rotationX[frame].value);
                object.rotation.y=THREE.MathUtils.degToRad(curvedata.rotationY[frame].value);
                object.rotation.z=THREE.MathUtils.degToRad(curvedata.rotationZ[frame].value);
                if(object.userData.targetflag)
                {
                    object.lookAt(posLookAt);
                }
                
                object.scale.x=curvedata.scaleX[frame].value;
                object.scale.y=curvedata.scaleY[frame].value;
                object.scale.z=curvedata.scaleZ[frame].value;
                /*for(let j=0; j < keyframes.length; j++ )
                {
                    if(frame==keyframes[j].frame)
                    {
                        setUVSet(object,keyframes[j].transform.uvset);
                    }  
                }*/
                if (object instanceof THREE.Light) 
                {
                    let prevKeyframe, nextKeyframe;
                    for (let j = 0; j < keyframes.length - 1; j++) 
                    {
                        if (frame >= keyframes[j].frame && frame <= keyframes[j + 1].frame) 
                        {
                            prevKeyframe = keyframes[j];
                            nextKeyframe = keyframes[j + 1];
                            break;
                        }
                    }
                    if (prevKeyframe && nextKeyframe) 
                    {
                        const frameDelta = nextKeyframe.frame - prevKeyframe.frame;
                        const t = (frame - prevKeyframe.frame) / frameDelta;
                        object.color = new THREE.Color().lerpColors(
                                prevKeyframe.transform.color,
                                nextKeyframe.transform.color,
                                t);
                        object.intensity=THREE.MathUtils.lerp( 
                                prevKeyframe.transform.intensity,
                                nextKeyframe.transform.intensity,
                                t);
                        if(object instanceof THREE.PointLight||object instanceof THREE.SpotLight)
                        {
                            object.distance=THREE.MathUtils.lerp( 
                                prevKeyframe.transform.distance,
                                nextKeyframe.transform.distance,
                                t);
                            object.decay = THREE.MathUtils.lerp(
                                prevKeyframe.transform.decay,
                                nextKeyframe.transform.decay,
                                t);
                        }
                        if(object instanceof THREE.SpotLight)
                        {
                            object.penumbra = THREE.MathUtils.lerp(
                                prevKeyframe.transform.penumbra,
                                nextKeyframe.transform.penumbra,
                                t);
                            object.angle = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(
                                THREE.MathUtils.radToDeg(prevKeyframe.transform.angle),
                                THREE.MathUtils.radToDeg(nextKeyframe.transform.angle),
                                t));
                        }
                        if(object instanceof THREE.RectAreaLight)
                        {
                                object.width = THREE.MathUtils.lerp(
                                    prevKeyframe.transform.width,
                                    nextKeyframe.transform.width,
                                    t); 
                                object.height = THREE.MathUtils.lerp(
                                    prevKeyframe.transform.height,
                                    nextKeyframe.transform.height,
                                    t);
                        }

                    } 
                    else 
                    {
                        // If there's no next keyframe, set the color to the last keyframe's color
                        object.color.copy(keyframes[keyframes.length - 1].transform.color);
                        object.intensity=keyframes[keyframes.length - 1].transform.intensity;
                        if(object instanceof THREE.PointLight||object instanceof THREE.SpotLight)
                        {
                            object.distance=keyframes[keyframes.length - 1].transform.distance;
                            object.decay = keyframes[keyframes.length - 1].transform.decay;
                        }
                        if(object instanceof THREE.SpotLight)
                        {
                            object.penumbra = keyframes[keyframes.length - 1].transform.penumbra;
                            object.angle = keyframes[keyframes.length - 1].transform.angle;
                        }
                        if(object instanceof THREE.RectAreaLight)
                        {
                            object.width = keyframes[keyframes.length - 1].transform.width;
                            object.height = keyframes[keyframes.length - 1].transform.height;
                        }
                    }
                }
                if ((object instanceof THREE.Mesh) && (object.material instanceof THREE.MeshPhysicalMaterial))
                {
                    let prevKeyframe, nextKeyframe;
                    for (let j = 0; j < keyframes.length-1 ; j++) 
                    {
                        if (frame >= keyframes[j].frame && frame <= keyframes[j + 1].frame) 
                        {
                            prevKeyframe = keyframes[j];
                            nextKeyframe = keyframes[j + 1];
                            break;
                        }    
                    }
                    if (prevKeyframe && nextKeyframe) 
                    {
                        const frameDelta = nextKeyframe.frame - prevKeyframe.frame;
                        const t = (frame - prevKeyframe.frame) / frameDelta;
                        object.material=prevKeyframe.transform.material;
                        if(prevKeyframe.transform.material==nextKeyframe.transform.material)
                        {
                            for (const key in object.material)
                            {
                                if(key.toLowerCase().endsWith('ness')||key.toLowerCase().endsWith('intensity')||key.toLowerCase().endsWith('ior')||key.toLowerCase().endsWith('opacity')||key.toLowerCase().endsWith('transmission'))
                                {
                                    object.material[key]= THREE.MathUtils.lerp(
                                        prevKeyframe.transform[key],
                                        nextKeyframe.transform[key],
                                        t);
                                }
                                else if(key.toLowerCase().endsWith('color')||key.toLowerCase().endsWith('emissive'))
                                {
                                    object.material[key]= new THREE.Color().lerpColors(
                                        prevKeyframe.transform[key],
                                        nextKeyframe.transform[key],
                                        t);
                                }
                                else if(key.toLowerCase().endsWith('map'))
                                {
                                    object.material[key]=prevKeyframe.transform[key];
                                    //console.log(object.material[key]);
                                }
                            }
                        }   
                    }
                    else 
                    {
                        console.log(object.material);
                        object.material=keyframes[keyframes.length - 1].transform.material;
                        
                        for (const key in object.material)
                        {
                            if(key.toLowerCase().endsWith('ness')||key.toLowerCase().endsWith('intensity')||key.toLowerCase().endsWith('ior')||key.toLowerCase().endsWith('opacity')||key.toLowerCase().endsWith('transmission'))
                            {
                                object.material[key]=keyframes[keyframes.length - 1].transform[key];
                            }
                            else if(key.toLowerCase().endsWith('color')||key.toLowerCase().endsWith('emissive'))
                            {
                                object.material[key].copy(keyframes[keyframes.length - 1].transform[key]);
                            }
                            else if(key.toLowerCase().endsWith('map'))
                            {
                                object.material[key]=keyframes[keyframes.length - 1].transform[key];
                                object.material[key].needsUpdate=true;
                                object.material.needsUpdate=true;
                                //console.log(object.material[key]);
                            }
                        }
                    }
                   
                    
                }
                if (object instanceof THREE.Group && object.children[0] instanceof Troika.Text) 
                {
                    let prevKeyframe, nextKeyframe;
                    for (let j = 0; j < keyframes.length - 1; j++) 
                    {
                        if (frame >= keyframes[j].frame && frame <= keyframes[j + 1].frame) 
                        {
                            prevKeyframe = keyframes[j];
                            nextKeyframe = keyframes[j + 1];
                            break;
                        }
                    }
                    if (prevKeyframe && nextKeyframe) 
                    {
                        // Calculate the t value for interpolation
                        const frameDelta = nextKeyframe.frame - prevKeyframe.frame;
                        const t = (frame - prevKeyframe.frame) / frameDelta;
                        
                        object.children[0].color = `#${(new THREE.Color().lerpColors(
                            new THREE.Color(prevKeyframe.transform.color),
                            new THREE.Color(nextKeyframe.transform.color),
                            t
                        )).getHexString()}`;
                        object.children[0].fillOpacity = THREE.MathUtils.lerp(
                            prevKeyframe.transform.fillOpacity,
                            nextKeyframe.transform.fillOpacity,
                            t); 
                        object.children[0].strokeWidth = THREE.MathUtils.lerp(
                            prevKeyframe.transform.strokeWidth,
                            nextKeyframe.transform.strokeWidth,
                            t);
                        object.children[0].strokeOpacity = THREE.MathUtils.lerp(
                                prevKeyframe.transform.strokeOpacity,
                                nextKeyframe.transform.strokeOpacity,
                                t);
                        object.children[0].strokeColor = `#${(new THREE.Color().lerpColors(
                            new THREE.Color(prevKeyframe.transform.strokeColor),
                            new THREE.Color(nextKeyframe.transform.strokeColor),
                            t
                        )).getHexString()}`;
                        object.children[0].outlineBlur = THREE.MathUtils.lerp(
                            prevKeyframe.transform.outlineBlur,
                            nextKeyframe.transform.outlineBlur,
                            t);
                        object.children[0].outlineColor = `#${(new THREE.Color().lerpColors(
                            new THREE.Color(prevKeyframe.transform.outlineColor),
                            new THREE.Color(nextKeyframe.transform.outlineColor),
                            t
                        )).getHexString()}`;
                        object.children[0].outlineOpacity = THREE.MathUtils.lerp(
                            prevKeyframe.transform.outlineOpacity,
                            nextKeyframe.transform.outlineOpacity,
                            t);
                        object.children[0].outlineWidth = THREE.MathUtils.lerp(
                            prevKeyframe.transform.outlineWidth,
                            nextKeyframe.transform.outlineWidth,
                            t);
                        object.children[0].outlineOffsetX = THREE.MathUtils.lerp(
                            prevKeyframe.transform.outlineOffsetX,
                            nextKeyframe.transform.outlineOffsetX,
                            t);
                        object.children[0].outlineOffsetY = THREE.MathUtils.lerp(
                            prevKeyframe.transform.outlineOffsetY,
                            nextKeyframe.transform.outlineOffsetY,
                            t);
                        object.children[0].lineHeight = THREE.MathUtils.lerp(
                            prevKeyframe.transform.lineHeight,
                            nextKeyframe.transform.lineHeight,
                            t);
                        object.children[0].letterSpacing = THREE.MathUtils.lerp(
                            prevKeyframe.transform.letterSpacing,
                            nextKeyframe.transform.letterSpacing,
                            t);                                   
                    }
                    else 
                    {
                        object.remove(object.children[0]);
                        let TextMesh=create2DText(object.userData.TextParams,object.userData.box);
                        object.add(TextMesh);
                        object.children[0].color.copy(keyframes[keyframes.length - 1].transform.color);
                        object.children[0].fillOpacity = keyframes[keyframes.length - 1].transform.fillOpacity;
                        object.children[0].strokeWidth = keyframes[keyframes.length - 1].transform.strokeWidth;
                        object.children[0].strokeOpacity = keyframes[keyframes.length - 1].transform.strokeOpacity;
                        object.children[0].strokeColor.copy(keyframes[keyframes.length - 1].transform.strokeColor);
                        object.children[0].outlineBlur = keyframes[keyframes.length - 1].transform.outlineBlur;
                        object.children[0].outlineColor.copy(keyframes[keyframes.length - 1].transform.outlineColor);
                        object.children[0].outlineOpacity = keyframes[keyframes.length - 1].transform.outlineOpacity;
                        object.children[0].outlineWidth = keyframes[keyframes.length - 1].transform.outlineWidth;
                        object.children[0].outlineOffsetX = keyframes[keyframes.length - 1].transform.outlineOffsetX;
                        object.children[0].outlineOffsetY = keyframes[keyframes.length - 1].transform.outlineOffsetY ;
                        object.children[0].lineHeight = keyframes[keyframes.length - 1].transform.lineHeight;
                        object.children[0].letterSpacing = keyframes[keyframes.length - 1].transform.letterSpacing;
                        
                    }
                }
                else if ( object instanceof Troika.Text) 
                {
                    
                    let prevKeyframe, nextKeyframe;
                    for (let j = 0; j < keyframes.length - 1; j++) 
                    {
                        if (frame >= keyframes[j].frame && frame <= keyframes[j + 1].frame) {
                            prevKeyframe = keyframes[j];
                            nextKeyframe = keyframes[j + 1];
                            break;
                        }
                    }
                    if (prevKeyframe && nextKeyframe) 
                    {
                        // Calculate the t value for interpolation
                        const frameDelta = nextKeyframe.frame - prevKeyframe.frame;
                        const t = (frame - prevKeyframe.frame) / frameDelta;
                        object.fillOpacity = THREE.MathUtils.lerp(
                            prevKeyframe.transform.fillOpacity,
                            nextKeyframe.transform.fillOpacity,
                            t);                                
                    }
                    else 
                    {
                    
                        object.fillOpacity = keyframes[keyframes.length - 1].transform.fillOpacity;
                    }   
                }
            }   
        }
    }   
}
function createAnimationCurveEditor(object)
{
    document.querySelector('#d3-container').innerHTML='';
    object.userData.curveData={};
    if (!object.userData.handlesData) 
    {
        object.userData.handlesData =  {
                                          positionX: [],
                                          positionY: [],
                                          positionZ: [],
                                          rotationX: [],
                                          rotationY: [],
                                          rotationZ: [],
                                          scaleX: [],
                                          scaleY: [],
                                          scaleZ: []
                                       };
       
    }

    if(object.userData.keyframes && object.userData.keyframes.length > 1)
    {
        let keyframes=object.userData.keyframes;
        const width = 640;
        const height = 350;
        const marginTop = 20;
        const marginRight = 20;
        const marginBottom =20;
        const marginLeft = 40;
  
        var x = d3.scaleLinear()
               .domain([0, totalFrames])
               .range([marginLeft, width - marginRight]);
               
          
        var y = d3.scaleLinear()
               .domain([-1000, 1000])
                .range([height - marginBottom, marginTop]);
  
        const svg = d3.select("#d3-container")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .call(d3.zoom().on("zoom", zoomed))
                    .on("wheel", function (event) 
                    {
                        event.preventDefault();
                        const direction = event.deltaY < 0 ? 1.1 : 0.9;
                        svg.call(d3.zoom().scaleBy, direction);
                    })
            .on("dblclick.zoom", null)
            .on("contextmenu", function(event) {
                event.preventDefault();
            });
            
  
          const g = svg.append("g");
  
          const xAxis= g.append("g")
              .attr("transform", `translate(0,${(height-marginBottom+marginTop)/2 })`)
              .call(d3.axisBottom(x));
        
          // Add the y-axis.
          const yAxis = g.append("g")
              .attr("transform", `translate(${marginLeft},0)`)
              .call(d3.axisLeft(y));
  
         
          const line = d3.line()
              .x(d => x(d.frame))
              .y(d => y(d.value));
  
          const colors = {
                  positionX: "red",
                  positionY: "green",
                  positionZ: "blue",
                  rotationX: "orange",
                  rotationY: "purple",
                  rotationZ: "brown",
                  scaleX: "cyan",
                  scaleY: "magenta",
                  scaleZ: "yellow"
              };
          const properties = ["positionX", "positionY", "positionZ", "rotationX", "rotationY", "rotationZ", "scaleX", "scaleY", "scaleZ"];
          var transformProperties = keyframes.map(kf => ({
                  frame: kf.frame,
                  positionX: kf.transform.position.x,
                  positionY: kf.transform.position.y,
                  positionZ: kf.transform.position.z,
                  rotationX: THREE.MathUtils.radToDeg(kf.transform.rotation.x),
                  rotationY: THREE.MathUtils.radToDeg(kf.transform.rotation.y),
                  rotationZ: THREE.MathUtils.radToDeg(kf.transform.rotation.z),
                  scaleX: kf.transform.scale.x,
                  scaleY: kf.transform.scale.y,
                  scaleZ: kf.transform.scale.z
              }));
              const checkboxContainer = d3.select("#d3-container")
              .append("div")
              .attr("id", "checkbox-container")
              .style("display", "flex")
              .style("flex-direction", "row")
              .style("gap", "10px")
              .style("border", "border: 2px solid black");

              properties.forEach(property => {
                const checkboxDiv = checkboxContainer
                    .append("div")
                    .attr("class", "checkbox-container");
    
                    checkboxDiv.append("input")
                    .attr("type", "checkbox")
                    .attr("id", property)
                    .attr("checked", true)
                    .on("change", function () {
                        handleCheckboxChange(property, this.checked);
                    });
    
                    checkboxDiv.append("label")
                    .attr("for", property)
                    .text(property);
            });
           /* const unifiedHandlesCheckbox = d3.select("#d3-container")
            .append("div")
            .attr("class", "checkbox-container")
            .append("input")
            .attr("type", "checkbox")
            .attr("id", "unified-handles")
            .attr("checked", true);

            d3.select("#d3-container")
            .append("label")
            .attr("for", "unified-handles")
            .text("Unified Handles");*/

            //let unifiedHandles = true;

            /*unifiedHandlesCheckbox.on("change", function () {
            unifiedHandles = this.checked;
            });*/
              renderCurves();
              function renderCurves() 
              {
                g.selectAll("path").remove();
                g.selectAll("circle").remove();
                properties.forEach(property => {
                    if (d3.select(`#${property}`).property("checked")) 
                    {
                    const data = transformProperties.map(d => ({ frame: d.frame, value: d[property] }));
                    g.append("path")
                        .datum(data)
                        .attr("fill", "none")
                        .attr("stroke", colors[property])
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                        .curve(d3.curveCatmullRom)
                        .x(d => x(d.frame))
                        .y(d => y(d.value)))
                        .on("dblclick", function(event) { addPoint(event, property); })
    
                    g.selectAll(`circle.${property}`)
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("class", property)
                        .attr("cx", d => x(d.frame))
                        .attr("cy", d => y(d.value))
                        .attr("r", 4)
                        .attr("fill", colors[property])
                        .call(d3.drag()
                            .on("drag", function (event, d) {
                                dragPoint(event, property, d);
                            }));
                        const curve = g.select(`path[stroke='${colors[property]}']`);
                        const curveLength = curve.node().getTotalLength();
                        const getPointAtLength = t => curve.node().getPointAtLength(t * curveLength);
                        const getTangent = t => {
                        const p1 = getPointAtLength(t - 0.001);
                        const p2 = getPointAtLength(t + 0.001);
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                        return { angle, p1, p2 };
                    };

                            /*for (let i = 1; i < data.length - 1; i++) 
                            {
                                const point = data[i];
                                const t = point.frame / keyframes[keyframes.length - 1].frame;
                                const { angle } = getTangent(t);
                                const handleGroup = g.append("g")
                                .attr("class", "control-handle-group")
                                .attr("data-frame", point.frame);
                        
                                const index = data.findIndex(d => d.frame === point.frame);
                                if (object.userData.handlesData[property] && object.userData.handlesData[property][index]) {
                                    const handleData = object.userData.handlesData[property][index];
        
                                    // Left handle
                                    const leftHandle = handleGroup.append("circle")
                                        .attr("class", "control-handle")
                                        .attr("cx", handleData.leftHandlePosition.x)
                                        .attr("cy", handleData.leftHandlePosition.y)
                                        .attr("r", 4)
                                        .attr("fill", "gray")
                                        .call(d3.drag()
                                            .on("drag", function (event) {
                                                dragHandle(event, index, property, "left", this, point);
                                            }));
        
                                    // Right handle
                                    const rightHandle = handleGroup.append("circle")
                                        .attr("class", "control-handle")
                                        .attr("cx", handleData.rightHandlePosition.x)
                                        .attr("cy", handleData.rightHandlePosition.y)
                                        .attr("r", 4)
                                        .attr("fill", "gray")
                                        .call(d3.drag()
                                            .on("drag", function (event) {
                                                dragHandle(event, index, property, "right", this, point);
                                            }));
        
                                    // Lines connecting handles to the point
                                    handleGroup.append("line")
                                        .attr("x1", x(point.frame))
                                        .attr("y1", y(point.value))
                                        .attr("x2", handleData.rightHandlePosition.x)
                                        .attr("y2", handleData.rightHandlePosition.y)
                                        .attr("stroke", "gray")
                                        .attr("stroke-width", 1);
        
                                    handleGroup.append("line")
                                        .attr("x1", x(point.frame))
                                        .attr("y1", y(point.value))
                                        .attr("x2", handleData.leftHandlePosition.x)
                                        .attr("y2", handleData.leftHandlePosition.y)
                                        .attr("stroke", "gray")
                                        .attr("stroke-width", 1);
        
                                } else {
                                    // Calculate handle positions if not initialized
                                    const handleLength = 20;
                                    const leftHandleX = x(point.frame) - handleLength * Math.cos(angle);
                                    const leftHandleY = y(point.value) - handleLength * Math.sin(angle);
                                    const rightHandleX = x(point.frame) + handleLength * Math.cos(angle);
                                    const rightHandleY = y(point.value) + handleLength * Math.sin(angle);
        
                                    // Store calculated handle positions
                                    object.userData.handlesData[property][index] = {
                                        leftHandlePosition: { x: leftHandleX, y: leftHandleY },
                                        rightHandlePosition: { x: rightHandleX, y: rightHandleY }
                                    };
        
                                    // Left handle
                                    const leftHandle = handleGroup.append("circle")
                                        .attr("class", "control-handle")
                                        .attr("cx", leftHandleX)
                                        .attr("cy", leftHandleY)
                                        .attr("r", 4)
                                        .attr("fill", "gray")
                                        .call(d3.drag()
                                            .on("drag", function (event) {
                                                dragHandle(event, index, property, "left", this, point);
                                            }));
        
                                    // Right handle
                                    const rightHandle = handleGroup.append("circle")
                                        .attr("class", "control-handle")
                                        .attr("cx", rightHandleX)
                                        .attr("cy", rightHandleY)
                                        .attr("r", 4)
                                        .attr("fill", "gray")
                                        .call(d3.drag()
                                            .on("drag", function (event) {
                                                dragHandle(event, index, property, "right", this, point);
                                            }));
        
                                    // Lines connecting handles to the point
                                    handleGroup.append("line")
                                        .attr("x1", x(point.frame))
                                        .attr("y1", y(point.value))
                                        .attr("x2", rightHandleX)
                                        .attr("y2", rightHandleY)
                                        .attr("stroke", "gray")
                                        .attr("stroke-width", 1);
        
                                    handleGroup.append("line")
                                        .attr("x1", x(point.frame))
                                        .attr("y1", y(point.value))
                                        .attr("x2", leftHandleX)
                                        .attr("y2", leftHandleY)
                                        .attr("stroke", "gray")
                                        .attr("stroke-width", 1);
                                }
                                //console.log(object.userData.handlesData);
                            }*/
                    }

                    
                       

                });
                /*xAxis= g.append("g")
                .attr("transform", `translate(0,${(height-marginBottom+marginTop)/2 })`)
                .call(d3.axisBottom(x));
        
          // Add the y-axis.
                yAxis = g.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y));
                //svg.on("dblclick", function(event) { addPoint(event, property); });*/
                
            }
            function handleCheckboxChange(property, isChecked) {
                transformProperties = keyframes.map(kf => ({
                    frame: kf.frame,
                    positionX: kf.transform.position.x,
                    positionY: kf.transform.position.y,
                    positionZ: kf.transform.position.z,
                    rotationX: THREE.MathUtils.radToDeg(kf.transform.rotation.x),
                    rotationY: THREE.MathUtils.radToDeg(kf.transform.rotation.y),
                    rotationZ: THREE.MathUtils.radToDeg(kf.transform.rotation.z),
                    scaleX: kf.transform.scale.x,
                    scaleY: kf.transform.scale.y,
                    scaleZ: kf.transform.scale.z
                }));
                g.selectAll("path").remove();
                g.selectAll("circle").remove();
                g.selectAll("line").remove();
                renderCurves();

            }

            function dragHandle(event, index, property, side, object,point) {
                const handleGroup = d3.select(object.parentNode);
                const handle = d3.select(object);
            
                const centerX = x(point.frame);
                const centerY = y(point.value);
            
                const deltaX = event.x - centerX;
                const deltaY = event.y - centerY;
            
                const radius = 20; // The fixed distance (radius) from the keyframe point to the handle
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const scaleFactor = radius / distance;
            
                const constrainedX = centerX + deltaX * scaleFactor;
                const constrainedY = centerY + deltaY * scaleFactor;
            
                handle.attr("cx", constrainedX).attr("cy", constrainedY);

                /*if (!object.userData.handlesData[property]) {
                    object.userData.handlesData[property] = [];
                }*/
                /*if (!object.userData.handlesData[property][index]) {
                    object.userData.handlesData[property][index] = { leftHandlePosition: {}, right: {} };
                }*/
            
                if (side === "left") {
                    handleGroup.select("line:first-of-type")
                        .attr("x2", constrainedX)
                        .attr("y2", constrainedY);
                } else if (side === "right") {
                    handleGroup.select("line:last-of-type")
                        .attr("x2", constrainedX)
                        .attr("y2", constrainedY);
                }

                /*object.userData.handlesData[property][index][side+"HandlePosition"] = {
                    x: constrainedX,
                    y: constrainedY
                };*/
            
                if (unifiedHandles) {
                    const otherHandle = side === "left" ? handleGroup.select(".control-handle:last-of-type") : handleGroup.select(".control-handle:first-of-type");
            
                    const oppositeDeltaX = -deltaX; // Move in the opposite direction
                    const oppositeDeltaY = -deltaY; // Move in the opposite direction
                    const oppositeDistance = Math.sqrt(oppositeDeltaX * oppositeDeltaX + oppositeDeltaY * oppositeDeltaY);
                    const oppositeScaleFactor = radius / oppositeDistance;
            
                    const oppositeConstrainedX = centerX + oppositeDeltaX * oppositeScaleFactor;
                    const oppositeConstrainedY = centerY + oppositeDeltaY * oppositeScaleFactor;
            
                    otherHandle.attr("cx", oppositeConstrainedX).attr("cy", oppositeConstrainedY);
            
                    if (side === "left") {
                        handleGroup.select("line:last-of-type")
                            .attr("x2", oppositeConstrainedX)
                            .attr("y2", oppositeConstrainedY);
                    } else {
                        handleGroup.select("line:first-of-type")
                            .attr("x2", oppositeConstrainedX)
                            .attr("y2", oppositeConstrainedY);
                    }
                    object.userData.handlesData[property][index][side === "leftHandlePosition" ? "rightHandlePosition" : "leftHandlePosition"] = {
                        x: oppositeConstrainedX,
                        y: oppositeConstrainedY
                    };
                }
            }
    
            function addPoint(event, property) 
            {
                
                const [mx, my] = d3.pointer(event);
                const frame = Math.round(x.invert(mx));
                const value = y.invert(my);
                console.log(value);

                const newKeyframe={
                    frame:frame,
                    transform:{
                        position:object.position.clone(),
                        rotation:
                        {
                           x:object.rotation.x,
                           y:object.rotation.y,
                           z:object.rotation.z
                        },
                        scale:object.scale.clone()
                    }
                }
                if(object.userData.curveData)
                {
                for(let i=0; i <object.userData.curveData.positionX.length;i++)
                {
                    if(object.userData.curveData.positionX[i].frame==frame)
                        {
                            newKeyframe.transform.position.x=object.userData.curveData.positionX[i].value; 
                        }
                    if(object.userData.curveData.positionY[i].frame==frame)
                        {
                            newKeyframe.transform.position.y=object.userData.curveData.positionY[i].value; 
                        }
                    if(object.userData.curveData.positionZ[i].frame==frame)
                        {
                            newKeyframe.transform.position.z=object.userData.curveData.positionZ[i].value; 
                        }
                    if(object.userData.curveData.rotationX[i].frame==frame)
                        {
                            newKeyframe.transform.rotation.x=THREE.MathUtils.degToRad(object.userData.curveData.rotationX[i].value); 
                        }
                    if(object.userData.curveData.rotationY[i].frame==frame)
                        {
                            newKeyframe.transform.rotation.y=THREE.MathUtils.degToRad(object.userData.curveData.rotationY[i].value); 
                        }
                    if(object.userData.curveData.rotationZ[i].frame==frame)
                        {
                            newKeyframe.transform.rotation.y=THREE.MathUtils.degToRad(object.userData.curveData.rotationZ[i].value); 
                        }
                    if(object.userData.curveData.scaleX[i].frame==frame)
                        {
                            newKeyframe.transform.scale.x=object.userData.curveData.scaleX[i].value; 
                        }
                    if(object.userData.curveData.scaleY[i].frame==frame)
                        {
                            newKeyframe.transform.scale.y=object.userData.curveData.scaleY[i].value; 
                        }
                    if(object.userData.curveData.scaleZ[i].frame==frame)
                        {
                            newKeyframe.transform.scale.z=object.userData.curveData.scaleZ[i].value; 
                        }
                                        
                }
                }

                switch(property)
                {
                    case "positionX":
                           newKeyframe.transform.position.x=value;
                           break;
                    case  "positionY":
                           newKeyframe.transform.position.y=value;
                           break;
                    case  "positionZ":
                           newKeyframe.transform.position.z=value;
                           break;
                    case  "rotationX":
                           newKeyframe.transform.rotation.x=THREE.MathUtils.degToRad(value);
                           break;
                    case  "rotationY":
                            newKeyframe.transform.rotation.y=THREE.MathUtils.degToRad(value);
                            break;
                    case  "rotationZ":
                            newKeyframe.transform.rotation.z=THREE.MathUtils.degToRad(value);
                            break;
                    case  "scaleX":
                            newKeyframe.transform.scale.x=value;
                            break;
                    case  "scaleY":
                            newKeyframe.transform.scale.y=value;
                            break;
                    case  "scaleZ":
                            newKeyframe.transform.scale.z=value;
                            break;
                }
    
                // Create a new keyframe point with the new value for the clicked property
                keyframes.push(newKeyframe);

    // Sort keyframes by frame number
                keyframes.sort((a, b) => a.frame - b.frame);

    // Assign the updated keyframes array to userData
                object.userData.keyframes = keyframes;
                console.log(object.userData.keyframes);
    
              g.selectAll("path").remove();
              g.selectAll("circle").remove();
              g.selectAll("line").remove();
              transformProperties = keyframes.map(kf => ({
                frame: kf.frame,
                positionX: kf.transform.position.x,
                positionY: kf.transform.position.y,
                positionZ: kf.transform.position.z,
                rotationX: THREE.MathUtils.radToDeg(kf.transform.rotation.x),
                rotationY: THREE.MathUtils.radToDeg(kf.transform.rotation.y),
                rotationZ: THREE.MathUtils.radToDeg(kf.transform.rotation.z),
                scaleX: kf.transform.scale.x,
                scaleY: kf.transform.scale.y,
                scaleZ: kf.transform.scale.z
            }));
              /*properties.forEach(property => {
                if (d3.select(`#${property}`).property("checked")) 
                {
              const data = transformProperties.map(d => ({ frame: d.frame, value: d[property] }));
              g.append("path")
                 .datum(data)
                 .attr("fill", "none")
                 .attr("stroke", colors[property])
                 .attr("stroke-width", 1.5)
                 .attr("d", d3.line()
                 .curve(d3.curveCatmullRom)
                 .x(d => x(d.frame))
                 .y(d => y(d.value)))
                 .on("dblclick", function(event) { addPoint(event, property); });

              g.selectAll(`circle.${property}`)
                      .data(data)
                      .enter()
                      .append("circle")
                      .attr("class", property)
                      .attr("cx", d => x(d.frame))
                      .attr("cy", d => y(d.value))
                      .attr("r", 4)
                      .attr("fill", colors[property])
                      .call(d3.drag()
                            .on("drag", function (event, d) {
                                dragPoint(event, property, d);
                            }));


              
                     
                }

              });*/
              renderCurves();
              object.userData.curveData=generateCurveData();
              updateTimeline();
              console.log(object.userData.curveData);
              
            }
            function dragPoint(event, property, d) {
                const newY = y.invert(event.y);
                const newX = x.invert(event.x); 
                d.value = newY;
                
                const kfIndex = keyframes.findIndex(kf => kf.frame === d.frame);
                d.frame=newX;
                keyframes[kfIndex].frame=d.frame;
                switch (property) {
                    case "positionX":
                        keyframes[kfIndex].transform.position.x = newY;
                        break;
                    case "positionY":
                        keyframes[kfIndex].transform.position.y = newY;
                        break;
                    case "positionZ":
                        keyframes[kfIndex].transform.position.z = newY;
                        break;
                    case "rotationX":
                        keyframes[kfIndex].transform.rotation.x = THREE.MathUtils.degToRad(newY);
                        break;
                    case "rotationY":
                        keyframes[kfIndex].transform.rotation.y = THREE.MathUtils.degToRad(newY);
                        break;
                    case "rotationZ":
                        keyframes[kfIndex].transform.rotation.z = THREE.MathUtils.degToRad(newY);
                        break;
                    case "scaleX":
                        keyframes[kfIndex].transform.scale.x = newY;
                        break;
                    case "scaleY":
                        keyframes[kfIndex].transform.scale.y = newY;
                        break;
                    case "scaleZ":
                        keyframes[kfIndex].transform.scale.z = newY;
                        break;
                }
                keyframes.sort((a, b) => a.frame - b.frame);
                transformProperties = keyframes.map(kf => ({
                    frame: kf.frame,
                    positionX: kf.transform.position.x,
                    positionY: kf.transform.position.y,
                    positionZ: kf.transform.position.z,
                    rotationX: THREE.MathUtils.radToDeg(kf.transform.rotation.x),
                    rotationY: THREE.MathUtils.radToDeg(kf.transform.rotation.y),
                    rotationZ: THREE.MathUtils.radToDeg(kf.transform.rotation.z),
                    scaleX: kf.transform.scale.x,
                    scaleY: kf.transform.scale.y,
                    scaleZ: kf.transform.scale.z
                }));
                //keyframes.sort((a, b) => a.frame - b.frame);
                object.userData.keyframes=keyframes;
                g.selectAll("path").remove();
              g.selectAll("circle").remove();
              g.selectAll("line").remove();
              renderCurves();
              object.userData.curveData=generateCurveData();
              updateTimeline();
              console.log(object.userData.curveData);
            }   
                  
                  
  
            function zoomed(event)
            {
              const transform = event.transform;
              //x = transform.rescaleX(x);//comment out to keep x same
              y = transform.rescaleY(y);
  
              // Fix the x-axis zoom to positive direction only
              const kx = Math.max(1, transform.k);
              const ky = Math.max(1, transform.k);
  
              // Adjust the scales based on the zoom level
              //x.domain([0, totalFrames / kx]);//comment out to keep x same
              y.domain([-1000 / ky, 1000 / ky]);
  
              g.selectAll("path").remove();
              g.selectAll("circle").remove();
              g.selectAll("line").remove();
              //g.selectAll("control-handle").remove();
              /*object.userData.handlesData =  {
                positionX: [],
                positionY: [],
                positionZ: [],
                rotationX: [],
                rotationY: [],
                rotationZ: [],
                scaleX: [],
                scaleY: [],
                scaleZ: []
             };*/
              renderCurves();
            
              xAxis.call(d3.axisBottom(x));
              yAxis.call(d3.axisLeft(y));
                  
            }
            

            function generateCurveData() {
                const curvedata = {};
                
                properties.forEach(property => {
                    if (d3.select(`#${property}`).property("checked")) {
                        const curvePath = g.select(`path[stroke='${colors[property]}']`);
                        const curveLength = curvePath.node().getTotalLength();
                        const interpolatedData = [];
                        for (let i = 0; i <= object.userData.keyframes[object.userData.keyframes.length-1].frame; i++) {
                            const frame = i;
                            const point = curvePath.node().getPointAtLength((frame / object.userData.keyframes[object.userData.keyframes.length-1].frame) * curveLength);
                            const value = y.invert(point.y);
                            interpolatedData.push({ frame, value });
                        }
                        curvedata[property] = interpolatedData;
                    }
                });
                return curvedata;
            }
            object.userData.curveData=generateCurveData();
            //console.log(object.userData.curveData)
            
          return svg.node();
          
      }

      
         
}

export {animationControls,setKeyframe,interpolateTransforms,createAnimationCurveEditor};