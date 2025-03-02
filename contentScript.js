// Detect browser type
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback for older browsers or if clipboard API fails
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

// Initialize Groq API client
const groqApiUrl = 'https://api.groq.com/openai/v1';

const groqClient = async (question) => {
    try {
        // Get the API key from storage
        const data = await new Promise((resolve) => {
            browserAPI.storage.sync.get('groqApiKey', resolve);
        });
        
        if (!data.groqApiKey) {
            throw new Error('Please set your Groq API key in the extension settings');
        }

        const response = await fetch(`${groqApiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${data.groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI Assistant. Given a question and its options, analyze and return ONLY the letter of the correct answer (A, B, C, or D) for multiple choice, or "True"/"False" for true/false questions. For definition questions, provide a detailed, clear definition.'
                    },
                    {
                        role: 'user',
                        content: `Question: ${question}\nPlease provide only the answer, no explanation.`
                    }
                ],
                temperature: 0.1,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const responseData = await response.json();
        
        if (!responseData || !responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
            throw new Error('Invalid response from API');
        }3000

        return responseData;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Function to get answer from Groq API
async function getAnswerFromGroq(question) {
    try {
        const result = await groqClient(question);
        return result.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error);
        return `Error: ${error.message}. Please make sure your API key is correct and try again.`;
    }
}

// Function to check if text is a word or compound word
function isWord(text) {
    const words = text.trim().split(/\s+/);
    // Check if it's a single word or a 2-3 word compound
    return words.length >= 1 && words.length <= 3;
}

// Function to check if text contains Finnish characters
function isFinnish(text) {
    const finnishChars = /[äöåÄÖÅ]/;
    return finnishChars.test(text);
}

// Function to get definition from Groq API
async function getDefinition(word) {
    try {
        // Always use Finnish prompt regardless of input word
        const prompt = `Määrittele suomeksi sana tai yhdyssana: "${word}". Anna vain yksityiskohtainen määritelmä suomeksi omin sanoin kirjoitettuna, ei muuta selitystä.`;

        const result = await groqClient(prompt);
        return result.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error getting definition:', error);
        return null;
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
    
    // Show loading state
    answerContainer.style.display = 'block';
    answerContainer.textContent = '...';
    
    let answer;
    // Check if it's a word or compound word
    if (isWord(selectedText)) {
        answer = await getDefinition(selectedText);
        // For definitions, just show "Done." but still copy to clipboard
        const cleanAnswer = answer.replace('Answer: ', '');
        await copyToClipboard(cleanAnswer);
        answerContainer.textContent = 'Done.';
        setTimeout(() => {
            answerContainer.style.display = 'none';
        }, 1000);
    } else {
        answer = await getAnswerFromGroq(selectedText);
        // For multiple choice/true-false questions, show the answer
        const cleanAnswer = answer.replace('Answer: ', '');
        answerContainer.textContent = cleanAnswer;
        await copyToClipboard(cleanAnswer);
        setTimeout(() => {
            answerContainer.style.display = 'none';
        }, 3000);
    }
}

// Initialize answer container
let answerContainer = createAnswerContainer();

// Function to handle key events for Firefox compatibility
function handleKeyEvent(event) {
    // Firefox-specific key detection
    const isZKey = (
        event.key?.toLowerCase() === 'z' ||
        event.code === 'KeyZ' ||
        event.which === 122 ||  // Firefox uses 122 for 'z'
        event.charCode === 122  // Firefox charCode
    );

    // Get selected text before preventing default
    const selectedText = window.getSelection().toString().trim();
    
    if (isZKey && selectedText.length > 0) {
        // Prevent default before async operation
        event.preventDefault();
        event.stopPropagation();
        
        // Call handleGetAnswer without await since we're in a non-async function
        handleGetAnswer().catch(console.error);
        
        // Return false to ensure the event is cancelled in Firefox
        return false;
    }
}

// Remove old event listeners if they exist
document.removeEventListener('keydown', handleKeyEvent, true);
document.removeEventListener('keypress', handleKeyEvent, true);

// Add event listeners specifically for Firefox
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
        
        // Show loading state
        answerContainer.style.display = 'block';
        answerContainer.textContent = '...';
        
        // Check if it's a single word or a question
        const processText = async () => {
            let answer;
            if (isWord(selectedText)) {
                answer = await getDefinition(selectedText);
            } else {
                answer = await getAnswerFromGroq(selectedText);
            }
            
            // Clean and display the answer
            const cleanAnswer = answer.replace('Answer: ', '');
            answerContainer.textContent = cleanAnswer;
            
            // Copy answer to clipboard
            await copyToClipboard(cleanAnswer);
            
            // Auto-hide after 2 seconds
            setTimeout(() => {
                answerContainer.style.display = 'none';
            }, 2000);
        };
        
        processText();
        return true;
    }
});
