
import { sampleRecipes } from "@/data/sampleRecipes";
import { db } from "@/firebase/config";
import { Recipe } from "@/types/Recipe";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";

// Spoonacular API key - in a real app, this would be in an environment variable
const SPOONACULAR_API_KEY = "505771b0111045f0b7b8493b3989b582";
const BASE_URL = "https://api.spoonacular.com";
const PROXY_BASE_URL = "https://cors-anywhere.herokuapp.com/" + BASE_URL;

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
      
      // Skip duplicates by ID
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
    
    // Check if this recipe already exists
    const exists = await recipeExistsInFirebase(recipe.id);
    if (exists) {
      console.log(`Recipe with ID ${recipe.id} already exists in Firebase, skipping save`);
      return null;
    }
    
    const recipeToSave = { ...recipe };
    delete (recipeToSave as any).firebaseId; // Remove firebaseId if exists
    
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
    
    // Try to sync each sample recipe individually
    for (const recipe of sampleRecipes) {
      // Check if this recipe already exists in Firebase
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
    // First try direct API call
    const response = await fetch(url);
    return response;
  } catch (error) {
    console.log("Direct API call failed, trying with CORS proxy...");
    // If direct call fails, try with CORS proxy
    const proxyUrl = "https://cors-anywhere.herokuapp.com/" + url;
    
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy API error: ${response.status}`);
      }
      return response;
    } catch (proxyError) {
      console.error("Proxy API call failed:", proxyError);
      // Fall back to local data only
      throw new Error("Failed to fetch data even with proxy");
    }
  }
};

// Function to search recipes online using Spoonacular API with CORS handling
export const searchRecipeOnline = async (query: string): Promise<Recipe | null> => {
  console.log(`Searching online for: ${query}`);
  
  try {
    // Step 1: Search for recipes by query
    const searchUrl = `${BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=1`;
    
    toast.info("Searching for recipes online...");
    
    const searchResponse = await fetchWithProxy(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      toast.error("No recipes found for this search term");
      return null;
    }
    
    const recipeId = searchData.results[0].id;
    
    // Generate a unique ID for our local database
    const localRecipeId = `online-${recipeId}`;
    
    // Check if this recipe already exists in Firebase
    const exists = await recipeExistsInFirebase(localRecipeId);
    if (exists) {
      toast.info("Recipe already exists in your collection");
      // Try to load it from Firebase
      const allRecipes = await loadRecipesFromFirebase();
      const existingRecipe = allRecipes.find(r => r.id === localRecipeId);
      if (existingRecipe) {
        return existingRecipe;
      }
    }
    
    // Step 2: Get detailed recipe information
    const detailUrl = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=false`;
    const detailResponse = await fetchWithProxy(detailUrl);
    
    if (!detailResponse.ok) {
      throw new Error(`API error: ${detailResponse.status}`);
    }
    
    const recipeDetail = await detailResponse.json();
    
    // Extract steps from recipe details
    let steps: string[] = [];
    if (recipeDetail.analyzedInstructions && 
        recipeDetail.analyzedInstructions.length > 0 && 
        recipeDetail.analyzedInstructions[0].steps) {
      steps = recipeDetail.analyzedInstructions[0].steps.map((step: any) => step.step);
    } else {
      steps = [
        "No detailed instructions available for this recipe.",
        "Please check the recipe description or search for another recipe."
      ];
    }
    
    // Extract ingredients
    const ingredients = recipeDetail.extendedIngredients 
      ? recipeDetail.extendedIngredients.map((ing: any) => ing.original)
      : [`Ingredients for ${query} not available`];
    
    // Calculate difficulty based on readyInMinutes
    let difficulty: "Easy" | "Medium" | "Hard";
    const cookTime = recipeDetail.readyInMinutes || 30;
    
    if (cookTime < 20) {
      difficulty = "Easy";
    } else if (cookTime < 45) {
      difficulty = "Medium";
    } else {
      difficulty = "Hard";
    }
    
    // Create the recipe object
    const recipe: Recipe = {
      id: localRecipeId,
      name: recipeDetail.title,
      description: recipeDetail.summary ? recipeDetail.summary.replace(/<[^>]*>/g, '').slice(0, 200) + "..." : `A delicious recipe for ${query}.`,
      image: recipeDetail.image || "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGZvb2R8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      cookTime: cookTime,
      difficulty: difficulty,
      servings: recipeDetail.servings || 2,
      ingredients: ingredients,
      steps: steps
    };
    
    // Try to save to Firebase, but don't let it block if it fails
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
  
  // Remove from local array
  if (index !== -1) {
    sampleRecipes.splice(index, 1);
  }
  
  // Remove from Firebase if we have a Firebase ID
  if (firebaseId) {
    try {
      await deleteDoc(doc(db, RECIPES_COLLECTION, firebaseId));
      console.log(`Recipe deleted from Firebase: ${firebaseId}`);
      return true;
    } catch (error) {
      console.error("Error deleting recipe from Firebase:", error);
      toast.warning("Recipe removed locally but couldn't connect to database");
      return index !== -1; // Still return true if we removed it locally
    }
  }
  
  return sampleRecipes.length < initialLength;
};