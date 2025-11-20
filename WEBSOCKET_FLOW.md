# WebSocket Flow - Actions & Message Types

## Resumen del Flujo de Comunicación

Este documento describe las **acciones** que enviamos al backend y los **messageTypes** que recibimos como respuesta.

---

## 1. ACCIONES QUE ENVIAMOS (Frontend → Backend)

Todas las acciones se envían a través de `wsRef.current.sendJson()` en el hook `useChatSocket.ts`.

### 1.1 `sendtext`
**Ubicación:** `useChatSocket.ts` líneas 538-577

```typescript
const sendMessage = useCallback(async (content: string) => {
  const out = {
    action: 'sendtext' as const,
    payload: { message: content }
  };
  wsRef.current.sendJson(out);
}, [isConnected, sessionId]);
```

**Propósito:** Enviar un mensaje de texto genérico al agente AI.

**Payload:** 
```typescript
{
  message: string  // El texto del mensaje del usuario
}
```

**Cuándo se usa:** 
- Cuando el usuario escribe un mensaje en el chat
- Para preguntas generales, solicitudes de ayuda, etc.

---

### 1.2 `getrecipes`
**Ubicación:** `useChatSocket.ts` líneas 665-685

```typescript
const getRecipes = useCallback(() => {
  const out = {
    action: 'getrecipes' as const,
    payload: ''
  };
  wsRef.current.sendJson(out);
}, [isConnected]);
```

**Propósito:** Solicitar la lista de recetas disponibles al backend.

**Payload:** String vacío

**Cuándo se usa:** 
- Al cargar la página de chat con un starter message
- Cuando el usuario solicita ver recetas

---

### 1.3 `getrecipe`
**Ubicación:** `useChatSocket.ts` líneas 687-707

```typescript
const getRecipe = useCallback((workflowId: string) => {
  const out = {
    action: 'getrecipe' as const,
    payload: { workflowId }
  };
  wsRef.current.sendJson(out);
}, [isConnected]);
```

**Propósito:** Solicitar los detalles completos de una receta específica.

**Payload:** 
```typescript
{
  workflowId: string  // ID del workflow de la receta
}
```

**Cuándo se usa:**
- Cuando el usuario hace clic en "View Recipe" en una tarjeta de receta
- Al expandir una receta para ver ingredientes, pasos, etc.

---

### 1.4 `startrecipe`
**Ubicación:** `useChatSocket.ts` líneas 709-729

```typescript
const startRecipe = useCallback((workflowId: string) => {
  const out = {
    action: 'startrecipe' as const,
    payload: { workflowId }
  };
  wsRef.current.sendJson(out);
}, [isConnected]);
```

**Propósito:** Iniciar la ejecución de una receta (comenzar a cocinar).

**Payload:**
```typescript
{
  workflowId: string  // ID del workflow a iniciar
}
```

**Cuándo se usa:**
- Cuando el usuario hace clic en "Start cooking" en una receta
- Inicia la sesión de cocina con el backend

---

### 1.5 `taskdone`
**Ubicación:** `useChatSocket.ts` líneas 731-751

```typescript
const taskDone = useCallback((taskId: string) => {
  const out = {
    action: 'taskdone' as const,
    payload: { taskId }
  };
  wsRef.current.sendJson(out);
}, [isConnected]);
```

**Propósito:** Marcar una tarea/paso como completado durante la cocina.

**Payload:**
```typescript
{
  taskId: string  // ID de la tarea completada
}
```

**Cuándo se usa:**
- Cuando el usuario marca un paso de la receta como completado
- Avanza al siguiente paso en el flujo de cocina

---

## 2. MESSAGE TYPES QUE RECIBIMOS (Backend → Frontend)

Todos los messageTypes se procesan en la función `handleIncoming` (líneas 151-435).

### 2.1 `text`
**Ubicación:** `useChatSocket.ts` líneas 311-340

```typescript
if (message.type === 'response' && message.messageType === 'text' && message.payload) {
  const payload = message.payload as { 
    message: string; 
    conversationId: string | null 
  };
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'text',
  payload: {
    message: string,
    conversationId: string | null
  },
  metadata: {
    timestamp: string,
    source: string
  }
}
```

