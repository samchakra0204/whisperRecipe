/*import { sampleRecipes } from "@/data/sampleRecipes";
import { db } from "@/firebase/config";
import { Recipe } from "@/types/Recipe";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";

// TheMealDB base URL
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Collection name in Firestore
const RECIPES_COLLECTION = "recipes";

// Function to generate unique recipe ID
const generateUniqueId = (baseId: string): string => {
  return `${baseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Function to load recipes from Firebase with fallback
export const loadRecipesFromFirebase = async (): Promise<Recipe[]> => {
  try {
    console.log("Attempting to load recipes from Firebase...");
    const recipesSnapshot = await getDocs(collection(db, RECIPES_COLLECTION));
    const recipes: Recipe[] = [];
    
    const seenIds = new Set<string>();
    
    recipesSnapshot.forEach((doc) => {
      const recipeData = doc.data() as Recipe;
      
      if (seenIds.has(recipeData.id)) {
        console.log(`Skipping duplicate recipe with ID: ${recipeData.id}`);
        return;
      }
      
      seenIds.add(recipeData.id);
      recipes.push({ ...recipeData, firebaseId: doc.id });
    });
    
    console.log(`Loaded ${recipes.length} recipes from Firebase`);
    return recipes;
  } catch (error) {
    console.error("Error loading recipes from Firebase:", error);
    toast.error("Failed to load saved recipes, using local data instead");
    
    return [...sampleRecipes];
  }
};

// Function to check if a recipe already exists in Firebase
const recipeExistsInFirebase = async (recipeId: string): Promise<boolean> => {
  try {
    const q = query(collection(db, RECIPES_COLLECTION), where("id", "==", recipeId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if recipe exists:", error);
    return false;
  }
};

// Function to save a recipe to Firebase with error handling
export const saveRecipeToFirebase = async (recipe: Recipe): Promise<string | null> => {
  try {
    console.log("Saving recipe to Firebase:", recipe.name);
    
    const exists = await recipeExistsInFirebase(recipe.id);
    if (exists) {
      console.log(`Recipe with ID ${recipe.id} already exists in Firebase, skipping save`);
      return null;
    }
    
    const recipeToSave = { ...recipe };
    delete (recipeToSave as any).firebaseId;
    
    const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeToSave);
    console.log("Recipe saved to Firebase with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving recipe to Firebase:", error);
    toast.warning("Recipe saved locally but couldn't connect to database");
    return null;
  }
};

// Function to sync sample recipes to Firebase with better error handling
export const syncSampleRecipesToFirebase = async (): Promise<void> => {
  try {
    console.log("Syncing sample recipes to Firebase...");
    
    let syncedCount = 0;
    
    for (const recipe of sampleRecipes) {
      const exists = await recipeExistsInFirebase(recipe.id);
      
      if (!exists) {
        const firebaseId = await saveRecipeToFirebase(recipe);
        if (firebaseId) {
          console.log(`Sample recipe "${recipe.name}" saved to Firebase`);
          syncedCount++;
        }
      } else {
        console.log(`Sample recipe "${recipe.name}" already exists in Firebase, skipping`);
      }
    }
    
    if (syncedCount > 0) {
      toast.success(`Added ${syncedCount} sample recipes to your collection`);
    } else {
      console.log("No new sample recipes to sync");
    }
  } catch (error) {
    console.error("Error syncing sample recipes to Firebase:", error);
    toast.warning("Using local recipe data");
  }
};

// Proxy function to handle CORS issues
const fetchWithProxy = async (url: string): Promise<Response> => {
  try {
    const response = await fetch(url);
    return response;
  } catch (error) {
    console.log("Direct API call failed, trying with CORS proxy...");
    const proxyUrl = "https://cors-anywhere.herokuapp.com/" + url;
    
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy API error: ${response.status}`);
      }
      return response;
    } catch (proxyError) {
      console.error("Proxy API call failed:", proxyError);
      throw new Error("Failed to fetch data even with proxy");
    }
  }
};

// Function to search recipes online using TheMealDB API with CORS handling
export const searchRecipeOnline = async (query: string): Promise<Recipe | null> => {
  console.log(`Searching online for: ${query}`);
  
  try {
    // TheMealDB search endpoint by name
    const searchUrl = `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`;
    
    toast.info("Searching for recipes online...");
    
    const searchResponse = await fetchWithProxy(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.meals || searchData.meals.length === 0) {
      toast.error("No recipes found for this search term");
      return null;
    }
    
    const meal = searchData.meals[0];
    
    // Unique local recipe ID using MealDB idMeal prefixed by 'mealdb-'
    const localRecipeId = `mealdb-${meal.idMeal}`;
    
    // Check if recipe exists in Firebase
    const exists = await recipeExistsInFirebase(localRecipeId);
    if (exists) {
      toast.info("Recipe already exists in your collection");
      const allRecipes = await loadRecipesFromFirebase();
      const existingRecipe = allRecipes.find(r => r.id === localRecipeId);
      if (existingRecipe) {
        return existingRecipe;
      }
    }
    
    // Extract ingredients and measures dynamically
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
      }
    }
    
    // Extract steps from instructions string, split by line or dot
    let steps: string[] = [];
    if (meal.strInstructions) {
      steps = meal.strInstructions
        .split(/\r?\n|\. /)
        .map((step: string) => step.trim())
        .filter((step: string) => step.length > 0);
    } else {
      steps = ["No detailed instructions available for this recipe."];
    }
    
    // Difficulty estimation based on number of ingredients
    let difficulty: "Easy" | "Medium" | "Hard";
    const ingredientCount = ingredients.length;
    
    if (ingredientCount <= 5) {
      difficulty = "Easy";
    } else if (ingredientCount <= 10) {
      difficulty = "Medium";
    } else {
      difficulty = "Hard";
    }
    
    // Create the recipe object
    const recipe: Recipe = {
      id: localRecipeId,
      name: meal.strMeal,
      description: meal.strInstructions
        ? meal.strInstructions.slice(0, 200) + "..."
        : `A delicious recipe for ${query}.`,
      image: meal.strMealThumb || "https://via.placeholder.com/500",
      cookTime: 30, // TheMealDB does not provide cook time, default to 30
      difficulty,
      servings: 2, // No servings info in MealDB, default to 2
      ingredients,
      steps,
    };
    
    try {
      const firebaseId = await saveRecipeToFirebase(recipe);
      if (firebaseId) {
        (recipe as any).firebaseId = firebaseId;
      }
    } catch (e) {
      console.warn("Couldn't save recipe to Firebase, but recipe is available locally");
    }
    
    return recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    toast.error("Failed to fetch recipe. Please try again later.");
    return null;
  }
};

// Function to delete a recipe from the collection
export const deleteRecipeFromCollection = async (recipeId: string, firebaseId?: string): Promise<boolean> => {
  const initialLength = sampleRecipes.length;
  const index = sampleRecipes.findIndex(recipe => recipe.id === recipeId);
  
  if (index !== -1) {
    sampleRecipes.splice(index, 1);
  }
  
  if (firebaseId) {
    try {
      await deleteDoc(doc(db, RECIPES_COLLECTION, firebaseId));
      console.log(`Recipe deleted from Firebase: ${firebaseId}`);
      return true;
    } catch (error) {
      console.error("Error deleting recipe from Firebase:", error);
      toast.warning("Recipe removed locally but couldn't connect to database");
      return index !== -1;
    }
  }
  
  return sampleRecipes.length < initialLength;
};*/

