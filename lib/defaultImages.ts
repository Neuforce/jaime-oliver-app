/**
 * Default Image Library
 * 
 * Centralized library of fallback images for recipes, ingredients, utensils, and cooking steps.
 * Uses free images from Unsplash for consistent, high-quality visuals.
 */

// ============================================
// INGREDIENTS - Comprehensive mapping
// ============================================
export const INGREDIENT_IMAGES: Record<string, string> = {
  // Vegetables
  'garlic': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop',
  'onion': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop',
  'onions': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop',
  // Tomatoes - SPECIFIC VARIETIES FIRST, then generic
  'tin quality chopped tomato': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'tin quality chopped tomatoes': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'chopped tomato': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'chopped tomatoes': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'diced tomato': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'diced tomatoes': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'tinned tomatoes': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'canned tomatoes': 'https://cdn.shopify.com/s/files/1/0518/6679/6203/files/chopped-tomato-shelf-life.jpg?v=1737406710',
  'cherry tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
  'tomato': 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=200&h=200&fit=crop',
  'tomatoes': 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=200&h=200&fit=crop',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop',
  'potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop',
  'carrots': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop',
  'celery': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&h=200&fit=crop',
  'fennel': 'https://images.unsplash.com/photo-1615485925503-6e4c5e69a0ff?w=200&h=200&fit=crop',
  'courgette': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&h=200&fit=crop',
  'zucchini': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&h=200&fit=crop',
  'pepper': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop',
  'peppers': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop',
  'bell pepper': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop',
  'mushroom': 'https://images.unsplash.com/photo-1579501678147-3c8c58a0b2a0?w=200&h=200&fit=crop',
  'mushrooms': 'https://images.unsplash.com/photo-1579501678147-3c8c58a0b2a0?w=200&h=200&fit=crop',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop',
  'rocket': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop',
  'arugula': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop',
  'lettuce': 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=200&h=200&fit=crop',
  'squash': 'https://hgtvhome.sndimg.com/content/dam/images/grdn/fullset/2015/2/9/0/CI_squash-littledipperxsq7513.jpg.rend.hgtvcom.1280.1280.85.suffix/1452970483978.webp',
  'butternut squash': 'https://hgtvhome.sndimg.com/content/dam/images/grdn/fullset/2015/2/9/0/CI_squash-littledipperxsq7513.jpg.rend.hgtvcom.1280.1280.85.suffix/1452970483978.webp',
  'broccoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&h=200&fit=crop',
  'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=200&h=200&fit=crop',
  'asparagus': 'https://images.unsplash.com/photo-1596097635121-c628c852c4df?w=200&h=200&fit=crop',
  'leek': 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=200&h=200&fit=crop',
  'leeks': 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=200&h=200&fit=crop',

  // Pasta & Grains
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'linguine': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'tagliatelle': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'penne': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'fusilli': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
  'arborio rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
  'risotto': 'https://images.unsplash.com/photo-1476124369491-c0ba1adb7aca?w=200&h=200&fit=crop',
  'couscous': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',
  'quinoa': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop',

  // Proteins
  'chicken': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&h=200&fit=crop',
  'chicken breast': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&h=200&fit=crop',
  'beef': 'https://images.unsplash.com/photo-1588347818036-8fc4ec0b3a17?w=200&h=200&fit=crop',
  'pork': 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=200&h=200&fit=crop',
  'bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&h=200&fit=crop',
  'sausage': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop',
  'fish': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200&h=200&fit=crop',
  'salmon': 'https://images.unsplash.com/photo-1580959375944-0b7b87f4cc3f?w=200&h=200&fit=crop',
  'cod': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200&h=200&fit=crop',
  'tuna': 'https://images.unsplash.com/photo-1580959375944-0b7b87f4cc3f?w=200&h=200&fit=crop',
  'shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=200&fit=crop',
  'prawns': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=200&fit=crop',
  'mussels': 'https://images.unsplash.com/photo-1609501676725-7186f3a1f2f4?w=200&h=200&fit=crop',
  'mussel': 'https://images.unsplash.com/photo-1609501676725-7186f3a1f2f4?w=200&h=200&fit=crop',
  'clams': 'https://images.unsplash.com/photo-1609501676725-7186f3a1f2f4?w=200&h=200&fit=crop',
  'egg': 'https://images.unsplash.com/photo-1587486937930-5ecd0f6d1c33?w=200&h=200&fit=crop',
  'eggs': 'https://images.unsplash.com/photo-1587486937930-5ecd0f6d1c33?w=200&h=200&fit=crop',

  // Dairy
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop',
  'cream': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop',
  'butter': 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=200&h=200&fit=crop',
  'cheese': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=200&h=200&fit=crop',
  'parmesan': 'https://images.unsplash.com/photo-1618164436262-32a3b2e2b5a5?w=200&h=200&fit=crop',
  'mozzarella': 'https://images.unsplash.com/photo-1618164436262-32a3b2e2b5a5?w=200&h=200&fit=crop',
  'cheddar': 'https://images.unsplash.com/photo-1618164436262-32a3b2e2b5a5?w=200&h=200&fit=crop',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',

  // Herbs & Spices
  'basil': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'parsley': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'cilantro': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'coriander': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'thyme': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'rosemary': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'oregano': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&h=200&fit=crop',
  'mint': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200&h=200&fit=crop',
  'chili': 'https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=200&h=200&fit=crop',
  'chilli': 'https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=200&h=200&fit=crop',
  'ginger': 'https://images.unsplash.com/photo-1599408781888-01ab2e43d160?w=200&h=200&fit=crop',
  
  // Pantry Staples
  'olive oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
  'salt': 'https://images.unsplash.com/photo-1608039829570-cc98a2e0a682?w=200&h=200&fit=crop',
  'black pepper': 'https://images.unsplash.com/photo-1608039829570-cc98a2e0a682?w=200&h=200&fit=crop',
  'flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
  'sugar': 'https://images.unsplash.com/photo-1514680458377-7f62f2b9e6d7?w=200&h=200&fit=crop',
  'stock': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'vegetable stock': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'chicken stock': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop',
  'white wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop',
  'red wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop',
  
  // Fruits & Citrus
  'lemon': 'https://image.makewebeasy.net/makeweb/0/vq7Oemz1i/DefaultData/18_2.jpg?v=202405291424',
  'lemons': 'https://image.makewebeasy.net/makeweb/0/vq7Oemz1i/DefaultData/18_2.jpg?v=202405291424',
  'lime': 'https://images.unsplash.com/photo-1591799193229-5c5ef5e5a42f?w=200&h=200&fit=crop',
  'orange': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=200&h=200&fit=crop',
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
  
  // Legumes & Beans
  'chickpea': 'https://images.unsplash.com/photo-1621958443141-f28c1f952f34?w=200&h=200&fit=crop',
  'chickpeas': 'https://images.unsplash.com/photo-1621958443141-f28c1f952f34?w=200&h=200&fit=crop',
  'lentils': 'https://images.unsplash.com/photo-1621958443141-f28c1f952f34?w=200&h=200&fit=crop',
  'beans': 'https://images.unsplash.com/photo-1621958443141-f28c1f952f34?w=200&h=200&fit=crop',
};

