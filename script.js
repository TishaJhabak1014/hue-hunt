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

// Function to toggle selection of a color
const toggleSelection = (elem) => {
    elem.classList.toggle('selected');
}

// Event listener for color selection
document.querySelectorAll('.rect').forEach(colorRect => {
    colorRect.addEventListener('click', (event) => {
        const colorValue = event.currentTarget.nextElementSibling;
        toggleSelection(colorValue);
    });
});

// Function to export selected colors
const exportColors = () => {
    const selectedColors = pickedColors.filter(color => document.querySelector(`.value[data-color="${color}"]`).classList.contains('selected'));
    const data = JSON.stringify(selectedColors);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_colors.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// Function to import selected colors from a file
const importColors = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const importedColors = JSON.parse(event.target.result);
        importedColors.forEach(color => {
            if (!pickedColors.includes(color)) {
                pickedColors.push(color);
            }
        });
        localStorage.setItem('picked-colors', JSON.stringify(pickedColors));
        showColor();
    };
    reader.readAsText(file);
}

// Event listener for export button
document.getElementById('export-btn').addEventListener('click', exportColors);

// Event listener for import input
document.getElementById('import-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    importColors(file);
});

// mono

// Function to generate a monochromatic gradient palette
const generateMonochromaticPalette = (color) => {
    const palette = [];
    // Lighten and darken the base color to generate the gradient
    for (let i = 1; i <= 5; i++) {
        const newColor = Color(color).lighten(i * 5).hex();
        palette.push(newColor);
    }
    return palette;
}
//
// Function to handle click on a color
const handleColorClick = (color) => {
    const gradientPalette = generateMonochromaticPalette(color);
    displayGradientPalette(gradientPalette);
}

// Event listener for color selection
document.querySelectorAll('.rect').forEach(colorRect => {
    colorRect.addEventListener('click', (event) => {
        const colorValue = event.currentTarget.nextElementSibling.dataset.color;
        handleColorClick(colorValue);
    });
});

// Function to display the generated gradient palette
const displayGradientPalette = (palette) => {
    const gradientContainer = document.querySelector('.gradient-palette');
    gradientContainer.innerHTML = ''; // Clear previous gradient if any
    palette.forEach((color, index) => {
        const gradientColor = document.createElement('div');
        gradientColor.classList.add('gradient-color');
        gradientColor.style.background = color;
        gradientColor.innerText = `Color ${index + 1}`;
        gradientContainer.appendChild(gradientColor);
    });
}