**Ejemplo de respuesta:**
```json
{
  "type": "response",
  "messageType": "text",
  "payload": {
    "message": "Crack a few eggs into a bowl, add a pinch of salt, and whisk until combined. Heat a non-stick pan over medium-low heat, add a little butter, then pour in the eggs. Stir gently with a spatula until just set but still creamy. Enjoy!",
    "conversationId": null
  },
  "metadata": {
    "timestamp": "2025-11-08T04:50:15.707217Z",
    "source": "ai-agent"
  }
}
```

**Qué hace:**
1. Extrae el mensaje de texto del payload
2. Crea un ChatMessage de tipo 'message' con sender 'agent'
3. Agrega el mensaje al estado
4. Guarda en localStorage
5. Llama al callback `onMessage`
6. Detiene el indicador de carga (`setIsLoading(false)`)

**Responde a:** Acción `sendtext`

---

### 2.2 `recipes_list`
**Ubicación:** `useChatSocket.ts` líneas 169-197

```typescript
if (message.type === 'response' && message.messageType === 'recipes_list' && message.payload) {
  const payload = message.payload as { 
    recipes: { 
      workflows: RecipeWorkflow[]; 
      count: number 
    } 
  };
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'recipes_list',
  payload: {
    recipes: {
      workflows: RecipeWorkflow[],
      count: number
    }
  },
  metadata: {
    timestamp: string
  }
}
```

**Qué hace:**
1. Transforma workflows a RecipeItems usando `transformWorkflowToRecipeItem()`
2. Crea un ChatMessage de tipo 'recipeList'
3. Agrega el mensaje al estado
4. Guarda en localStorage
5. Llama al callback `onMessage`

**Responde a:** Acción `getrecipes`

---

### 2.3 `recipe_detail`
**Ubicación:** `useChatSocket.ts` líneas 200-251

```typescript
if (message.type === 'response' && message.messageType === 'recipe_detail' && message.payload) {
  const payload = message.payload as { 
    recipe: RecipeDetail; 
    workflowId: string 
  };
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'recipe_detail',
  payload: {
    recipe: RecipeDetail,
    workflowId: string
  },
  metadata: {
    timestamp: string
  }
}
```

**Qué hace:**
1. Transforma RecipeDetail a RecipeItem usando `transformRecipeDetailToRecipeItem()`
2. Actualiza la receta existente en el mensaje recipeList (match por workflowId o title)
3. Crea un mensaje standalone con los detalles de la receta
4. Guarda en localStorage
5. Llama al callback `onMessage`

**Responde a:** Acción `getrecipe`

---

### 2.4 `recipe_started`
**Ubicación:** `useChatSocket.ts` líneas 254-308

```typescript
if (message.type === 'response' && message.messageType === 'recipe_started' && message.payload) {
  const payload = message.payload as {
    action: 'startrecipe';
    status: 'success' | 'error';
    requestId: string;
    workflowId: string;
    data?: any;
    error?: string;
  };
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'recipe_started',
  payload: {
    action: 'startrecipe',
    status: 'success' | 'error',
    requestId: string,
    workflowId: string,
    data?: any,  // Información de la sesión de cocina
    error?: string
  },
  metadata: {
    timestamp: string
  }
}
```

**Qué hace:**
- **Si status === 'success':**
  1. Crea un mensaje de status tipo 'system' con emoji 🚀
  2. Agrega "Recipe started successfully! Ready to cook."
  3. Si hay `data`, registra información de la sesión de cocina
  4. Guarda en localStorage

- **Si status === 'error':**
  1. Crea un mensaje de error con emoji ❌
  2. Muestra el error al usuario
  3. Llama al callback `onError`

**Responde a:** Acción `startrecipe`

---

### 2.5 `scheduled_task`
**Ubicación:** `useChatSocket.ts` líneas 341-390

