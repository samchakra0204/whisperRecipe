
/*import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { toast } from "sonner";
import { ChefHat, Plus, X } from "lucide-react";
import { Recipe } from "@/types/Recipe";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface AddRecipeFormProps {
  onAddRecipe: (recipe: Recipe) => void;
}

const AddRecipeForm: React.FC<AddRecipeFormProps> = ({ onAddRecipe }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      cookTime: 30,
      difficulty: "Medium" as "Easy" | "Medium" | "Hard",
      servings: 4,
    }
  });

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep.trim()]);
      setCurrentStep("");
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      servings: data.servings,
      ingredients,
      steps,
    };

    onAddRecipe(newRecipe);
    toast.success(`Recipe "${data.name}" added successfully!`);
    form.reset();
    setIngredients([]);
    setSteps([]);
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Add New Recipe
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            Add New Recipe
          </SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your recipe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full h-10 px-3 border border-input rounded-md focus:outline-none"
                        {...field}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="Add ingredient"
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <Button type="button" onClick={addIngredient}>Add</Button>
                </div>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                      <span>{ingredient}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea 
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.target.value)}
                    placeholder="Add step instructions"
                  />
                  <Button type="button" onClick={addStep} className="self-start">Add</Button>
                </div>
                <ol className="space-y-2 list-decimal list-inside">
                  {steps.map((step, index) => (
                    <li key={index} className="bg-muted p-2 rounded flex justify-between">
                      <span className="flex-1">{step}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full">
                Add Recipe
              </Button>
            </CardFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddRecipeForm;*/

/*import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ChefHat, Plus, X } from "lucide-react";
import { Recipe } from "@/types/Recipe";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AddRecipeFormProps {
  onAddRecipe: (recipe: Recipe) => void;
}

const UNSPLASH_ACCESS_KEY = "guTXHFAAITO5gvk-qnsRqmVcUEdCbbbKxjrWTY3sjl8";

const AddRecipeForm: React.FC<AddRecipeFormProps> = ({ onAddRecipe }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      cookTime: 30,
      difficulty: "Medium" as "Easy" | "Medium" | "Hard",
      servings: 4,
    },
  });

  const watchName = form.watch("name");

  useEffect(() => {
    const fetchImage = async (query: string) => {
      if (!query.trim()) return;

      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            query
          )}&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        const data = await res.json();
        const photo = data.results?.[0];
        if (photo?.urls?.small) {
          setImageUrl(photo.urls.small);
        } else {
          setImageUrl(undefined);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageUrl(undefined);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchImage(watchName);
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [watchName]);

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep.trim()]);
      setCurrentStep("");
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      servings: data.servings,
      ingredients,
      steps,
      image: imageUrl,
    };

    onAddRecipe(newRecipe);
    toast.success(`Recipe "${data.name}" added successfully!`);
    form.reset();
    setIngredients([]);
    setSteps([]);
    setImageUrl(undefined);
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Add New Recipe
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            Add New Recipe
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {imageUrl && (
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Recipe preview"
                  className="rounded-md max-h-48 object-cover"
                />
              </div>
            )}

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your recipe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (mins)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 px-3 border border-input rounded-md focus:outline-none"
                        {...field}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="Add ingredient"
                    onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                  />
                  <Button type="button" onClick={addIngredient}>
                    Add
                  </Button>
                </div>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-muted p-2 rounded"
                    >
                      <span>{ingredient}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.target.value)}
                    placeholder="Add step instructions"
                  />
                  <Button type="button" onClick={addStep} className="self-start">
                    Add
                  </Button>
                </div>
                <ol className="space-y-2 list-decimal list-inside">
                  {steps.map((step, index) => (
                    <li
                      key={index}
                      className="bg-muted p-2 rounded flex justify-between"
                    >
                      <span className="flex-1">{step}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full">
                Submit Recipe
              </Button>
            </CardFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddRecipeForm;*/

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ChefHat, Plus, X } from "lucide-react";
import { Recipe } from "@/types/Recipe";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AddRecipeFormProps {
  onAddRecipe: (recipe: Recipe) => void;
  recipeToEdit?: Recipe;
}

const UNSPLASH_ACCESS_KEY = "guTXHFAAITO5gvk-qnsRqmVcUEdCbbbKxjrWTY3sjl8";