// ============================================
// UTENSILS - Comprehensive mapping
// ============================================
export const UTENSIL_IMAGES: Record<string, string> = {
  // Knives & Cutting
  'knife': 'https://assets.epicurious.com/photos/563b755389987d44229603c7/16:9/w_2560%2Cc_limit/EP_-11.jpg',
  'sharp knife': 'https://assets.epicurious.com/photos/563b755389987d44229603c7/16:9/w_2560%2Cc_limit/EP_-11.jpg',
  "chef's knife": 'https://assets.epicurious.com/photos/563b755389987d44229603c7/16:9/w_2560%2Cc_limit/EP_-11.jpg',
  'chopping knife': 'https://assets.epicurious.com/photos/563b755389987d44229603c7/16:9/w_2560%2Cc_limit/EP_-11.jpg',
  'cutting board': 'https://m.media-amazon.com/images/I/71x84Vg3EmL.jpg',
  'chopping board': 'https://m.media-amazon.com/images/I/71x84Vg3EmL.jpg',
  
  // Pots & Pans - SPECIFIC FIRST, then generic
  'large pot for pasta': 'https://m.media-amazon.com/images/I/61egz7FAT8L._AC_UF894,1000_QL80_.jpg',
  'pot for pasta': 'https://m.media-amazon.com/images/I/61egz7FAT8L._AC_UF894,1000_QL80_.jpg',
  'pot': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop',
  'large pot': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop',
  'saucepan': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'stockpot': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop',
  'large frying pan with lid': 'https://i.ebayimg.com/00/s/MTEzOVgxNTAw/z/nh8AAOSwExVoCvpy/$_3.PNG',
  'frying pan with lid': 'https://i.ebayimg.com/00/s/MTEzOVgxNTAw/z/nh8AAOSwExVoCvpy/$_3.PNG',
  'pan with lid': 'https://i.ebayimg.com/00/s/MTEzOVgxNTAw/z/nh8AAOSwExVoCvpy/$_3.PNG',
  'pan': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'frying pan': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'large frying pan': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'skillet': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'wok': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop',
  'casserole': 'https://images.unsplash.com/photo-1585515320310-c7a96a3d3ecf?w=200&h=200&fit=crop',
  'dutch oven': 'https://images.unsplash.com/photo-1585515320310-c7a96a3d3ecf?w=200&h=200&fit=crop',
  
  // Utensils - SPECIFIC FIRST, then generic
  'wooden spoon or spatula': 'https://lancastercastiron.com/cdn/shop/products/WoodenSpoonandSpatula_grande.jpg?v=1625578887',
  'spoon or spatula': 'https://lancastercastiron.com/cdn/shop/products/WoodenSpoonandSpatula_grande.jpg?v=1625578887',
  'spoon': 'https://images.unsplash.com/photo-1599667064523-d16a1b6c8d5c?w=200&h=200&fit=crop',
  'wooden spoon': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'tablespoon': 'https://images.unsplash.com/photo-1599667064523-d16a1b6c8d5c?w=200&h=200&fit=crop',
  'teaspoon': 'https://images.unsplash.com/photo-1599667064523-d16a1b6c8d5c?w=200&h=200&fit=crop',
  'spatula': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'turner': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'tongs': 'https://m.media-amazon.com/images/I/51SfxRZYI0L.jpg',
  'whisk': 'https://images.unsplash.com/photo-1609501676725-236bce11c223?w=200&h=200&fit=crop',
  'ladle': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop',
  'slotted spoon': 'https://images.unsplash.com/photo-1599667064523-d16a1b6c8d5c?w=200&h=200&fit=crop',
  
  // Bowls & Containers
  'bowl': 'https://wilmax.com/cdn/shop/products/992553.jpg',
  'small bowl': 'https://wilmax.com/cdn/shop/products/992553.jpg',
  'large bowl': 'https://wilmax.com/cdn/shop/products/992553.jpg',
  'mixing bowl': 'https://wilmax.com/cdn/shop/products/992553.jpg',
  'measuring cup': 'https://images.unsplash.com/photo-1608854803137-0df53b5de992?w=200&h=200&fit=crop',
  'measuring spoons': 'https://images.unsplash.com/photo-1608854803137-0df53b5de992?w=200&h=200&fit=crop',
  
  // Strainers & Drainers
  'colander': 'https://cdn11.bigcommerce.com/s-59xg43cj3a/images/stencil/1280x1280/products/14765/16842/Square-48694_HES_HN8_largeColander_NoFood_1800x1800__60157.1687183946.jpg?c=1',
  'strainer': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'sieve': 'https://images.unsplash.com/photo-1596640215762-e0713bae7e8e?w=200&h=200&fit=crop',
  
  // Graters & Peelers
  'grater': 'https://assets.manufactum.de/p/034/034454/34454_01.jpg/microplane-grater-fine.jpg?profile=pdsmain_1500',
  'zester': 'https://images.unsplash.com/photo-1621958147135-c9e7c4e279ce?w=200&h=200&fit=crop',
  'peeler': 'https://images.unsplash.com/photo-1585515320310-c7a96a3d3ecf?w=200&h=200&fit=crop',
  'vegetable peeler': 'https://images.unsplash.com/photo-1585515320310-c7a96a3d3ecf?w=200&h=200&fit=crop',
  
  // Baking
  'baking sheet': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop',
  'baking tray': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop',
  'baking dish': 'https://images.unsplash.com/photo-1585515320310-c7a96a3d3ecf?w=200&h=200&fit=crop',
  'roasting pan': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop',
  
  // Serving - SPECIFIC FIRST (with numbers), then generic
  '4 serving plates or pasta bowls': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  '2 serving plates or pasta bowls': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  '6 serving plates or pasta bowls': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  'serving plates or pasta bowls': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  'pasta bowls': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  'serving plates': 'https://images.thdstatic.com/productImages/1daa058c-6cbc-4cae-a1cf-a79267461fc0/svn/multicolor-certified-international-bowls-14184set-4-64_600.jpg',
  'plate': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=200&h=200&fit=crop',
  'serving plate': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=200&h=200&fit=crop',
  'platter': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop',
  'serving bowl': 'https://wilmax.com/cdn/shop/products/992553.jpg',
  
  // Miscellaneous
  'lid': 'https://images.unsplash.com/photo-1584990347449-f88d4c543fd5?w=200&h=200&fit=crop',
  'timer': 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=200&h=200&fit=crop',
  'oven mitts': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=200&h=200&fit=crop',
  'kitchen towel': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop',
  'paper towels': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop',
};

