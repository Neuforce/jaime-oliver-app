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

## 5. WORKFLOW ENGINE MESSAGE TYPES (Nuevos)

Estos messageTypes son enviados por el Workflow Engine para controlar el flujo de la receta en tiempo real. Cada evento actualiza el estado visual de los steps (coming → active → done).

### 5.1 `workflow_started`
**Ubicación:** `useChatSocket.ts` líneas 408-492

**Cuándo llega:** El backend envía el workflow completo con todas las tareas cuando se inicia una receta.

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "workflow_started",
  "payload": {
    "event": "workflow_started",
    "workflowId": "wf_12345",
    "workflowName": "Tomato & Mussel Pasta",
    "recipeId": "recipe_001",
    "recipeName": "Tomato & Mussel Pasta",
    "startedAt": "2025-11-21T10:00:00Z",
    "data": {
      "name": "Tomato & Mussel Pasta",
      "slug": "tomato-mussel-pasta",
      "tags": ["Italian", "Pasta", "Seafood"],
      "tasks": [
        {
          "taskId": "task_001",
          "name": "Prepare All Vegetables",
          "type": "immediate",
          "description": "Chop garlic, celery...",
          "metadata": {
            "category": "preparation",
            "priority": "high",
            "cookingTime": "5 minutes",
            "detailedDescription": "# Prepare All Vegetables..."
          },
          "next": ["task_002"]
        }
        // ... más tasks
      ],
      "metadata": {
        "estimatedTime": "20 minutes",
        "ingredientsList": ["garlic", "pasta", "mussels"],
        "equipmentNeeded": ["knife", "pot", "pan"]
      },
      "description": "A quick 20-minute Italian seafood pasta",
      "startTaskId": "task_001",
      "endTaskId": "task_008"
    }
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "workflow_started",
    "timestamp": "2025-11-21T10:00:00Z"
  }
}
```

**Qué hace:**
1. Transforma todas las `tasks` del backend a `steps` del frontend
2. Marca el **primer step** como `'active'` (azul pulsante)
3. Marca todos los **demás steps** como `'coming'` (gris)
4. Crea un recipeItem completo con ingredientes, utensilios y steps
5. Agrega la receta al estado como mensaje de tipo `'recipeList'`

**Resultado visual:**
- 🔵 Step 1: Active (barra azul pulsante)
- ⚪ Steps 2-N: Coming (barra gris)

---

### 5.2 `workflow_finished`
**Ubicación:** `useChatSocket.ts` líneas 494-550

**Cuándo llega:** Cuando el usuario completa el último paso de la receta.

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "workflow_finished",
  "payload": {
    "event": "workflow_finished",
    "workflowId": "wf_12345",
    "workflowName": "Tomato & Mussel Pasta",
    "finishedAt": "2025-11-21T10:25:00Z",
    "status": "completed",
    "summary": "Recipe completed successfully"
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "workflow_finished",
    "timestamp": "2025-11-21T10:25:00Z"
  }
}
```

**Qué hace:**
1. Encuentra la receta en el estado
2. Marca **TODOS** los steps como `'done'` (verde)
3. Agrega mensaje de sistema: "🎉 Recipe completed! All steps are done."

**Resultado visual:**
- ✅ Todos los steps: Done (barra verde)
- 🎉 Mensaje de completitud

---

### 5.3 `task_done` (Mejorado)
**Ubicación:** `useChatSocket.ts` líneas 552-614