const AddRecipeForm: React.FC<AddRecipeFormProps> = ({
  onAddRecipe,
  recipeToEdit,
}) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const form = useForm({
    defaultValues: {
      name: recipeToEdit?.name || "",
      description: recipeToEdit?.description || "",
      cookTime: recipeToEdit?.cookTime || 30,
      difficulty: recipeToEdit?.difficulty || "Medium",
      servings: recipeToEdit?.servings || 4,
    },
  });

  useEffect(() => {
    if (recipeToEdit) {
      setIngredients(recipeToEdit.ingredients);
      setSteps(recipeToEdit.steps);
      setImageUrl(recipeToEdit.image);
    }
  }, [recipeToEdit]);

  const watchName = form.watch("name");

  useEffect(() => {
    const fetchImage = async (query: string) => {
      if (!query.trim() || recipeToEdit) return;

      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            query
          )}&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        const data = await res.json();
        const photo = data.results?.[0];
        if (photo?.urls?.small) {
          setImageUrl(photo.urls.small);
        } else {
          setImageUrl(undefined);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageUrl(undefined);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchImage(watchName);
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [watchName, recipeToEdit]);

  /*const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };*/
  const addIngredient = () => {
  if (currentIngredient.trim()) {
    const newItems = currentIngredient
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setIngredients([...ingredients, ...newItems]);
    setCurrentIngredient("");
  }
};

const addStep = () => {
  if (currentStep.trim()) {
    const newSteps = currentStep
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setSteps([...steps, ...newSteps]);
    setCurrentStep("");
  }
};


  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  /*const addStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep.trim()]);
      setCurrentStep("");
    }
  };*/

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    const newRecipe: Recipe = {
      id: recipeToEdit?.id || Date.now().toString(),
      name: data.name,
      description: data.description,
      cookTime: data.cookTime,
      difficulty: data.difficulty as "Easy" | "Medium" | "Hard",
      servings: data.servings,
      ingredients,
      steps,
      image: imageUrl,
    };

    onAddRecipe(newRecipe);

    toast.success(
      recipeToEdit
        ? `Recipe "${data.name}" updated successfully!`
        : `Recipe "${data.name}" added successfully!`
    );

    form.reset();
    setIngredients([]);
    setSteps([]);
    setImageUrl(undefined);
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          {recipeToEdit ? "Edit Recipe" : "Add New Recipe"}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            {recipeToEdit ? "Edit Recipe" : "Add New Recipe"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {imageUrl && (
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Recipe preview"
                  className="rounded-md max-h-48 object-cover"
                />
              </div>
            )}

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your recipe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (mins)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 px-3 border border-input rounded-md focus:outline-none"
                        {...field}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="Add ingredient"
                    onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                  />
                  <Button type="button" onClick={addIngredient}>
                    Add
                  </Button>
                </div>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-muted p-2 rounded"
                    >
                      <span>{ingredient}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.target.value)}
                    placeholder="Add step instructions"
                  />
                  <Button type="button" onClick={addStep} className="self-start">
                    Add
                  </Button>
                </div>
                <ol className="space-y-2 list-decimal list-inside">
                  {steps.map((step, index) => (
                    <li
                      key={index}
                      className="bg-muted p-2 rounded flex justify-between"
                    >
                      <span className="flex-1">{step}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full">
                {recipeToEdit ? "Update Recipe" : "Submit Recipe"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddRecipeForm;

/*import { Recipe } from "@/types/Recipe";
import React, { useState } from "react";

interface AddRecipeFormProps {
  onAddRecipe: (recipe: Recipe) => void;
}

const AddRecipeForm: React.FC<AddRecipeFormProps> = ({ onAddRecipe }) => {
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [stepInput, setStepInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [cookTime, setCookTime] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [servings, setServings] = useState<number>(1);

  const parseNumberedText = (input: string): string[] => {
    // Match sequences like "1. sugar" or "2. salt" (number followed by dot and space)
    const regex = /\d+\.\s*([^.\d]+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  };

  const handleAddIngredients = () => {
    const parsed = parseNumberedText(ingredientInput);
    setIngredients((prev) => [...prev, ...parsed]);
    setIngredientInput("");
  };

  const handleAddSteps = () => {
    const parsed = parseNumberedText(stepInput);
    setSteps(parsed);
    setStepInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      alert("Recipe name is required");
      return;
    }
    if (ingredients.length === 0) {
      alert("Add at least one ingredient");
      return;
    }
    if (steps.length === 0) {
      alert("Add at least one step");
      return;
    }

    const newRecipe: Recipe = {
      id: Math.random().toString(36).substring(2, 9),
      name: recipeName,
      description,
      cookTime,
      difficulty,
      servings,
      ingredients,
      steps,
    };

    onAddRecipe(newRecipe);

    setRecipeName("");
    setDescription("");
    setIngredients([]);
    setSteps([]);
    setCookTime(0);
    setDifficulty("Easy");
    setServings(1);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-4 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-xl font-bold">Add Recipe</h2>

      <div>
        <label className="block font-semibold">Recipe Name:</label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border rounded p-2"
          placeholder="Brief description"
        />
      </div>

      <div>
        <label className="block font-semibold">Cook Time (minutes):</label>
        <input
          type="number"
          min={0}
          value={cookTime}
          onChange={(e) => setCookTime(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")
          }
          className="w-full border rounded p-2"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold">Servings:</label>
        <input
          type="number"
          min={1}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">
          Ingredients (e.g. 1. sugar 2. salt):
        </label>
        <textarea
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          rows={3}
          className="w-full border rounded p-2"
          placeholder={"1. sugar\n2. salt\n3. oil"}
        />
        <button
          type="button"
          onClick={handleAddIngredients}
          className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
        >
          Add Ingredients
        </button>
        <div className="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-auto">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-start">
              <span className="mr-2 font-semibold">{index + 1}.</span>
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold">Steps (e.g. 1. mix 2. bake):</label>
        <textarea
          value={stepInput}
          onChange={(e) => setStepInput(e.target.value)}
          rows={3}
          className="w-full border rounded p-2"
          placeholder={"1. mix\n2. bake\n3. serve"}
        />
        <button
          type="button"
          onClick={handleAddSteps}
          className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
        >
          Add Steps
        </button>
        {steps.length > 0 && (
          <div className="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            <p className="font-semibold">Steps:</p>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start">
                <span className="mr-2 font-semibold">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white p-3 rounded font-semibold hover:bg-primary-dark"
      >
        Submit Recipe
      </button>
    </form>
  );
};

export default AddRecipeForm;*/
