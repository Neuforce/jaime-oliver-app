# 📸 Default Images Library

## Overview

Librería centralizada de imágenes por defecto para recetas, ingredientes, utensilios y pasos de cocción. Todas las imágenes provienen de **Unsplash** (gratuitas y de alta calidad).

## Archivo Principal

**`lib/defaultImages.ts`** - Librería centralizada con todas las imágenes y funciones helper.

## Categorías de Imágenes

### 🥬 Ingredientes (120+ items)

La librería incluye imágenes para:

- **Vegetales**: garlic, onion, tomato, potato, carrot, celery, fennel, courgette, zucchini, pepper, mushroom, spinach, rocket, squash, broccoli, cauliflower, asparagus, leek, etc.
- **Pasta & Granos**: pasta, linguine, spaghetti, penne, fusilli, rice, arborio rice, risotto, couscous, quinoa
- **Proteínas**: chicken, beef, pork, bacon, fish, salmon, cod, tuna, shrimp, prawns, mussels, clams, eggs
- **Lácteos**: milk, cream, butter, cheese, parmesan, mozzarella, cheddar, yogurt
- **Hierbas & Especias**: basil, parsley, cilantro, thyme, rosemary, oregano, mint, chili, ginger
- **Despensa**: olive oil, salt, pepper, flour, sugar, stock, wine
- **Frutas & Cítricos**: lemon, lime, orange, apple
- **Legumbres**: chickpea, lentils, beans

### 🔪 Utensilios (50+ items)

La librería incluye imágenes para:

- **Cuchillos**: knife, sharp knife, chef's knife, chopping knife, cutting board
- **Ollas & Sartenes**: pot, large pot, saucepan, stockpot, pan, frying pan, skillet, wok, casserole, dutch oven
- **Utensilios**: spoon, wooden spoon, spatula, tongs, whisk, ladle, slotted spoon
- **Bowls**: bowl, small bowl, large bowl, mixing bowl, measuring cup
- **Coladores**: colander, strainer, sieve
- **Ralladores**: grater, zester, peeler
- **Horneado**: baking sheet, baking tray, baking dish, roasting pan
- **Servir**: plate, serving plate, platter, serving bowl
- **Varios**: lid, timer, oven mitts, kitchen towel

### 👨‍🍳 Pasos de Cocción (50+ acciones)

La librería incluye imágenes para acciones como:

- **Preparación**: prepare, chop, dice, slice, cut, peel, wash, rinse, drain, grate
- **Métodos de Cocción**: cook, boil, simmer, fry, sauté, stir, mix, combine, bake, roast, grill, steam
- **Agregar & Sazonar**: add, season, sprinkle, drizzle, pour
- **Revisar**: check, test, taste
- **Finalizar**: serve, plate, garnish, finish, rest, cool
- **Específicos**: pasta, noodles, sauce, vegetables

## Funciones Helper

### `getIngredientImage(ingredientName, backendImageUrl?)`

Obtiene imagen para un ingrediente con lógica de fallback.

**Prioridades:**
1. Usa imagen del backend si está disponible y es válida
2. Busca en la librería local por coincidencia exacta
3. Busca en la librería local por coincidencia parcial (ej: "2 garlic cloves" → "garlic")
4. Fallback a imagen genérica de ingrediente

**Ejemplo:**
```typescript
const imageUrl = getIngredientImage("garlic");
// Returns: https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop

const imageUrl2 = getIngredientImage("2 cloves of garlic");
// También returns la imagen de garlic (coincidencia parcial)
```

### `getUtensilImage(utensilName, backendImageUrl?)`

Obtiene imagen para un utensilio con lógica de fallback.

**Prioridades:**
1. Usa imagen del backend si está disponible y es válida
2. Busca en la librería local por coincidencia exacta
3. Busca en la librería local por coincidencia parcial
4. Fallback a imagen genérica de utensilio

**Ejemplo:**
```typescript
const imageUrl = getUtensilImage("knife");
// Returns: https://images.unsplash.com/photo-1594736797933-d0cbc0b0c4e1?w=200&h=200&fit=crop

const imageUrl2 = getUtensilImage("Large pot for pasta");
// Returns imagen de "pot" (coincidencia parcial)
```

### `getStepImage(stepTitle, stepDescription?, backendImageUrl?)`

Obtiene imagen para un paso de cocción basándose en palabras clave.

**Prioridades:**
1. Usa imagen del backend si está disponible y es válida
2. Busca en la librería local por coincidencia exacta en el título
3. Busca en la librería local por palabras clave en título o descripción
4. Fallback a imagen genérica de cocción

**Ejemplo:**
```typescript
const imageUrl = getStepImage("Chop Vegetables", "Finely chop the garlic and onions");
// Returns imagen de "chop" (acción detectada)

const imageUrl2 = getStepImage("Boil the Pasta", "Cook pasta for 10-12 minutes");
// Returns imagen de "boil" (acción detectada)
```

### `isValidImageUrl(url)`

Valida si una URL es una imagen válida.

