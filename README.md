# Nova — Groq LLM Chatbot

Nova is a web-based AI chatbot powered by the **Groq API** and designed to be deployed on **Vercel**.

It uses the `llama-3.3-70b-versatile` model, keeps the Groq API key on the server as an environment variable, and stores chat history in the browser so the conversation survives page refreshes.

## Features

- LLM chatbot named **Nova**
- Groq API integration
- `llama-3.3-70b-versatile` model
- Persistent conversation memory using browser `localStorage`
- Clear Chat button
- Enter-to-send support
- Shift + Enter for multi-line messages
- Typing indicator
- Responsive dark UI
- Friendly API error handling
- API key never placed in frontend code

## Project Structure

```text
Nova/
├── api/
│   └── chat.js
├── index.html
├── style.css
├── script.js
├── package.json
└── README.md
```

> `chat.js` is placed inside the `api` folder because Vercel automatically treats files in `api/` as serverless functions.

## How It Works

1. The user enters a message in the Nova interface.
2. `script.js` saves the user's message to `localStorage`.
3. The frontend sends the conversation history to `/api/chat`.
4. `api/chat.js` reads `GROQ_API_KEY` from the server environment.
5. The server sends the conversation to Groq.
6. The Groq response is returned to the browser.
7. The assistant response is added to the saved conversation history.

The API key is therefore not exposed in the browser.

## Local Setup

### 1. Install Node.js

Use a recent Node.js version. The included `package.json` targets Node.js 22.x.

### 2. Install dependencies

```bash
npm install
```

### 3. Install and use Vercel CLI

The project uses Vercel's local development environment:

```bash
npm run dev
```

Vercel will provide a local URL, commonly similar to:

```text
http://localhost:3000
```

### 4. Add the Groq API key for local testing

For local development, use Vercel's environment-variable mechanism rather than placing the key in frontend code.

One convenient option is:

```bash
vercel env add GROQ_API_KEY development
```

Follow the prompts and enter your Groq API key when asked.

Alternatively, you can connect the project to a Vercel project and pull its development environment variables locally.

**Do not put the API key in `index.html`, `script.js`, `style.css`, or any committed source file.**

## Vercel Deployment

### 1. Push the project to GitHub

Create a repository and upload the project with this structure:

```text
api/chat.js
index.html
style.css
script.js
package.json
README.md
```

### 2. Import the GitHub repository into Vercel

Create a new Vercel project and select your GitHub repository.

### 3. Add the environment variable

In Vercel:

```text
Project Settings
→ Environment Variables
→ Add New
```

Add:

```text
Name: GROQ_API_KEY
Value: YOUR_GROQ_API_KEY
```

Apply it to the deployment environments you need, then redeploy.

### 4. Test the live site

Open the generated Vercel URL and test:

- Send a normal message.
- Ask a follow-up question to verify conversation context.
- Refresh the page and confirm the chat is still present.
- Click **Clear chat** and confirm the history is removed.

## Security

The Groq API key must remain private.

This project intentionally does **not** place the key in:

- `index.html`
- `script.js`
- `style.css`
- browser `localStorage`
- GitHub source code

Only the Vercel serverless function reads:

```js
process.env.GROQ_API_KEY
```

## Persistent Memory

Nova's persistent memory is implemented as browser-side conversation storage.

The chat history is stored under:

```text
nova_chat_history_v1
```

in `localStorage`.

This means the same browser can restore the conversation after a refresh or reopening the page. The memory is local to that browser/device; it is not an account-based cloud memory system.

The **Clear chat** button removes the saved history.

## Important Assignment Alignment

This implementation follows the assignment requirements for:

- Groq as the LLM provider
- Plain HTML/CSS/JavaScript frontend
- Vercel serverless backend
- API key stored as an environment variable
- Conversation-state handling
- Vercel deployment
- GitHub-ready source code

## Model

Nova uses:

```text
llama-3.3-70b-versatile
```

You can change the model ID in `api/chat.js` later if you choose another Groq-supported chat model.

## Troubleshooting

### `GROQ_API_KEY is not configured`

The Vercel project does not have the required environment variable. Add `GROQ_API_KEY` in Vercel Project Settings and redeploy.

### `Method not allowed`

The `/api/chat` endpoint expects a `POST` request from the frontend.

### Groq rate-limit or API errors

Groq can apply rate limits. Nova returns the API error as a friendly message to the browser instead of exposing the API key.

### Chat history is not persisting

Check that browser storage is enabled and that the site is not running in a privacy mode that blocks `localStorage`.

## Submission Checklist

Before submitting:

- [ ] GitHub repository is public or shared with the instructor.
- [ ] Vercel deployment is live.
- [ ] `GROQ_API_KEY` is set in Vercel.
- [ ] No API key is committed to GitHub.
- [ ] Chat sends and receives real Groq responses.
- [ ] Conversation survives a page refresh.
- [ ] Clear Chat works.
- [ ] Live URL works in an incognito/private browser window.

## Credits

Built with:

- HTML
- CSS
- JavaScript
- Groq API
- Vercel