import { sampleRecipes } from "@/data/sampleRecipes";
import { db } from "@/firebase/config";
import { Recipe } from "@/types/Recipe";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";

const RECIPES_COLLECTION = "recipes";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const SPOONACULAR_API_KEY = "YOUR_SPOONACULAR_KEY";

async function fetchWithProxy(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    // fallback with CORS proxy if direct fetch fails
    return await fetch(CORS_PROXY + encodeURIComponent(url));
  }
}

async function recipeExistsInFirebase(localId: string): Promise<boolean> {
  const q = query(collection(db, "recipes"), where("id", "==", localId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function printAllRecipes() {
  try {
    const snapshot = await getDocs(collection(db, "recipes"));
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

printAllRecipes();


export async function syncSampleRecipesToFirebase() {
  try {
    for (const recipe of sampleRecipes) {
      const q = query(collection(db, RECIPES_COLLECTION), where("id", "==", recipe.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Recipe does not exist in Firebase, add it
        const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipe);
        // Save firebaseId back to local recipe for future reference
        recipe.firebaseId = docRef.id;
      } else {
        // Recipe exists, update local firebaseId with existing Firestore document ID
        snapshot.forEach(docSnap => {
          recipe.firebaseId = docSnap.id;
        });
      }
    }
    toast.success("Sample recipes synced to Firebase!");
  } catch (error) {
    console.error("Error syncing sample recipes:", error);
    toast.error("Failed to sync sample recipes.");
  }
}

export async function loadRecipesFromFirebase(): Promise<Recipe[]> {
  const snapshot = await getDocs(collection(db, "recipes"));
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Recipe),
    firebaseId: doc.id,
  }));
}

export const deleteRecipeFromCollection = async (
  recipeId: string,
  firebaseId?: string
): Promise<boolean> => {
  const initialLength = sampleRecipes.length;

  // Remove from local sampleRecipes array
  const index = sampleRecipes.findIndex(recipe => recipe.id === recipeId);
  if (index !== -1) {
    sampleRecipes.splice(index, 1);
  }

  if (firebaseId) {
    try {
      // Delete the explicitly provided Firebase document
      await deleteDoc(doc(db, RECIPES_COLLECTION, firebaseId));
      console.log(`Deleted recipe from Firebase: ${firebaseId}`);

      // Query for all other documents with same recipe id
      const q = query(collection(db, RECIPES_COLLECTION), where("id", "==", recipeId));
      const snapshot = await getDocs(q);

      // If duplicates remain, delete all but one
      if (snapshot.size > 1) {
        const docs = snapshot.docs;

        // Keep one doc — preferably the one with firebaseId if still present, otherwise first doc
        let toKeepDocId = firebaseId;
        if (!docs.some(doc => doc.id === firebaseId)) {
          toKeepDocId = docs[0].id;
        }

        // Delete all except toKeepDocId
        for (const docSnap of docs) {
          if (docSnap.id !== toKeepDocId) {
            await deleteDoc(doc(db, RECIPES_COLLECTION, docSnap.id));
            console.log(`Deleted duplicate recipe firebaseId: ${docSnap.id}`);
          }
        }
      }

      toast.success("Deleted recipe and duplicates (kept one).");
      return true;
    } catch (error) {
      console.error("Error deleting recipe(s) from Firebase:", error);
      toast.warning("Recipe removed locally but couldn't delete from database");
      return index !== -1;
    }
  }

  // Only local delete happened
  return sampleRecipes.length < initialLength;
};

export async function saveRecipeToFirebase(recipe: Recipe): Promise<string | null> {
  try {
    const exists = await recipeExistsInFirebase(recipe.id);
    if (exists) {
      await deleteRecipeFromCollection(recipe.id);
      toast.info("Duplicate recipes found and removed.");
    }

    const docRef = await addDoc(collection(db, "recipes"), recipe);
    toast.success("Recipe saved!");
    return docRef.id;
  } catch (err) {
    console.error("Firebase save error:", err);
    toast.error("Failed to save recipe.");
    return null;
  }
}

function estimateDifficulty(ingredientsCount: number): "Easy" | "Medium" | "Hard" {
  if (ingredientsCount <= 5) return "Easy";
  if (ingredientsCount <= 10) return "Medium";
  return "Hard";
}

function extractIngredients(drink: any): string[] {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
    } else {
      break;
    }
  }
  return ingredients;
}