**Criterios:**
- Acepta rutas locales que empiezan con `/`
- Verifica extensiones de imagen comunes (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`)
- Rechaza URLs que contienen `/recipes/` (probablemente son páginas web, no imágenes)

## Uso en el Código

### En `useChatSocket.ts`

```typescript
import { getIngredientImage, getUtensilImage, getStepImage } from '../lib/defaultImages';

// Para ingredientes
const ingredients = metadata.ingredientsList?.map((ingredient) => ({
  name: ingredient.name,
  quantity: ingredient.quantity || '',
  imageUrl: getIngredientImage(ingredient.name, ingredient.imageUrl),
}));

// Para utensilios
const utensils = metadata.equipmentNeeded?.map((equipment) => ({
  name: equipment.name,
  imageUrl: getUtensilImage(equipment.name, equipment.imageUrl),
}));

// Para steps
const steps = definition?.tasks?.map((task) => ({
  title: task.name,
  duration: task.metadata?.cookingTime || '',
  icon: getStepImage(task.name, task.description, task.metadata?.imageUrl),
  description: task.description,
}));
```

## Agregar Nuevas Imágenes

### 1. Buscar Imagen en Unsplash

1. Ve a [https://unsplash.com](https://unsplash.com)
2. Busca el ingrediente/utensilio/acción
3. Copia la URL de la imagen
4. Modifica el tamaño agregando: `?w=200&h=200&fit=crop` (o `w=400&h=400` para steps)

### 2. Agregar a la Librería

Edita `lib/defaultImages.ts`:

```typescript
export const INGREDIENT_IMAGES: Record<string, string> = {
  // ... existing entries
  'nuevo ingrediente': 'https://images.unsplash.com/photo-XXXXXX?w=200&h=200&fit=crop',
};
```

### 3. Agregar Sinónimos

Muchos ingredientes tienen múltiples nombres:

```typescript
'courgette': 'https://images.unsplash.com/photo-XXX...',
'zucchini': 'https://images.unsplash.com/photo-XXX...', // Mismo que courgette
```

## Características Especiales

### ✅ Coincidencia Inteligente

La librería usa coincidencia parcial, por lo que:
- "2 cloves of garlic" → encuentra "garlic"
- "Large pot for boiling" → encuentra "pot"
- "Finely chop the vegetables" → encuentra "chop"

### ✅ Fallbacks Graceful

Si no se encuentra una imagen específica, siempre hay un fallback:
- Ingredientes → imagen genérica de ingrediente
- Utensilios → imagen genérica de cocina
- Steps → imagen genérica de cocción

### ✅ Prioridad al Backend

Si el backend proporciona una imagen válida, siempre se usa primero.

### ✅ Optimización de Performance

- Todas las URLs incluyen parámetros de optimización de Unsplash
- Tamaños apropiados: 200x200px para items, 400x400px para steps
- `fit=crop` para mantener aspect ratio consistente

## Estadísticas Actuales

- 🥬 **120+** ingredientes con imágenes
- 🔪 **50+** utensilios con imágenes  
- 👨‍🍳 **50+** acciones de cocción con imágenes
- 📸 Todas las imágenes de **Unsplash** (gratuitas, alta calidad)
- 🎨 Tamaños optimizados y consistentes
- 🔍 Coincidencia inteligente con sinónimos

## Sistema de Fallback Automático (404 Resilience)

### 🔄 Rotación Automática de Imágenes

Si una imagen retorna un error 404, el sistema automáticamente prueba la **siguiente imagen válida** de la lista correspondiente.

#### Funciones de Fallback

```typescript
// Si una imagen de ingrediente falla, automáticamente usa la siguiente
getNextIngredientImage(failedUrl) // → Retorna siguiente URL de ingrediente

// Si una imagen de utensilio falla, automáticamente usa la siguiente
getNextUtensilImage(failedUrl) // → Retorna siguiente URL de utensilio

// Si una imagen de step falla, automáticamente usa la siguiente  
getNextStepImage(failedUrl) // → Retorna siguiente URL de step
```

#### Implementación en Componentes

En `RecipeAccordion.tsx`, cada imagen tiene un handler `onError`:

```typescript
<img
  src={ingredient.imageUrl}
  alt={ingredient.name}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    // Automáticamente prueba la siguiente imagen válida
    const nextImage = getNextIngredientImage(target.src);
    if (target.src !== nextImage) {
      target.src = nextImage;
    }
  }}
/>
```

#### Comportamiento

1. **Primera carga**: Usa la imagen asignada
2. **Si falla (404)**: Automáticamente carga la siguiente imagen de la lista
3. **Si esa también falla**: Continúa con la siguiente
4. **Al final de la lista**: Vuelve al principio (circular)

✅ **Resultado**: Nunca verás una imagen rota, siempre habrá una imagen válida mostrándose.

## Beneficios

1. **Consistencia Visual**: Todas las imágenes tienen el mismo estilo y calidad
2. **Fallbacks Automáticos**: Nunca hay imágenes rotas
3. **Resiliente a 404**: Sistema automático de fallback secuencial
4. **Fácil Mantenimiento**: Un solo archivo centralizado
5. **Escalable**: Fácil agregar nuevas imágenes
6. **Performance**: URLs optimizadas de Unsplash
7. **Inteligente**: Coincidencia parcial y sinónimos
8. **Prioridad al Backend**: Siempre respeta las imágenes del servidor
9. **Auto-recuperación**: Si una imagen falla, automáticamente usa la siguiente

---
*Última actualización: Noviembre 20, 2025*