```typescript
if (message.type === 'response' && message.messageType === 'scheduled_task' && message.payload) {
  const payload = message.payload as {
    sessionId: string;
    taskId: string;
    type: string;
    name: string;
    metadata?: {
      category?: string;
      priority?: string;
      checkPoints?: string[];
      detailedDescription?: string;
    };
    next?: string[];
    description?: string;
  };
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'scheduled_task',
  payload: {
    sessionId: string,
    taskId: string,
    type: string,  // e.g., "immediate"
    name: string,  // e.g., "Check Mussels"
    metadata?: {
      category?: string,
      priority?: string,
      checkPoints?: string[],
      detailedDescription?: string  // Markdown formatted
    },
    next?: string[],  // Array de taskIds siguientes
    description?: string
  },
  metadata: {
    timestamp: string,
    source: string
  }
}
```

**Ejemplo de respuesta:**
```json
{
  "type": "response",
  "messageType": "scheduled_task",
  "payload": {
    "sessionId": "34a863c8-3635-4c54-a2da-c9e3c7960302",
    "taskId": "task_006",
    "type": "immediate",
    "name": "Check Mussels",
    "metadata": {
      "category": "cooking",
      "priority": "high",
      "checkPoints": [
        "Mussels are heated through",
        "Sauce is aromatic and steamy"
      ],
      "detailedDescription": "# Check Mussels\n\nYour 5 minutes are up - let's check on those mussels!\n\n**What to look for:**\n- The mussels should be **heated through** - steaming hot\n- The sauce should be **aromatic** - you'll smell the garlic, tomato, and seafood\n- Everything should look glossy and delicious\n\n**Next step:**\n- **Remove the pan from the heat**\n- Keep the lid on to keep everything warm while you finish the pasta\n- Your sauce is done and ready to toss with the pasta!\n\n**Timing check:** Your pasta should be just about done by now - perfect timing!"
    },
    "next": ["task_008"],
    "description": "Timer for mussel cooking completion"
  },
  "metadata": {
    "timestamp": "2025-10-31T21:08:53.996552",
    "source": "workflow-engine"
  }
}
```

**Qué hace:**
1. Extrae la información de la tarea programada del payload
2. Crea un ChatMessage de tipo 'message' con sender 'system'
3. Formatea el contenido con emoji ⏰ y el nombre de la tarea
4. Incluye la descripción detallada (con formato Markdown si está disponible)
5. Agrega el mensaje al estado
6. Guarda en localStorage
7. Llama al callback `onMessage`
8. Registra los check points y next tasks en consola para debugging

**Responde a:** **Ninguna acción** - Es disparado automáticamente por el backend cuando un timer programado se completa.

**Uso típico:** 
- Notificar al usuario cuando debe revisar la comida
- Recordatorios de pasos críticos durante la cocción
- Avisos de tiempo cumplido para pasos con duración específica

---

### 2.6 `task_done`
**Ubicación:** `useChatSocket.ts` líneas 311-359

```typescript
if (message.type === 'response' && message.messageType === 'task_done' && message.payload) {
  const payload = message.payload as TaskDonePayload;
  // ... procesamiento
}
```

**Formato del mensaje:**
```typescript
{
  type: 'response',
  messageType: 'task_done',
  payload: {
    status: 'success' | 'error',
    taskId: string,
    data?: {
      nextTasks?: Array<{
        name: string;
        id: string;
        // ... otros campos de la tarea
      }>;
    }
  },
  metadata: {
    timestamp: string
  }
}
```

**Qué hace:**
- **Si status === 'success':**
  1. Crea un mensaje de status con el nombre de la tarea completada
  2. Si hay `nextTasks`, muestra cuál es el siguiente paso
  3. Si no hay más tareas, muestra "Recipe completed!"
  4. Registra las próximas tareas disponibles
  5. Guarda en localStorage

- **Si status === 'error':**
  1. Crea un mensaje de error
  2. Llama al callback `onError`

**Responde a:** Acción `taskdone`

---

### 2.7 `message` (Legacy Format)
**Ubicación:** `useChatSocket.ts` líneas 362-404

```typescript
if (message.type === 'message' && message.data) {
  // Procesamiento de formato legacy
}
```

**Formato del mensaje:**
```typescript
{
  type: 'message',
  data: ChatMessage | PushMessage
}
```

