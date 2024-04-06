const colorPickerBtn = document.querySelector("#color-picker"); // Selects the color picker button
const clearAll = document.querySelector(".clear-all"); // Selects the clear all button
const colorList = document.querySelector(".all-colors"); // Selects the container for displaying picked colors
let pickedColors = JSON.parse(localStorage.getItem("picked-colors")) || []; // Retrieves picked colors from localStorage or initializes as an empty array

const copyColor = (elem) => {
    elem.innerText = "Copied"; // Changes the text content to "Copied"
    navigator.clipboard.writeText(elem.dataset.color); // Writes the color value to the clipboard
    setTimeout(() => elem.innerText = elem.dataset.color, 1000); // Restores the original text content after 1 second
}

const deleteColor = (elem) => {
    const colorToDelete = elem.dataset.color; // Retrieves the color value to be deleted
    pickedColors = pickedColors.filter(color => color !== colorToDelete); // Removes the color from the pickedColors array
    localStorage.setItem("picked-colors", JSON.stringify(pickedColors)); // Updates localStorage with the modified pickedColors array
    if (pickedColors.length === 0) {
        document.querySelector(".picked-colors").classList.add("hide"); // Hides the container for picked colors if no colors are left
    }
    showColor(); // Calls the showColor function to update the color list
}

const showColor = () => {
    if(!pickedColors.length) return; // Exits the function if no colors are picked
    colorList.innerHTML = pickedColors.map(color => `
        <li class="color">
            <span class="rect" style="background: ${color}; border: 1px solid ${color == "#ffffff" ? "#ccc": color}"></span>
            <span class="value hex" data-color="${color}">${color}</span>
            <span class="icons">
                <i class="fas fa-copy copy-icon"></i>
                <i class="fas fa-trash delete-icon"></i>
            </span>
        </li>
    `).join(""); // Generates HTML for displaying picked colors and inserts it into the colorList container
    document.querySelector(".picked-colors").classList.remove("hide"); // Shows the container for picked colors
    document.querySelectorAll(".color").forEach(li => {
        const copyIcon = li.querySelector(".copy-icon"); // Selects the copy icon for each color
        const deleteIcon = li.querySelector(".delete-icon"); // Selects the delete icon for each color

        copyIcon.addEventListener("click", e => {
            e.stopPropagation();
            copyColor(e.currentTarget.parentElement.previousElementSibling); // Copies the color value to the clipboard when clicked
        });

        deleteIcon.addEventListener("click", e => {
            e.stopPropagation();
            deleteColor(e.currentTarget.parentElement.previousElementSibling); // Deletes the color when clicked
        });
    });
}

const activateEyeDropper = () => {
    document.body.style.display = "none"; // Hides the body while activating the eye dropper
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
        document.body.style.display = "block"; // Restores display of the body after eye dropper operation
    }, 10);
}

const clearAllColors = () => {
    pickedColors = []; // Clears the pickedColors array
    localStorage.setItem("picked-colors", JSON.stringify(pickedColors)); // Clears the picked colors from localStorage
    document.querySelector(".picked-colors").classList.add("hide"); // Hides the container for picked colors
}

clearAll.addEventListener("click", clearAllColors); // Adds event listener to the clear all button
colorPickerBtn.addEventListener("click", activateEyeDropper); // Adds event listener to the color picker button

showColor(); // Calls the showColor function to initially display picked colors

const exportIcon = document.querySelector(".export-icon"); // Selects the export icon
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

exportIcon.addEventListener("click", exportColors); // Adds event listener to the export icon
