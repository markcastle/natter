# 💬 Natter

Welcome to **Natter** — a modern, real-time chat app powered by NATS WebSockets and built for developer happiness!


---

## 🚀 Project Info

**URL**: https://lovable.dev/projects/dea4d901-b80f-42ae-8889-4fef2b0c213b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dea4d901-b80f-42ae-8889-4fef2b0c213b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

---

## 📝 Overview
Natter is a blazing-fast, developer-friendly chat app using [NATS](https://nats.io/) for real-time communication. It features:
- Dynamic topic-based chat rooms
- Modern UI (React + shadcn-ui + TailwindCSS)
- Robust, extensible codebase
- Hot reload & instant preview

## 🏗️ Architecture
- **Frontend:** React + Vite + TypeScript
- **Real-time layer:** NATS (WebSocket)
- **UI:** shadcn-ui, Tailwind CSS
- **State/Context:** React Context for NATS connection and chat state

## 🧠 How It Works
- Users join/leave rooms (topics) dynamically
- Each room maps to a NATS topic: `chat.<roomName>` (e.g., `chat.general`)
- Messages are published/subscribed in real time
- All logic is modular and testable

## 🗂️ Project Structure
```text
├── src/
│   ├── components/      # UI components (chat, sidebar, etc)
│   ├── contexts/        # React Contexts (NatsContext, etc)
│   ├── services/        # NATS client, subscription mgmt, message handling
│   ├── pages/           # App pages (Chat, Index, etc)
│   ├── index.css        # Tailwind + custom CSS
│   └── ...
├── public/              # Static assets
├── README.md            # This file
└── ...
```


## 🪄 NATS Topic Conventions
- All chat rooms are NATS topics: `chat.<room>` (e.g., `chat.general`, `chat.tech`)
- To create/join a room: subscribe to its topic
- To send a message: publish to the topic

## ⚙️ Environment Setup
1. **Clone & Install:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm i
   ```
2. **Start Dev Server:**
   ```sh
   npm run dev
   ```
3. **Connect to a NATS Server:**
   - Default: `wss://demo.nats.io:8443`
   - Or run your own NATS server with WebSocket enabled

## 🧑‍💻 Developer Workflow
- Edit code, save, see hot reload in browser
- All logic is modular and testable
- Use context hooks (`useNats`) for chat state and actions

## 🧪 Testing
- (Add your test strategy here! Recommend: Vitest/Jest for logic, React Testing Library for UI)
- Example:
  ```sh
  npm run test
  ```

## 🤝 Contributing
- Fork, branch, and PR!
- Follow best practices (modular code, clear naming, docstrings)
- Add/maintain tests for new features

## 🐞 Troubleshooting
- **Can't connect?** Check your NATS server URL and WebSocket port
- **UI not updating?** Make sure your context/provider is set up correctly
- **Auth errors?** Double-check credentials and NATS permissions

## ❓ FAQ
- **Q: Can I use a custom NATS server?**
  - Yes! Just set the server URL in the UI or code.
- **Q: How do I add a new room?**
  - Just type a new room name; Natter will subscribe/publish to `chat.<roomName>`.
- **Q: Is this production-ready?**
  - It's a great base for learning, prototyping, or extending for production.

---

## 🦄 Credits
- Built with ❤️ by the Natter community
- Powered by [NATS.io](https://nats.io/) and the open-source ecosystem

---

## 📖 Original Docs

```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚢 Deployment

Simply open [Lovable](https://lovable.dev/projects/dea4d901-b80f-42ae-8889-4fef2b0c213b) and click on Share -> Publish.

## 🌐 Custom Domains

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