**Qué hace:**
1. Detecta si el `data` tiene el formato de ChatMessage o PushMessage
2. Normaliza a ChatMessage si es necesario
3. Agrega el mensaje al estado
4. Guarda en localStorage
5. Llama al callback `onMessage`

**Propósito:** Compatibilidad con mensajes antiguos del backend.

---

## 3. EVENT HANDLER PRINCIPAL

El event handler es la función `handleIncoming` que se registra en el WebSocket:

```typescript
// Línea 519
client.on('message', (msg) => {
  handleIncomingRef.current?.(msg);
});
```

### Estructura del Event Handler

```typescript
const handleIncoming = useCallback((data: any) => {
  console.log('[useChatSocket] Processing message:', data?.type, data?.messageType);
  
  try {
    // 1. Parse del mensaje (si es string JSON)
    let parsedData = data;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    }
    
    const message = parsedData as WebSocketMessage;
    
    // 2. MESSAGE ROUTER - Distribuye por messageType
    if (message.type === 'response' && message.messageType === 'text') {
      // Handler para text (mensajes genéricos)
    }
    
    if (message.type === 'response' && message.messageType === 'recipes_list') {
      // Handler para recipes_list
    }
    
    if (message.type === 'response' && message.messageType === 'recipe_detail') {
      // Handler para recipe_detail
    }
    
    if (message.type === 'response' && message.messageType === 'recipe_started') {
      // Handler para recipe_started
    }
    
    if (message.type === 'response' && message.messageType === 'scheduled_task') {
      // Handler para scheduled_task (timers automáticos)
    }
    
    if (message.type === 'response' && message.messageType === 'task_done') {
      // Handler para task_done
    }
    
    if (message.type === 'message') {
      // Handler para mensajes legacy
    }
    
  } catch (e) {
    console.error('[useChatSocket] Error handling incoming message:', e);
  }
}, [sessionId]);
```

---

## 4. FLUJO COMPLETO DE EJEMPLO

### Ejemplo 1: Enviar un Mensaje de Texto

```
1. Usuario escribe "how can I cook scrambled eggs?"
   
2. Frontend envía:
   action: 'sendtext'
   payload: { message: "how can I cook scrambled eggs?" }
   
3. Frontend agrega mensaje del usuario al UI inmediatamente
   
4. Backend procesa la pregunta con el agente AI
   
5. Backend responde:
   messageType: 'text'
   payload: { 
     message: "Crack a few eggs into a bowl, add a pinch of salt...",
     conversationId: null
   }
   
6. Frontend agrega respuesta del agente al UI
   
7. Frontend detiene el indicador de carga
```

### Ejemplo 2: Starter Question - "I feel like pasta"

```
1. Usuario hace clic en starter question "I feel like pasta" en home page
   
2. Frontend navega a /chat?starter=I%20feel%20like%20pasta
   
3. Frontend muestra el mensaje del usuario inmediatamente
   
4. WebSocket se conecta
   
5. Frontend envía:
   action: 'sendtext'
   payload: { message: "I feel like pasta" }
   
6. Backend procesa y puede responder con:
   - messageType: 'text' (respuesta conversacional)
   - O messageType: 'recipes_list' (lista de recetas)
   
7. Frontend muestra la respuesta apropiadamente
```

### Ejemplo 3: Obtener y Ver una Receta

```
1. Usuario hace clic en "View Recipe" para "Spaghetti Carbonara"
   
2. Frontend envía:
   action: 'getrecipe'
   payload: { workflowId: 'workflow-123' }
   
3. Backend responde:
   messageType: 'recipe_detail'
   payload: { recipe: {...}, workflowId: 'workflow-123' }
   
4. Frontend actualiza la receta con detalles completos
   (ingredientes, pasos, utensilios, etc.)
```

### Ejemplo 4: Cocinar una Receta

