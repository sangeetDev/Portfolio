import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {scene,selectedObject,listIndex,gui,traverseScene,fonts,Text3DList,models,boxMesh3D,box3D} from '../../main.js';
import { BoxHelperCustom } from './CustomBoxHelper.js';
import {mergeGeometries,mergeVertices,toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js'
import { setKeyframe } from '../../Animation&Keyframing/Iterpolate_Keyframing.js';
let textGeometry;
let TextScene;
const superscriptMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
    '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻',
    '=': '⁼', '(': '⁽', ')': '⁾',
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶦ',
    'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ',
    'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᵠ', 'r': 'ʳ',
    's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ',
    'y': 'ʸ', 'z': 'ᶻ',
    'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ᶜ', 'D': 'ᴅ', 'E': 'ᴱ', 'F': 'ᴳ',
    'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ⁱ', 'J': 'ᴶ', 'K': 'ᴷ', 'L': 'ᴸ',
    'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ', 'P': 'ᴾ', 'Q': 'ᵠ', 'R': 'ᴿ',
    'S': 'ˢ', 'T': 'ᵀ', 'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ʷ', 'X': 'ˣ',
    'Y': 'ʸ', 'Z': 'ᶻ'
};

const subscriptMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
    '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋',
    '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'b': 'ₑ', 'c': 'ₒ', 'd': 'ₓ', 'e': 'ₑ', 'f': 'ₓ',
    'g': '₍', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ',
    'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'q': 'ₒ', 'r': 'ᵣ',
    's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'w': 'ₓ', 'x': 'ₓ',
    'y': 'ᵧ', 'z': 'ₓ',
    'A': 'ₐ', 'B': 'ₑ', 'C': 'ₒ', 'D': 'ₓ', 'E': 'ₑ', 'F': 'ₓ',
    'G': '₍', 'H': 'ₕ', 'I': 'ᵢ', 'J': 'ⱼ', 'K': 'ₖ', 'L': 'ₗ',
    'M': 'ₘ', 'N': 'ₙ', 'O': 'ₒ', 'P': 'ₚ', 'Q': 'ₒ', 'R': 'ᵣ',
    'S': 'ₛ', 'T': 'ₜ', 'U': 'ᵤ', 'V': 'ᵥ', 'W': 'ₓ', 'X': 'ₓ',
    'Y': 'ᵧ', 'Z': 'ₓ'
};
async function create3DText(threeDTextParams,box)
{
    let textGeometry;
    let TextScene;
    const material=new THREE.MeshPhysicalMaterial({color:threeDTextParams.color});
   
    //const loader = new FontLoader();
    //const font= threeDTextParams.font;
    let textFont;
    const params={
		font:textFont ,
		size: threeDTextParams.size,
		depth: threeDTextParams.depth,
		curveSegments: threeDTextParams.curveSegments,
		bevelEnabled: threeDTextParams.bevelEnabled,
		bevelThickness: threeDTextParams.bevelThickness,
		bevelSize:threeDTextParams.bevelSize,
		bevelOffset: threeDTextParams.bevelOffset,
		bevelSegments: threeDTextParams.bevelSegments
	}
    try
    {
        
    params.font=await loadFont(threeDTextParams);
    threeDTextParams.text=processText(threeDTextParams.text) ;  
    textGeometry=   createWrappedTextGeometry(threeDTextParams.text,params,box,document.getElementById('multiline-input').style.textAlign)//createAlignedTextGeometry(threeDTextParams.text,params,document.getElementById('multiline-input').style.textAlign, box);
    //textGeometry=new  TextGeometry(threeDTextParams.text,params);
    TextScene=new THREE.Mesh(textGeometry,material);
    const words= threeDTextParams.text.split(" ");
    if(words.length<4)
    {
    TextScene.name=threeDTextParams.text;
    material.name=threeDTextParams.text+"_Material";
    }
    else
    {
        TextScene.name=threeDTextParams.text.split(" ").slice(0, 3).join(" ");
        material.name=threeDTextParams.text.split(" ").slice(0, 3).join(" ") +"_Material";
    }
    return TextScene;
    }
    catch (error) 
    {
        console.error('Error loading font:', error);
    }   
}
function loadFont(threeDTextParams) 
{
    const loader = new FontLoader();
    if(threeDTextParams.Bold && !threeDTextParams.Italic)
    {
        return new Promise((resolve, reject) => {
            loader.load('./fonts/' + threeDTextParams.font + '_Bold.json', resolve, undefined, reject);
        });
    }
    if(!threeDTextParams.Bold && threeDTextParams.Italic)
    {
        return new Promise((resolve, reject) => {
            loader.load('./fonts/' + threeDTextParams.font + '_Italic.json', resolve, undefined, reject);
        });
    }
    if(threeDTextParams.Bold && threeDTextParams.Italic)
    {
        return new Promise((resolve, reject) => {
            loader.load('./fonts/' + threeDTextParams.font + '_Bold Italic.json', resolve, undefined, reject);
        });
    }
    else
    {
        return new Promise((resolve, reject) => {
            loader.load('./fonts/' + threeDTextParams.font + '_Regular.json', resolve, undefined, reject);
        });
    }      
}
function create3DTextControls()
{
    const TextFolder=findFolder();
    const Text3dparam={
        add_3dText:function(){Text3D();}
    }
    const Text2D=TextFolder.add(Text3dparam,'add_3dText').name("Add 3D text");
}
function findFolder() 
{
    const arr=gui.foldersRecursive()
    
    for (const folder of arr) 
    {
        if (folder._title === "Text Controls") 
        {
            return folder;
        }
    }

    return null;
}
function Text3D()
{
    const attr=document.getElementById('container');
    attr.innerHTML="";
    const div= document.createElement('div');
    const lbl1 = document.createElement("label");
    const textarea=document.createElement("textarea");
    textarea.rows='5';
    textarea.cols='30';
    textarea.id='multiline-input';
    lbl1.appendChild(document.createTextNode("Enter 3D Text"));
    lbl1.appendChild(textarea);
    div.appendChild(lbl1);
    attr.appendChild(div);
    const threeDTextParams={
        text:"",
        font:"Arial",
        size:1,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 7,
        Bold:false,
        Italic:false,
        //UnderLine:false,
        Alignment:"Left",
        color:'#ff0000'
        
    
    }
    
    let TextMesh;
    const Textgroup=new THREE.Group();
    Textgroup.userData.TextParams=threeDTextParams;
    Text3DList.push( Textgroup);
    Textgroup.name="3D_Text"+Text3DList.length;
    Textgroup.userData.filename="3D_Text"+Text3DList.length;
    models.push(Textgroup);
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    scene.add(Textgroup); 
    for(let i=0; i<models.length;i++)
    {
        console.log('adding to outliner');
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }
    if(boxMesh3D)
    {
        Textgroup.userData.box3D=boxMesh3D;
    }
    //Text3DList.push(group);
    textarea.addEventListener('input',function(event){
        Textgroup.userData.TextParams.text=event.target.value; 
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
        {
            //console.log(boxMesh3D);
            if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=Text;
            //console.log(TextMesh);
            Textgroup.add(TextMesh);
            TextMesh.geometry.computeBoundingBox();
            let textHeight=TextMesh.geometry.boundingBox.max.y-TextMesh.geometry.boundingBox.min.y;
            //console.log(textHeight);
            if(textHeight>boxMesh3D.userData.height)
            {
                
                boxMesh3D.userData.height = textHeight;
                const geometry=new THREE.BoxGeometry(boxMesh3D.userData.width,textHeight,boxMesh3D.userData.depth);
                boxMesh3D.geometry.dispose();
                boxMesh3D.geometry=geometry;
                //box3D.update();
                //box3D=new BoxHelperCustom(boxMesh3D);
                box3D.update();
                const cloneMesh=boxMesh3D.clone();
                Textgroup.userData.box3D=cloneMesh;
                cloneMesh.userData.width=boxMesh3D.userData.width;
                cloneMesh.userData.height=boxMesh3D.userData.height;
                cloneMesh.userData.depth=boxMesh3D.userData.depth;

            }
            sceneTree.innerHTML='';
            for(let i=0; i<models.length;i++)
                {
                    console.log('adding to outliner');
                    const name=document.createElement('div');
                    name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
                    const sceneTree = document.getElementById('scene-tree');
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree);
                }
            
           
            //console.log(box3D);
        }).catch((error) => {
            console.error('Error adding text to scene:', error);
        });
        
    })
    attr.appendChild(textarea);

    const lblboxWidth=document.createElement('label');
    const boxWidth=document.createElement('input');
    boxWidth.id='boxWidth';
    boxWidth.value=boxMesh3D.userData.width;
    lblboxWidth.appendChild(document.createTextNode(" Text Box Width:"));
    lblboxWidth.appendChild(boxWidth);
    boxWidth.addEventListener('input',function(event)
    {
        boxMesh3D.userData.width = event.target.value;
        const geometry=new THREE.BoxGeometry(boxMesh3D.userData.width,boxMesh3D.userData.height,boxMesh3D.userData.depth);
        boxMesh3D.geometry.dispose();
        boxMesh3D.geometry=geometry;
        box3D.update();
        const cloneMesh=boxMesh3D.clone();
        Textgroup.userData.box3D=cloneMesh;
        cloneMesh.userData.width=boxMesh3D.userData.width;
        cloneMesh.userData.height=boxMesh3D.userData.height;
        cloneMesh.userData.depth=boxMesh3D.userData.depth;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
        {
            TextMesh=Text;
            Textgroup.add(TextMesh);  
        }).catch((error) => {
            console.error('Error adding text to scene:', error);
        });
    });
    attr.appendChild(lblboxWidth); 

    const dropdown = document.createElement('select');
    dropdown.id = 'fonts';
    fonts.forEach((font, index) => {
        const option = document.createElement('option');
        option.text = font;
        option.value = index;
        dropdown.appendChild(option);
    });
    dropdown.addEventListener('change', (event) => {
        const selectedfont = fonts[parseInt(event.target.value)];
        Textgroup.userData.TextParams.font=selectedfont;
        textarea.style.fontFamily=selectedfont;
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(dropdown);

    const lbl2=document.createElement('label');
    const Bold=document.createElement('input');
    Bold.type='checkbox';
    Bold.checked=Textgroup.userData.TextParams.Bold;
    lbl2.appendChild(document.createTextNode("Bold"));
    lbl2.appendChild(Bold);
    Bold.addEventListener('change',function(){
        if(Bold.checked)
        {
            Textgroup.userData.TextParams.Bold=true;
            textarea.style.fontWeight='bold';
        }
        else
        {
            Textgroup.userData.TextParams.Bold=false;
            textarea.style.fontWeight='normal';
        }
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
        {
            if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=Text;
            Textgroup.add(TextMesh);
        }).catch((error) => {
            console.error('Error adding text to scene:', error);
        });

    });
    attr.appendChild(lbl2);

    const lbl3=document.createElement('label');
    const Italic=document.createElement('input');
    Italic.type='checkbox';
    Italic.checked=Textgroup.userData.TextParams.Italic;
    lbl2.appendChild(document.createTextNode("Italic"));
    lbl2.appendChild(Italic);
    Italic.addEventListener('change',function(){
        if(Italic.checked)
        {
            Textgroup.userData.TextParams.Italic=true;
            textarea.style.fontStyle='italic';
        }
        else
        {
            Textgroup.userData.TextParams.Italic=false;
            textarea.style.fontStyle='normal';
        }
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(lbl3);
    
    const right=document.createElement('button');
    right.textContent='right Align';
    right.class='alignment-button';
    right.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="right";
        document.getElementById('multiline-input').style.textAlign='right';
        create3DText(Textgroup.userData.TextParams, boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(right);

    const left=document.createElement('button');
    left.textContent='left Align';
    left.class='alignment-button';
    left.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="left";
        document.getElementById('multiline-input').style.textAlign='left';
        create3DText(Textgroup.userData.TextParams, boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(left);

    const center=document.createElement('button');
    center.textContent='center Align';
    center.class='alignment-button';
    center.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="center";
        document.getElementById('multiline-input').style.textAlign='center';
        create3DText(Textgroup.userData.TextParams, boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh);
                }
                
                TextMesh=Text;
                //ThreeDText.userData.TextParams.text=event.target.value;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(center);

    const lblColor=document.createElement('label');
    const Color=document.createElement('input');
    Color.id='Color';
    Color.type = 'color';
    Color.value = Textgroup.userData.TextParams.color;
    lblColor.appendChild(document.createTextNode("Color:"));
    lblColor.appendChild(Color);
    Color.addEventListener('input', function(event) {
        Textgroup.userData.TextParams.color = event.target.value;
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });                                        
    });
    attr.appendChild(lblColor);

    const lbl4=document.createElement('label');
    const size=document.createElement('input');
    size.id='size';
    size.value=Textgroup.userData.TextParams.size;
    lbl4.appendChild(document.createTextNode("Size:"));
    lbl4.appendChild(size);
    size.addEventListener('input',function(event){
        Textgroup.userData.TextParams.size=event.target.value;
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl4);

    const lbl5=document.createElement('label');
    const depth=document.createElement('input');
    depth.id='depth';
    depth.value=Textgroup.userData.TextParams.depth;
    lbl5.appendChild(document.createTextNode("Depth:"));
    lbl5.appendChild(depth);
    depth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.depth=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl5);
    
    const lblCurve=document.createElement('label');
    const curveSegments=document.createElement('input');
    curveSegments.id='curve-segments';
    curveSegments.value=Textgroup.userData.TextParams.curveSegments;
    lblCurve.appendChild(document.createTextNode("Curve Segments:"));
    lblCurve.appendChild(curveSegments);
    curveSegments.addEventListener('input',function(event){
        Textgroup.userData.TextParams.curveSegments=parseInt(event.target.value);
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lblCurve);
    
    const lblbevel=document.createElement('label');
    const Bevel=document.createElement('input');
    Bevel.type='checkbox';
    Bevel.checked=Textgroup.userData.TextParams.bevelEnabled;
    lblbevel.appendChild(document.createTextNode("Enable Bevel"));
    lblbevel.appendChild(Bevel);
    Bevel.addEventListener('change',function(){
        if(Bevel.checked)
        {
            Textgroup.userData.TextParams.bevelEnabled=true;
           
        }
        else
        {
            Textgroup.userData.TextParams.bevelEnabled=false;
           
        }
        create3DText(Textgroup.userData.TextParams, boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });

    });
    attr.appendChild(lblbevel);

    const lbl6=document.createElement('label');
    const BevelThickness=document.createElement('input');
    BevelThickness.id='BevelThickness';
    BevelThickness.value=Textgroup.userData.TextParams.bevelThickness;
    lbl6.appendChild(document.createTextNode("Bevel Thickness:"));
    lbl6.appendChild(BevelThickness);
    BevelThickness.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelThickness=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl6);

    const lbl7=document.createElement('label');
    const BevelSize=document.createElement('input');
    BevelSize.id='BevelSize';
    BevelSize.value=Textgroup.userData.TextParams.bevelSize;
    lbl7.appendChild(document.createTextNode("Bevel Size:"));
    lbl7.appendChild(BevelSize);
    BevelSize.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelSize=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl7);

    const lbl8=document.createElement('label');
    const BevelOffset=document.createElement('input');
    BevelOffset.id='BevelOffset';
    BevelOffset.value=Textgroup.userData.TextParams.bevelOffset;
    lbl8.appendChild(document.createTextNode("Bevel Offset:"));
    lbl8.appendChild(BevelOffset);
    BevelOffset.addEventListener('input',function(event){
        Textgroup.userData.TextParams.bevelOffset=parseFloat(event.target.value);
        create3DText(Textgroup.userData.TextParams,boxMesh3D).then((Text)=>
            {
                if(TextMesh)
                {
                    Textgroup.remove(TextMesh)
                }
                TextMesh=Text;
                Textgroup.add(TextMesh);
            }).catch((error) => {
                console.error('Error adding text to scene:', error);
            });
    });
    attr.appendChild(lbl8);
}
function createAlignedTextGeometry(text, params, alignment, box) {
    const geometries = [];
    const characters = text.split('');
    let currentLine = '';
    let lineWidth = 0;
    let yOffset = 0; // Start at the top of the box

    // Function to estimate character width based on the font and size
    const estimateCharacterWidth = (char) => {
        const charGeometry = new TextGeometry(char, params);
        //const charMesh=new THREE.Mesh(charGeometry,new THREE.MeshBasicMaterial());
        charGeometry.computeBoundingBox();
        const charWidth = charGeometry.boundingBox.max.x -charGeometry.boundingBox.min.x;
       // charMesh.dispose();
        return charWidth;

    };

    // Iterate over each character and place it into the box
    characters.forEach((char, index) => {
        // Create the geometry for each character
        const charGeometry = new TextGeometry(char, params);
        const charWidth = estimateCharacterWidth(char);

        // Check if adding the next character will exceed the box width
        if (lineWidth + charWidth > box.width) {
            // If the character is not a space, add a hyphen before wrapping to the next line
            if (char !== ' ') {
                currentLine += '-';
                const hyphenGeometry = new TextGeometry('-', params);
                hyphenGeometry.translate(lineWidth - box.width / 2, yOffset + box.height / 2, 0);
                geometries.push(hyphenGeometry);
            }

            // Move to the next line and reset width tracking
            yOffset -= params.size;
            lineWidth = 0;
            currentLine = ''; // Start a new line
        }

        // Translate and add the current character geometry

        charGeometry.translate(lineWidth - box.width / 2, yOffset + box.height / 2, 0);
        console.log(charGeometry);
        lineWidth += charWidth;
        currentLine += char;

        // Add the current character's geometry to the array of geometries
        geometries.push(charGeometry);
    });

    // Align the text based on the alignment option
    geometries.forEach((geometry) => {
        if (alignment === 'center') {
            // Move the entire line to be center-aligned within the box
            const offsetX = (box.width - lineWidth) / 2;
            geometry.translate(offsetX, 0, 0);
        } else if (alignment === 'right') {
            // Right-align the text by moving it to the right side of the box
            const offsetX = box.width - lineWidth;
            geometry.translate(offsetX, 0, 0);
        }
        // Left-aligned text is already in the correct position (default)
    });

    // Merge the geometries into a single geometry
    const mergedGeometry = mergeGeometries(geometries, false);

    
    return mergedGeometry;
}
/*function createWrappedTextGeometry(text, params,box) {
    
    const font=params.font;
    const textSize=params.size;
    const boxWidth=box.userData.width;
    const boxHeight=box.userData.height;
    const depth=box.userData.depth;
    const lineHeightMultiplier=1.5

    const hyphenChar =  "-";
    const lineHeight = lineHeightMultiplier * params.size;
    let geometry = new THREE.BufferGeometry();
    let textGeometries = [];

    function wrapText(text, boxWidth,params) {
        const words = text.split(/\s+/);
        let lines = [];
        let currentLine = "";

        words.forEach((word) => {
            let testLine = currentLine + (currentLine.length > 0 ? " " : "") + word;
            const testGeometry = new TextGeometry(testLine, params);
            testGeometry.computeBoundingBox();
            const testWidth = testGeometry.boundingBox.max.x-testGeometry.boundingBox.min.x;

            if (testWidth > boxWidth) {
                if (word.length * textSize > boxWidth) {
                    let splitWord = word;
                    while (splitWord.length > 0) {
                        let subWord = splitWord.slice(0, Math.floor(boxWidth / textSize));
                        currentLine += subWord + hyphenChar;
                        lines.push(currentLine);
                        currentLine = "";
                        splitWord = splitWord.slice(Math.floor(boxWidth / textSize));
                    }
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine.length > 0) lines.push(currentLine);

        return lines;
    }

    // Wrap the text
    const lines = wrapText(text, boxWidth, params);
    let yOffset = boxHeight / 2-textSize; // Start from the top of the box

    // Create TextGeometry for each line
    lines.forEach((line) => {
        const textGeometry = new TextGeometry(line, params);

        // Offset each line so that it is placed inside the box
        textGeometry.translate(-boxWidth / 2, yOffset, 0); // Align to top-left of the box
        yOffset -= lineHeight;

        if (yOffset < -boxHeight / 2) {
            console.log("Text exceeds box height, some text may be cut off!");
        }

        textGeometries.push(textGeometry);
    });

    // Merge all text geometries into a single geometry
    const combinedgeometry= mergeGeometries(textGeometries, true);

    return combinedgeometry;
}*/
/*function createWrappedTextGeometry(text, params, box) {
    const font = params.font;
    const textSize = params.size;
    const boxWidth = box.userData.width;
    const boxHeight = box.userData.height;
    const depth = box.userData.depth;
    const lineHeightMultiplier = 1.5;

    const hyphenChar = "-";
    const lineHeight = lineHeightMultiplier * params.size;
    let textGeometries = [];

    // Function to wrap text within the box width
    function wrapTextLine(lineText, boxWidth, params) {
        const words = lineText.split(/\s+/); // Split text into words
        let lines = [];
        let currentLine = "";

        words.forEach((word) => {
            let testLine = currentLine + (currentLine.length > 0 ? " " : "") + word;
            const testGeometry = new TextGeometry(testLine, params);
            testGeometry.computeBoundingBox();
            const testWidth = testGeometry.boundingBox.max.x - testGeometry.boundingBox.min.x;

            // If the test line exceeds the box width, move to the next line
            if (testWidth > boxWidth) {
                // If the word itself exceeds boxWidth, break the word and hyphenate
                if (word.length * textSize > boxWidth) {
                    let splitWord = word;
                    while (splitWord.length > 0) {
                        let subWord = splitWord.slice(0, Math.floor(boxWidth / textSize) - 1);
                        currentLine += subWord + hyphenChar;
                        lines.push(currentLine);
                        currentLine = "";
                        splitWord = splitWord.slice(subWord.length);
                    }
                } else {
                    // Move the current line to the next line
                    lines.push(currentLine);
                    currentLine = word;
                }
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine.length > 0) lines.push(currentLine); // Add the last line

        return lines;
    }

    // Split the text by newline characters and handle wrapping for each line separately
    function wrapText(text, boxWidth, params) {
        const paragraphs = text.split("\n"); // Split by newline characters
        let wrappedLines = [];

        paragraphs.forEach((paragraph) => {
            const wrapped = wrapTextLine(paragraph, boxWidth, params); // Wrap each paragraph individually
            wrappedLines = wrappedLines.concat(wrapped); // Combine the wrapped lines
        });

        return wrappedLines;
    }

    // Wrap the text
    const lines = wrapText(text, boxWidth, params);
    let yOffset = boxHeight / 2 - textSize; // Start from the top of the box

    // Create TextGeometry for each line
    lines.forEach((line) => {
        const textGeometry = new TextGeometry(line, params);

        // Offset each line so that it is placed inside the box
        textGeometry.translate(-boxWidth / 2, yOffset, 0); // Align to top-left of the box
        yOffset -= lineHeight; // Move down to the next line

        if (yOffset < -boxHeight / 2) {
            console.log("Text exceeds box height, some text may be cut off!");
        }

        textGeometries.push(textGeometry); // Collect each line's geometry
    });

    // Merge all text geometries into a single geometry
    const combinedGeometry = mergeGeometries(textGeometries, true);

    return combinedGeometry; // Return the combined text geometry
}*/
/*function createWrappedTextGeometry(text, params, box)
{
    const textSize = params.size;
    const boxWidth = box.userData.width;
    const boxHeight = box.userData.height;
    const lineHeightMultiplier = 1.5;

    const hyphenChar = "-";
    const lineHeight = lineHeightMultiplier * params.size;
    let textGeometries = [];

    // Function to wrap text within the box width
    function wrapTextLine(lineText, boxWidth, params) 
    {
        let lines = [];
        let currentLine = "";
        let currentLineWidth = 0;

        lineText.split(/\s+/).forEach((word) => {
            let wordGeometry = new TextGeometry(word, params);
            wordGeometry.computeBoundingBox();
            let wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x;

            // Check if the word fits within the remaining width of the current line
            if (currentLineWidth + wordWidth > boxWidth) {
                // Word exceeds box width, so we need to break it
                let splitIndex = 0;
                let subWordWidth = 0;
                let subWord = "";

                for (let i = 0; i < word.length; i++) {
                    const charGeometry = new TextGeometry(word[i], params);
                    charGeometry.computeBoundingBox();
                    let charWidth = charGeometry.boundingBox.max.x - charGeometry.boundingBox.min.x;
                    subWordWidth += charWidth;

                    // If adding this character exceeds the box width, break the word
                    if (currentLineWidth + subWordWidth > boxWidth) {
                        splitIndex = i;
                        subWord = word.slice(0, i) + hyphenChar;
                        break;
                    }
                }

                // Add the first part of the word with a hyphen to the current line
                lines.push(currentLine + subWord);

                // Set the remaining part of the word for the next line
                currentLine = word.slice(splitIndex);
                currentLineWidth = 0; // Reset line width for the new line

                // Recalculate remaining word width for the next line
                wordGeometry = new TextGeometry(currentLine, params);
                wordGeometry.computeBoundingBox();
                wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x;
            }

            // Add word to the current line
            currentLine += (currentLine ? " " : "") + word;
            currentLineWidth += wordWidth;
        });

        if (currentLine.length > 0) lines.push(currentLine); // Add the last line

        return lines;
    }

    // Split the text by newline characters and handle wrapping for each line separately
    function wrapText(text, boxWidth, params) {
        const paragraphs = text.split("\n"); // Split by newline characters
        let wrappedLines = [];

        paragraphs.forEach((paragraph) => {
            const wrapped = wrapTextLine(paragraph, boxWidth, params); // Wrap each paragraph individually
            wrappedLines = wrappedLines.concat(wrapped); // Combine the wrapped lines
        });

        return wrappedLines;
    }

    // Wrap the text
    const lines = wrapText(text, boxWidth, params);
    let yOffset = boxHeight / 2 - textSize; // Start from the top of the box

    // Create TextGeometry for each line
    lines.forEach((line) => {
        const textGeometry = new TextGeometry(line, params);

        // Offset each line so that it is placed inside the box
        textGeometry.translate(-boxWidth / 2, yOffset, 0); // Align to top-left of the box
        yOffset -= lineHeight; // Move down to the next line

        if (yOffset < -boxHeight / 2) {
            console.log("Text exceeds box height, some text may be cut off!");
        }

        textGeometries.push(textGeometry); // Collect each line's geometry
    });

    // Merge all text geometries into a single geometry
    const combinedGeometry = mergeGeometries(textGeometries, true);

    return combinedGeometry; // Return the combined text geometry
}*/
function createWrappedTextGeometry(text, params, box, alignment = 'left') {
    
    const textSize = params.size;
    const boxWidth = box.userData.width;
    const boxHeight = box.userData.height;
    
    const lineHeightMultiplier = 1.5;

    const hyphenChar = "-";
    const lineHeight = lineHeightMultiplier * params.size;
    let textGeometries = [];

    // Function to wrap text within the box width
    function wrapTextLine(lineText, boxWidth, params) {
        let lines = [];
        let currentLine = "";
        let currentLineWidth = 0;

        lineText.split(/\s+/).forEach((word) => {
            let wordGeometry = new TextGeometry(word, params);
            wordGeometry.computeBoundingBox();
            let wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x;

            // Check if the word fits within the remaining width of the current line
            if (currentLineWidth + wordWidth > boxWidth) 
            {
                // Word exceeds box width, so we need to break it
                let subWordWidth = 0;
                let subWord = "";
                let remainder = word; // Start with the full word as remainder

            // Break the word into parts, fit as much as possible in the current line
            for (let i = 0; i < word.length; i++) {
                const charGeometry = new TextGeometry(word[i], params);
                charGeometry.computeBoundingBox();
                let charWidth = charGeometry.boundingBox.max.x - charGeometry.boundingBox.min.x+params.size*0.2;
                subWordWidth += charWidth;

                // If adding this character exceeds the box width, break the word
                if (currentLineWidth + subWordWidth > boxWidth) {
                    subWord = word.slice(0, i) + hyphenChar; // Add hyphen at break point
                    remainder = word.slice(i); // The rest of the word
                    break;
                }
            }

            // Add the broken word to the current line and finalize it
            lines.push(currentLine + (currentLine ? " " : "") + subWord);

            // Move to the next line with the remainder of the word
            currentLine = "";  // Reset current line after adding the subword
            currentLineWidth = 0; // Reset the line width for the new line

            word = remainder; // Set the word to the remainder for the next iteration
            wordGeometry = new TextGeometry(word, params);
            wordGeometry.computeBoundingBox();
            wordWidth = wordGeometry.boundingBox.max.x - wordGeometry.boundingBox.min.x;
            }

            // Add word to the current line
            currentLine += (currentLine ? " " : "") + word;
            currentLineWidth += wordWidth;
        });

        if (currentLine.length > 0) lines.push(currentLine); // Add the last line

        return lines;
    }

    // Split the text by newline characters and handle wrapping for each line separately
    function wrapText(text, boxWidth, params) {
        const paragraphs = text.split("\n"); // Split by newline characters
        let wrappedLines = [];

        paragraphs.forEach((paragraph) => {
            const wrapped = wrapTextLine(paragraph, boxWidth, params); // Wrap each paragraph individually
            wrappedLines = wrappedLines.concat(wrapped); // Combine the wrapped lines
        });

        return wrappedLines;
    }

    // Wrap the text
    const lines = wrapText(text, boxWidth, params);
    let yOffset = boxHeight / 2 - textSize; // Start from the top of the box

    // Create TextGeometry for each line
    lines.forEach((line) => {
        const textGeometry = new TextGeometry(line, params);
        textGeometry.computeVertexNormals();
        // Compute the width of the line
        textGeometry.computeBoundingBox();
        const lineWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        
        // Offset each line based on the specified alignment
        let xOffset=0;
        switch (alignment) {
            case 'center':
                xOffset = -boxWidth/2+(boxWidth - lineWidth) / 2; // Center aligned
                break;
            case 'right':
                xOffset = -boxWidth/2+(boxWidth - lineWidth); // Right aligned
                break;
            case 'left':
                xOffset=-boxWidth/2;
                break;
            default:
                xOffset=-boxWidth/2 // Left aligned (default)
                break;
        }


        textGeometry.translate(xOffset, yOffset, 0); // Align based on specified alignment
        yOffset -= lineHeight; // Move down to the next line

       /* if (yOffset < -boxHeight / 2) {
            console.log("Text exceeds box height, some text may be cut off!");
        }*/

        textGeometries.push(textGeometry); // Collect each line's geometry
    });

    // Merge all text geometries into a single geometry
    const combinedGeometry = mergeGeometries(textGeometries, false);
    combinedGeometry.computeVertexNormals();
    return combinedGeometry; // Return the combined text geometry
}
function processText(multilineText) {
    let text = multilineText

    // Replace superscript pattern
    text = text.replace(/\((.*?)\)\^\((.*?)\)/g, function(match, base, exponent) {
        return base + convertToSuperscript(exponent);
    });

    // Replace subscript pattern
    text = text.replace(/\((.*?)\)~\^\((.*?)\)/g, function(match, base, subscript) {
        return base + convertToSubscript(subscript);
    });

    console.log("Processed Text: ", text);

    // Call your function to create TextGeometry with the processed text
   return text;
}

