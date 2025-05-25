
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

import React, { useState, useEffect } from "react";
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
      image: photoPreview || undefined,
    };

    onAddRecipe(newRecipe);
    toast.success(`Recipe "${data.name}" added successfully!`);
    form.reset();
    setIngredients([]);
    setSteps([]);
    setPhotoFile(null);
    setPhotoPreview(null);
  });

  useEffect(() => {
    // Cleanup URL object when component unmounts or photo changes
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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

            <FormItem>
              <FormLabel>Photo (optional)</FormLabel>
              <FormControl>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </FormControl>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-2 max-h-40 rounded-md object-cover"
                />
              )}
            </FormItem>
            
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

export default AddRecipeForm;
