
import { Recipe } from "@/types/Recipe";

// Use stable IDs for sample recipes to prevent duplicates
const createStableId = (baseId: string): string => {
  return `sample-${baseId}`;
};

// Using 'export const' instead of 'export default' so it can be modified
export const sampleRecipes: Recipe[] = [
  {
    id: createStableId("recipe-1"),
    name: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish with eggs, cheese, pancetta and black pepper.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
    cookTime: 20,
    difficulty: "Easy",
    servings: 4,
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale, diced",
      "4 large eggs",
      "100g Pecorino Romano cheese, grated",
      "50g Parmesan cheese, grated",
      "2 garlic cloves, minced (optional)",
      "Fresh ground black pepper",
      "Salt to taste"
    ],
    steps: [
      "Bring a large pot of salted water to a boil and cook the spaghetti according to package instructions until al dente.",
      "While pasta is cooking, heat a large skillet over medium heat and cook the pancetta until crispy, about 7-8 minutes.",
      "In a bowl, whisk together eggs, grated Pecorino, grated Parmesan, and plenty of freshly ground black pepper.",
      "When pasta is done, reserve 1 cup of pasta water, then drain the pasta.",
      "Working quickly, add the hot pasta to the skillet with the pancetta, tossing to combine.",
      "Remove the skillet from heat and quickly pour in the egg mixture, stirring continuously until the eggs thicken but don't scramble.",
      "Add a splash of the reserved pasta water to create a creamy sauce if needed.",
      "Serve immediately with extra grated cheese and black pepper on top."
    ]
  },
  {
    id: createStableId("recipe-2"),
    name: "Chicken Tikka Masala",
    description: "A flavorful Indian dish with marinated chicken pieces in a creamy tomato sauce.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1071&q=80",
    cookTime: 45,
    difficulty: "Medium",
    servings: 4,
    ingredients: [
      "800g chicken breast, cut into bite-size pieces",
      "1 cup plain yogurt",
      "2 tbsp lemon juice",
      "2 tsp ground cumin",
      "2 tsp ground turmeric",
      "2 tsp ground coriander",
      "2 tsp garam masala",
      "2 tsp paprika",
      "1 large onion, finely chopped",
      "4 garlic cloves, minced",
      "1 tbsp ginger, grated",
      "400g can of tomatoes",
      "1 cup heavy cream",
      "Fresh cilantro for garnish",
      "Salt to taste"
    ],
    steps: [
      "In a large bowl, combine yogurt, lemon juice, cumin, turmeric, coriander, 1 tsp garam masala, and paprika.",
      "Add chicken pieces to the marinade, cover and refrigerate for at least 1 hour, preferably overnight.",
      "Heat oil in a large skillet over medium-high heat. Cook the marinated chicken pieces until browned, about 3-4 minutes per side.",
      "Remove the chicken and set aside. In the same skillet, add onion and cook until soft, about 5 minutes.",
      "Add garlic and ginger, cook for 1 minute until fragrant.",
      "Add canned tomatoes, bring to a simmer and cook for 10-15 minutes until sauce thickens.",
      "Stir in cream and the remaining 1 tsp garam masala. Simmer for 5 minutes.",
      "Return the chicken to the sauce and simmer until chicken is cooked through, about 10 minutes.",
      "Season with salt to taste and garnish with fresh cilantro before serving."
    ]
  },
  {
    id: createStableId("recipe-3"),
    name: "Avocado Toast with Poached Egg",
    description: "A simple yet nutritious breakfast with creamy avocado and perfectly poached egg on toast.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
    cookTime: 15,
    difficulty: "Easy",
    servings: 2,
    ingredients: [
      "2 slices of bread (sourdough works well)",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp white vinegar",
      "1/2 lemon, juiced",
      "Red pepper flakes (optional)",
      "Salt and pepper to taste",
      "Fresh herbs for garnish (parsley, cilantro, or chives)"
    ],
    steps: [
      "Toast the bread slices to your preferred level of crispiness.",
      "In a small bowl, mash the avocado with lemon juice, salt, and pepper.",
      "Fill a saucepan with water (about 3 inches deep) and bring to a gentle simmer. Add vinegar.",
      "Crack each egg into a small bowl. Create a gentle whirlpool in the simmering water with a spoon.",
      "Carefully slide each egg into the whirlpool and poach for 3-4 minutes for a runny yolk.",
      "While eggs are poaching, spread the mashed avocado on the toast slices.",
      "Remove eggs with a slotted spoon and place on paper towels to drain excess water.",
      "Place poached eggs on top of the avocado toast, sprinkle with red pepper flakes if desired, and garnish with fresh herbs."
    ]
  }
];