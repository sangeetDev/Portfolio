import * as THREE from 'three';
import {scene,renderer,currentCamera,orbitControls,transformControls,selectedObject,listIndex,gui,HDRI,lights,traverseScene,
        lighttargets,boxMesh,box,fonts,Text2DList,Text3DList,models,boxMesh3D,box3D,cameraTracker,activecamera,cameraChanged,
        EmitterShapes,EmitterShape,ParticleSystems,Emitters,fps,totalFrames,materials,getUVSets,UVsets,index,fileNames,
        loadGLBFromDrive,updateTimeline,Paths,updateCameraAttributes} from '../main.js';

let PathFolder,Pathdropdown,Pathnames=['none'],selectedCurve,PathAttributes;
function  createPathControls()
{
    PathFolder=gui.addFolder('Curve Path Controls');
    const pathParams={
        add_path:function(){createPath()}
    }
    const newPath=PathFolder.add(pathParams,'add_path').name('Create New Curve');
    const path={
        selectedOption:'none'
    };
    Pathdropdown=PathFolder.add(path,'selectedOption',Pathnames).name('Selected Curve').onChange(function(option){
        updatePathAttributes(option);
    })
    PathFolder.close();
}
function createPath()
{
   const CurvePoints=[
        new THREE.Vector3(0,1,5),
        new THREE.Vector3(3.54,1,3.54),
        new THREE.Vector3(5,1,0),
        new THREE.Vector3(3.54,1,-3.54),
        new THREE.Vector3(0,1,-5),
        new THREE.Vector3(-3.54,1,-3.54),
        new THREE.Vector3(-5,1,0),
        new THREE.Vector3(-3.54,1,3.54),
    ];
    const spline= new THREE.CatmullRomCurve3(CurvePoints);
    spline.closed=true;
    const splinegeo=new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
    const color=new THREE.Color(Math.random(), Math.random(), Math.random());
    const splineMat=new THREE.LineBasicMaterial({color:color});
    const splineObject=new THREE.Line(splinegeo,splineMat);
    scene.add(splineObject);
    Paths.push(splineObject);
    splineObject.userData.Points=CurvePoints;
    splineObject.name='Curve_'+Paths.length;
    splineObject.visible=true;
    splineObject.userData.controlPoints=[];
    splineObject.userData.spline=spline;
    for(let i=0; i<CurvePoints.length;i++)
    {
        let geo;
        let mat;
        if (i==0)
        {
            geo = new THREE.ConeGeometry(0.1, 0.5, 16);
            mat=new THREE.MeshBasicMaterial({color:0xff0000});
        }
        else
        {
            geo=new THREE.SphereGeometry(0.1,8,8);
            mat=new THREE.MeshBasicMaterial({color:color});
        }
        const splinepoint=new THREE.Mesh(geo,mat);
        splinepoint.position.copy(CurvePoints[i]);
        if(i==0)
        {
            const direction = new THREE.Vector3().subVectors(spline.getPointAt(0.01), CurvePoints[0]).normalize();
            const axis = new THREE.Vector3(0, 1, 0); // Default cone points along Y-axis
            const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
            splinepoint.applyQuaternion(quaternion);
        }
        scene.add(splinepoint);
        splinepoint.visible=true;
        splineObject.userData.controlPoints.push(splinepoint);
        
    }
    splineObject.userData.closed=spline.closed;
    updatePathOptions();
    updateCameraAttributes();

    const PathContainer=document.getElementById('Curves-Container');
    const Button=document.createElement('button');
    Button.textContent=splineObject.name;
    Button.addEventListener('click',function()
    {
        selectedCurve=splineObject;
        updatePathAttributes(Button.textContent);
    });
    PathContainer.appendChild(Button);
}

