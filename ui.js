// ui.js  
  
export function addMessage(chatWindow, role, content, isHTML = false) {  
    const messageElement = document.createElement('div');  
    messageElement.className = role === "user" ? 'message user-message' : 'message assistant-message';  
  
    const messageContent = document.createElement('div');  
    messageContent.className = 'message-content';  
  
    if (isHTML) {  
        messageContent.innerHTML = content;  
    } else {  
        messageContent.textContent = content;  
    }  
  
    if (role === "assistant") {  
        const icon = document.createElement('i');  
        icon.className = 'fa-solid fa-palette message-icon';  
        messageElement.appendChild(icon);  
    }  
  
    messageElement.appendChild(messageContent);  
    chatWindow.appendChild(messageElement);  
    chatWindow.scrollTop = chatWindow.scrollHeight;  
}  
  
export function showLoader(chatWindow) {  
    const loaderElement = document.createElement('div');  
    loaderElement.className = 'loader';  
    loaderElement.id = 'loader';  
  
    for (let i = 0; i < 3; i++) {  
        const dot = document.createElement('div');  
        dot.className = 'dot';  
        loaderElement.appendChild(dot);  
    }  
  
    chatWindow.appendChild(loaderElement);  
    chatWindow.scrollTop = chatWindow.scrollHeight;  
}  
  
export function hideLoader() {  
    const loaderElement = document.getElementById('loader');  
    if (loaderElement) {  
        loaderElement.remove();  
    }  
}  
  
export function toggleCategory(categoryId) {  
    const categoryElement = document.getElementById(categoryId);  
    if (categoryElement) {  
        categoryElement.style.display = categoryElement.style.display === 'none' ? 'block' : 'none';  
    }  
}  
  
export function createImageCard(chatWindow, imageUrl, openModalCallback, regenerateImageCallback) {  
    const imageCard = document.createElement('div');  
    imageCard.className = 'image-card';  
  
    const img = document.createElement('img');  
    img.src = imageUrl;  
    img.alt = 'Generated Image';  
    img.onclick = () => openModalCallback(img.src);  
  
    const options = document.createElement('div');  
    options.className = 'image-card-options';  
  
    const zoomButton = document.createElement('button');  
    zoomButton.innerHTML = '<i class="fa fa-search-plus"></i>';  
    zoomButton.onclick = () => openModalCallback(img.src);  
  
    const downloadButton = document.createElement('button');  
    downloadButton.innerHTML = '<i class="fa fa-download"></i>';  
    downloadButton.onclick = () => window.open(imageUrl, '_blank');  
  
    const regenerateButton = document.createElement('button');  
    regenerateButton.innerHTML = '<i class="fa fa-sync-alt"></i>';  
    regenerateButton.onclick = () => regenerateImageCallback(imageUrl);  
  
    options.appendChild(zoomButton);  
    options.appendChild(downloadButton);  
    options.appendChild(regenerateButton);  
  
    imageCard.appendChild(img);  
    imageCard.appendChild(options);  
    chatWindow.appendChild(imageCard);  
  
    chatWindow.scrollTop = chatWindow.scrollHeight;  
}  
  
export function renderPrompts(promptLibrary, promptDataArray, toggleCategoryCallback) {  
    promptLibrary.innerHTML = '';  
  
    if (promptDataArray.length === 0) {  
        promptLibrary.textContent = 'No prompts available.';  
        return;  
    }  
  
    const fragment = document.createDocumentFragment();  
  
    promptDataArray.forEach(promptData => {  
        const promptCategoryElement = document.createElement('div');  
        promptCategoryElement.className = 'prompt-category';  
  
        const categoryHeading = document.createElement('h3');  
        categoryHeading.className = 'category-heading';  
        categoryHeading.dataset.category = promptData.category;  
  
        const iconElement = document.createElement('i');  
        iconElement.className = "fa-solid fa-spinner fa-spin";  
        iconElement.title = promptData.category;  
  
        iconElement.addEventListener('click', (event) => {  
            event.stopPropagation();  
            toggleCategoryCallback(promptData.category);  
        });  
  
        categoryHeading.appendChild(iconElement);  
  
        const promptList = document.createElement('ul');  
        promptList.className = 'prompt-list';  
        promptList.id = promptData.category;  
        promptList.style.display = 'none';  
  
        promptData.prompts.forEach(prompt => {  
            const listItem = document.createElement('li');  
            listItem.textContent = prompt.promptName;  
            listItem.dataset.promptTitle = prompt.promptName;  
            listItem.dataset.promptDescription = prompt.content;  
            promptList.appendChild(listItem);  
        });  
  
        promptCategoryElement.appendChild(categoryHeading);  
        promptCategoryElement.appendChild(promptList);  
        fragment.appendChild(promptCategoryElement);  
    });  
  
    promptLibrary.appendChild(fragment);  
}  