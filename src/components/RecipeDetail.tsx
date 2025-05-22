
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChefHat, Clock, EggFried, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { Recipe } from "@/types/Recipe";
import { toast } from "sonner";
import { deleteRecipeFromCollection } from "@/services/recipeSearchService";

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onDelete?: (recipeId: string) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose, onDelete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Create and configure utterance
      const newUtterance = new SpeechSynthesisUtterance();
      newUtterance.rate = 0.9; // Slightly slower than default
      newUtterance.pitch = 1;
      newUtterance.volume = 1;
      
      // Handle speech end
      newUtterance.onend = () => {
        setIsSpeaking(false);
      };
      
      setUtterance(newUtterance);
      
      // Cleanup function
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const nextStep = () => {
    if (activeStep < recipe.steps.length - 1) {
      setActiveStep(activeStep + 1);
      // Automatically speak the next step
      speakStep(recipe.steps[activeStep + 1]);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      // Automatically speak the previous step
      speakStep(recipe.steps[activeStep - 1]);
    }
  };

  const speakStep = (text: string) => {
    if (speechSynthesis && utterance) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Set new text and speak
      utterance.text = text;
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      
      toast.info("Speaking step instructions");
    } else {
      toast.error("Speech synthesis not available on this browser");
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      speakStep(recipe.steps[activeStep]);
    }
  };
  
  const handleDelete = () => {
    if (deleteRecipeFromCollection(recipe.id)) {
      toast.success(`Recipe "${recipe.name}" deleted successfully`);
      if (onDelete) {
        onDelete(recipe.id);
      }
      onClose();
    } else {
      toast.error("Failed to delete recipe");
    }
  };

  // Speak the first step when component mounts
  useEffect(() => {
    if (recipe.steps.length > 0 && utterance) {
      speakStep(recipe.steps[0]);
    }
  }, [utterance]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 h-48 md:h-auto rounded-lg overflow-hidden bg-muted">
            <img
              src={recipe.image || "/placeholder.svg"}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-2/3">
            <CardTitle className="text-2xl mb-2">{recipe.name}</CardTitle>
            <CardDescription className="mb-4">{recipe.description}</CardDescription>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={18} />
                <span>{recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat size={18} />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <EggFried size={18} />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="pt-4">
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="instructions" className="pt-4">
            <div className="space-y-6">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Step {activeStep + 1} of {recipe.steps.length}</div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleSpeech}
                    className={isSpeaking ? "text-primary animate-pulse" : ""}
                  >
                    {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </Button>
                </div>
                <p>{recipe.steps[activeStep]}</p>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={activeStep === 0}
                >
                  Previous Step
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={activeStep === recipe.steps.length - 1}
                >
                  Next Step
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default RecipeDetail;
