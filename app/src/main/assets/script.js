// script.js - Logic for the SNotePad WebView interface

// --- DOM Elements ---
const selectFolderBtn = document.getElementById('select-folder-btn');
const fileList = document.getElementById('file-list');
const filenameInput = document.getElementById('filename-input');
const contentTextarea = document.getElementById('content-textarea');
const saveFileBtn = document.getElementById('save-file-btn');
const prefsKeyInput = document.getElementById('prefs-key-input');
const prefsValueInput = document.getElementById('prefs-value-input');
const savePrefsBtn = document.getElementById('save-prefs-btn');
const loadPrefsBtn = document.getElementById('load-prefs-btn');
const errorDisplay = document.getElementById('error-display');

// --- Check if AndroidInterface is available ---
if (typeof AndroidInterface === 'undefined') {
    showError("Error: Android communication interface is not available. Ensure the app is running correctly.");
    // Disable buttons if interface is missing
    selectFolderBtn.disabled = true;
    saveFileBtn.disabled = true;
    savePrefsBtn.disabled = true;
    loadPrefsBtn.disabled = true;
}

// --- Event Listeners ---
selectFolderBtn.addEventListener('click', () => {
    console.log("Select Folder button clicked");
    clearError(); // Clear previous errors
    if (AndroidInterface) {
        AndroidInterface.requestFolderSelection();
    } else {
        showError("Android interface not available.");
    }
});

saveFileBtn.addEventListener('click', () => {
    console.log("Save File button clicked");
    clearError();
    const filename = filenameInput.value.trim();
    const content = contentTextarea.value;
    if (!filename) {
        showError("Please enter a filename.");
        return;
    }
    if (AndroidInterface) {
        AndroidInterface.saveFile(filename, content);
    } else {
        showError("Android interface not available.");
    }
});

savePrefsBtn.addEventListener('click', () => {
    console.log("Save Preference button clicked");
    clearError();
    const key = prefsKeyInput.value.trim();
    const value = prefsValueInput.value;
     if (!key) {
        showError("Please enter a preference key.");
        return;
    }
    if (AndroidInterface) {
        AndroidInterface.saveToPreferences(key, value);
    } else {
        showError("Android interface not available.");
    }
});

loadPrefsBtn.addEventListener('click', () => {
    console.log("Load Preference button clicked");
    clearError();
    const key = prefsKeyInput.value.trim();
     if (!key) {
        showError("Please enter a preference key to load.");
        return;
    }
    if (AndroidInterface) {
        // Clear the value field before loading
        prefsValueInput.value = '';
        AndroidInterface.loadFromPreferences(key);
    } else {
        showError("Android interface not available.");
    }
});

// --- Functions Called by Kotlin ---

/**
 * Displays the list of files received from Android.
 * @param {string} filesJson - A JSON string representing an array of file objects [{name: "...", uri: "..."}, ...].
 */
function displayFileList(filesJson) {
    console.log("Received file list:", filesJson);
    clearError();
    fileList.innerHTML = ''; // Clear previous list
    try {
        const files = JSON.parse(filesJson);
        if (files.length === 0) {
            fileList.innerHTML = '<li>No files found in the selected folder.</li>';
            return;
        }
        files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.dataset.uri = file.uri; // Store URI in data attribute
            li.onclick = () => {
                console.log("File item clicked:", file.name, file.uri);
                clearError();
                 // Remove existing content divs for this item if any
                const existingContent = li.querySelector('.file-content');
                if (existingContent) {
                    existingContent.remove();
                } else {
                    // Request content if not already shown
                    if (AndroidInterface) {
                        AndroidInterface.readFileContent(file.uri);
                    } else {
                         showError("Android interface not available.");
                    }
                }
            };
            fileList.appendChild(li);
        });
    } catch (e) {
        console.error("Error parsing file list JSON:", e);
        showError("Error displaying file list. Invalid data received.");
        fileList.innerHTML = '<li>Error loading file list.</li>';
    }
}

/**
 * Displays the content of a file below its list item.
 * @param {string} uriString - The URI of the file whose content is being displayed.
 * @param {string} content - The content of the file.
 */
function displayFileContent(uriString, content) {
    console.log("Received file content for URI:", uriString);
    clearError();
    const listItem = fileList.querySelector(`li[data-uri="${uriString}"]`);
    if (listItem) {
        // Remove existing content div if present (to avoid duplicates)
        const existingContent = listItem.querySelector('.file-content');
        if (existingContent) {
            existingContent.remove();
        }

        // Create a new div to show the content
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('file-content');
        contentDiv.textContent = content; // Use textContent to prevent HTML injection
        listItem.appendChild(contentDiv); // Append content below the list item
    } else {
        console.warn("List item not found for URI:", uriString);
        showError("Could not find the corresponding file item to display content.");
    }
}

/**
 * Displays the loaded preference value in the input field.
 * @param {string} value - The value loaded from preferences.
 */
function displayPreferenceValue(value) {
     console.log("Received preference value:", value);
     clearError();
     prefsValueInput.value = value;
}

/**
 * Clears the filename and content fields after successful save.
 */
function clearSaveFields() {
    filenameInput.value = '';
    contentTextarea.value = '';
}


// --- Error Handling ---

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    console.error("JavaScript Error:", message);
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
     // Optionally call Android Toast for more visibility
     if (AndroidInterface && AndroidInterface.showToast) {
        AndroidInterface.showToast("Error: " + message.substring(0, 100)); // Show truncated message in Toast
     }
}

/**
 * Clears the error message display.
 */
function clearError() {
    errorDisplay.textContent = '';
    errorDisplay.classList.add('hidden');
}

// --- Initial Log ---
console.log("SNotePad script loaded.");
// Optional: Show a welcome toast via Android
// if (AndroidInterface && AndroidInterface.showToast) {
//     AndroidInterface.showToast("Welcome to SNotePad!");
// }