**Cuándo llega:** Cuando el usuario completa una tarea (hablando/escribiendo al agente, o presionando "Next").

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "task_done",
  "payload": {
    "event": "task_done",
    "taskId": "task_003",
    "taskName": "Start the Sauce",
    "workflowId": "wf_12345",
    "completedAt": "2025-11-21T10:15:00Z",
    "status": "success",
    "data": {
      "name": "Start the Sauce",
      "taskId": "task_003",
      "type": "immediate",
      "next": ["task_005"],
      "description": "Sauté vegetables...",
      "metadata": {
        "category": "cooking",
        "priority": "high"
      }
    }
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "task_done",
    "timestamp": "2025-11-21T10:15:00Z"
  }
}
```

**Qué hace:**
1. Encuentra el step con `taskId` del payload
2. Marca ese step como `'done'` (verde)
3. **AUTOMÁTICAMENTE** marca el siguiente step como `'active'` (azul)
4. La UI detecta el cambio y **auto-navega** al nuevo step activo

**Resultado visual:**
- ✅ Step completado: Done (barra verde)
- 🔵 Siguiente step: Active (barra azul pulsante)
- 🎯 Auto-navegación al step activo
- **Usuario NO necesita presionar "Next"**

---

### 5.4 `next_task`
**Ubicación:** `useChatSocket.ts` líneas 616-659

**Cuándo llega:** El backend activa explícitamente el siguiente paso en el flujo.

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "next_task",
  "payload": {
    "event": "next_task",
    "taskId": "task_005",
    "taskName": "Add Mussels and Cook",
    "taskDescription": "Add mussels, cover, and cook...",
    "taskType": "immediate",
    "workflowId": "wf_12345",
    "stepNumber": 5,
    "totalSteps": 8,
    "data": {
      "taskId": "task_005",
      "type": "immediate",
      "name": "Add Mussels and Cook",
      "metadata": {
        "category": "cooking",
        "priority": "high",
        "technique": "covered cooking",
        "cookingTime": "5 minutes"
      },
      "next": ["task_006", "task_007"],
      "description": "Add mussels, cover...",
      "dependsOn": ["task_004", "task_003"]
    }
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "next_task",
    "timestamp": "2025-11-21T10:16:00Z"
  }
}
```

**Qué hace:**
1. Encuentra el step con el `taskId` del payload
2. Marca ese step como `'active'` (azul)
3. La UI detecta el cambio y auto-navega al step

**Resultado visual:**
- 🔵 Step indicado: Active (barra azul pulsante)
- 🎯 Auto-navegación

---

### 5.5 `timed_task`
**Ubicación:** `useChatSocket.ts` líneas 661-685

**Cuándo llega:** El backend inicia un timer para una tarea específica.

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "timed_task",
  "payload": {
    "event": "timed_task",
    "taskId": "task_006",
    "taskName": "Check Mussels",
    "taskDescription": "Timer for mussel cooking...",
    "workflowId": "wf_12345",
    "duration": "1",
    "durationUnit": "minutes",
    "startedAt": "2025-11-21T10:17:00Z",
    "data": {
      "taskId": "task_006",
      "type": "timed",
      "name": "Check Mussels",
      "metadata": {
        "category": "cooking",
        "priority": "high",
        "checkPoints": [
          "Mussels are heated through",
          "Sauce is aromatic and steamy"
        ]
      },
      "next": ["task_008"],
      "description": "Timer for mussel cooking...",
      "timerDuration": "PT1M",
      "activated_at_utc": "2025-11-21T10:17:00.000Z"
    }
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "timed_task",
    "timestamp": "2025-11-21T10:17:00Z"
  }
}
```

**Qué hace:**
1. Solo logea la información del timer
2. El step permanece en estado `'coming'` (gris)
3. La UI puede mostrar un countdown timer si lo desea

**Resultado visual:**
- ⚪ Step: Coming (barra gris)
- ⏱️ Countdown timer activo (opcional en UI)

**Nota:** El step NO se activa hasta que llegue `timer_done`.

---

### 5.6 `timer_done`
**Ubicación:** `useChatSocket.ts` líneas 687-726

**Cuándo llega:** Cuando el countdown timer de una tarea termina.

**Formato del mensaje:**
```json
{
  "type": "response",
  "messageType": "timer_done",
  "payload": {
    "event": "timer_done",
    "taskId": "task_006",
    "taskName": "Check Mussels",
    "workflowId": "wf_12345",
    "completedAt": "2025-11-21T10:18:00Z",
    "elapsedTime": "60",
    "data": {
      "taskId": "task_006",
      "type": "timed",
      "name": "Check Mussels",
      "metadata": {
        "category": "cooking",
        "priority": "high",
        "checkPoints": [
          "Mussels are heated through",
          "Sauce is aromatic and steamy"
        ]
      },
      "next": ["task_008"],
      "description": "Timer for mussel cooking...",
      "timerDuration": "PT1M"
    }
  },
  "metadata": {
    "source": "workflow-engine",
    "eventType": "timer_done",
    "timestamp": "2025-11-21T10:18:00Z"
  }
}
```

**Qué hace:**
1. Encuentra el step con el `taskId`
2. Cambia el status de `'coming'` → `'active'` (azul)
3. La UI detecta el cambio y auto-navega al step

**Resultado visual:**
- 🔵 Step: Active (barra azul pulsante)
- 🎯 Auto-navegación al step
- ⏱️ Timer se detiene

---

## 6. FLUJO COMPLETO DE UNA RECETA

Aquí está el flujo end-to-end con todos los eventos:

### Fase 1: Inicio
```
Usuario: Click "Start cooking"
  ↓