// ============================================
// COOKING STEPS - Action-based images
// ============================================
export const STEP_IMAGES: Record<string, string> = {
  // Preparation
  'prepare': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
  'preparation': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop',
  'chop': 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop',
  'chopping': 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop',
  'dice': 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop',
  'slice': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop',
  'slicing': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop',
  'cut': 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop',
  'cutting': 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop',
  'peel': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop',
  'peeling': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop',
  'wash': 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
  'washing': 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
  'rinse': 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
  'drain': 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=400&fit=crop',
  'grate': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  
  // Cooking Methods
  'cook': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'cooking': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'boil': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'boiling': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'simmer': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'simmering': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'fry': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=400&fit=crop',
  'frying': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=400&fit=crop',
  'sauté': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=400&fit=crop',
  'sautéing': 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&h=400&fit=crop',
  'stir': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'stirring': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'mix': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'mixing': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'combine': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'bake': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'baking': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  'roast': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
  'roasting': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
  'grill': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop',
  'grilling': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop',
  'steam': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'steaming': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  
  // Adding & Seasoning
  'add': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'adding': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'season': 'https://images.unsplash.com/photo-1608039829570-cc98a2e0a682?w=400&h=400&fit=crop',
  'seasoning': 'https://images.unsplash.com/photo-1608039829570-cc98a2e0a682?w=400&h=400&fit=crop',
  'sprinkle': 'https://images.unsplash.com/photo-1608039829570-cc98a2e0a682?w=400&h=400&fit=crop',
  'drizzle': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
  'pour': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'pouring': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  
  // Checking & Testing
  'check': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'checking': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'test': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'taste': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  'tasting': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop',
  
  // Final Steps
  'serve': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'serving': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'plate': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'plating': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'garnish': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'finish': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'rest': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  'cool': 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=400&h=400&fit=crop',
  
  // Pasta specific
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  'noodles': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
  
  // Sauce specific
  'sauce': 'https://images.unsplash.com/photo-1611175888969-d5a89c5a6f0f?w=400&h=400&fit=crop',
  
  // Vegetables
  'vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop',
  'vegetable': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get ingredient image with fallback logic
 * Returns object with primary URL and fallback URLs array
 */
export const getIngredientImage = (ingredientName: string, backendImageUrl?: string): string => {
  // Priority 1: Use backend image if provided and valid
  if (backendImageUrl && isValidImageUrl(backendImageUrl)) {
    return backendImageUrl;
  }
  
  // Priority 2: Try to find in local mapping by matching ingredient name
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  if (INGREDIENT_IMAGES[normalizedName]) {
    return INGREDIENT_IMAGES[normalizedName];
  }
  
  // Try partial match (e.g., "2 cloves of garlic" -> "garlic")
  for (const [key, imageUrl] of Object.entries(INGREDIENT_IMAGES)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  // Priority 3: Fallback to generic ingredient image from Unsplash
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format';
};

/**
 * Get next available ingredient image from the list
 * Used as fallback when an image fails to load
 */
export const getNextIngredientImage = (failedUrl: string): string => {
  const allUrls = getIngredientFallbackUrls();
  const currentIndex = allUrls.indexOf(failedUrl);
  
  // If found, return next URL, otherwise return first URL
  if (currentIndex !== -1 && currentIndex < allUrls.length - 1) {
    return allUrls[currentIndex + 1];
  }
  
  // If at end or not found, cycle back to first URL
  return allUrls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format';
};

/**
 * Get utensil image with fallback logic
 */
export const getUtensilImage = (utensilName: string, backendImageUrl?: string): string => {
  // Priority 1: Use backend image if provided and valid
  if (backendImageUrl && isValidImageUrl(backendImageUrl)) {
    return backendImageUrl;
  }
  
  // Priority 2: Try to find in local mapping by matching utensil name
  const normalizedName = utensilName.toLowerCase().trim();
  
  // Try exact match first
  if (UTENSIL_IMAGES[normalizedName]) {
    return UTENSIL_IMAGES[normalizedName];
  }
  
  // Try partial match (e.g., "Large pot for pasta" -> "pot")
  for (const [key, imageUrl] of Object.entries(UTENSIL_IMAGES)) {
    if (normalizedName.includes(key)) {
      return imageUrl;
    }
  }
  
  // Priority 3: Fallback to generic utensil image from Unsplash
  return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&h=200&fit=crop&auto=format';
};

/**
 * Get next available utensil image from the list
 * Used as fallback when an image fails to load
 */
export const getNextUtensilImage = (failedUrl: string): string => {
  const allUrls = getUtensilFallbackUrls();
  const currentIndex = allUrls.indexOf(failedUrl);
  
  // If found, return next URL, otherwise return first URL
  if (currentIndex !== -1 && currentIndex < allUrls.length - 1) {
    return allUrls[currentIndex + 1];
  }
  
  // If at end or not found, cycle back to first URL
  return allUrls[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&h=200&fit=crop&auto=format';
};

/**
 * Get step image with fallback logic
 * Matches based on keywords in step title or description
 */
export const getStepImage = (stepTitle: string, stepDescription?: string, backendImageUrl?: string): string => {
  // Priority 1: Use backend image if provided and valid
  if (backendImageUrl && isValidImageUrl(backendImageUrl)) {
    return backendImageUrl;
  }
  
  // Priority 2: Try to find in local mapping by matching step keywords
  const searchText = `${stepTitle} ${stepDescription || ''}`.toLowerCase().trim();
  
  // Try exact match first
  if (STEP_IMAGES[stepTitle.toLowerCase().trim()]) {
    return STEP_IMAGES[stepTitle.toLowerCase().trim()];
  }
  
  // Try partial match - search for cooking action keywords
  for (const [key, imageUrl] of Object.entries(STEP_IMAGES)) {
    if (searchText.includes(key)) {
      return imageUrl;
    }
  }
  
  // Priority 3: Fallback to generic cooking image from Unsplash
  return 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop&auto=format';
};

/**
 * Get next available step image from the list
 * Used as fallback when an image fails to load
 */
export const getNextStepImage = (failedUrl: string): string => {
  const allUrls = getStepFallbackUrls();
  const currentIndex = allUrls.indexOf(failedUrl);
  
  // If found, return next URL, otherwise return first URL
  if (currentIndex !== -1 && currentIndex < allUrls.length - 1) {
    return allUrls[currentIndex + 1];
  }
  
  // If at end or not found, cycle back to first URL
  return allUrls[0] || 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop&auto=format';
};

/**
 * Check if a URL is a valid image URL format (doesn't check if it actually loads)
 */
export const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  // Check if it's a local path (starts with /)
  if (url.startsWith('/')) return true;
  // Check if it ends with common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) && !lowerUrl.includes('/recipes/');
};

/**
 * Get all available fallback URLs for ingredients (in priority order)
 */
const getIngredientFallbackUrls = (): string[] => {
  return Object.values(INGREDIENT_IMAGES);
};

/**
 * Get all available fallback URLs for utensils (in priority order)
 */
const getUtensilFallbackUrls = (): string[] => {
  return Object.values(UTENSIL_IMAGES);
};

/**
 * Get all available fallback URLs for steps (in priority order)
 */
const getStepFallbackUrls = (): string[] => {
  return Object.values(STEP_IMAGES);
};

/**
 * Try to get a working image URL from a list, with fallback to next valid image
 * This function returns an image with onError handler that cycles through fallbacks
 */
const getImageWithFallbacks = (
  primaryUrl: string,
  fallbackUrls: string[],
  defaultFallback: string
): string => {
  // For now, return primary URL
  // The actual fallback logic will be handled by the Image component's onError handler
  // which will use the data-fallback-urls attribute
  return primaryUrl;
};

/**
 * Generate data attributes for fallback URLs
 * This can be used by Image components to handle 404s gracefully
 */
export const getImageFallbackData = (
  primaryUrl: string,
  category: 'ingredient' | 'utensil' | 'step'
): { src: string; 'data-fallback-urls': string; 'data-fallback-index': number } => {
  let fallbackUrls: string[];
  
  switch (category) {
    case 'ingredient':
      fallbackUrls = getIngredientFallbackUrls();
      break;
    case 'utensil':
      fallbackUrls = getUtensilFallbackUrls();
      break;
    case 'step':
      fallbackUrls = getStepFallbackUrls();
      break;
  }
  
  // Remove the primary URL from fallbacks to avoid duplicates
  const uniqueFallbacks = fallbackUrls.filter(url => url !== primaryUrl);
  
  return {
    src: primaryUrl,
    'data-fallback-urls': JSON.stringify(uniqueFallbacks),
    'data-fallback-index': 0,
  };
};

