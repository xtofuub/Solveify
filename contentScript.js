// Detect browser type
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        textArea.remove();
    }
}

// Create a floating answer container
function createAnswerContainer() {
    const container = document.createElement('div');
    container.id = 'answer-container';
    container.style.cssText = `
        position: fixed;
        bottom: 5px;
        left: 5px;
        background-color: rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.4);
        padding: 3px 5px;
        border-radius: 2px;
        z-index: 10000;
        max-width: 100px;
        font-family: Arial, sans-serif;
        font-size: 10px;
        display: none;
        backdrop-filter: blur(1px);
        pointer-events: none;
        user-select: none;
        text-shadow: none;
        letter-spacing: -0.2px;
    `;
    document.body.appendChild(container);
    return container;
}

// Initialize Gemini API client
const geminiClient = async (question, instruction) => {
    try {
        const data = await new Promise((resolve) => {
            browserAPI.storage.sync.get('geminiApiKey', resolve);
        });
        
        if (!data.geminiApiKey) {
            throw new Error('Please set your Gemini API key in the extension settings');
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${data.geminiApiKey}`;

        const requestBody = {
            contents: [{
                role: 'user',
                parts: [{ text: instruction + question }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 150
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const responseData = await response.json();
        
        if (!responseData || !responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
            throw new Error('Invalid response from API');
        }

        return responseData.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Function to get answer from Gemini API
async function getAnswerFromGemini(question) {
    try {
        const instruction = 'You are a helpful AI Assistant. Given a question and its options, analyze and return ONLY the letter of the correct answer (A, B, C, or D) for multiple choice, or "True"/"False" for true/false questions. For definition questions, provide a detailed, clear definition. Do not provide any explanation.';
        const result = await geminiClient(question, instruction);
        return result;
    } catch (error) {
        console.error('Error:', error);
        return `Error: ${error.message}`;
    }
}

// Function to check if text is a word or compound word
function isWord(text) {
    const words = text.trim().split(/\s+/);
    return words.length >= 1 && words.length <= 3;
}

// Function to get definition from Gemini API
async function getDefinition(word) {
    try {
        const instruction = `Määrittele suomeksi sana tai yhdyssana: "${word}". Anna vain yksityiskohtainen määritelmä suomeksi omin sanoin kirjoitettuna, ei muuta selitystä.`;
        const result = await geminiClient(word, instruction);
        return result;
    } catch (error) {
        console.error('Error getting definition:', error);
        return `Error: ${error.message}`;
    }
}

// Function to handle getting answer for selected text
async function handleGetAnswer() {
    const selectedText = window.getSelection().toString().trim();
    
    if (!selectedText || selectedText.length === 0) {
        answerContainer.style.display = 'block';
        answerContainer.textContent = 'Select text';
        setTimeout(() => {
            answerContainer.style.display = 'none';
        }, 1500);
        return;
    }
    
    answerContainer.style.display = 'block';
    answerContainer.textContent = '...';
    
    let answer;
    try {
        if (isWord(selectedText)) {
            answer = await getDefinition(selectedText);
        } else {
            answer = await getAnswerFromGemini(selectedText);
        }
        
        if (answer.startsWith('Error:')) {
            answerContainer.textContent = answer;
            setTimeout(() => {
                answerContainer.style.display = 'none';
            }, 5000);
            return;
        }

        const cleanAnswer = answer;
        
        if (isWord(selectedText)) {
            answerContainer.textContent = 'Done.';
            await copyToClipboard(cleanAnswer);
            setTimeout(() => {
                answerContainer.style.display = 'none';
            }, 1000);
        } else {
            answerContainer.textContent = cleanAnswer;
            await copyToClipboard(cleanAnswer);
            setTimeout(() => {
                answerContainer.style.display = 'none';
            }, 3000);
        }

    } catch (error) {
        answerContainer.textContent = `API Error: ${error.message}`;
        setTimeout(() => {
            answerContainer.style.display = 'none';
        }, 5000);
    }
}

// Initialize answer container
let answerContainer = createAnswerContainer();

// Function to handle key events
function handleKeyEvent(event) {
    const isZKey = (
        event.key?.toLowerCase() === 'z' ||
        event.code === 'KeyZ' ||
        event.which === 122 ||
        event.charCode === 122
    );

    const selectedText = window.getSelection().toString().trim();
    
    if (isZKey && selectedText.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        handleGetAnswer().catch(console.error);
        return false;
    }
}

// Remove old event listeners if they exist
document.removeEventListener('keydown', handleKeyEvent, true);
document.removeEventListener('keypress', handleKeyEvent, true);

// Add event listeners specifically for Firefox and Chrome
document.addEventListener('keypress', handleKeyEvent, true);
document.addEventListener('keydown', handleKeyEvent, true);

// Listen for messages from background script (for right-click menu)
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "answerQuestion") {
        const selectedText = request.selectedText;
        
        if (!selectedText || selectedText.trim().length === 0) {
            answerContainer.style.display = 'block';
            answerContainer.textContent = 'Select text';
            setTimeout(() => {
                answerContainer.style.display = 'none';
            }, 1500);
            return;
        }
        
        answerContainer.style.display = 'block';
        answerContainer.textContent = '...';
        
        const processText = async () => {
            let answer;
            try {
                if (isWord(selectedText)) {
                    answer = await getDefinition(selectedText);
                } else {
                    answer = await getAnswerFromGemini(selectedText);
                }

                if (answer.startsWith('Error:')) {
                    answerContainer.textContent = answer;
                    setTimeout(() => {
                        answerContainer.style.display = 'none';
                    }, 5000);
                    return;
                }

                const cleanAnswer = answer;
                answerContainer.textContent = cleanAnswer;
                await copyToClipboard(cleanAnswer);
                setTimeout(() => {
                    answerContainer.style.display = 'none';
                }, 2000);

            } catch (error) {
                answerContainer.textContent = `API Error: ${error.message}`;
                setTimeout(() => {
                    answerContainer.style.display = 'none';
                }, 5000);
            }
        };
        
        processText();
        return true;
    }
});