import { callAzureOpenAI } from './api.js';  
import { iconCache } from './state.js';  
import { iconMappings } from './server.js';  
  
export async function icon_code_generation(iconPreference) {  
    if (iconCache[iconPreference]) {  
        return iconCache[iconPreference];  
    }  
  
    const predefinedIcons = iconMappings.reduce((acc, category) => {  
        acc[category.category] = category.iconClass;  
        return acc;  
    }, {});
  
    if (predefinedIcons[iconPreference]) {  
        iconCache[iconPreference] = predefinedIcons[iconPreference];  
        return predefinedIcons[iconPreference];  
    }  
  
    const prompt = `Suggest a FontAwesome icon class based on the user's preference: "${iconPreference}". The icon should be represented as a free FontAwesome class in the format: "fa-solid fa-icon-name".`;  
  
    try {  
        const response = await callAzureOpenAI([{ role: "user", content: prompt }], 50, 0.5);  
        if (response?.choices?.[0]?.message?.content) {  
            const suggestedIcon = response.choices[0].message.content.trim();  
            const validIconFormat = /^fa-solid fa-[\w-]+$/;  
            if (validIconFormat.test(suggestedIcon)) {  
                iconCache[iconPreference] = suggestedIcon;  
                return suggestedIcon;  
            }  
        }  
    } catch (error) {  
        console.error('Error during icon generation:', error);  
    }  
  
    for (const category of iconMappings) {  
        if (iconPreference.toLowerCase().includes(category.category.toLowerCase())) {  
            iconCache[iconPreference] = category.iconClass;  
            return category.iconClass;  
        }  
    }  
  
    iconCache[iconPreference] = "fa-solid fa-info-circle";  
    return "fa-solid fa-info-circle";  
}
