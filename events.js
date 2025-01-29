// events.js  
  
import { addMessage, showLoader, hideLoader, toggleCategory, createImageCard, renderPrompts } from './ui.js';  
import { callAzureOpenAI, fetchBlobsData, generateImage } from './api.js';  
import { messages, finalPrompt, selectedPrompt, awaitingFollowupResponse, awaitingImageExplanation, dynamicChatActive, dynamicChatQuestionCount, QUESTION_TOPICS, resetSessionState } from './state.js';  
import { icon_code_generation } from './utils.js';  
  
export async function setupEventListeners() {  
    const chatWindow = document.getElementById('chat-window');  
    const userInput = document.getElementById('user-input');  
    const sendButton = document.getElementById('send-button');  
    const promptLibrary = document.querySelector('.prompt-library');  
  
    promptLibrary.addEventListener('click', (event) => {  
        if (event.target && event.target.matches('.prompt-list li')) {  
            const item = event.target;  
            const promptTitle = item.getAttribute('data-prompt-title');  
            const promptDescription = item.getAttribute('data-prompt-description');  
            if (promptTitle && promptDescription) {  
                selectPrompt(promptDescription, chatWindow);  
            }  
        }  
    });  
  
    userInput.addEventListener('input', () => toggleSendButton(userInput, sendButton));  
  
    sendButton.addEventListener('click', () => sendMessage(userInput, chatWindow));  
  
    userInput.addEventListener('keypress', (event) => {  
        if (event.key === 'Enter') {  
            sendMessage(userInput, chatWindow);  
        }  
    });  
  
    document.getElementById('new-session-button').addEventListener('click', resetSessionState);  
  
    document.getElementById('direct-image-generation').addEventListener('change', async (event) => {  
        if (event.target.checked) {  
            const userInputValue = document.getElementById('user-input').value;  
            const conversationHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');  
  
            const prompt = `Based on the user's input "${userInputValue}" and our conversation "${conversationHistory}", generate a detailed image description that can be used for direct image generation. Ensure the description includes specific visual elements, styles, and any other relevant details to create a high-quality image.`;  
  
            const imageDescription = await callAzureOpenAI([  
                { role: "system", content: "You are an AI assistant that generates detailed image descriptions for direct image generation. Ensure the output is clear, concise, and includes specific visual elements and styles." },  
                { role: "user", content: prompt }  
            ], 750, 0.7);  
  
            if (imageDescription) {  
                console.log("Generated Image Description:", imageDescription);  
            } else {  
                console.error("Failed to generate image description.");  
            }  
        }  
    });  
  
    document.getElementById('options-menu-button').addEventListener('click', function() {  
        const dropdown = document.querySelector('.dropdown-content');  
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';  
    });  
  
    document.querySelector('.close').addEventListener('click', () => {  
        document.getElementById('image-modal').style.display = 'none';  
    });  
  
    window.addEventListener('click', (event) => {  
        if (event.target === document.getElementById('image-modal')) {  
            document.getElementById('image-modal').style.display = 'none';  
        }  
    });  
  
    document.getElementById('image-upload').addEventListener('change', async (event) => {  
        const file = event.target.files[0];  
        if (file) {  
            const reader = new FileReader();  
            reader.onload = async () => {  
                const base64Image = reader.result.split(',')[1];  
                showLoader(chatWindow);  
                const explanation = await getImageExplanation(base64Image);  
                hideLoader();  
                if (explanation && !explanation.includes("Failed")) {  
                    addMessage(chatWindow, "assistant", explanation);  
                    finalPrompt = explanation;  
                    awaitingImageExplanation = true;  
                } else {  
                    addMessage(chatWindow, "assistant", "Failed to get image explanation.");  
                }  
            };  
            reader.readAsDataURL(file);  
        }  
    });  
  
    document.getElementById('theme-toggle-button').addEventListener('click', () => {  
        document.body.classList.toggle('dark-theme');  
        const isDarkTheme = document.body.classList.contains('dark-theme');  
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');  
    });  
  
    window.addEventListener('DOMContentLoaded', () => {  
        const savedTheme = localStorage.getItem('theme');  
        if (savedTheme === 'dark') {  
            document.body.classList.add('dark-theme');  
        }  
    });  
  
    await loadPrompts(promptLibrary);  
}  
  
function toggleSendButton(userInput, sendButton) {  
    sendButton.style.display = userInput.value.trim() === '' ? 'none' : 'block';  
}  
  
async function loadPrompts(promptLibrary) {  
    try {  
        const blobs = await fetchBlobsFromAzure();  
        const blobNames = blobs.map(blob => blob.name);  
        const blobsData = await fetchBlobsData(blobNames);  
  
        renderPrompts(promptLibrary, blobsData, toggleCategory);  
  
        blobsData.forEach(async (promptData) => {  
            const iconClass = await icon_code_generation(promptData.category);  
            const categoryHeading = document.querySelector(`[data-category="${promptData.category}"] i`);  
            if (categoryHeading) {  
                categoryHeading.className = iconClass;  
            }  
        });  
    } catch (error) {  
        console.error('Error fetching prompts:', error);  
    }  
}  
  
async function fetchBlobsFromAzure() {  
    const storageAccountName = 'promptfreefinal';  
    const containerName = 'prompt-lib';  
    const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';  
    const listUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;  
  
    const response = await fetch(listUrl);  
    if (!response.ok) {  
        throw new Error(`Failed to fetch blob list: ${response.statusText}`);  
    }  
  
    const text = await response.text();  
    const parser = new DOMParser();  
    const xmlDoc = parser.parseFromString(text, "application/xml");  
    const blobs = Array.from(xmlDoc.getElementsByTagName("Blob")).map(blob => {  
        return {  
            name: blob.getElementsByTagName("Name")[0].textContent  
        };  
    });  
  
    return blobs;  
}
