# Questify (Stealth version)

**Questify** is a browser extension that simplifies the process of answering questions. By leveraging the **Gemini API**, it allows users to quickly analyze highlighted questions and retrieve accurate answers, making knowledge acquisition effortless.

![original-7c3852b08e60261f29f0fc3a3776da6f\_jpg](https://github.com/user-attachments/assets/4f0795c5-81a9-4b49-9a65-ccca129fe8e9)

## Features

* **Quick Answer Retrieval**: Highlight a question and get instant answers.
* **Multiple Choice Support**: Works seamlessly with multiple-choice questions.
* **Definition Lookup**: Provides clear definitions for single-word queries.
* **User-Friendly Interface**: Simple and intuitive design for easy navigation.
* **Keyboard Shortcut**: Use "z" to automatically answer the highlighted task.
* **Stealth**: The answer is hard to see, making it easy to use discreetly (the answer will appear in the bottom left corner).

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/xtofuub/Solveify.git
   ```
2. Extract the ZIP.
3. Load the extension in your browser:

   * For Chrome: Go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the project directory.
   * For Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `manifest.json` file.

## Usage

1. Highlight a question or word on any webpage.
2. Right-click and select **"Get answer to this question"**.
3. Questify will analyze the text and display the answer.
4. It also has a built-in shortcut using **"z"** to automatically answer the task.
5. The answer will appear at the bottom left corner, barely visible so others cannot notice.

## How to Create a Gemini API Key

Follow these steps to generate your Gemini API key:

1. **Visit the Gemini API Console**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Log In**: Use your Google account to sign in.
3. **Create a New API Key**: Click on **Create API Key** and choose the project to link it to.
4. **Copy Your API Key**: Make sure to copy and store your key securely.
5. **Manage Your API Keys**: You can view, revoke, or regenerate API keys in the console anytime.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

* [Gemini API](https://ai.google.dev/) for providing the question-answering capabilities.
* Inspiration from various browser extensions that enhance user experience.

---

