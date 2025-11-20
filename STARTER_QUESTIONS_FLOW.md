# Starter Questions Flow

## 📋 Descripción

Los **Starter Questions** son las preguntas predefinidas en la página principal que el usuario puede seleccionar para iniciar una conversación.

## 🎯 Starter Questions Disponibles

```typescript
const STARTER_QUESTIONS = [
  'I feel like pasta',
  'Something healthy',
  'Quick 15-minute meal',
  'Dessert ideas',
];
```

---

## 🔄 Flujo Completo

### 1️⃣ Usuario hace clic en "I feel like pasta"

**Ubicación:** `app/page.tsx`

```typescript
<button onClick={() => beginChat(q)}>
  {q}  // "I feel like pasta"
</button>
```

---

### 2️⃣ Se navega a la página de chat con query parameter

```typescript
const beginChat = async (starter?: string) => {
  createNewSession();
  await new Promise(r => setTimeout(r, 100));
  if (starter) {
    router.push(`/chat?starter=${encodeURIComponent(starter)}`);
  }
};
```

**URL resultante:**
```
/chat?starter=I%20feel%20like%20pasta
```

---

### 3️⃣ La página de chat carga el mensaje inicial

**Ubicación:** `app/chat/page.tsx` líneas 80-92

```typescript
const starter = searchParams.get('starter');

if (starter) {
  // Crea un mensaje inicial del usuario
  const initial: ChatMessage[] = [
    {
      type: 'message',
      sender: 'user',
      session_id: sessionId,
      content: starter,  // ← "I feel like pasta"
      timestamp: new Date().toISOString(),
    },
  ];
  setInitialMessages(initial);
}
```

**Resultado:** El mensaje "I feel like pasta" aparece inmediatamente en el chat como mensaje del usuario.

---

### 4️⃣ WebSocket se conecta

```typescript
useEffect(() => {
  // ... inicialización del WebSocket
  const client = new WsClient({
    endpoint: wsEndpoint,
    token: process.env.NEXT_PUBLIC_WS_TOKEN,
    sessionId
  });
  
  client.connect();
}, [sessionId]);
```

---

### 5️⃣ Se solicitan recetas al backend vía WebSocket

**Ubicación:** `app/chat/page.tsx` líneas 103-111

```typescript
useEffect(() => {
  const starter = searchParams.get('starter');
  if (starter && isConnected && sessionId) {
    setTimeout(() => {
      console.log('[ChatPage] Requesting recipes from backend for:', starter);
      getRecipes();  // ← Solicita recetas directamente
    }, 500);
  }
}, [isConnected, searchParams, sessionId, getRecipes]);
```

**Acción enviada al WebSocket:**

```json
{
  "action": "getrecipes",
  "payload": ""
}
```

---

### 6️⃣ Backend responde con lista de recetas

```json
{
  "type": "response",
  "messageType": "recipes_list",
  "payload": {
    "recipes": {
      "workflows": [
        {
          "id": "workflow-123",
          "name": "Spaghetti Carbonara",
          "description": "Classic Italian pasta dish",
          "imageUrl": "https://..."
        },
        // ... más recetas
      ],
      "count": 5
    }
  },
  "metadata": {
    "timestamp": "2025-11-20T10:30:00Z"
  }
}
```

---

### 7️⃣ Frontend muestra el acordeón de recetas

**Ubicación:** `hooks/useChatSocket.ts`

```typescript
// Líneas 169-197
if (message.type === 'response' && message.messageType === 'recipes_list') {
  const recipes: RecipeItem[] = payload.recipes.workflows.map(transformWorkflowToRecipeItem);
  
  const chatMessage: ChatMessage = {
    type: 'recipeList',
    sender: 'agent',
    session_id: sessionId,
    content: `Found ${payload.recipes.count} recipes`,
    timestamp,
    recipes,
  };
  setMessages(prev => [...prev, chatMessage]);
}
```

**Resultado en UI:** Acordeón con las tarjetas de recetas directamente.

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│ PÁGINA PRINCIPAL (app/page.tsx)                                │
│                                                                 │
│  [I feel like pasta]  [Something healthy]  [Quick 15-min meal]│
│         ↓                                                       │
│    onClick: beginChat("I feel like pasta")                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ NAVEGACIÓN                                                      │
│                                                                 │
│  router.push('/chat?starter=I%20feel%20like%20pasta')         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ PÁGINA DE CHAT (app/chat/page.tsx)                            │
│                                                                 │
│  1. Lee starter desde URL params (pero no lo muestra)         │
│  2. Conecta WebSocket                                          │
│  3. Envía: action='getrecipes', payload=''                    │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ WEBSOCKET CLIENT (lib/wsClient.ts)                            │
│                                                                 │
│  ws.send(JSON.stringify({                                      │
│    action: 'getrecipes',                                       │
│    payload: ''                                                 │
│  }))                                                           │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (AWS Lambda / Workflow Engine)                        │
│                                                                 │
│  - Recibe action='getrecipes'                                  │
│  - Busca recetas disponibles                                   │
│  - Responde con lista de recetas                              │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPUESTA WEBSOCKET                                            │
│                                                                 │
│  messageType: 'recipes_list'                                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ HOOK useChatSocket (hooks/useChatSocket.ts)                   │
│                                                                 │
│  - handleIncoming() procesa el mensaje                         │
│  - Actualiza estado de messages                                │
│  - Guarda en localStorage                                      │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ UI (components/chat/ChatWindow.tsx)                            │
│                                                                 │
│  - Renderiza RecipeAccordion con las recetas                  │
│  - NO muestra mensajes de usuario ni texto del agente         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🆚 Comparación: Antes vs Ahora

### ❌ ANTES (Incorrecto)

```
Usuario hace clic en "I feel like pasta"
   ↓
Se navega a /chat?starter=I%20feel%20like%20pasta
   ↓
Mensaje aparece en UI como mensaje del usuario
   ↓
WebSocket envía: action='getrecipes', payload=''
   ↓
❌ Backend NO sabe qué tipo de recetas buscar
❌ El texto "I feel like pasta" NO se envía
```

### ✅ AHORA (Correcto)

```
Usuario hace clic en "I feel like pasta"
   ↓
Se navega a /chat?starter=I%20feel%20like%20pasta
   ↓
WebSocket se conecta
   ↓
WebSocket envía: action='getrecipes', payload=''
   ↓
✅ Backend responde con lista de recetas
✅ Frontend muestra acordeón de recetas directamente
✅ Sin mensajes intermedios, directo a las recetas
```

---

## 🔑 Puntos Clave

1. **Se solicitan recetas directamente** usando la acción `getrecipes`
2. **NO se muestra mensaje del usuario** - vamos directo al acordeón
3. **El backend responde con recipes_list** con las recetas disponibles
4. **El mismo flujo funciona** para starter questions y para texto escrito manualmente
5. **Delay de 500ms** para asegurar que el WebSocket esté conectado antes de enviar

---

## 🧪 Testing

Para verificar que funciona correctamente:

1. Abre la consola del navegador
2. Haz clic en "I feel like pasta"
3. Deberías ver el log:
   ```
   [ChatPage] Requesting recipes from backend for: I feel like pasta
   [useChatSocket] Requesting recipes from backend...
   ```
4. El WebSocket debería enviar:
   ```json
   {
     "action": "getrecipes",
     "payload": ""
   }
   ```
5. El frontend debería mostrar el acordeón de recetas directamente

---

**Última actualización:** 2025-11-20

