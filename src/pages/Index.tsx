import AddRecipeForm from "@/components/AddRecipeForm";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceRecognition from "@/components/VoiceRecognition";
import { sampleRecipes } from "@/data/sampleRecipes";
import {
  deleteRecipeFromCollection,
  loadRecipesFromFirebase,
  saveRecipeToFirebase,
  searchRecipeOnline,
  syncSampleRecipesToFirebase
} from "@/services/recipeSearchService";
import { Recipe } from "@/types/Recipe";
import { ChefHat, Globe, Loader2, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseConnected, setDatabaseConnected] = useState(false);

  // Load recipes from Firebase on component mount
  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      try {
        // First, try to sync sample recipes to Firebase
        await syncSampleRecipesToFirebase();
        
        // Then load all recipes from Firebase
        const firebaseRecipes = await loadRecipesFromFirebase();
        
        if (firebaseRecipes.length > 0) {
          setDatabaseConnected(true);
          setRecipes(firebaseRecipes);
          setFilteredRecipes(firebaseRecipes);
          toast.success(`Loaded ${firebaseRecipes.length} recipes from your collection`);
        } else {
          // Fallback to sample recipes if Firebase has no data
          setRecipes([...sampleRecipes]);
          setFilteredRecipes([...sampleRecipes]);
          toast.info("Using default recipes for your collection");
        }
      } catch (error) {
        console.error("Error loading recipes:", error);
        toast.error("Failed to connect to the recipe database");
        
        // Fallback to sample recipes if Firebase fails
        setRecipes([...sampleRecipes]);
        setFilteredRecipes([...sampleRecipes]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecipes();
  }, []);

  const filterRecipes = useCallback((query: string) => {
    if (!query) {
      setFilteredRecipes(recipes);
      return true;
    }
    
    const filtered = recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredRecipes(filtered);
    
    if (filtered.length === 0) {
      toast.info("No recipes found matching your search");
      return false;
    }
    return true;
  }, [recipes]);

  useEffect(() => {
    filterRecipes(searchQuery);
  }, [searchQuery, filterRecipes]);

  // Use Firebase for adding recipes
  const handleAddRecipe = async (newRecipe: Recipe) => {
    try {
      // Try to save to Firebase first
      const firebaseId = await saveRecipeToFirebase(newRecipe);
      
      // Add Firebase ID to recipe if available
      const recipeWithId = firebaseId 
        ? { ...newRecipe, firebaseId }
        : newRecipe;
      
      // Update local state
      setRecipes(prevRecipes => [...prevRecipes, recipeWithId]);
      setFilteredRecipes(prevRecipes => [...prevRecipes, recipeWithId]);
      
      if (firebaseId) {
        toast.success("Recipe added to your collection and saved to database");
      } else {
        toast.success("Recipe added to your local collection");
      }
      
      setSearchQuery("");  // Clear search to show all recipes including the new one
    } catch (error) {
      console.error("Error adding recipe:", error);
      toast.error("Failed to add recipe");
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const recipeToDelete = recipes.find(r => r.id === recipeId);
    if (recipeToDelete) {
      const firebaseId = (recipeToDelete as any).firebaseId;
      
      try {
        const deleted = await deleteRecipeFromCollection(recipeId, firebaseId);
        
        if (deleted) {
          setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
          setFilteredRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
          setSelectedRecipe(null);
          
          toast.success("Recipe deleted successfully");
        } else {
          toast.error("Failed to delete recipe");
        }
      } catch (error) {
        console.error("Error during delete:", error);
        
        // Still remove from local state even if Firebase delete fails
        setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
        setFilteredRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
        setSelectedRecipe(null);
        
        toast.warning("Recipe removed from local collection");
      }
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setIsProcessing(true);
    
    // Simple command processing
    const lowercaseTranscript = transcript.toLowerCase();
    
    // Search commands
    if (lowercaseTranscript.includes("search for") || lowercaseTranscript.includes("find")) {
      const searchTerms = lowercaseTranscript
        .replace("search for", "")
        .replace("find", "")
        .trim();
      
      setSearchQuery(searchTerms);
      toast.success(`Searching for "${searchTerms}"`);
    }
    // Show all recipes command
    else if (lowercaseTranscript.includes("show all recipes") || lowercaseTranscript.includes("all recipes")) {
      setSearchQuery("");
      toast.success("Showing all recipes");
    }
    // Direct recipe search
    else {
      setSearchQuery(transcript);
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = filterRecipes(searchQuery);
    
    // If no local recipes found, offer to search online
    if (!found && searchQuery.trim().length > 0) {
      toast.info("No recipes found locally. Would you like to search online?", {
        action: {
          label: "Search online",
          onClick: () => handleOnlineSearch(),
        },
      });
    }
  };

  const handleOnlineSearch = async () => {
    try {
      setIsSearching(true);
      toast.info("Searching online. This may take a moment...", {
        duration: 5000
      });
      
      const recipe = await searchRecipeOnline(searchQuery);
      setIsSearching(false);
      
      if (recipe) {
        handleAddRecipe(recipe);
        setSelectedRecipe(recipe);
        toast.success("Recipe found and added to your collection!");
      }
    } catch (error) {
      setIsSearching(false);
      toast.error("Failed to search for recipe online. Please try again later.");
      console.error("Online search error:", error);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ChefHat size={32} className="text-primary" />
          <h1 className="text-3xl font-bold text-primary">WhisperChef</h1>
        </div>
        <p className="text-muted-foreground">
          Your AI voice-powered recipe assistant
        </p>
        {!databaseConnected && (
          <p className="text-amber-500 text-sm mt-2">
            Using local data mode - changes won't persist after reload
          </p>
        )}
      </header>

      <div className="w-full max-w-xl mx-auto mb-8">
        <VoiceRecognition 
          onResult={handleVoiceResult}
          isProcessing={isProcessing}
        />
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleManualSearch} className="flex gap-2 flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes or say 'search for pasta'"
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search size={18} className="mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleOnlineSearch} 
              disabled={isSearching || !searchQuery}
            >
              {isSearching ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Globe size={18} className="mr-2" />
              )}
              {isSearching ? "Searching..." : "Web Search"}
            </Button>
          </form>
          <AddRecipeForm onAddRecipe={handleAddRecipe} />
        </div>
      </div>

      {isLoading && (
        <div className="text-center my-8">
          <p className="mb-4 text-muted-foreground">Loading your recipes...</p>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isSearching && (
        <div className="text-center my-8">
          <p className="mb-4 text-muted-foreground">Searching for recipes online...</p>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !isSearching && filteredRecipes.length === 0 && (
        <div className="text-center my-8">
          <p className="mb-4 text-muted-foreground">No recipes found. Would you like to add a new recipe or search online?</p>
          <div className="flex justify-center gap-4">
            <AddRecipeForm onAddRecipe={handleAddRecipe} />
            <Button onClick={handleOnlineSearch} disabled={!searchQuery}>
              <Globe size={18} className="mr-2" />
              Search Online
            </Button>
          </div>
        </div>
      )}

      {selectedRecipe ? (
        <div className="mt-8">
          <RecipeDetail 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)}
            onDelete={handleDeleteRecipe}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.firebaseId || recipe.id} 
              recipe={recipe}
              onSelect={handleSelectRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;