function updatePathOptions()
{
    Pathnames=[];
    Pathnames[0]="none";
    for (let i=0;i<Paths.length;i++)
    {
        Pathnames[i+1]=Paths[i].name;

    }
        const path={
            selectedOption:'none'
        };
        Pathdropdown.destroy();
        Pathdropdown=PathFolder.add(path,'selectedOption',Pathnames).name('Selected Curve').onChange(function(option){
           updatePathAttributes(option);
        });
}
function updatePathAttributes(option)
{
    if(option=="none")
    {
        return;
    }

    for(let i=0;i<Paths.length;i++)
    {
        if(Paths[i].name==option)
        {
            selectedCurve=Paths[i];
            console.log(selectedCurve);
            break;
        }
    }
    const attr=document.getElementById("container");
    attr.innerHTML='';

    const PathNameDiv=document.createElement('div');
    PathNameDiv.innerHTML=`<strong>${selectedCurve.name}<strong>`;
    attr.appendChild(PathNameDiv);

    const OpenCloseLabel=document.createElement('label');
    OpenCloseLabel.appendChild(document.createTextNode("closed curve"));
    const openclose=document.createElement('input');
    openclose.type='checkbox';
    openclose.checked=selectedCurve.userData.closed;
    openclose.addEventListener('click',function()
    {
        if(openclose.checked)
        {
            const curvePoints=selectedCurve.userData.Points;

            const spline=new THREE.CatmullRomCurve3(curvePoints);
            spline.closed=true;
            const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
            selectedCurve.geometry = newCurveGeometry;
            selectedCurve.userData.spline=spline;
            selectedCurve.userData.closed=true;

        }
        else
        {
            const curvePoints=selectedCurve.userData.Points;
            const spline=new THREE.CatmullRomCurve3(curvePoints);
            spline.closed=false;
            const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
            selectedCurve.geometry = newCurveGeometry;
            selectedCurve.userData.spline=spline;
            selectedCurve.userData.closed=false;
        }
    });
    OpenCloseLabel.appendChild(openclose);
    attr.appendChild(OpenCloseLabel);

    const reverseLabel=document.createElement('label');
    reverseLabel.appendChild(document.createTextNode('Reverse Direction'));
    const reverse=document.createElement('input');
    reverse.type='checkbox';
    reverse.checked=false;
    reverse.addEventListener('click',function()
    {
        const curvePoints=selectedCurve.userData.Points;
        const reversedpoints=[];
        reversedpoints.push(curvePoints[0]);
        for(let i=curvePoints.length-1;i>0;i--)
        {
            reversedpoints.push(curvePoints[i]);
        }
        const spline=new THREE.CatmullRomCurve3(reversedpoints);
        spline.closed=selectedCurve.userData.closed;
        const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
        selectedCurve.geometry = newCurveGeometry;
        selectedCurve.userData.spline=spline;
        selectedCurve.userData.Points=reversedpoints;
        const color=selectedCurve.userData.controlPoints[1].material.color;
        for(let i=0;i<selectedCurve.userData.controlPoints.length;i++)
        {
            scene.remove(selectedCurve.userData.controlPoints[i]);
        }
        selectedCurve.userData.controlPoints=[];
        for(let i=0; i<reversedpoints.length;i++)
        {
            
            let geo;
            let mat;
            if (i==0)
            {
                geo = new THREE.ConeGeometry(0.1, 0.5, 16);
                mat=new THREE.MeshBasicMaterial({color:0xff0000});
            }
            else
            {
                geo=new THREE.SphereGeometry(0.1,8,8);
                mat=new THREE.MeshBasicMaterial({color:color});
            }
            const splinepoint=new THREE.Mesh(geo,mat);
            splinepoint.position.copy(reversedpoints[i]);
            if(i==0)
            {
                const direction = new THREE.Vector3().subVectors(spline.getPointAt(0.01), reversedpoints[0]).normalize();
                const axis = new THREE.Vector3(0, 1, 0); // Default cone points along Y-axis
                const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
                splinepoint.applyQuaternion(quaternion);
            }
            scene.add(splinepoint);
            splinepoint.visible=true;
            selectedCurve.userData.controlPoints.push(splinepoint);
            
        }
        
    });
    reverseLabel.appendChild(reverse);
    attr.appendChild(reverseLabel);

    const addPointdiv=document.createElement('div');
    addPointdiv.innerHTML=`Add points to curve`;
    
    const position=new THREE.Vector3();

    const LabelX=document.createElement('label');
    LabelX.appendChild(document.createTextNode("X:"));
    const X=document.createElement('input');
    X.type='text';
    X.addEventListener('input',function(event)
    {
        position.x=parseFloat(event.target.value);
    });
    LabelX.appendChild(X);
    attr.appendChild(LabelX);

    const LabelY=document.createElement('label');
    LabelY.appendChild(document.createTextNode("Y:"));
    const Y=document.createElement('input');
    Y.type='text';
    Y.addEventListener('input',function(event)
    {
        position.y=parseFloat(event.target.value);
    });
    LabelY.appendChild(Y);
    attr.appendChild(LabelY);

    const LabelZ=document.createElement('label');
    LabelZ.appendChild(document.createTextNode("Z:"));
    const Z=document.createElement('input');
    Z.type='text';
    Z.addEventListener('input',function(event)
    {
        position.z=parseFloat(event.target.value);
    });
    LabelZ.appendChild(Z);
    attr.appendChild(LabelZ);

    const button=document.createElement('button');
    button.textContent="Add new Point";
    button.addEventListener('click',function()
    {
        const curvePoints=selectedCurve.userData.Points;
        curvePoints.push(position);
        const spline=new THREE.CatmullRomCurve3(curvePoints);
        spline.closed=selectedCurve.userData.closed;
        const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
        selectedCurve.geometry = newCurveGeometry;
        selectedCurve.userData.spline=spline;
        selectedCurve.userData.Points=curvePoints;
        const geometry=new THREE.SphereGeometry(0.1,8,8);
        const mat=selectedCurve.userData.controlPoints[1].material;
        const splinePoint=new THREE.Mesh(geometry,mat);
        splinePoint.position.copy(curvePoints[curvePoints.length-1]);
        selectedCurve.userData.controlPoints.push(splinePoint);
        scene.add(splinePoint);
    });
    attr.appendChild(button);

    const deletebutton=document.createElement('button');
    deletebutton.textContent="Delete Selected Point";
    deletebutton.addEventListener('click',function()
    {
        if(selectedObject)
        {
            if(selectedCurve.userData.controlPoints.includes(selectedObject))
            {
                const deletepoint=selectedObject.position;
                const curvePoints=selectedCurve.userData.Points;
                for(let i=0;i<curvePoints.length;i++)
                {
                    if(curvePoints[i].equals(deletepoint))
                    {
                        console.log("deleted point");
                        curvePoints.splice(i, 1);
                        selectedCurve.userData.controlPoints.splice(i,1);
                        console.log(curvePoints);
                        break;  
                    }
                }
                transformControls.detach();
                scene.remove(selectedObject);
                const spline=new THREE.CatmullRomCurve3(curvePoints);
                spline.closed=selectedCurve.userData.closed;
                const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
                selectedCurve.geometry = newCurveGeometry;
                selectedCurve.userData.spline=spline;
                selectedCurve.userData.Points=curvePoints;
                

            }
            else
            {
                alert("Selected Object is not a control point")
            }
        } 
        else
        {
            alert("No point selected");
        }
    });
    attr.appendChild(deletebutton);

   
}
function updateCurve() 
{
    if(Paths.length>0)
    {
        for(let i=0;i<Paths.length;i++)
        {
            const splineObject=Paths[i];
            splineObject.geometry.dispose();
    
            const CurvePoints = splineObject.userData.controlPoints.map(point => point.position);
            const spline = new THREE.CatmullRomCurve3(CurvePoints);
            spline.closed=splineObject.userData.spline.closed;
            const newCurveGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
            splineObject.geometry = newCurveGeometry;
            splineObject.userData.Points=CurvePoints;
            splineObject.userData.spline=spline;
            const direction = new THREE.Vector3().subVectors(spline.getPointAt(0.01), CurvePoints[0]).normalize();
            const axis = new THREE.Vector3(0, 1, 0); // Default cone points along Y-axis
            const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
            splineObject.userData.controlPoints[0].quaternion.copy(quaternion);
                
            //getEquallySpacedPoints(spline,numPoints);
        }   
    }

}
export {createPathControls,selectedCurve,updateCurve};