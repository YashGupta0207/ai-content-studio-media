# Social Studio — Cuemath ◈

**Social Studio** is an AI-powered content generation platform designed for ed-tech social media strategists. It helps transform educational ideas or documents into engaging, high-performance social media posts, carousels, and stories.

![Project Preview]([https://via.placeholder.com/1200x600.png?text=Social+Studio+Preview+Placeholder](https://ai-content-studio-media.onrender.com/))

## 🚀 Features

-   **Multi-Format Generation**: Create Carousels (1:1), Stories (9:16), and Single Posts (1:1).
-   **Idea-to-Content**: Transform a simple text prompt into a structured multi-slide series.
-   **Document-to-Content**: Upload PDF or TXT files to automatically extract and reformat educational content.
-   **AI-Powered Copywriting**: Leverages GPT-4o-mini (via OpenRouter) with a specialized Cuemath brand voice.
-   **Visual Prompting**: Automatically generates detailed prompts for AI image generation (e.g., Midjourney/DALL-E) for each slide.
-   **Content Refinement**: Use the "Rewrite All" feature to adjust tone, length, or focus across all slides instantly.
-   **Export Ready**: One-click export for slide content.

## 🛠️ Tech Stack

-   **Frontend**: Vanilla HTML5, CSS3 (Modern UI with Syne & DM Sans typography), JavaScript (ES modules).
-   **Backend**: Node.js, Express.js.
-   **AI Layer**: Python, LangChain, OpenRouter API.
-   **Styling**: Premium aesthetics with a focus on usability and micro-animations.

## 📂 Project Structure

```bash
.
├── ai/                 # Python scripts for LangChain pipeline
├── backend/            # Express.js server and API routes
│   ├── routes/         # API endpoints (content, images, upload, export)
│   ├── uploads/        # Temporary storage for uploaded documents
│   └── utils/          # AI and utility helpers
├── frontend/           # Web interface (HTML, CSS, JS)
│   ├── components/     # Reusable UI components
│   └── utils/          # Frontend API helpers
└── README.md           # Project documentation
```

## ⚙️ Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   OpenRouter API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YashGupta0207/ai-content-studio-media.git
    cd ai-content-studio-media
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    OPENROUTER_API_KEY=your_api_key_here
    ```

3.  **Frontend Setup**:
    The frontend is served statically by the backend, or can be run independently using a local server.
    ```bash
    cd ../frontend
    # If using a separate server (optional):
    npx serve .
    ```

4.  **AI Dependencies**:
    ```bash
    pip install langchain-openai python-dotenv
    ```

## 🖥️ Running the App

1.  **Start the Backend**:
    ```bash
    cd backend
    npm start
    ```
2.  Open your browser and navigate to `http://localhost:5000`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Created by Yash Gupta for Cuemath*
