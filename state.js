// state.js  
  
export let messages = [];  
export let finalPrompt = null;  
export let selectedPrompt = null;  
export let awaitingFollowupResponse = false;  
export let awaitingImageExplanation = false;  
export let dynamicChatActive = false;  
export let dynamicChatQuestionCount = 0;  
export const QUESTION_TOPICS = ["colors", "textures", "shapes", "lighting", "depth", "style"];  
export const promptCache = new Map();  
export const iconCache = {};  
  
export function resetSessionState() {  
    messages = [];  
    finalPrompt = null;  
    selectedPrompt = null;  
    awaitingFollowupResponse = false;  
    awaitingImageExplanation = false;  
    dynamicChatActive = false;  
    dynamicChatQuestionCount = 0;  
}  