Frontend: action='startrecipe', payload={workflowId}
  ↓
Backend: messageType='recipe_started' 
  → Step 1 = 'active', Steps 2-N = 'coming'
  
O alternativamente:
Backend: messageType='workflow_started'
  → Crea receta completa, Step 1 = 'active'
```

### Fase 2: Progreso
```
Usuario: Habla/escribe "I'm done chopping"
  ↓
Frontend: action='sendtext', payload={message}
  ↓
Backend analiza y responde:

Opción A - Solo texto:
Backend: messageType='text'
  → Muestra respuesta del agente

Opción B - Tarea completada:
Backend: messageType='task_done', payload={taskId}
  → Step actual = 'done', Siguiente = 'active'
  → Auto-navega al siguiente step
```

### Fase 3: Steps con Timer
```
Backend: messageType='timed_task', payload={taskId, duration}
  → Step permanece 'coming', inicia countdown
  ↓
[Countdown en progreso: 5 minutos...]
  ↓
Backend: messageType='timer_done', payload={taskId}
  → Step = 'active'
  → Auto-navega al step
```

### Fase 4: Finalización
```
Usuario completa último step
  ↓
Backend: messageType='task_done', payload={taskId: "task_008"}
  → Último step = 'done'
  ↓
Backend: messageType='workflow_finished'
  → TODOS los steps = 'done'
  → Muestra "🎉 Recipe completed!"
```

---

## 7. FLUJO DE MENSAJES DE TEXTO (sendtext)

### Usuario envía mensaje
```typescript
// Frontend
action: 'sendtext'
payload: { message: "How do I chop the garlic?" }
```

### Backend puede responder con múltiples messageTypes:

#### Respuesta 1: Texto simple
```json
{
  "messageType": "text",
  "payload": {
    "message": "To chop garlic: remove skin, place flat side down..."
  }
}
```

#### Respuesta 2: Tarea completada
```json
{
  "messageType": "task_done",
  "payload": {
    "taskId": "task_001",
    "status": "success"
  }
}
```
→ Marca step done, activa siguiente, auto-navega

#### Respuesta 3: Activar siguiente tarea
```json
{
  "messageType": "next_task",
  "payload": {
    "taskId": "task_002"
  }
}
```
→ Activa step específico, auto-navega

#### Respuesta 4: Combinación
El backend puede enviar **múltiples mensajes** en secuencia:
1. `text` - Confirmación al usuario
2. `task_done` - Marca tarea completada
3. `next_task` - Activa siguiente

---

## 8. RESUMEN RÁPIDO

| Acción (Frontend → Backend) | MessageType (Backend → Frontend) | Propósito | Status Change |
|----------------------------|----------------------------------|-----------|---------------|
| `sendtext` | `text` / `text_message` | Mensaje de texto genérico | - |
| `getrecipes` | `recipes_list` | Obtener lista de recetas | - |
| `getrecipe` | `recipe_detail` | Obtener detalles de una receta | - |
| `startrecipe` | `recipe_started` | Iniciar sesión de cocina | Step 1 → active |
| - | `workflow_started` | Workflow completo con tasks | Step 1 → active, resto → coming |
| `taskdone` (manual) | `task_done` | Marcar paso completado | Current → done, next → active |
| `sendtext` (IA detecta) | `task_done` | IA detecta tarea completada | Current → done, next → active |
| - | `next_task` | Activar siguiente tarea | Specific step → active |
| - | `timed_task` | Iniciar timer | Step stays coming |
| - | `timer_done` | Timer completado | Step → active |
| - | `workflow_finished` | Receta completada | ALL steps → done |
| - | `scheduled_task` | Timer automático (notificación) | - |

### Estados de Steps (Status)
- ⚪ **`'coming'`**: Gris - Paso futuro, no disponible aún
- 🔵 **`'active'`**: Azul pulsante - Paso actual, usuario debe completar
- ✅ **`'done'`**: Verde - Paso completado

### Auto-navegación
La UI **automáticamente navega** al step activo cuando:
- Llega `task_done` → activa siguiente → navega
- Llega `next_task` → activa step → navega  
- Llega `timer_done` → activa step → navega

**Usuario NO necesita presionar "Next"** cuando el backend marca tareas como completadas.

---

## 9. VALIDACIONES Y ERRORES

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

## 10. CALLBACKS DISPONIBLES

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

**Última actualización:** 2025-11-21 - Agregado soporte completo para Workflow Engine events (workflow_started, workflow_finished, task_done mejorado, next_task, timed_task, timer_done)

