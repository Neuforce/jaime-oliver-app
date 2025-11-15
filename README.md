# Jamie Oliver App - Real-Time Chat

A complete real-time chat application built with Next.js 14, TypeScript and WebSockets.

## 🚀 Features

- **Real-Time Chat**: Instant communication using WebSockets
- **Workflow System**: Intelligent message processing
- **Modern Interface**: Responsive and intuitive UI with Tailwind CSS
- **TypeScript**: Static typing for greater robustness
- **Modular Architecture**: Reusable and well-organized components

## 🏗️ Architecture

```
[Chat Interface (Frontend)] <--WebSocket--> [UI Backend (Next.js API)] <--REST--> [Workflow System]
```

## 📁 Project Structure

```
jamie-oliver-app/
├── app/
│   ├── layout.tsx              # Main layout
│   ├── page.tsx                # Home page
│   ├── chat/
│   │   └── page.tsx            # Chat page
│   └── api/
│       ├── workflow/           # Workflow system API
│       │   ├── sendMessage/route.ts
│       │   ├── taskDone/route.ts
│       │   └── start/route.ts
│       ├── ui/                 # Interface API
│       │   ├── pushMessage/route.ts
│       │   └── session/create/route.ts
│       └── ws/route.ts         # Endpoint WebSocket
├── components/
│   ├── ui/                     # Base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── chat/                   # Chat components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageBubble.tsx
│   │   └── index.ts
│   └── layout/                 # Layout components
│       ├── Container.tsx
│       └── index.ts
├── hooks/
│   └── useChatSocket.ts        # WebSocket hook
├── lib/
│   ├── websocket.ts            # WebSocket management
│   ├── session.ts              # Session management
│   └── utils.ts                # Utilities
├── types/
│   └── chat.ts                 # TypeScript types
└── styles/
    └── globals.css             # Global styles
```

## 🛠️ Technologies Used

- **Next.js 14** with App Router
- **TypeScript** for static typing
- **Tailwind CSS** for styling
- **WebSockets** for real-time communication
- **React Hooks** for state management
- **UUID** for unique ID generation

## 📋 System Requirements

- **Node.js**: Version 18.18.0 or higher (recommended: 20.x)
- **npm**: Version 9.x or higher

## 🚀 Installation and Execution

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd jamier-oliver-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env.local` file and update it with your actual values:
   ```env
   # WebSocket Configuration (required for WebSocket connection)
   NEXT_PUBLIC_WS_ENDPOINT=wss://your-websocket-endpoint.com/ws
   
   # Optional: Server-side mock backend (for local development)
   EXTERNAL_BACKEND_WS_URL=ws://mock-backend:8080
   ```
   
   **Note**: Client-side variables (used in browser) must be prefixed with `NEXT_PUBLIC_`. Server-side variables (like `EXTERNAL_BACKEND_WS_URL`) do not need this prefix.

4. **Run in development mode**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## 🏃‍♂️ Available Scripts

- `npm run dev` - Run the application in development mode
- `npm run build` - Build the application for production
- `npm run start` - Run the application in production mode
- `npm run lint` - Run the code linter

## 💬 Chat Features

### User Interface
- **Home Page**: Application presentation with button to start chat
- **Chat Window**: Complete chat interface with message history
- **Message Input**: Text field with send button
- **Message Bubbles**: Different styles for user, agent and system

### Session Management
- **Unique Session ID**: Each conversation has a unique identifier (persistent via `useSessionId` hook)
- **Local Persistence**: Session is maintained in localStorage and persists across page reloads
- **Automatic Connection**: WebSocket connects automatically when sessionId is available
- **Automatic Reconnection**: Reconnection attempt in case of connection loss (exponential backoff, up to 8 attempts)

### Message Types
- **User Message**: Messages sent by the user
- **Agent Message**: Responses from the workflow system
- **System Message**: Notifications and system states

## ⚙️ Environment Variables

The application uses the following environment variables:

| Variable | Description | Example | Required | Used In |
|----------|-------------|---------|----------|---------|
| `NEXT_PUBLIC_WS_ENDPOINT` | Full WebSocket endpoint URL (complete URL including protocol and path) | `wss://api.example.com/ws` | No* | `hooks/useChatSocket.ts` |
| `EXTERNAL_BACKEND_WS_URL` | External backend WebSocket URL (server-side, for mock mode) | `ws://mock-backend:8080` | No | `lib/mockExternalBackend.ts` |

\* If `NEXT_PUBLIC_WS_ENDPOINT` is not set or set to `"disabled"`, WebSocket connection will be disabled (useful for local development with mock backend). The endpoint should be the complete WebSocket URL including the protocol (`wss://` or `ws://`) and full path.

**Note**: The `webapp/` subdirectory uses additional variables (`NEXT_PUBLIC_WS_TOKEN`, `NEXT_PUBLIC_WS_CHUNK_BYTES`) but these are not used by the main jamie-oliver-app.

**Important**: 
- Client-side variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Server-side variables (like `EXTERNAL_BACKEND_WS_URL`) do NOT need the `NEXT_PUBLIC_` prefix
- Create a `.env.local` file (not committed to git) for your local configuration
- Restart the dev server after changing environment variables

## 🔧 API Endpoints

### WebSocket
- `GET /api/ws?session_id=<id>` - WebSocket connection

### Workflow
- `POST /api/workflow/sendMessage` - Send message to workflow
- `POST /api/workflow/taskDone` - Mark task as completed
- `POST /api/workflow/start` - Start workflow

### UI
- `POST /api/ui/pushMessage` - Send message to UI
- `POST /api/ui/session/create` - Create new session

## 🎨 Customization

### Styles
Styles are defined in `app/globals.css` using Tailwind CSS. You can customize:
- Theme colors
- Animations
- Typography
- Spacing

### Components
All components are in the `components/` folder and are fully customizable:
- `Button` - Buttons with different variants
- `Input` - Input fields with validation
- `Container` - Responsive container
- `ChatWindow` - Main chat window
- `MessageBubble` - Message bubbles
- `MessageInput` - Input for writing messages

## 🐛 Troubleshooting

### Node.js Version Error
If you encounter the error "Node.js version not supported":
```bash
# Use nvm to change version
nvm install 20
nvm use 20
```

### WebSocket Issues
If WebSockets are not working correctly:
1. Verify that port 3000 is available
2. Check browser console for errors
3. Verify network/firewall configuration

### TypeScript Errors
If there are compilation errors:
```bash
npm run lint
```

## 📝 Development Notes

- The application is configured to work in development mode
- WebSockets are simulated to facilitate development
- The workflow system is a simulation that responds with predefined messages
- The application is fully responsive and works on mobile devices

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 👨‍💻 Author

Developed with ❤️ to demonstrate the capabilities of Next.js 14 and WebSockets.