```
1. Usuario hace clic en "Start cooking"
   
2. Frontend envía:
   action: 'startrecipe'
   payload: { workflowId: 'workflow-123' }
   
3. Backend responde:
   messageType: 'recipe_started'
   payload: { 
     status: 'success', 
     workflowId: 'workflow-123',
     data: { sessionId: 'cook-session-456', initialTasks: [...] }
   }
   
4. Frontend muestra "Recipe started successfully!"
   
5. Usuario completa el primer paso
   
6. Frontend envía:
   action: 'taskdone'
   payload: { taskId: 'task-001' }
   
7. Backend responde:
   messageType: 'task_done'
   payload: { 
     status: 'success',
     taskId: 'task-001',
     data: { nextTasks: [{ name: 'Boil water', id: 'task-002' }] }
   }
   
8. Frontend muestra "Task completed. Next: Boil water"
```

### Ejemplo 5: Timer Programado (Scheduled Task)

```
1. Usuario está cocinando y el backend tiene un timer activo
   
2. Pasan 5 minutos (timer configurado en el backend)
   
3. Backend envía automáticamente (sin acción del frontend):
   messageType: 'scheduled_task'
   payload: {
     taskId: 'task-006',
     name: 'Check Mussels',
     type: 'immediate',
     metadata: {
       priority: 'high',
       checkPoints: [
         'Mussels are heated through',
         'Sauce is aromatic and steamy'
       ],
       detailedDescription: '# Check Mussels\n\nYour 5 minutes are up...'
     },
     next: ['task-008']
   }
   
4. Frontend recibe el mensaje automáticamente
   
5. Frontend muestra una notificación:
   "⏰ Check Mussels"
   + Descripción detallada con checkpoints
   
6. Usuario puede leer las instrucciones y continuar
```

---

## 5. TIPOS DE DATOS

### RecipeWorkflow
```typescript
interface RecipeWorkflow {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  // ... otros campos
}
```

### RecipeDetail
```typescript
interface RecipeDetail {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    imageUrl?: string;
  }>;
  utensils: Array<{
    name: string;
    imageUrl?: string;
  }>;
  steps: Array<{
    title: string;
    description: string;
    icon?: string;
    videoUrl?: string;
  }>;
  // ... otros campos
}
```

### TaskDonePayload
```typescript
interface TaskDonePayload {
  status: 'success' | 'error';
  taskId: string;
  data?: {
    nextTasks?: Array<{
      name: string;
      id: string;
      description?: string;
      // ... otros campos
    }>;
  };
  error?: string;
}
```

---

## 6. RESUMEN RÁPIDO

| Acción (Frontend → Backend) | MessageType (Backend → Frontend) | Propósito |
|----------------------------|----------------------------------|-----------|
| `sendtext` | `text` | Enviar mensaje de texto genérico |
| `getrecipes` | `recipes_list` | Obtener lista de recetas |
| `getrecipe` | `recipe_detail` | Obtener detalles de una receta |
| `startrecipe` | `recipe_started` | Iniciar sesión de cocina |
| `taskdone` | `task_done` | Marcar paso completado |
| - | `scheduled_task` | Timer automático cumplido (sin acción) |
| - | `message` (legacy) | Mensajes genéricos |

---

## 7. VALIDACIONES Y ERRORES

Todas las funciones que envían acciones validan:
1. ✅ `isConnected` - WebSocket está conectado
2. ✅ `wsRef.current` - Cliente WebSocket existe
3. ✅ Si alguna validación falla:
   - Se llama a `setError('No active connection')`
   - Se registra un warning en consola
   - No se envía la acción

Todos los handlers de messageType:
1. ✅ Validan que el `payload` exista
2. ✅ Validan el `status` (success/error) cuando aplica
3. ✅ Manejan errores con try/catch
4. ✅ Registran logs en consola para debugging
5. ✅ Guardan mensajes en localStorage automáticamente

---

## 8. CALLBACKS DISPONIBLES

El hook `useChatSocket` acepta estos callbacks opcionales:

```typescript
interface UseChatSocketOptions {
  onConnect?: () => void;           // Cuando WebSocket se conecta
  onDisconnect?: () => void;        // Cuando WebSocket se desconecta
  onMessage?: (message: ChatMessage) => void;  // Cuando llega un mensaje
  onError?: (error: string) => void;  // Cuando ocurre un error
  initialMessages?: ChatMessage[];   // Mensajes iniciales al cargar
  initialSessionId?: string;         // Session ID inicial
}
```

---

**Última actualización:** $(date)

