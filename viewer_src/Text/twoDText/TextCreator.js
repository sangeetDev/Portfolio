import * as Troika from './troika-three-text/dist/troika-three-text.esm.js';
import * as THREE from 'three';
import {CustomPlaneHelper} from './CustomPlaneHelper.js'
import { setKeyframe } from '../../Animation&Keyframing/Iterpolate_Keyframing.js';
import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,traverseScene,gui,boxMesh,box,fonts,Text2DList,models}from '../../main.js';

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
function createTextControls()
{
    const Text2dparam={
        add_2dText:function(){twoDtext();}
    }
    const TextFolder=gui.addFolder('Text Controls')
    const Text2D=TextFolder.add(Text2dparam,'add_2dText').name("Add 2D text");
    TextFolder.close();

    
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
function convertToSubscript(text) 
{
    return text.split('').map(char => subscriptMap[char] || char).join('');
}
function create2DText(twoDTextParams,box)
{
    const textMesh = new Troika.Text();
    textMesh.text = processText(twoDTextParams.text);  // Set the text content
    textMesh.fontSize = twoDTextParams.fontSize;             // Set font size
    textMesh.color = twoDTextParams.color;
    //if(box.userData.width<0)
    //textMesh.position.set(box.position.x + box.userData.width / 2, box.position.y + box.userData.height / 2, box.position.z); 
    //else
    textMesh.position.set( - box.geometry.parameters.width/ 2, box.geometry.parameters.height / 2, 0);
      // Position text in the scene
    console.log(textMesh.position)
    if(twoDTextParams.Bold && !twoDTextParams.Italic)
    {
        textMesh.font = '.../../fonts/'+twoDTextParams.font+'_Bold.ttf'

    }
    else if(!twoDTextParams.Bold && twoDTextParams.Italic)
    {
        textMesh.font = './fonts/'+twoDTextParams.font+'_Italic.ttf'   
    }
    else if(twoDTextParams.Bold && twoDTextParams.Italic)
    {
        textMesh.font = './fonts/'+twoDTextParams.font+'_Bold_Italic.ttf'    
    }
    else
    {
           textMesh.font = './fonts/'+twoDTextParams.font+'.ttf'
    } 
    //console.log(twoDTextParams.Bold);
    //console.log(textMesh.font); 
    //console.log(textMesh.position); 
    textMesh.material=new THREE.MeshPhysicalMaterial({color:0xffffff,side:THREE.DoubleSide});

    textMesh.maxWidth = box.geometry.parameters.width;   
    textMesh.textAlign = twoDTextParams.Alignment;
    textMesh.overflowWrap='break-word';  
    textMesh.whiteSpace='normal';
    textMesh.lineHeight=twoDTextParams.lineHeight;
    textMesh.letterSpacing=twoDTextParams.letterSpacing; 
    textMesh.fillOpacity=  twoDTextParams.fillOpacity;
    textMesh.strokeColor= twoDTextParams.strokeColor;  
    textMesh.strokeWidth= twoDTextParams.strokeWidth;
    textMesh.strokeOpacity= twoDTextParams.strokeOpacity; 
    textMesh.outlineColor= twoDTextParams.outlineColor;
    textMesh.outlineOpacity=twoDTextParams.outlineOpacity;
    textMesh.outlineWidth=twoDTextParams.outlineWidth;
    textMesh.outlineBlur=twoDTextParams.outlineBlur;
    textMesh.outlineOffsetX=twoDTextParams.outlineOffsetX; 
    textMesh.outlineOffsetY=twoDTextParams.outlineOffsetY;
    textMesh.curveRadius=twoDTextParams.curveRadius; 
    textMesh.anchorX=twoDTextParams.anchorX; 
    textMesh.anchorY=twoDTextParams.anchorY;
    textMesh.direction=twoDTextParams.direction; 
    if(textMesh.curveRadius!=0)
    {
        textMesh.position.set(0,box.userData.height / 2,0)
    }
    console.log(textMesh.material);     // Optional: Max width of the text box

// Ensure Troika computes the layout
    textMesh.sync();
    console.log(textMesh.textAlign)
    const words= twoDTextParams.text.split(" ");
    if(words.length<4)
    {
        textMesh.name=twoDTextParams.text;
    //material.name=threeDTextParams.text+"_Material";
    }
    else
    {
        textMesh.name=twoDTextParams.text.split(" ").slice(0, 3).join(" ");
        //material.name=threeDTextParams.text.split(" ").slice(0, 3).join(" ") +"_Material";
    }
    return textMesh;
}
function twoDtext()
{
    
    const attr=document.getElementById('container');
    attr.innerHTML="";
    const div= document.createElement('div');
    const lbl1 = document.createElement("label");
    const textarea=document.createElement("textarea");
    textarea.rows='5';
    textarea.cols='30';
    textarea.id='multiline-input-2D';
    lbl1.appendChild(document.createTextNode("Enter 2D Text"));
    lbl1.appendChild(textarea);
    div.appendChild(lbl1);
    attr.appendChild(div);
    const twoDTextParams={
        text:"",
        font:"Arial",
        fontSize:1,
        Bold:false,
        Italic:false,
        Alignment:"Left",
        color:'#ff0000' ,
        lineHeight:'normal',
        letterSpacing:0,
        fillOpacity:1,
        direction:'auto',
        curveRadius:0,
        clipRect:[null,null,null,null],
        anchorY:0,
        anchorX:0,
        outlineBlur:0,
        outlineColor:"#000000",
        outlineOffsetX:0,
        outlineOffsetY:0,
        outlineOpacity:1,
        outlineWidth:0,
        strokeColor:"#ff0000",
        strokeOpacity:1,
        strokeWidth:0,
        textIndent:0,
    }
    
    let TextMesh;
    const Textgroup=new THREE.Group();
    Textgroup.userData.TextParams=twoDTextParams;
    if(boxMesh)
    {
        let cloneMesh=boxMesh.clone()
        Textgroup.userData.box=cloneMesh;
        cloneMesh.userData.width=boxMesh.userData.width;
        cloneMesh.userData.height=boxMesh.userData.height;    
    }
    Text2DList.push( Textgroup);
    Textgroup.name="2D_Text"+Text2DList.length
    scene.add(Textgroup); 
    Textgroup.userData.filename="2D_Text"+Text2DList.length;
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
    //Text3DList.push(group);
    textarea.addEventListener('input',function(event){
        Textgroup.userData.TextParams.text=event.target.value; 
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        TextMesh.addEventListener('synccomplete',() => {
            const textHeight = TextMesh.textRenderInfo.blockBounds[3] - TextMesh.textRenderInfo.blockBounds[1]; // Get text height
            
            // Update the height of the box based on the text height
            if (textHeight > boxMesh.userData.height) 
            {
                boxMesh.userData.height = textHeight;
                boxMesh.geometry.parameters.height=textHeight;
                scene.remove(box);
                box=new CustomPlaneHelper(boxMesh,0xff0000);
                scene.add(box);
                console.log(box);
                let cloneMesh=boxMesh.clone()
                Textgroup.userData.box=cloneMesh;
                cloneMesh.userData.width=boxMesh.userData.width;
                cloneMesh.userData.height=boxMesh.userData.height;
 // Adjust box scale
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
        });
        Textgroup.add(TextMesh);    
    });
    attr.appendChild(textarea);

    const lblboxWidth=document.createElement('label');
    const boxWidth=document.createElement('input');
    boxWidth.id='boxWidth';
    console.log(boxMesh.userData.width)
    boxWidth.value=boxMesh.userData.width;
    lblboxWidth.appendChild(document.createTextNode(" Text Box Width:"));
    lblboxWidth.appendChild(boxWidth);
    boxWidth.addEventListener('input',function(event){
        let width=event.target.value;
        let height=boxMesh.userData.height;
        boxMesh.geometry.parameters.width=width;
        scene.remove(box);
        //boxMesh.position.copy(.position);
        boxMesh.visible=false;
        boxMesh.userData.width=width;
        boxMesh.userData.height=height;
        box=new CustomPlaneHelper(boxMesh,0xff0000);
        scene.add(box);
        let cloneMesh=boxMesh.clone()
        Textgroup.userData.box=cloneMesh;
        cloneMesh.userData.width=boxMesh.userData.width;
        cloneMesh.userData.height=boxMesh.userData.height;

        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh); 
         
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
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);
        
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
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);

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
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);    
    });
    attr.appendChild(lbl3);
    
    const right=document.createElement('button');
    right.textContent='right Align';
    right.class='alignment-button';
    right.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="right";
        textarea.style.textAlign='right';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(right);

    const left=document.createElement('button');
    left.textContent='left Align';
    left.class='alignment-button';
    left.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="left";
        textarea.style.textAlign='left';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(left);

    const center=document.createElement('button');
    center.textContent='center Align';
    center.class='alignment-button';
    center.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="center";
        textarea.style.textAlign='center';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(center);

    const justify=document.createElement('button');
    justify.textContent='justify';
    justify.class='alignment-button';
    justify.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="justify";
        //textarea.style.textAlign='justify';
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(justify);

    const lblColor=document.createElement('label');
    const Color=document.createElement('input');
    Color.id='Color';
    Color.type = 'color';
    Color.value = Textgroup.userData.TextParams.color;
    lblColor.appendChild(document.createTextNode("Color:"));
    lblColor.appendChild(Color);
    Color.addEventListener('input', function(event) {
        Textgroup.userData.TextParams.color = event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);                                   
    });
    attr.appendChild(lblColor);

    const lbl4=document.createElement('label');
    const size=document.createElement('input');
    size.id='size';
    size.value=Textgroup.userData.TextParams.fontSize;
    lbl4.appendChild(document.createTextNode("Size:"));
    lbl4.appendChild(size);
    size.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fontSize=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lbl4);

    const lblHeight=document.createElement('label');
    const lineHeight=document.createElement('input');
    lineHeight.id='lineHeight';
    lineHeight.value=Textgroup.userData.TextParams.lineHeight;
    lblHeight.appendChild(document.createTextNode("Line Height:"));
    lblHeight.appendChild(lineHeight);
    lineHeight.addEventListener('input',function(event){
        Textgroup.userData.TextParams.lineHeight=event.target.value;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lblHeight);
    
    const lblSpacing=document.createElement('label');
    const letterSpacing=document.createElement('input');
    letterSpacing.id='letterSpacing';
    letterSpacing.value=Textgroup.userData.TextParams.letterSpacing;
    lblSpacing.appendChild(document.createTextNode("Letter Spacing:"));
    lblSpacing.appendChild(letterSpacing);
    letterSpacing.addEventListener('input',function(event){
        Textgroup.userData.TextParams.letterSpacing=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblSpacing);

    const lblopacity=document.createElement('label');
    const fillOpacity=document.createElement('input');
    fillOpacity.id='fillOpacity';
    fillOpacity.value=Textgroup.userData.TextParams.fillOpacity;
    lblopacity.appendChild(document.createTextNode("Fill Opacity:"));
    lblopacity.appendChild(fillOpacity);
    fillOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fillOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblopacity);

    const lblstrcolor=document.createElement('label');
    const strokeColor=document.createElement('input');
    strokeColor.id='strokeColor';
    strokeColor.type='color';
    strokeColor.value=Textgroup.userData.TextParams.strokeColor;
    lblstrcolor.appendChild(document.createTextNode("Stroke Color:"));
    lblstrcolor.appendChild(strokeColor);
    strokeColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    
    attr.appendChild(lblstrcolor);

    const lblstrwidth=document.createElement('label');
    const strokeWidth=document.createElement('input');
    strokeWidth.id='strokeWidth';
    strokeWidth.value=Textgroup.userData.TextParams.strokeWidth;
    lblstrwidth.appendChild(document.createTextNode("Stroke Width:"));
    lblstrwidth.appendChild(strokeWidth);
    strokeWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstrwidth);

    const lblstropacity=document.createElement('label');
    const strokeOpacity=document.createElement('input');
    strokeOpacity.id='strokeWidth';
    strokeOpacity.value=Textgroup.userData.TextParams.strokeOpacity;
    lblstropacity.appendChild(document.createTextNode("Stroke Opacity:"));
    lblstropacity.appendChild(strokeOpacity);
    strokeOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeOpacity=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstropacity);

    const lbloutcolor=document.createElement('label');
    const outlineColor=document.createElement('input');
    outlineColor.id='outlineColor';
    outlineColor.type='color';
    outlineColor.value=Textgroup.userData.TextParams.outlineColor;
    lbloutcolor.appendChild(document.createTextNode("Outline Color:"));
    lbloutcolor.appendChild(outlineColor);
    outlineColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutcolor);

    const lbloutopacity=document.createElement('label');
    const outlineOpacity=document.createElement('input');
    outlineOpacity.id='outlineOpacity';
    outlineOpacity.value=Textgroup.userData.TextParams.outlineOpacity;
    lbloutopacity.appendChild(document.createTextNode("Outline Opacity:"));
    lbloutopacity.appendChild(outlineOpacity);
    outlineOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutopacity); 
    
    const lbloutwidth=document.createElement('label');
    const outlineWidth=document.createElement('input');
    outlineWidth.id='outlineWidth';
    outlineWidth.value=Textgroup.userData.TextParams.outlineWidth;
    lbloutwidth.appendChild(document.createTextNode("Outline Width:"));
    lbloutwidth.appendChild(outlineWidth);
    outlineWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutwidth); 

    const lbloutblur=document.createElement('label');
    const outlineBlur=document.createElement('input');
    outlineBlur.id='outlineBlur';
    outlineBlur.value=Textgroup.userData.TextParams.outlineBlur;
    lbloutblur.appendChild(document.createTextNode("Outline Blur:"));
    lbloutblur.appendChild(outlineBlur);
    outlineBlur.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineBlur=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutblur); 

    const lbloutoffX=document.createElement('label');
    const outlineOffsetX=document.createElement('input');
    outlineOffsetX.id='outlineOffsetX';
    outlineOffsetX.value=Textgroup.userData.TextParams.outlineOffsetX;
    lbloutoffX.appendChild(document.createTextNode("Outline X Offset:"));
    lbloutoffX.appendChild(outlineOffsetX);
    outlineOffsetX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffX); 

    const lbloutoffY=document.createElement('label');
    const outlineOffsetY=document.createElement('input');
    outlineOffsetY.id='outlineOffsetY';
    outlineOffsetY.value=Textgroup.userData.TextParams.outlineOffsetY;
    lbloutoffY.appendChild(document.createTextNode("Outline Y Offset:"));
    lbloutoffY.appendChild(outlineOffsetY);
    outlineOffsetY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffY); 

    const lblcurveRadius=document.createElement('label');
    const curveRadius=document.createElement('input');
    curveRadius.id='curveRadius';
    curveRadius.value=Textgroup.userData.TextParams.curveRadius;
    lblcurveRadius.appendChild(document.createTextNode("Curve Radius:"));
    lblcurveRadius.appendChild(curveRadius);
    curveRadius.addEventListener('input',function(event){
        Textgroup.userData.TextParams.curveRadius=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblcurveRadius); 

    const lblanchorX=document.createElement('label');
    const anchorX=document.createElement('input');
    anchorX.id='anchorX';
    anchorX.value=Textgroup.userData.TextParams.anchorX;
    lblanchorX.appendChild(document.createTextNode("anchorX:"));
    lblanchorX.appendChild(anchorX);
    anchorX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorX); 

    const lblanchorY=document.createElement('label');
    const anchorY=document.createElement('input');
    anchorY.id='anchorY';
    anchorY.value=Textgroup.userData.TextParams.anchorY;
    lblanchorY.appendChild(document.createTextNode("anchorY:"));
    lblanchorY.appendChild(anchorY);
    anchorY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorY); 

    /*const lbldirection=document.createElement('label');
    const direction=document.createElement('input');
    direction.id='direction';
    direction.value=Textgroup.userData.TextParams.direction;
    lbldirection.appendChild(document.createTextNode("direction:"));
    lbldirection.appendChild(direction);
    direction.addEventListener('input',function(event){
        Textgroup.userData.TextParams.direction=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbldirection); */    
    


    
}
function update2DTextattribute()
{
    const Textgroup=selectedObject;
    Textgroup.userData.startframe=0;
    Textgroup.userData.endframe=0;
    let TextMesh=selectedObject.children[0];
    let boxMesh=Textgroup.userData.box;
    if(box)
    {
        scene.remove(box);
    }
    box=new CustomPlaneHelper(boxMesh,0xff0000);
    scene.add(box);

    const attr=document.getElementById('container');
    attr.innerHTML="";

    const propertyElement = document.createElement('div');
    propertyElement.innerHTML = `<strong>Text Name:</strong> ${Textgroup.name.toUpperCase()}`; 
    attr.appendChild(propertyElement); 

   
    const div= document.createElement('div');
    const lbl1 = document.createElement("label");
    const textarea=document.createElement("textarea");
    textarea.rows='5';
    textarea.cols='30';
    textarea.id='multiline-input-2D';
    textarea.value=Textgroup.userData.TextParams.text;
    lbl1.appendChild(document.createTextNode("Enter 2D Text"));
    lbl1.appendChild(textarea);
    div.appendChild(lbl1);
    attr.appendChild(div);
    
    textarea.addEventListener('input',function(event){
        Textgroup.userData.TextParams.text=event.target.value; 
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        TextMesh.addEventListener('synccomplete',() => {
            const textHeight = TextMesh.textRenderInfo.blockBounds[3] - TextMesh.textRenderInfo.blockBounds[1]; // Get text height
            
            // Update the height of the box based on the text height
            if (textHeight > boxMesh.userData.height) 
            {
                boxMesh.userData.height = textHeight;
                boxMesh.geometry.parameters.height=textHeight;
                box.update();
                let cloneMesh=boxMesh.clone()
                Textgroup.userData.box=cloneMesh;
                cloneMesh.userData.width=boxMesh.userData.width;
                cloneMesh.userData.height=boxMesh.userData.height;
 // Adjust box scale
            }
        });
        Textgroup.add(TextMesh); 
        let sceneTree=document.getElementById('scene-tree');
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
    });
    attr.appendChild(textarea);

    const lblboxWidth=document.createElement('label');
    const boxWidth=document.createElement('input');
    boxWidth.id='boxWidth';
    boxWidth.value=boxMesh.userData.width;
    lblboxWidth.appendChild(document.createTextNode(" Text Box Width:"));
    lblboxWidth.appendChild(boxWidth);
    boxWidth.addEventListener('input',function(event){
        let width=event.target.value;
        let height=boxMesh.userData.height;
        boxMesh.geometry.parameters.width=width;
        scene.remove(box);
        boxMesh.position.copy(selectedObject.position);
        boxMesh.visible=false;
        boxMesh.userData.width=width;
        boxMesh.userData.height=height;
        box=new CustomPlaneHelper(boxMesh,0xff0000);
        scene.add(box);
        let cloneMesh=boxMesh.clone()
        Textgroup.userData.box=cloneMesh;
        cloneMesh.userData.width=boxMesh.userData.width;
        cloneMesh.userData.height=boxMesh.userData.height;

        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
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
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);
        
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
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);

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
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);    
    });
    attr.appendChild(lbl3);
    
    const right=document.createElement('button');
    right.textContent='right Align';
    right.class='alignment-button';
    right.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="right";
        textarea.style.textAlign='right';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(right);

    const left=document.createElement('button');
    left.textContent='left Align';
    left.class='alignment-button';
    left.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="left";
        textarea.style.textAlign='left';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  

    });
    attr.appendChild(left);

    const center=document.createElement('button');
    center.textContent='center Align';
    center.class='alignment-button';
    center.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="center";
        textarea.style.textAlign='center';
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(center);

    const justify=document.createElement('button');
    justify.textContent='justify';
    justify.class='alignment-button';
    justify.addEventListener('click',function(){
        Textgroup.userData.TextParams.Alignment="justify";
        //textarea.style.textAlign='justify';
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(justify);

    const lblColor=document.createElement('label');
    const Color=document.createElement('input');
    Color.id='Color';
    Color.type = 'color';
    Color.value = Textgroup.userData.TextParams.color;
    lblColor.appendChild(document.createTextNode("Color:"));
    lblColor.appendChild(Color);
    Color.addEventListener('input', function(event) {
        Textgroup.userData.TextParams.color = event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);                                   
    });
    attr.appendChild(lblColor);

    const lbl4=document.createElement('label');
    const size=document.createElement('input');
    size.id='size';
    size.value=Textgroup.userData.TextParams.fontSize;
    lbl4.appendChild(document.createTextNode("Size:"));
    lbl4.appendChild(size);
    size.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fontSize=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lbl4);

    const lblHeight=document.createElement('label');
    const lineHeight=document.createElement('input');
    lineHeight.id='lineHeight';
    lineHeight.value=Textgroup.userData.TextParams.lineHeight;
    lblHeight.appendChild(document.createTextNode("Line Height:"));
    lblHeight.appendChild(lineHeight);
    lineHeight.addEventListener('input',function(event){
        Textgroup.userData.TextParams.lineHeight=event.target.value;
        if(TextMesh)
        {
            Textgroup.remove(TextMesh)
        }
        TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
        Textgroup.add(TextMesh);  
    });
    attr.appendChild(lblHeight);
    
    const lblSpacing=document.createElement('label');
    const letterSpacing=document.createElement('input');
    letterSpacing.id='letterSpacing';
    letterSpacing.value=Textgroup.userData.TextParams.letterSpacing;
    lblSpacing.appendChild(document.createTextNode("Letter Spacing:"));
    lblSpacing.appendChild(letterSpacing);
    letterSpacing.addEventListener('input',function(event){
        Textgroup.userData.TextParams.letterSpacing=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblSpacing);

    const lblopacity=document.createElement('label');
    const fillOpacity=document.createElement('input');
    fillOpacity.id='fillOpacity';
    fillOpacity.value=Textgroup.userData.TextParams.fillOpacity;
    lblopacity.appendChild(document.createTextNode("Fill Opacity:"));
    lblopacity.appendChild(fillOpacity);
    fillOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.fillOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblopacity);

    const lblstrcolor=document.createElement('label');
    const strokeColor=document.createElement('input');
    strokeColor.id='strokeColor';
    strokeColor.type='color';
    strokeColor.value=Textgroup.userData.TextParams.strokeColor;
    lblstrcolor.appendChild(document.createTextNode("Stroke Color:"));
    lblstrcolor.appendChild(strokeColor);
    strokeColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    
    attr.appendChild(lblstrcolor);

    const lblstrwidth=document.createElement('label');
    const strokeWidth=document.createElement('input');
    strokeWidth.id='strokeWidth';
    strokeWidth.value=Textgroup.userData.TextParams.strokeWidth;
    lblstrwidth.appendChild(document.createTextNode("Stroke Width:"));
    lblstrwidth.appendChild(strokeWidth);
    strokeWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstrwidth);

    const lblstropacity=document.createElement('label');
    const strokeOpacity=document.createElement('input');
    strokeOpacity.id='strokeWidth';
    strokeOpacity.value=Textgroup.userData.TextParams.strokeOpacity;
    lblstropacity.appendChild(document.createTextNode("Stroke Opacity:"));
    lblstropacity.appendChild(strokeOpacity);
    strokeOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.strokeOpacity=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    });
    attr.appendChild(lblstropacity);

    const lbloutcolor=document.createElement('label');
    const outlineColor=document.createElement('input');
    outlineColor.id='outlineColor';
    outlineColor.type='color';
    outlineColor.value=Textgroup.userData.TextParams.outlineColor;
    lbloutcolor.appendChild(document.createTextNode("Outline Color:"));
    lbloutcolor.appendChild(outlineColor);
    outlineColor.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineColor=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutcolor);

    const lbloutopacity=document.createElement('label');
    const outlineOpacity=document.createElement('input');
    outlineOpacity.id='outlineOpacity';
    outlineOpacity.value=Textgroup.userData.TextParams.outlineOpacity;
    lbloutopacity.appendChild(document.createTextNode("Outline Opacity:"));
    lbloutopacity.appendChild(outlineOpacity);
    outlineOpacity.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOpacity=event.target.value;
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutopacity); 
    
    const lbloutwidth=document.createElement('label');
    const outlineWidth=document.createElement('input');
    outlineWidth.id='outlineWidth';
    outlineWidth.value=Textgroup.userData.TextParams.outlineWidth;
    lbloutwidth.appendChild(document.createTextNode("Outline Width:"));
    lbloutwidth.appendChild(outlineWidth);
    outlineWidth.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineWidth=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutwidth); 

    const lbloutblur=document.createElement('label');
    const outlineBlur=document.createElement('input');
    outlineBlur.id='outlineBlur';
    outlineBlur.value=Textgroup.userData.TextParams.outlineBlur;
    lbloutblur.appendChild(document.createTextNode("Outline Blur:"));
    lbloutblur.appendChild(outlineBlur);
    outlineBlur.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineBlur=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutblur); 

    const lbloutoffX=document.createElement('label');
    const outlineOffsetX=document.createElement('input');
    outlineOffsetX.id='outlineOffsetX';
    outlineOffsetX.value=Textgroup.userData.TextParams.outlineOffsetX;
    lbloutoffX.appendChild(document.createTextNode("Outline X Offset:"));
    lbloutoffX.appendChild(outlineOffsetX);
    outlineOffsetX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffX); 

    const lbloutoffY=document.createElement('label');
    const outlineOffsetY=document.createElement('input');
    outlineOffsetY.id='outlineOffsetY';
    outlineOffsetY.value=Textgroup.userData.TextParams.outlineOffsetY;
    lbloutoffY.appendChild(document.createTextNode("Outline Y Offset:"));
    lbloutoffY.appendChild(outlineOffsetY);
    outlineOffsetY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.outlineOffsetY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lbloutoffY); 

    const lblcurveRadius=document.createElement('label');
    const curveRadius=document.createElement('input');
    curveRadius.id='curveRadius';
    curveRadius.value=Textgroup.userData.TextParams.curveRadius;
    lblcurveRadius.appendChild(document.createTextNode("Curve Radius:"));
    lblcurveRadius.appendChild(curveRadius);
    curveRadius.addEventListener('input',function(event){
        Textgroup.userData.TextParams.curveRadius=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblcurveRadius); 

    const lblanchorX=document.createElement('label');
    const anchorX=document.createElement('input');
    anchorX.id='anchorX';
    anchorX.value=Textgroup.userData.TextParams.anchorX;
    lblanchorX.appendChild(document.createTextNode("anchorX:"));
    lblanchorX.appendChild(anchorX);
    anchorX.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorX=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorX); 

    const lblanchorY=document.createElement('label');
    const anchorY=document.createElement('input');
    anchorY.id='anchorY';
    anchorY.value=Textgroup.userData.TextParams.anchorY;
    lblanchorY.appendChild(document.createTextNode("anchorY:"));
    lblanchorY.appendChild(anchorY);
    anchorY.addEventListener('input',function(event){
        Textgroup.userData.TextParams.anchorY=parseFloat(event.target.value);
        if(TextMesh)
            {
                Textgroup.remove(TextMesh)
            }
            TextMesh=create2DText(Textgroup.userData.TextParams,boxMesh);
            Textgroup.add(TextMesh);
    
    });
    attr.appendChild(lblanchorY);
    
    const animationElement = document.createElement('div');
    const element='TEXT ANIMATIONS';
    animationElement.innerHTML = `<strong>${element}</strong>` ; 
    attr.appendChild(animationElement); 
    
    const SeparateCharacters1=document.createElement('button');
    SeparateCharacters1.textContent='separate Characters';
    SeparateCharacters1.addEventListener('click',function(){
        Separate2DCharacters();
    });
    attr.appendChild(SeparateCharacters1);


    const lblstartframe=document.createElement('label');
    const startframe=document.createElement('input');
    startframe.id='startframe';
    lblstartframe.appendChild(document.createTextNode("start frame:"));
    lblstartframe.appendChild(startframe);
    startframe.addEventListener('input',function(event){
        Textgroup.userData.startframe=parseInt(event.target.value);
        console.log(Textgroup.userData.startframe);
    });
    attr.appendChild(lblstartframe);

    const lblendframe=document.createElement('label');
    const endframe=document.createElement('input');
    endframe.id='endframe';
    lblendframe.appendChild(document.createTextNode("end frame:"));
    lblendframe.appendChild(endframe);
    endframe.addEventListener('input',function(event){
        Textgroup.userData.endframe=parseInt(event.target.value);
        console.log(Textgroup.userData.endframe);
    });
    attr.appendChild(lblendframe);

    const CreateAnimation=document.createElement('button');
    CreateAnimation.textContent='Create Characters Visibility Animation';
    CreateAnimation.addEventListener('click',function(){
         CreateCharVisAnimation();
    });
    attr.appendChild(CreateAnimation); 
    
    const CreateAnimation1=document.createElement('button');
    CreateAnimation1.textContent='Create Words Visibility Animation';
    CreateAnimation1.addEventListener('click',function(){
         CreateWordVisAnimation();
    });
    attr.appendChild(CreateAnimation1);

    const CreateAnimation2=document.createElement('button');
    CreateAnimation2.textContent='Create characters Scale Animation';
    CreateAnimation2.addEventListener('click',function(){
        CreateCharZoomIn();
    });
    attr.appendChild(CreateAnimation2);

    const CreateAnimation3=document.createElement('button');
    CreateAnimation3.textContent='Create Words Scale Animation';
    CreateAnimation3.addEventListener('click',function(){
        CreateWordZoomIn();
    });
    attr.appendChild(CreateAnimation3);

    const CreateAnimation4=document.createElement('button');
    CreateAnimation4.textContent='Create Characters Opacity Animation';
    CreateAnimation4.addEventListener('click',function(){
        CreateCharOpacityAnim();
    });
    attr.appendChild(CreateAnimation4);

    const CreateAnimation5=document.createElement('button');
    CreateAnimation5.textContent='Create Words Opacity Animation';
    CreateAnimation5.addEventListener('click',function(){
        CreateWordOpacityAnim();
    });
    attr.appendChild(CreateAnimation5);

    const CreateAnimation6=document.createElement('button');
    CreateAnimation6.textContent='Create char rot Animation';
    CreateAnimation6.addEventListener('click',function(){
        CreateCharRotateAnim();
    });
    attr.appendChild(CreateAnimation6);

    const CreateAnimation7=document.createElement('button');
    CreateAnimation7.textContent='Create Word rot Animation';
    CreateAnimation7.addEventListener('click',function(){
        CreateWordRotateAnim();
    });
    attr.appendChild(CreateAnimation7);

    const CreateAnimation8=document.createElement('button');
    CreateAnimation8.textContent='Create Char Position Animation';
    CreateAnimation8.addEventListener('click',function(){
        CreateCharPositionAnim();
    });
    attr.appendChild(CreateAnimation8);

    const CreateAnimation9=document.createElement('button');
    CreateAnimation9.textContent='Create Word Position Animation';
    CreateAnimation9.addEventListener('click',function(){
        CreateWordPositionAnim();
    });
    attr.appendChild(CreateAnimation9);
}
function Separate2DCharacters()
{
    const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
    let troikaText=selectedObject.children[0];
    troikaText.sync();
    //selectedObject.remove(selectedObject.children[0]);
    const textGeometry = troikaText.geometry;
    const charCount = characters.length;
    const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
    console.log(glyphBounds);
    // Remove the original mesh from the group
   
    const textRenderInfo = troikaText._textRenderInfo;
    let offset=0;
    selectedObject.remove(troikaText);
    for (let i = 0; i < charCount; i++) 
    {
        const xMin = glyphBounds[i * 4 + 0];
        const yMin = glyphBounds[i * 4 + 1];
        const xMax = glyphBounds[i * 4 + 2];
        const yMax = glyphBounds[i * 4 + 3];
        const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
        const charPosition = new THREE.Vector3(
            troikaText.position.x+charRect.left , 
            troikaText.position.y+charRect.top, 
            0 // Z position remains 0
        );
        const charText = new Troika.Text();
        charText.material=new THREE.MeshPhysicalMaterial({color:troikaText.color,side:THREE.DoubleSide});
        charText.text=characters[i];
        charText.fontSize = troikaText.fontSize;             
        charText.color= troikaText.color;
        charText.font=troikaText.font;
        charText.overflowWrap=troikaText.overflowWrap
        charText.whiteSpace=troikaText.whiteSpace
        charText.lineHeight=troikaText.lineHeight
        charText.letterSpacing=troikaText.letterSpacing
        charText.fillOpacity=troikaText.fillOpacity
        charText.strokeColor=troikaText.strokeColor
        charText.strokeWidth=troikaText.strokeWidth
        charText.strokeOpacity=troikaText.strokeOpacity
        charText.outlineColor=troikaText.outlineColor
        charText.outlineOpacity=troikaText.outlineOpacity
        charText.outlineWidth=troikaText.outlineWidth
        charText.outlineBlur=troikaText.outlineBlur
        charText.outlineOffsetX=troikaText.outlineOffsetX
        charText.outlineOffsetY=troikaText.outlineOffsetY
        charText.curveRadius=troikaText.curveRadius
        charText.anchorX=troikaText.anchorX
        charText.anchorY=troikaText.anchorY
        charText.direction=troikaText.direction

            
        charText.position.copy(charPosition);
        charText.quaternion.copy(troikaText.quaternion); 
           
        charText.sync(); 
        selectedObject.add(charText);
        charText.name=troikaText.name+"_2DChar_"+characters[i]+"_"+i; 
        movePivotToGeometryCenter(charText);
        console.log(selectedObject.children[i].position);
        charText.sync(); 
            
    }
    let sceneTree=document.getElementById('scene-tree');
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
}
function CreateCharVisAnimation()
{
   
        if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
            {
                alert('start or end frame not defined');
            }
            else
            {
                selectedObject.userData.keyframes=[];
                const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
                //characters.unshift('');
                console.log(characters);
                const startframe=selectedObject.userData.startframe;
                const endframe=selectedObject.userData.endframe;
                console.log(startframe,endframe);
                let frameInterval=Math.floor((endframe-startframe)/characters.length);
                if(frameInterval<1)
                {
                    alert('frame interval not enough')
                }
                else
                {
                    let troikaText=selectedObject.children[0];
                    troikaText.sync();
                    //selectedObject.remove(selectedObject.children[0]);
                    const textGeometry = troikaText.geometry;
                    const charCount = characters.length;
                   const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
                    console.log(glyphBounds);
                    // Remove the original mesh from the group
                   
                    const textRenderInfo = troikaText._textRenderInfo;
                    let offset=0;
                    selectedObject.remove(troikaText);
                    
                    
                    
                    for (let i = 0; i < charCount; i++) 
                    {
                        
                        const xMin = glyphBounds[i * 4 + 0];
                        const yMin = glyphBounds[i * 4 + 1];
                        const xMax = glyphBounds[i * 4 + 2];
                        const yMax = glyphBounds[i * 4 + 3];
                        const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
                        const charPosition = new THREE.Vector3(
                        troikaText.position.x+charRect.left , 
                        troikaText.position.y+charRect.top, 
                         0 // Z position remains 0
                        );
                        const charText = new Troika.Text();
                        charText.text=characters[i];
                        charText.fontSize = troikaText.fontSize;             
                        charText.color= troikaText.color;
                        charText.font=troikaText.font;
                        charText.overflowWrap=troikaText.overflowWrap
                        charText.whiteSpace=troikaText.whiteSpace
                        charText.lineHeight=troikaText.lineHeight
                        charText.letterSpacing=troikaText.letterSpacing
                        charText.fillOpacity=troikaText.fillOpacity
                        charText.strokeColor=troikaText.strokeColor
                        charText.strokeWidth=troikaText.strokeWidth
                        charText.strokeOpacity=troikaText.strokeOpacity
                        charText.outlineColor=troikaText.outlineColor
                        charText.outlineOpacity=troikaText.outlineOpacity
                        charText.outlineWidth=troikaText.outlineWidth
                        charText.outlineBlur=troikaText.outlineBlur
                        charText.outlineOffsetX=troikaText.outlineOffsetX
                        charText.outlineOffsetY=troikaText.outlineOffsetY
                        charText.curveRadius=troikaText.curveRadius
                        charText.anchorX=troikaText.anchorX
                        charText.anchorY=troikaText.anchorY
                        charText.direction=troikaText.direction
            
                        
                        charText.position.copy(charPosition);
                        charText.quaternion.copy(troikaText.quaternion); 
                        charText.name=troikaText.name+"_2DChar_"+characters[i]+"_"+i; 
                        charText.sync(); 
                        selectedObject.add(charText); 
                        
                        console.log(selectedObject.children[i].position);
                        charText.fillOpacity=0.0;
                        charText.sync(); 
                        setKeyframe(selectedObject.children[i],0);
                        
                    }
                    let sceneTree=document.getElementById('scene-tree');
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
                    let frame=startframe;
                    for(let i=0;i<selectedObject.children.length;i++)
                    {
                        if(selectedObject.children[i].name.includes('Char'))
                        {
                        setKeyframe(selectedObject.children[i],frame);
                        frame=frame+frameInterval;
                        setKeyframe(selectedObject.children[i],frame-1);
                        selectedObject.children[i].fillOpacity=1;
                        setKeyframe(selectedObject.children[i],frame);
                        }
                    }
               }
                    
                   
            }
   
}
function CreateWordVisAnimation()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const words=selectedObject.userData.TextParams.text.split(/([-\s,.;_]+)/);
            console.log(words);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/words.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                //const words=selectedObject.userData.TextParams.text.split(/(\s+)/);
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                const wordCount = words.length;
                const textRenderInfo = troikaText._textRenderInfo;
                const selectionRects = [];
                let startIndex = 0;
                selectedObject.remove(troikaText);
                let i=0;
                words.forEach(word => {
                    const endIndex = startIndex + word.length; // Calculate the end index
                    const rects = Troika.getSelectionRects(textRenderInfo,startIndex, endIndex);
                    if (rects.length > 0) {
                      selectionRects.push(rects[0]); // Store the first rect for the word
                    }
                    startIndex = endIndex ; // Move past the space
                  });
                  //console.log(selectionRects);
              
                  // Create individual Troika text meshes for each word
                  let frame=startframe;
                 
                  selectionRects.forEach((rect, index) => 
                  {
                    const word = words[index];
              
                    // Create a new Troika text mesh for the individual word
                    const wordText = new Troika.Text();
                    wordText.text = word;    // Set the text to the word
                    wordText.fontSize = troikaText.fontSize;             // Set font size
                    wordText.color= troikaText.color;
                    wordText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                    wordText.overflowWrap=troikaText.overflowWrap
                    wordText.whiteSpace=troikaText.whiteSpace
                    wordText.lineHeight=troikaText.lineHeight
                    wordText.letterSpacing=troikaText.letterSpacing
                    wordText.fillOpacity=troikaText.fillOpacity
                    wordText.strokeColor=troikaText.strokeColor
                    wordText.strokeWidth=troikaText.strokeWidth
                    wordText.strokeOpacity=troikaText.strokeOpacity
                    wordText.outlineColor=troikaText.outlineColor
                    wordText.outlineOpacity=troikaText.outlineOpacity
                    wordText.outlineWidth=troikaText.outlineWidth
                    wordText.outlineBlur=troikaText.outlineBlur
                    wordText.outlineOffsetX=troikaText.outlineOffsetX
                    wordText.outlineOffsetY=troikaText.outlineOffsetY
                    wordText.curveRadius=troikaText.curveRadius
                    wordText.anchorX=troikaText.anchorX
                    wordText.anchorY=troikaText.anchorY
                    wordText.direction=troikaText.direction
                    
                    const wordPosition = new THREE.Vector3(
                      troikaText.position.x + rect.left, // Adjust position based on the x coordinate of the rectangle
                      troikaText.position.y + rect.top,  // Y position based on the y coordinate of the rectangle
                      0            // Z position remains the same
                    );
              
                    // Apply the calculated position to the word text mesh
                    wordText.position.copy(wordPosition);
              
                   
                    wordText.sync();
                    selectedObject.add(wordText);
                    wordText.name=selectedObject.name+"_Word_"+word+i;
                    i++;
                    wordText.fillOpacity=0.0;
                    setKeyframe(wordText,0);
                    
                });
                let sceneTree=document.getElementById('scene-tree');
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
                for(let i=0;i<selectedObject.children.length;i++)
                    {
                        if(selectedObject.children[i].name.includes("Word"))
                        {
                        setKeyframe(selectedObject.children[i],frame);
                        frame=frame+frameInterval;
                        setKeyframe(selectedObject.children[i],frame-1);
                        selectedObject.children[i].fillOpacity=1;
                        setKeyframe(selectedObject.children[i],frame);
                        }
                    }
            }
        }
   
}
function CreateCharZoomIn()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
    {
        alert('start or end frame not defined');
    }
    else
    {
        selectedObject.userData.keyframes=[];
        const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
        //characters.unshift('');
        console.log(characters);
        const startframe=selectedObject.userData.startframe;
        const endframe=selectedObject.userData.endframe;
        console.log(startframe,endframe);
        let frameInterval=Math.floor((endframe-startframe)/characters.length);
        if(frameInterval<1)
        {
            alert('frame interval not enough')
        }
        else
        {
            let troikaText=selectedObject.children[0];
            troikaText.sync();
            //selectedObject.remove(selectedObject.children[0]);
            const textGeometry = troikaText.geometry;
            const charCount = characters.length;
           const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
            console.log(glyphBounds);
            // Remove the original mesh from the group
           
            const textRenderInfo = troikaText._textRenderInfo;
            let offset=0;
            selectedObject.remove(troikaText);
            
            
            // Loop through each character
            for (let i = 0; i < charCount; i++) 
            {
                // Get the bounds for the current character (each char has 4 bounds: xMin, yMin, xMax, yMax)
                const xMin = glyphBounds[i * 4 + 0];
                const yMin = glyphBounds[i * 4 + 1];
                const xMax = glyphBounds[i * 4 + 2];
                const yMax = glyphBounds[i * 4 + 3];
                const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
                /*const charWidth = xMax - xMin;
                const charHeight = yMax - yMin;*/
      // Calculate the position of the character as the midpoint of its bounding box
                const charPosition = new THREE.Vector3(
                troikaText.position.x+charRect.left , // Midpoint X
                troikaText.position.y+charRect.top, // Midpoint Y
                 0 // Z position remains 0
                );

                //console.log(xMin,xMax,yMin,yMax);
                // Apply the world matrix of the original text mesh to the character's position
                /*const worldMatrix = new THREE.Matrix4();
                troikaText.updateWorldMatrix(true, false);
                worldMatrix.copy(troikaText.matrixWorld);
                charPosition.applyMatrix4(worldMatrix);*/

                const charText = new Troika.Text();
                charText.text=characters[i];
                charText.fontSize = troikaText.fontSize;             // Set font size
                charText.color= troikaText.color;
                charText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                charText.overflowWrap=troikaText.overflowWrap
                charText.whiteSpace=troikaText.whiteSpace
                charText.lineHeight=troikaText.lineHeight
                charText.letterSpacing=troikaText.letterSpacing
                charText.fillOpacity=troikaText.fillOpacity
                charText.strokeColor=troikaText.strokeColor
                charText.strokeWidth=troikaText.strokeWidth
                charText.strokeOpacity=troikaText.strokeOpacity
                charText.outlineColor=troikaText.outlineColor
                charText.outlineOpacity=troikaText.outlineOpacity
                charText.outlineWidth=troikaText.outlineWidth
                charText.outlineBlur=troikaText.outlineBlur
                charText.outlineOffsetX=troikaText.outlineOffsetX
                charText.outlineOffsetY=troikaText.outlineOffsetY
                charText.curveRadius=troikaText.curveRadius
                charText.anchorX=troikaText.anchorX
                charText.anchorY=troikaText.anchorY
                charText.direction=troikaText.direction
    
                // Set the position of each character to match its original position in the text
                charText.position.copy(charPosition);
                charText.quaternion.copy(troikaText.quaternion); // Copy rotation too if needed
                //charText.position.x=charText.position.x+offset;
                charText.sync(); 
                charText.name=troikaText.name+"_2DChar_"+characters[i]+"_"+i; 
                selectedObject.add(charText); // Add to the group after sync is completed
                console.log(selectedObject.children[i].position);
                charText.scale.set(0.001,0.001,0.001);
                setKeyframe(selectedObject.children[i],0);
                //offset=charWidth+offset;
            }
            let sceneTree=document.getElementById('scene-tree');
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
            let frame=startframe;
            const intervals = calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.7)
            for (let i = 0; i <selectedObject.children.length; i++)
            {
               if(selectedObject.children[i].name.includes('Char')) 
               {
                //setKeyframe(selectedObject.children[i], Math.floor(intervals[i].keyframeTimes[0]));
               setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
               if(i>0)
               {
                setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]-1));
               }
               selectedObject.children[i].scale.set(0.05,0.05,0.05);
               setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
               selectedObject.children[i].scale.set(0.8,0.8,0.8);
               setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
               selectedObject.children[i].scale.set(1,1,1);
               setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
               }
            }
       }
            
           
    }
    
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
function CreateWordZoomIn()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const words=selectedObject.userData.TextParams.text.split(/([-\s,.;_]+)/);
            console.log(words);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/words.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                //const words=selectedObject.userData.TextParams.text.split(/(\s+)/);
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                const wordCount = words.length;
                const textRenderInfo = troikaText._textRenderInfo;
                const selectionRects = [];
                let startIndex = 0;
                selectedObject.remove(troikaText);
                words.forEach(word => {
                    const endIndex = startIndex + word.length; // Calculate the end index
                    const rects = Troika.getSelectionRects(textRenderInfo,startIndex, endIndex);
                    if (rects.length > 0) {
                      selectionRects.push(rects[0]); // Store the first rect for the word
                    }
                    startIndex = endIndex ; // Move past the space
                  });
                  //console.log(selectionRects);
              
                  // Create individual Troika text meshes for each word
                  let frame=startframe;
                 
                  selectionRects.forEach((rect, index) => 
                  {
                    const word = words[index];
              
                    // Create a new Troika text mesh for the individual word
                    const wordText = new Troika.Text();
                    wordText.text = word;    // Set the text to the word
                    wordText.fontSize = troikaText.fontSize;             // Set font size
                    wordText.color= troikaText.color;
                    wordText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                    wordText.overflowWrap=troikaText.overflowWrap
                    wordText.whiteSpace=troikaText.whiteSpace
                    wordText.lineHeight=troikaText.lineHeight
                    wordText.letterSpacing=troikaText.letterSpacing
                    wordText.fillOpacity=troikaText.fillOpacity
                    wordText.strokeColor=troikaText.strokeColor
                    wordText.strokeWidth=troikaText.strokeWidth
                    wordText.strokeOpacity=troikaText.strokeOpacity
                    wordText.outlineColor=troikaText.outlineColor
                    wordText.outlineOpacity=troikaText.outlineOpacity
                    wordText.outlineWidth=troikaText.outlineWidth
                    wordText.outlineBlur=troikaText.outlineBlur
                    wordText.outlineOffsetX=troikaText.outlineOffsetX
                    wordText.outlineOffsetY=troikaText.outlineOffsetY
                    wordText.curveRadius=troikaText.curveRadius
                    wordText.anchorX=troikaText.anchorX
                    wordText.anchorY=troikaText.anchorY
                    wordText.direction=troikaText.direction
                    
                    const wordPosition = new THREE.Vector3(
                      troikaText.position.x + rect.left, // Adjust position based on the x coordinate of the rectangle
                      troikaText.position.y + rect.top,  // Y position based on the y coordinate of the rectangle
                      0            // Z position remains the same
                    );
              
                    // Apply the calculated position to the word text mesh
                    wordText.position.copy(wordPosition);
              
                    // Sync and add the word text mesh to the group
                    wordText.sync();
                    selectedObject.add(wordText);
                    wordText.scale.set(0.001,0.001,0.001);
                    setKeyframe(wordText,0);
                    /*setKeyframe(wordText,frame);
                    if(index>0)
                    setKeyframe(wordText,frame-1);
                    wordText.scale.set(0.05,0.05,0.05);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(0.8,0.8,0.8);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(1,1,1);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    console.log(wordText.userData.keyframes);*/
                });
                const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.7);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                        
                        //setKeyframe(selectedObject.children[i], Math.floor(intervals[i].keyframeTimes[0]));
                       setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                       if(i>0)
                       {
                        setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]-1));
                       }
                       selectedObject.children[i].scale.set(0.05,0.05,0.05);
                       setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                       selectedObject.children[i].scale.set(0.8,0.8,0.8);
                       setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                       selectedObject.children[i].scale.set(1,1,1);
                       setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
            }
        }
    
}
function CreateCharOpacityAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
            //characters.unshift('');
            console.log(characters);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/characters.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                //selectedObject.remove(selectedObject.children[0]);
                const textGeometry = troikaText.geometry;
                const charCount = characters.length;
               const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
                console.log(glyphBounds);
                // Remove the original mesh from the group
               
                const textRenderInfo = troikaText._textRenderInfo;
                let offset=0;
                selectedObject.remove(troikaText);
                
                
                
                for (let i = 0; i < charCount; i++) 
                {
                    
                    const xMin = glyphBounds[i * 4 + 0];
                    const yMin = glyphBounds[i * 4 + 1];
                    const xMax = glyphBounds[i * 4 + 2];
                    const yMax = glyphBounds[i * 4 + 3];
                    const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
                    const charPosition = new THREE.Vector3(
                    troikaText.position.x+charRect.left , 
                    troikaText.position.y+charRect.top, 
                     0 // Z position remains 0
                    );
                    const charText = new Troika.Text();
                    charText.text=characters[i];
                    charText.fontSize = troikaText.fontSize;             
                    charText.color= troikaText.color;
                    charText.font=troikaText.font;
                    charText.overflowWrap=troikaText.overflowWrap
                    charText.whiteSpace=troikaText.whiteSpace
                    charText.lineHeight=troikaText.lineHeight
                    charText.letterSpacing=troikaText.letterSpacing
                    charText.fillOpacity=troikaText.fillOpacity
                    charText.strokeColor=troikaText.strokeColor
                    charText.strokeWidth=troikaText.strokeWidth
                    charText.strokeOpacity=troikaText.strokeOpacity
                    charText.outlineColor=troikaText.outlineColor
                    charText.outlineOpacity=troikaText.outlineOpacity
                    charText.outlineWidth=troikaText.outlineWidth
                    charText.outlineBlur=troikaText.outlineBlur
                    charText.outlineOffsetX=troikaText.outlineOffsetX
                    charText.outlineOffsetY=troikaText.outlineOffsetY
                    charText.curveRadius=troikaText.curveRadius
                    charText.anchorX=troikaText.anchorX
                    charText.anchorY=troikaText.anchorY
                    charText.direction=troikaText.direction
        
                    
                    charText.position.copy(charPosition);
                    charText.quaternion.copy(troikaText.quaternion); 
                   
                    charText.sync(); 
                    selectedObject.add(charText); 
                    console.log(selectedObject.children[i].position);
                    charText.fillOpacity=0.001;
                    charText.sync(); 
                    setKeyframe(selectedObject.children[i],0);
                    
                }
                let frame=startframe;
                const intervals = calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92)
                console.log(intervals);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    
                    
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                   /*if(i>0)
                   {
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]-1));
                   }*/
                   selectedObject.children[i].fillOpacity=0.01;
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                   selectedObject.children[i].fillOpacity=0.7;
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                   selectedObject.children[i].fillOpacity=1;
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
           }
                
               
        }
}

function CreateWordOpacityAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const words=selectedObject.userData.TextParams.text.split(/([-\s,.;_]+)/);
            console.log(words);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/words.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                //const words=selectedObject.userData.TextParams.text.split(/(\s+)/);
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                const wordCount = words.length;
                const textRenderInfo = troikaText._textRenderInfo;
                const selectionRects = [];
                let startIndex = 0;
                selectedObject.remove(troikaText);
                words.forEach(word => {
                    const endIndex = startIndex + word.length; // Calculate the end index
                    const rects = Troika.getSelectionRects(textRenderInfo,startIndex, endIndex);
                    if (rects.length > 0) {
                      selectionRects.push(rects[0]); // Store the first rect for the word
                    }
                    startIndex = endIndex ; // Move past the space
                  });
                  //console.log(selectionRects);
              
                  // Create individual Troika text meshes for each word
                  let frame=startframe;
                 
                  selectionRects.forEach((rect, index) => 
                  {
                    const word = words[index];
              
                    // Create a new Troika text mesh for the individual word
                    const wordText = new Troika.Text();
                    wordText.text = word;    // Set the text to the word
                    wordText.fontSize = troikaText.fontSize;             // Set font size
                    wordText.color= troikaText.color;
                    wordText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                    wordText.overflowWrap=troikaText.overflowWrap
                    wordText.whiteSpace=troikaText.whiteSpace
                    wordText.lineHeight=troikaText.lineHeight
                    wordText.letterSpacing=troikaText.letterSpacing
                    wordText.fillOpacity=troikaText.fillOpacity
                    wordText.strokeColor=troikaText.strokeColor
                    wordText.strokeWidth=troikaText.strokeWidth
                    wordText.strokeOpacity=troikaText.strokeOpacity
                    wordText.outlineColor=troikaText.outlineColor
                    wordText.outlineOpacity=troikaText.outlineOpacity
                    wordText.outlineWidth=troikaText.outlineWidth
                    wordText.outlineBlur=troikaText.outlineBlur
                    wordText.outlineOffsetX=troikaText.outlineOffsetX
                    wordText.outlineOffsetY=troikaText.outlineOffsetY
                    wordText.curveRadius=troikaText.curveRadius
                    wordText.anchorX=troikaText.anchorX
                    wordText.anchorY=troikaText.anchorY
                    wordText.direction=troikaText.direction
                    
                    const wordPosition = new THREE.Vector3(
                      troikaText.position.x + rect.left, // Adjust position based on the x coordinate of the rectangle
                      troikaText.position.y + rect.top,  // Y position based on the y coordinate of the rectangle
                      0            // Z position remains the same
                    );
              
                    // Apply the calculated position to the word text mesh
                    wordText.position.copy(wordPosition);
              
                    // Sync and add the word text mesh to the group
                    wordText.sync();
                    selectedObject.add(wordText);
                    wordText.fillOpacity=0.0;
                    setKeyframe(wordText,0);
                    /*setKeyframe(wordText,frame);
                    if(index>0)
                    setKeyframe(wordText,frame-1);
                    wordText.scale.set(0.05,0.05,0.05);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(0.8,0.8,0.8);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(1,1,1);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    console.log(wordText.userData.keyframes);*/
                });
                const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                    selectedObject.children[i].fillOpacity=0.01;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                    selectedObject.children[i].fillOpacity=0.7;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                    selectedObject.children[i].fillOpacity=1;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
            }
        }
    
}
function CreateCharRotateAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
            //characters.unshift('');
            console.log(characters);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/characters.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                //selectedObject.remove(selectedObject.children[0]);
                const textGeometry = troikaText.geometry;
                const charCount = characters.length;
               const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
                console.log(glyphBounds);
                // Remove the original mesh from the group
               
                const textRenderInfo = troikaText._textRenderInfo;
                let offset=0;
                selectedObject.remove(troikaText);
                
                
                
                for (let i = 0; i < charCount; i++) 
                {
                    
                    const xMin = glyphBounds[i * 4 + 0];
                    const yMin = glyphBounds[i * 4 + 1];
                    const xMax = glyphBounds[i * 4 + 2];
                    const yMax = glyphBounds[i * 4 + 3];
                    const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
                    const charPosition = new THREE.Vector3(
                    troikaText.position.x+charRect.left , 
                    troikaText.position.y+charRect.top, 
                     0 // Z position remains 0
                    );
                    const charText = new Troika.Text();
                    charText.text=characters[i];
                    charText.fontSize = troikaText.fontSize;             
                    charText.color= troikaText.color;
                    charText.font=troikaText.font;
                    charText.overflowWrap=troikaText.overflowWrap
                    charText.whiteSpace=troikaText.whiteSpace
                    charText.lineHeight=troikaText.lineHeight
                    charText.letterSpacing=troikaText.letterSpacing
                    charText.fillOpacity=troikaText.fillOpacity
                    charText.strokeColor=troikaText.strokeColor
                    charText.strokeWidth=troikaText.strokeWidth
                    charText.strokeOpacity=troikaText.strokeOpacity
                    charText.outlineColor=troikaText.outlineColor
                    charText.outlineOpacity=troikaText.outlineOpacity
                    charText.outlineWidth=troikaText.outlineWidth
                    charText.outlineBlur=troikaText.outlineBlur
                    charText.outlineOffsetX=troikaText.outlineOffsetX
                    charText.outlineOffsetY=troikaText.outlineOffsetY
                    charText.curveRadius=troikaText.curveRadius
                    charText.anchorX=troikaText.anchorX
                    charText.anchorY=troikaText.anchorY
                    charText.direction=troikaText.direction
        
                    
                    charText.position.copy(charPosition);
                    charText.quaternion.copy(troikaText.quaternion); 
                   
                    charText.sync(); 
                    selectedObject.add(charText); 
                    console.log(selectedObject.children[i].position);
                    charText.rotation.y=THREE.MathUtils.degToRad(90);
                    charText.fillOpacity=0.0;
                    charText.sync(); 
                    setKeyframe(selectedObject.children[i],0);
                    
                }
                let frame=startframe;
                const intervals = calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92)
                console.log(intervals);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    
                    
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                   /*if(i>0)
                   {
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]-1));
                   }*/
                   selectedObject.children[i].fillOpacity=0.01;
                   selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(75);
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                   selectedObject.children[i].fillOpacity=0.7;
                   selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(15);
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                   selectedObject.children[i].fillOpacity=1;
                   selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(0);
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
           }
                
               
        }
}
function CreateWordRotateAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const words=selectedObject.userData.TextParams.text.split(/([-\s,.;_]+)/);
            console.log(words);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/words.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                //const words=selectedObject.userData.TextParams.text.split(/(\s+)/);
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                const wordCount = words.length;
                const textRenderInfo = troikaText._textRenderInfo;
                const selectionRects = [];
                let startIndex = 0;
                selectedObject.remove(troikaText);
                words.forEach(word => {
                    const endIndex = startIndex + word.length; // Calculate the end index
                    const rects = Troika.getSelectionRects(textRenderInfo,startIndex, endIndex);
                    if (rects.length > 0) {
                      selectionRects.push(rects[0]); // Store the first rect for the word
                    }
                    startIndex = endIndex ; // Move past the space
                  });
                  //console.log(selectionRects);
              
                  // Create individual Troika text meshes for each word
                  let frame=startframe;
                 
                  selectionRects.forEach((rect, index) => 
                  {
                    const word = words[index];
              
                    // Create a new Troika text mesh for the individual word
                    const wordText = new Troika.Text();
                    wordText.text = word;    // Set the text to the word
                    wordText.fontSize = troikaText.fontSize;             // Set font size
                    wordText.color= troikaText.color;
                    wordText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                    wordText.overflowWrap=troikaText.overflowWrap
                    wordText.whiteSpace=troikaText.whiteSpace
                    wordText.lineHeight=troikaText.lineHeight
                    wordText.letterSpacing=troikaText.letterSpacing
                    wordText.fillOpacity=troikaText.fillOpacity
                    wordText.strokeColor=troikaText.strokeColor
                    wordText.strokeWidth=troikaText.strokeWidth
                    wordText.strokeOpacity=troikaText.strokeOpacity
                    wordText.outlineColor=troikaText.outlineColor
                    wordText.outlineOpacity=troikaText.outlineOpacity
                    wordText.outlineWidth=troikaText.outlineWidth
                    wordText.outlineBlur=troikaText.outlineBlur
                    wordText.outlineOffsetX=troikaText.outlineOffsetX
                    wordText.outlineOffsetY=troikaText.outlineOffsetY
                    wordText.curveRadius=troikaText.curveRadius
                    wordText.anchorX=troikaText.anchorX
                    wordText.anchorY=troikaText.anchorY
                    wordText.direction=troikaText.direction
                    
                    const wordPosition = new THREE.Vector3(
                      troikaText.position.x + rect.left, // Adjust position based on the x coordinate of the rectangle
                      troikaText.position.y + rect.top,  // Y position based on the y coordinate of the rectangle
                      0            // Z position remains the same
                    );
              
                    // Apply the calculated position to the word text mesh
                    wordText.position.copy(wordPosition);
              
                    // Sync and add the word text mesh to the group
                    wordText.sync();
                    selectedObject.add(wordText);
                    wordText.rotation.y=THREE.MathUtils.degToRad(90);
                    wordText.fillOpacity=0.0;
                    setKeyframe(wordText,0);
                    /*setKeyframe(wordText,frame);
                    if(index>0)
                    setKeyframe(wordText,frame-1);
                    wordText.scale.set(0.05,0.05,0.05);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(0.8,0.8,0.8);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(1,1,1);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    console.log(wordText.userData.keyframes);*/
                });
                const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                    selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(75);
                    selectedObject.children[i].fillOpacity=0.01;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                    selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(15);
                    selectedObject.children[i].fillOpacity=0.7;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                    selectedObject.children[i].rotation.y=THREE.MathUtils.degToRad(0);
                    selectedObject.children[i].fillOpacity=1;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
            }
        }
    
}
function CreateCharPositionAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const characters=selectedObject.userData.TextParams.text.split(/(?=.)/);
            //characters.unshift('');
            console.log(characters);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/characters.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                //selectedObject.remove(selectedObject.children[0]);
                const textGeometry = troikaText.geometry;
                const charCount = characters.length;
               const glyphBounds = textGeometry.attributes.aTroikaGlyphBounds.array;
                console.log(glyphBounds);
                // Remove the original mesh from the group
               
                const textRenderInfo = troikaText._textRenderInfo;
                let offset=0;
                selectedObject.remove(troikaText);
                
                
                
                for (let i = 0; i < charCount; i++) 
                {
                    
                    const xMin = glyphBounds[i * 4 + 0];
                    const yMin = glyphBounds[i * 4 + 1];
                    const xMax = glyphBounds[i * 4 + 2];
                    const yMax = glyphBounds[i * 4 + 3];
                    const charRect = Troika.getSelectionRects(textRenderInfo,i, i + 1)[0]; 
                    const charPosition = new THREE.Vector3(
                    troikaText.position.x+charRect.left , 
                    troikaText.position.y+charRect.top, 
                     0 // Z position remains 0
                    );
                    const charText = new Troika.Text();
                    charText.text=characters[i];
                    charText.fontSize = troikaText.fontSize;             
                    charText.color= troikaText.color;
                    charText.font=troikaText.font;
                    charText.overflowWrap=troikaText.overflowWrap
                    charText.whiteSpace=troikaText.whiteSpace
                    charText.lineHeight=troikaText.lineHeight
                    charText.letterSpacing=troikaText.letterSpacing
                    charText.fillOpacity=troikaText.fillOpacity
                    charText.strokeColor=troikaText.strokeColor
                    charText.strokeWidth=troikaText.strokeWidth
                    charText.strokeOpacity=troikaText.strokeOpacity
                    charText.outlineColor=troikaText.outlineColor
                    charText.outlineOpacity=troikaText.outlineOpacity
                    charText.outlineWidth=troikaText.outlineWidth
                    charText.outlineBlur=troikaText.outlineBlur
                    charText.outlineOffsetX=troikaText.outlineOffsetX
                    charText.outlineOffsetY=troikaText.outlineOffsetY
                    charText.curveRadius=troikaText.curveRadius
                    charText.anchorX=troikaText.anchorX
                    charText.anchorY=troikaText.anchorY
                    charText.direction=troikaText.direction
        
                    
                    charText.position.copy(charPosition);
                    charText.quaternion.copy(troikaText.quaternion); 
                   
                    charText.sync(); 
                    selectedObject.add(charText); 
                    console.log(selectedObject.children[i].position);
                    charText.position.z=5;
                    charText.fillOpacity=0.0;
                    charText.sync(); 
                    setKeyframe(selectedObject.children[i],0);
                    
                }
                let frame=startframe;
                const intervals = calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92)
                console.log(intervals);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    
                    
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                   selectedObject.children[i].position.z=3;
                   selectedObject.children[i].fillOpacity=0.01
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                   selectedObject.children[i].fillOpacity=0.7
                   selectedObject.children[i].position.z=0.5;
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                   selectedObject.children[i].fillOpacity=1
                   selectedObject.children[i].position.z=0;
                   selectedObject.children[i].sync();
                   setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
           }
                
               
        }
}
function CreateWordPositionAnim()
{
    if(selectedObject.userData.startframe===undefined|| !selectedObject.userData.endframe===undefined)
        {
            alert('start or end frame not defined');
        }
        else
        {
            selectedObject.userData.keyframes=[];
            const words=selectedObject.userData.TextParams.text.split(/([-\s,.;_]+)/);
            console.log(words);
            const startframe=selectedObject.userData.startframe;
            const endframe=selectedObject.userData.endframe;
            console.log(startframe,endframe);
            let frameInterval=Math.floor((endframe-startframe)/words.length);
            if(frameInterval<1)
            {
                alert('frame interval not enough')
            }
            else
            {
                //const words=selectedObject.userData.TextParams.text.split(/(\s+)/);
                let troikaText=selectedObject.children[0];
                troikaText.sync();
                const wordCount = words.length;
                const textRenderInfo = troikaText._textRenderInfo;
                const selectionRects = [];
                let startIndex = 0;
                selectedObject.remove(troikaText);
                words.forEach(word => {
                    const endIndex = startIndex + word.length; // Calculate the end index
                    const rects = Troika.getSelectionRects(textRenderInfo,startIndex, endIndex);
                    if (rects.length > 0) {
                      selectionRects.push(rects[0]); // Store the first rect for the word
                    }
                    startIndex = endIndex ; // Move past the space
                  });
                  //console.log(selectionRects);
              
                  // Create individual Troika text meshes for each word
                  let frame=startframe;
                 
                  selectionRects.forEach((rect, index) => 
                  {
                    const word = words[index];
              
                    // Create a new Troika text mesh for the individual word
                    const wordText = new Troika.Text();
                    wordText.text = word;    // Set the text to the word
                    wordText.fontSize = troikaText.fontSize;             // Set font size
                    wordText.color= troikaText.color;
                    wordText.font=troikaText.font;
                //charText.maxWidth=troikaText.maxWidth 
                //charText.textAlign=troikaText.textAlign
                    wordText.overflowWrap=troikaText.overflowWrap
                    wordText.whiteSpace=troikaText.whiteSpace
                    wordText.lineHeight=troikaText.lineHeight
                    wordText.letterSpacing=troikaText.letterSpacing
                    wordText.fillOpacity=troikaText.fillOpacity
                    wordText.strokeColor=troikaText.strokeColor
                    wordText.strokeWidth=troikaText.strokeWidth
                    wordText.strokeOpacity=troikaText.strokeOpacity
                    wordText.outlineColor=troikaText.outlineColor
                    wordText.outlineOpacity=troikaText.outlineOpacity
                    wordText.outlineWidth=troikaText.outlineWidth
                    wordText.outlineBlur=troikaText.outlineBlur
                    wordText.outlineOffsetX=troikaText.outlineOffsetX
                    wordText.outlineOffsetY=troikaText.outlineOffsetY
                    wordText.curveRadius=troikaText.curveRadius
                    wordText.anchorX=troikaText.anchorX
                    wordText.anchorY=troikaText.anchorY
                    wordText.direction=troikaText.direction
                    
                    const wordPosition = new THREE.Vector3(
                      troikaText.position.x + rect.left, // Adjust position based on the x coordinate of the rectangle
                      troikaText.position.y + rect.top,  // Y position based on the y coordinate of the rectangle
                      0            // Z position remains the same
                    );
              
                    // Apply the calculated position to the word text mesh
                    wordText.position.copy(wordPosition);
              
                    // Sync and add the word text mesh to the group
                    wordText.sync();
                    selectedObject.add(wordText);
                    wordText.position.z=5;
                    wordText.fillOpacity=0.0;
                    setKeyframe(wordText,0);
                    /*setKeyframe(wordText,frame);
                    if(index>0)
                    setKeyframe(wordText,frame-1);
                    wordText.scale.set(0.05,0.05,0.05);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(0.8,0.8,0.8);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    wordText.scale.set(1,1,1);
                    frame=frame+Math.floor(frameInterval/3);
                    setKeyframe(wordText,frame);
                    console.log(wordText.userData.keyframes);*/
                });
                const intervals=calculateFrameIntervals(selectedObject.children.length,startframe,endframe,0.92);
                for (let i = 0; i <selectedObject.children.length; i++)
                {
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[0]));
                    selectedObject.children[i].position.z=3;
                    selectedObject.children[i].fillOpacity=0.01;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[1]));
                    selectedObject.children[i].position.z=0.5;
                    selectedObject.children[i].fillOpacity=0.7;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[2]));
                    selectedObject.children[i].position.z=0;
                    selectedObject.children[i].fillOpacity=1;
                    selectedObject.children[i].sync();
                    setKeyframe(selectedObject.children[i],Math.floor(intervals[i].keyframeTimes[3]));
                }
            }
        }
    
}
export {
        create2DText,createTextControls,update2DTextattribute, CreateCharVisAnimation,CreateWordVisAnimation,CreateCharZoomIn,CreateWordZoomIn,
        CreateCharOpacityAnim,CreateCharRotateAnim, CreateWordRotateAnim,CreateCharPositionAnim,CreateWordPositionAnim
        }