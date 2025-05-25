import { Button } from "@/components/ui/button";
import { Recipe } from "@/types/Recipe";
import React, { useState } from "react";
import AddRecipeForm from "./AddRecipeForm";

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | undefined>(undefined);

  const handleAddOrUpdateRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === recipe.id);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = recipe;
        return updated;
      }
      // Add new
      return [...prev, recipe];
    });
    setRecipeToEdit(undefined);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <AddRecipeForm
        onAddRecipe={handleAddOrUpdateRecipe}
        recipeToEdit={recipeToEdit}
      />

      <h2 className="mt-8 mb-4 text-xl font-semibold">Recipe List</h2>
      {recipes.length === 0 ? (
        <p>No recipes added yet.</p>
      ) : (
        <ul className="space-y-4">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{recipe.name}</h3>
                <p>Cook time: {recipe.cookTime} mins</p>
                <p>Difficulty: {recipe.difficulty}</p>
                <p>Servings: {recipe.servings}</p>
              </div>
              <Button onClick={() => setRecipeToEdit(recipe)}>Edit</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipesPage;
