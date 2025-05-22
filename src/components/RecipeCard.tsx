
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Utensils } from "lucide-react";
import { Recipe } from "@/types/Recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock size={16} />
          <span>{recipe.cookTime} min</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">{recipe.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <ChefHat size={16} className="mr-1" />
          <span>{recipe.difficulty}</span>
        </div>
        <Button onClick={() => onSelect(recipe)} size="sm" variant="outline">
          <Utensils size={16} className="mr-2" />
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