function convertToSuperscript(text) {
    return text.split('').map(char => superscriptMap[char] || char).join('');
}

function convertToSubscript(text) {
    return text.split('').map(char => subscriptMap[char] || char).join('');
}
function SeparateCharacters()
{
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;
    selectedObject.remove(Textobject);
    const characters=separateUnconnectedGeometries(Textgeometry);
    for(let i=0; i<characters.length;i++)
        {
            const material=Textobject.material.clone();
            material.name=Textobject.material.name+i;
            const char=new THREE.Mesh(characters[i],material);
            char.name=selectedObject.name+"_Char_"+i;
            selectedObject.add(char);
            movePivotToGeometryCenter(char);
            //char.position.z=5;
            //setKeyframe(char,0);
        }
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0; i<models.length;i++)
        {
            //console.log('adding to outliner');
            const name=document.createElement('div');
            name.innerHTML=`<strong>${models[i].userData.name}:</strong>`;
            const sceneTree = document.getElementById('scene-tree');
            sceneTree.appendChild(name);
            traverseScene(models[i], sceneTree);
        }
}
function create3DCharPosAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;

    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    for(let i=0; i<characters.length;i++)
    {
        const material=Textobject.material.clone();
        material.name=Textobject.material.name+i;
        const char=new THREE.Mesh(characters[i],material);
        char.name=selectedObject.name+"_Char_"+i;
        selectedObject.add(char);
        movePivotToGeometryCenter(char);
        char.position.z=5;
        setKeyframe(char,0);
    }
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0; i<models.length;i++)
        {
            //console.log('adding to outliner');
            const name=document.createElement('div');
            name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
            const sceneTree = document.getElementById('scene-tree');
            sceneTree.appendChild(name);
            traverseScene(models[i], sceneTree);
        }
    console.log(selectedObject.children);
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
    {
        if(selectedObject.children[i].name.includes('Char'))
        {
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
            selectedObject.children[i].position.z=3;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
            selectedObject.children[i].position.z=0.5;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
            selectedObject.children[i].position.z=0;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
            console.log(selectedObject.children[i].userData.keyframes);
        }
    }

}
function create3DCharRotAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;

    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    for(let i=0; i<characters.length;i++)
    {
        const material=Textobject.material.clone();
        material.transparent=true;
        let char=new THREE.Mesh(characters[i],material);
        char.name=selectedObject.name+"_Char_"+i;
        //char=setPivotToCenter(char);
        char.material.opacity=0.0;
        selectedObject.add(char);
        movePivotToGeometryCenter(char)
        console.log(char.position);
        char.rotation.y=THREE.MathUtils.degToRad(90);

        setKeyframe(char,0);
    }
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0; i<models.length;i++)
    {
        //console.log('adding to outliner');
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }

    console.log(selectedObject.children);
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    //console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
        { 
           if(selectedObject.children[i].name.includes('Char'))
           {
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
           selectedObject.children[i].material.opacity=0.01;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(75);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
           selectedObject.children[i].material.opacity=0.7;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(15);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
           selectedObject.children[i].material.opacity=1.0;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(0);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
           console.log(selectedObject.children[i].userData.keyframes);
           }
        }

}
function create3DCharScaleAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;

    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    for(let i=0; i<characters.length;i++)
    {
        const material=Textobject.material.clone();
        material.transparent=true;
        let char=new THREE.Mesh(characters[i],material);
        char.name=selectedObject.name+"_Char_"+i;
        //char=setPivotToCenter(char);
        char.material.opacity=0.0;
        selectedObject.add(char);
        movePivotToGeometryCenter(char)
        console.log(char.position);
        char.scale.set(0.01,0.01,0.01);

        setKeyframe(char,0);
    }
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0; i<models.length;i++)
    {
        //console.log('adding to outliner');
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }
    console.log(selectedObject.children);
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    //console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
        { 
           if(selectedObject.children[i].name.includes('Char'))
           {
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
           selectedObject.children[i].material.opacity=0.01;
           selectedObject.children[i].scale.set(0.01,0.01,0.01);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
           selectedObject.children[i].material.opacity=0.7;
           selectedObject.children[i].scale.set(0.7,0.7,0.7);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
           selectedObject.children[i].material.opacity=1.0;
           selectedObject.children[i].scale.set(1,1,1);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
           console.log(selectedObject.children[i].userData.keyframes);
           }
        }
}
function create3DWordPosAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    const wordText=selectedObject.userData.TextParams.text.split(' ');
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;

    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    const words=separateWordGeometries(characters);
    for(let i=0; i<words.length;i++)
    {
        const material=Textobject.material;
        const word=new THREE.Mesh(words[i],material);
        selectedObject.add(word);
        word.name=selectedObject.name+"_Word_"+i;
        word.position.z=5;
        setKeyframe(word,0);
    }
    console.log(selectedObject.children);
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0;i<models.length;i++)
    {
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }
    console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
    {
        if(selectedObject.children[i].name.includes('Word'))
        {
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
            selectedObject.children[i].position.z=3;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
            selectedObject.children[i].position.z=0.5;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
            selectedObject.children[i].position.z=0;
            setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
            console.log(selectedObject.children[i].userData.keyframes);
        }
    }

}
function create3DWordRotAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    const wordText=selectedObject.userData.TextParams.text.split(' ');
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;

    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    const words=separateWordGeometries(characters);
    for(let i=0; i<words.length;i++)
    {
        const material=Textobject.material.clone();
        material.transparent=true;
        let word=new THREE.Mesh(words[i],material);
        //char=setPivotToCenter(char);
        word.material.opacity=0.0;
        word.name=selectedObject.name+"_Word_"+i;
        selectedObject.add(word);
        movePivotToGeometryCenter(word)
        word.rotation.y=THREE.MathUtils.degToRad(90);
        setKeyframe(word,0);
    }
    //console.log(selectedObject.children);
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0;i<models.length;i++)
    {
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    //console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
        { 
            if(selectedObject.children[i].name.includes('Word'))
            {
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
           selectedObject.children[i].material.opacity=0.01;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(75);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
           selectedObject.children[i].material.opacity=0.7;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(15);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
           selectedObject.children[i].material.opacity=1.0;
           selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(0);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
           console.log(selectedObject.children[i].userData.keyframes);
            }
        }

}
function create3DWordScaleAnim()
{
    let startframe=selectedObject.userData.startframe;
    let endframe=selectedObject.userData.endframe;
    console.log(startframe,endframe);
    const Textobject=selectedObject.children[0];
    const Textgeometry=Textobject.geometry;
    const wordText=selectedObject.userData.TextParams.text.split(' ');
    selectedObject.remove(Textobject);

    const characters=separateUnconnectedGeometries(Textgeometry);
    const words=separateWordGeometries(characters);
    for(let i=0; i<words.length;i++)
    {
        const material=Textobject.material.clone();
        material.transparent=true;
        let word=new THREE.Mesh(words[i],material);
        //char=setPivotToCenter(char);
        word.material.opacity=0.0;
        word.name=selectedObject.name+"_Word_"+i;
        selectedObject.add(word);
        movePivotToGeometryCenter(word)
        
        word.scale.set(0.01,0.01,0.01);

        setKeyframe(word,0);
    }
    let sceneTree=document.getElementById('scene-tree');
    sceneTree.innerHTML='';
    for(let i=0;i<models.length;i++)
    {
        const name=document.createElement('div');
        name.innerHTML=`<strong>${models[i].userData.filename}:</strong>`;
        const sceneTree = document.getElementById('scene-tree');
        sceneTree.appendChild(name);
        traverseScene(models[i], sceneTree);
    }
    //console.log(selectedObject.children);
    //selectedObject.children[1].visible=false;
    const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
    //console.log(intervals);
    for (let i = 0; i <selectedObject.children.length; i++)
        { 
            if(selectedObject.children[i].name.includes('Word'))
            {
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
           selectedObject.children[i].material.opacity=0.01;
           selectedObject.children[i].scale.set(0.01,0.01,0.01);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
           selectedObject.children[i].material.opacity=0.7;
           selectedObject.children[i].scale.set(0.7,0.7,0.7);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
           selectedObject.children[i].material.opacity=1.0;
           selectedObject.children[i].scale.set(1,1,1);
           setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
           console.log(selectedObject.children[i].userData.keyframes);
            }
        }
}
function movePivotToGeometryCenter(mesh) {
    // Compute the bounding box of the geometry
    mesh.geometry.computeBoundingBox();
    const boundingBox = mesh.geometry.boundingBox;

    // Get the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Translate the geometry so that the center becomes the new pivot
    mesh.geometry.translate(-center.x, -center.y, -center.z);

    // Move the mesh to compensate for the geometry translation and keep it in the same place
    mesh.position.add(center);
}
function separateUnconnectedGeometries(geometry) 
{
    // Helper function to round vertex positions to avoid floating-point precision issues
    function roundVertices(geometry, precision = 6) {
        const positionAttr = geometry.attributes.position;
        for (let i = 0; i < positionAttr.count; i++) {
            positionAttr.setXYZ(
                i,
                parseFloat(positionAttr.getX(i).toFixed(precision)),
                parseFloat(positionAttr.getY(i).toFixed(precision)),
                parseFloat(positionAttr.getZ(i).toFixed(precision))
            );
        }
        positionAttr.needsUpdate = true;
    }

    // Round the vertices before merging and indexing
    roundVertices(geometry);

    // Ensure the geometry has indices and merge vertices for proper connection
    if (!geometry.index) {
        console.warn("The geometry is not indexed. Merging vertices and creating an index.");
        geometry = mergeVertices(geometry);
    }

    const positions = geometry.attributes.position.array;
    const indices = geometry.index.array;
    const normals = geometry.attributes.normal.array;
    const uvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
    const visited = new Set(); // Set to track visited indices
    const geometries = []; // Array to hold the new geometries

    // Create a mapping from vertex positions to indices
    const vertexMap = new Map();
    const precision = 1e-6; // Precision threshold for merging

    function getVertexKey(x, y, z) {
        return `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
    }

    // Populate vertex map (ensures shared vertices have a consistent index)
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        const key = getVertexKey(x, y, z);

        if (!vertexMap.has(key)) {
            vertexMap.set(key, i / 3); // Store the index of the vertex
        }
    }

    // Rebuild the index buffer to ensure faces share vertices
    const newIndices = [];
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const keyA = getVertexKey(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
        const keyB = getVertexKey(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
        const keyC = getVertexKey(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]);

        // Use the mapped vertex indices to ensure connected faces share vertices
        newIndices.push(vertexMap.get(keyA), vertexMap.get(keyB), vertexMap.get(keyC));
    }

    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndices), 1));

    // Function to get connected components of the geometry
    function traverse(startIndex) {
        const stack = [startIndex]; // Stack for depth-first traversal
        const partIndices = new Set(); // Set to hold indices of the current part

        while (stack.length > 0) {
            const currentIndex = stack.pop();

            if (visited.has(currentIndex)) continue;
            visited.add(currentIndex);

            partIndices.add(currentIndex);

            // Find connected vertices by checking adjacent faces
            for (let i = 0; i < indices.length; i += 3) {
                const [a, b, c] = [newIndices[i], newIndices[i + 1], newIndices[i + 2]];

                if (a === currentIndex || b === currentIndex || c === currentIndex) {
                    if (!visited.has(a)) stack.push(a);
                    if (!visited.has(b)) stack.push(b);
                    if (!visited.has(c)) stack.push(c);
                }
            }
        }

        return partIndices; // Return as a Set
    }

    // Iterate over all indices to find unconnected parts
    for (let i = 0; i < newIndices.length; i++) {
        if (!visited.has(newIndices[i])) {
            const partIndices = traverse(newIndices[i]);

            if (partIndices.size === 0) continue; // Skip empty parts

            let newGeometry = new THREE.BufferGeometry();
            const partPositions = [];
            const partUvs = [];
            const partIndicesMap = new Map(); // Maps old index to new index

            // Collect part positions and indices
            partIndices.forEach((originalIndex) => {
                const newIndex = partPositions.length / 3;
                partPositions.push(
                    positions[originalIndex * 3],
                    positions[originalIndex * 3 + 1],
                    positions[originalIndex * 3 + 2]
                );
                if (uvs) {
                    partUvs.push(
                        uvs[originalIndex * 2],
                        uvs[originalIndex * 2 + 1]
                    );
                }
                partIndicesMap.set(originalIndex, newIndex);
            });

            // Create index buffer for new geometry
            const partIndexArray = [];
            for (let j = 0; j < newIndices.length; j += 3) {
                if (partIndices.has(newIndices[j]) && partIndices.has(newIndices[j + 1]) && partIndices.has(newIndices[j + 2])) {
                    partIndexArray.push(
                        partIndicesMap.get(newIndices[j]),
                        partIndicesMap.get(newIndices[j + 1]),
                        partIndicesMap.get(newIndices[j + 2])
                    );
                }
            }

            newGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(partPositions), 3));
            newGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(partIndexArray), 1));
            newGeometry=toCreasedNormals(newGeometry,Math.PI/3)
            // Adjust normals to prevent smoothing artifacts
           // newGeometry.computeVertexNormals();

            if (uvs) 
            {
                newGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(partUvs), 2));
            }

            // Store the newly created geometry
            geometries.push(newGeometry);
        }
    }

    return geometries; // Return the array of separated geometries
}
function separateWordGeometries(characterGeometries) {
    const wordGeometries = [];
    let currentWordGeometries = [];

    // Iterate over the character geometries
    for (let i = 0; i < characterGeometries.length; i++) {
        const currentGeometry = characterGeometries[i];
        currentGeometry.computeBoundingBox();
        //const currentBoundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(currentGeometry));
       
        if (i > 0) {
            const previousGeometry = characterGeometries[i - 1];
            previousGeometry.computeBoundingBox();
            //const previousBoundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(previousGeometry));

            const previousMaxX =  previousGeometry.boundingBox.max.x;
            const currentMinX = currentGeometry.boundingBox.min.x;

            // Calculate the spacing between characters
            const spacing = Math.abs(currentMinX - previousMaxX);

            // If the spacing exceeds the threshold, we assume it's the start of a new word
            if (spacing > 0.25) {
                // Combine all character geometries collected so far into one word geometry
                const wordGeometry = mergeGeometries(currentWordGeometries, false);
                wordGeometries.push(wordGeometry);
                currentWordGeometries = [];
            }
        }

        // Add the current character geometry to the current word's geometries
        currentWordGeometries.push(currentGeometry);
    }

    // Combine and add the last word
    if (currentWordGeometries.length > 0) {
        const wordGeometry = mergeGeometries(currentWordGeometries, false);
        wordGeometries.push(wordGeometry);
    }

    return wordGeometries;
}
function calculateFrameIntervals(n, startFrame, endFrame, overlapFactor) 
{
    const totalFrames = endFrame - startFrame;
    
    // Calculate duration for each object (including overlap)
    const objectDuration = totalFrames / (n - overlapFactor * (n - 1));
    
    let intervals = [];
  
    for (let i = 0; i < n; i++) {
      // Calculate the start frame for each object
      const objectStartFrame = startFrame + i * objectDuration * (1 - overlapFactor);
      const objectEndFrame = objectStartFrame + objectDuration;
      
      // Calculate keyframe times based on percentages
      const keyframeTimes = [
        objectStartFrame,                                           // Time for scale 0.001
        objectStartFrame + (0.3 * objectDuration),                  // Time for scale 0.05
        objectStartFrame + (0.7 * objectDuration),                  // Time for scale 0.8
        objectEndFrame                                              // Time for scale 1
      ];
  
      intervals.push({
        objectIndex: i + 1,    // Object number (1-based index)
        startFrame: objectStartFrame,
        endFrame: objectEndFrame,
        keyframeTimes
      });
    }
  
    return intervals;
}
export{create3DText,create3DTextControls,SeparateCharacters,create3DWordPosAnim,create3DCharPosAnim,create3DCharRotAnim,create3DCharScaleAnim,
       create3DWordRotAnim,create3DWordScaleAnim,separateUnconnectedGeometries,separateWordGeometries
      }
