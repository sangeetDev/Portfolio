import * as THREE from 'three';
import {scene,currentCamera,orbitControls,transformControls,selectedObject,listIndex,models,traverseScene} from '../main.js';
import { addTransformcontrols,detachTransformcontrols } from '../transformControls/TransformContols.js';
let selectedObjects=[];
document.addEventListener('click',function(event){
    if(event.ctrlKey)
    {
        if(selectedObject)
        {
            if(!selectedObjects.includes(selectedObject))
            {
                selectedObjects.push(selectedObject);
                console.log(selectedObjects);
            }
        }
    }
});
document.addEventListener('keydown', async function(event) {
    if (event.ctrlKey && event.key === 'g') 
    {
        event.preventDefault();
        console.log('grouping')
        let obj = selectedObjects[0].parent;
        let flag=true;
        for(let i=1;i<selectedObjects.length;i++)
        {
            if(obj==selectedObjects[i].parent)
            {
                flag=true;
            }
            else
            {
                flag=false;
                break;
            }
        }
        let userInput;

        if (selectedObjects.length > 0) 
        {
            const group = new THREE.Group();

            // Open dialog and wait for user input
            try {
                userInput = await openDialog(); // Wait for user input
                group.name = userInput; // Set the group name after getting input
            } catch (error) {
                console.log('User canceled input or an error occurred:', error);
                return; // Exit if the user cancels or input fails
            }

            // Add group to scene
            scene.add(group);
            for (let i = 0; i < selectedObjects.length; i++) {
                group.add(selectedObjects[i]);
            }
            if(flag)
            {
                if(obj!=scene)
                {
                obj.add(group);

                // Clear selected objects
                selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }
                }
                else
                {
                    group.userData.filename=group.name;
                    let i=0;
                    while(i<models.length)
                    {
                        let index=0;
                        while(index<selectedObjects.length)
                        {
                            if(models[i]==selectedObjects[index])
                            {
                                models.splice(i,1);
                                index++;
                            }
                            
                        }
                        i++;
                    }

                    models.push(group);
                    let j=0;
                    while(j<models.length)
                    {
                       if(models[j].children[0].length==0)
                       {
                        console.log('removing');
                        models.splice(j,1);
                       }
                        j++;
                    }
                    selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }
                }
            }
            else
            {
                group.userData.filename=group.name;
                models.push(group);
                selectedObjects = [];
    
                // Update the scene tree
                const sceneTree = document.getElementById('scene-tree');
                sceneTree.innerHTML = ''; // Clear existing content
                for (let i = 0; i < models.length; i++) {
                    const name = document.createElement('div');
                    name.id = "name" + i;
                    const newFilename = models[i].userData.filename;
                    name.innerHTML = `<strong>${newFilename}:</strong>`;
                    sceneTree.appendChild(name);
                    traverseScene(models[i], sceneTree); // Rebuild scene tree
                }

            }
            
        }
    }
});
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'p') 
    {
        event.preventDefault();
        console.log('ungrouping');
        const group=selectedObjects[0].parent;
        const obj = selectedObjects[0].parent.parent;
        if(obj==scene)
        {
            alert('Ungrouping not possible, Scene is the parent');
            selectedObjects=[];
            return;
        }
       
        
        
            for (let i = 0; i < selectedObjects.length; i++) 
            {
                group.remove(selectedObjects[i]);
                obj.add(selectedObjects[i]);
            }
            //obj.remove(group);
            selectedObjects = [];

            // Update the scene tree
            const sceneTree = document.getElementById('scene-tree');
            sceneTree.innerHTML = ''; // Clear existing content
            for (let i = 0; i < models.length; i++) {
                const name = document.createElement('div');
                name.id = "name" + i;
                const newFilename = models[i].userData.filename;
                name.innerHTML = `<strong>${newFilename}:</strong>`;
                sceneTree.appendChild(name);
                traverseScene(models[i], sceneTree); // Rebuild scene tree
            }
            console.log('ungrouped');
    }
});
function deleteObject(object)
{
    object.parent.remove(object);
    console.log('deleted');
    object.traverse((child) => 
    {
        if (child.isMesh) 
        {
            child.geometry.dispose();
            child.material.dispose();
        }
    });
    transformControls.detach();    
}
// Function to open the dialog and return a Promise that resolves with the user input
function openDialog() {
    return new Promise((resolve, reject) => {
        // Get elements
        const dialogBox = document.getElementById('dialogBox');
        const closeDialogBtn = document.getElementById('closeDialog');
        const submitBtn = document.getElementById('submitBtn');
        const userInputField = document.getElementById('userInput');

        // Show the dialog box
        dialogBox.style.display = 'flex';

        // Handle dialog submission
        submitBtn.addEventListener('click', function() {
            const userInput = userInputField.value;
            if (userInput.trim() !== '') {
                resolve(userInput); // Resolve with the user's input
                dialogBox.style.display = 'none'; // Close dialog
            } else {
                alert('Please enter a valid name!');
            }
        });

        // Handle dialog cancellation
        closeDialogBtn.addEventListener('click', function() {
            reject('User canceled the dialog'); // Reject if user cancels
            dialogBox.style.display = 'none'; // Close dialog
        });
    });
}
function showCustomAlert() {
    return new Promise((resolve) => {
      document.getElementById("customAlert").style.display = "flex";
  
      // Event listener for the Yes button
      document.getElementById("yesButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(true); // Resolves the promise with `true` if Yes is clicked
      });
  
      // Event listener for the No button
      document.getElementById("noButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(false); // Resolves the promise with `false` if No is clicked
      });
  
      // Event listener for the Close button
      document.getElementById("closeButton").addEventListener("click", function() {
        document.getElementById("customAlert").style.display = "none";
        resolve(false); // Also resolves as `false` if closed without Yes
      });
    });
  }
export{deleteObject}