function extractSteps(instructions: string | null): string[] {
  if (!instructions) return ["Instructions not available."];
  return instructions
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function searchRecipeOnline(query: string): Promise<Recipe | null> {
  query = query.trim();
  if (!query) {
    toast.error("Please enter a search query");
    return null;
  }

  // 1. Edamam API
  try {
    const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(
      query
    )}&app_id=YOUR_EDAMAM_APP_ID&app_key=YOUR_EDAMAM_APP_KEY`;
    const response = await fetchWithProxy(edamamUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        const rec = data.hits[0].recipe;
        const localId = `edamam-${rec.uri.split("#")[1]}`;

        if (await recipeExistsInFirebase(localId)) {
          toast.info("Recipe already saved");
          const allRecipes = await loadRecipesFromFirebase();
          return allRecipes.find((r) => r.id === localId) || null;
        }

        const recipe: Recipe = {
          id: localId,
          name: rec.label,
          description: rec.label + " recipe from Edamam",
          image: rec.image,
          cookTime: rec.totalTime || 30,
          difficulty: estimateDifficulty(rec.ingredientLines.length),
          servings: rec.yield || 2,
          ingredients: rec.ingredientLines,
          steps: ["Instructions not available."],
        };
        const firebaseId = await saveRecipeToFirebase(recipe);
        if (firebaseId) recipe.firebaseId = firebaseId;
        return recipe;
      }
    }
  } catch (e) {
    console.error("Edamam fetch failed:", e);
  }

  // 2. TheMealDB API
  try {
    const mealUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetchWithProxy(mealUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        const localId = `themealdb-${meal.idMeal}`;

        if (await recipeExistsInFirebase(localId)) {
          toast.info("Recipe already saved");
          const allRecipes = await loadRecipesFromFirebase();
          return allRecipes.find((r) => r.id === localId) || null;
        }

        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim() !== "") {
            ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
          } else break;
        }

        const steps = meal.strInstructions
          ? meal.strInstructions.split(".").map((s: string) => s.trim()).filter(Boolean)
          : ["Instructions not available."];

        const recipe: Recipe = {
          id: localId,
          name: meal.strMeal,
          description: meal.strArea ? `A ${meal.strArea} dish` : `Recipe for ${query}`,
          image: meal.strMealThumb,
          cookTime: 30,
          difficulty: estimateDifficulty(ingredients.length),
          servings: 2,
          ingredients,
          steps,
        };

        const firebaseId = await saveRecipeToFirebase(recipe);
        if (firebaseId) recipe.firebaseId = firebaseId;
        return recipe;
      }
    }
  } catch (e) {
    console.error("TheMealDB fetch failed:", e);
  }

  // 3. Spoonacular API
  try {
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      query
    )}&addRecipeInformation=true&number=1&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await fetchWithProxy(spoonacularUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const recipeData = data.results[0];
        const localId = `spoonacular-${recipeData.id}`;

        if (await recipeExistsInFirebase(localId)) {
          toast.info("Recipe already saved");
          const allRecipes = await loadRecipesFromFirebase();
          return allRecipes.find((r) => r.id === localId) || null;
        }

        const ingredients = recipeData.extendedIngredients
          ? recipeData.extendedIngredients.map(
              (ing: any) => `${ing.amount} ${ing.unit} ${ing.name}`.trim()
            )
          : [];

        const steps =
          recipeData.analyzedInstructions && recipeData.analyzedInstructions.length > 0
            ? recipeData.analyzedInstructions[0].steps.map((step: any) => step.step)
            : ["Instructions not available."];

        const recipe: Recipe = {
          id: localId,
          name: recipeData.title,
          description: recipeData.summary
            ? recipeData.summary.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 200) + "..."
            : `A tasty recipe for ${query}`,
          image: recipeData.image || "https://via.placeholder.com/500",
          cookTime: recipeData.readyInMinutes || 30,
          difficulty: estimateDifficulty(ingredients.length),
          servings: recipeData.servings || 2,
          ingredients,
          steps,
        };

        const firebaseId = await saveRecipeToFirebase(recipe);
        if (firebaseId) recipe.firebaseId = firebaseId;
        return recipe;
      }
    }
  } catch (e) {
    console.error("Spoonacular fetch failed:", e);
  }

  // 4. TheCocktailDB API
  try {
    const cocktailUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    const response = await fetchWithProxy(cocktailUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.drinks && data.drinks.length > 0) {
        const drink = data.drinks[0];
        const localId = `cocktaildb-${drink.idDrink}`;

        if (await recipeExistsInFirebase(localId)) {
          toast.info("Recipe already saved");
          const allRecipes = await loadRecipesFromFirebase();
          return allRecipes.find((r) => r.id === localId) || null;
        }

        const ingredients = extractIngredients(drink);
        const steps = extractSteps(drink.strInstructions);

        const recipe: Recipe = {
          id: localId,
          name: drink.strDrink,
          description: drink.strInstructions
            ? drink.strInstructions.slice(0, 200) + "..."
            : `A delicious drink recipe for ${query}`,
          image: drink.strDrinkThumb || "https://via.placeholder.com/500",
          cookTime: 10,
          difficulty: estimateDifficulty(ingredients.length),
          servings: 1,
          ingredients,
          steps,
        };

        const firebaseId = await saveRecipeToFirebase(recipe);
        if (firebaseId) recipe.firebaseId = firebaseId;
        return recipe;
      }
    }
  } catch (e) {
    console.error("TheCocktailDB fetch failed:", e);
  }

  toast.error("No recipes found online for your query.");
  return null;
}
