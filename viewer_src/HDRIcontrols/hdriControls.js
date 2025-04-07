import * as THREE from 'three';
import {scene,gui,renderer,HDRI} from '../main.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
let H
export function hdricontrols()
{
    const Hdri=gui.addFolder('HDRI controls');
    const deg = {
        rot_deg: 0
    }
    const axis = new THREE.Vector3(0, 1, 0);
    Hdri.add( deg, 'rot_deg', 0, 360, 1).onChange(function(event)
    {   
        scene.environmentRotation.y=THREE.MathUtils.degToRad ( event );
        scene.backgroundRotation.y=THREE.MathUtils.degToRad ( event );
    });
    const params = 
    {
        switch: true
    };
    Hdri.add(params, "switch").name("on/off").onChange(function(value) 
    {
        if (value) {
            // Switch is checked
            if(H)
            {
                scene.background=H;
                scene.environment=H;
            }
            else
            {
                scene.background=HDRI;
                scene.environment=HDRI;
            }
           
        } else {
            scene.background=new THREE.Color(0xffffff);
            scene.environment=new THREE.Color(0xffffff);
            
        }
    });
    const exp = {
        Exposure: 1
    }

    Hdri.add( exp, 'Exposure', 0, 100, 0.01).onChange(function(event)
    {
        scene.environmentIntensity=event;
        scene.backgroundIntensity=event;
        scene.traverse(child =>{
            if(child instanceof THREE.Mesh)
            {
                child.material.envMapIntensity=event;
            }

        });
    });
    const hdrInput = document.getElementById('hdrInput');
    hdrInput.addEventListener('change',(event) => {
        const file = event.target.files[0];
        const filename=file.name;
        if (file) 
        {
            const reader = new FileReader();
            reader.onload = (e) => 
            {
                const hdrLoader = new RGBELoader();
                hdrLoader.load(e.target.result, (texture) => 
                {
                    const gen = new THREE.PMREMGenerator(renderer);
                    H= gen.fromEquirectangular(texture).texture;
                    scene.environment = H;
                    scene.background = H;
                    texture.dispose();
                    settings.HDRI = filename;
                    hdrifile.updateDisplay();
                    gen.dispose();
                });
            };
            reader.readAsDataURL(file);
        }
    });
    const controller = {
        loadHDR: () => document.getElementById('hdrInput').click()
      };
    Hdri.add(controller, 'loadHDR').name('Load HDR');
    
    
    /*const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.hdr';
    fileInput.style.display = 'none'; // Keep it hidden

    fileInput.addEventListener('change', (event) => 
    {
        const file = event.target.files[0];
        const filename=file.name;
        if (file) 
        {
            const reader = new FileReader();
            reader.onload = (e) => 
            {
                const hdrLoader = new RGBELoader();
                hdrLoader.load(e.target.result, (texture) => 
                {
                    const gen = new THREE.PMREMGenerator(renderer);
                    H= gen.fromEquirectangular(texture).texture;
                    scene.environment = H;
                    scene.background = H;
                    texture.dispose();
                    settings.HDRI = filename;
                    hdrifile.updateDisplay();
                    gen.dispose();
                });
            };
            reader.readAsDataURL(file);
        }
        return filename;
    });
    const hdriupload=Hdri.add(HDRIadd,'add_hdri').name('Load HDRI').onChange(()=>
    {
        fileInput.click();
    });*/
    Hdri.close();
}