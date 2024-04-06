const colorPickerBtn = document.querySelector("#color-picker");
const clearAll = document.querySelector(".clear-all");
const colorList = document.querySelector(".all-colors");
let pickedColors = JSON.parse(localStorage.getItem("picked-colors")) || [];

const copyColor = (elem) => {
    elem.innerText = "Copied";
    navigator.clipboard.writeText(elem.dataset.color);
    setTimeout(() => elem.innerText = elem.dataset.color, 1000);
}

const deleteColor = (elem) => {
    const colorToDelete = elem.dataset.color;
    pickedColors = pickedColors.filter(color => color !== colorToDelete);
    localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
    if (pickedColors.length === 0) {
        document.querySelector(".picked-colors").classList.add("hide");
    }
    showColor(); // Always call showColor to update the color list
}


const showColor = () => {
    if(!pickedColors.length) return;
    colorList.innerHTML = pickedColors.map(color => `
        <li class="color">
            <span class="rect" style="background: ${color}; border: 1px solid ${color == "#ffffff" ? "#ccc": color}"></span>
            <span class="value hex" data-color="${color}">${color}</span>
            <span class="icons">
                <i class="fas fa-copy copy-icon"></i>
                <i class="fas fa-trash delete-icon"></i>
            </span>
        </li>
    `).join("");
    document.querySelector(".picked-colors").classList.remove("hide");
    
    document.querySelectorAll(".color").forEach(li => {
        const copyIcon = li.querySelector(".copy-icon");
        const deleteIcon = li.querySelector(".delete-icon");
        
        copyIcon.addEventListener("click", e => {
            e.stopPropagation();
            copyColor(e.currentTarget.parentElement.previousElementSibling);
        });
        
        deleteIcon.addEventListener("click", e => {
            e.stopPropagation();
            deleteColor(e.currentTarget.parentElement.previousElementSibling);
        });
    });
}

const activateEyeDropper = () => {
    document.body.style.display = "none";
    setTimeout(async () => {
        try {
            // Opening the eye dropper and getting the selected color
            const eyeDropper = new EyeDropper();
            const { sRGBHex } = await eyeDropper.open();
            navigator.clipboard.writeText(sRGBHex);

            // Adding the color to the list if it doesn't already exist
            if(!pickedColors.includes(sRGBHex)) {
                pickedColors.push(sRGBHex);
                localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
                showColor();
            }
        } catch (error) {
            alert("Failed to copy the color code!");
        }
        document.body.style.display = "block";
    }, 10);
}

const clearAllColors = () => {
    pickedColors = [];
    localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
    document.querySelector(".picked-colors").classList.add("hide");
}

clearAll.addEventListener("click", clearAllColors);
colorPickerBtn.addEventListener("click", activateEyeDropper);

showColor();

const exportIcon = document.querySelector(".export-icon");
const exportColors = () => {
    // Create an object with keys like "color1", "color2", etc.
    const colorsObject = {};
    pickedColors.forEach((color, index) => {
        colorsObject[`color${index + 1}`] = color;
    });
    
    // Convert the object to a JSON string
    const jsonColors = JSON.stringify(colorsObject, null, 2); // null, 2 adds indentation for readability
    
    // Create a Blob object to store the JSON string
    const blob = new Blob([jsonColors], { type: "application/json" });
    
    // Create a link element to trigger the download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "picked-colors.json";
    
    // Append the link to the body and trigger the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


exportIcon.addEventListener("click", exportColors);
