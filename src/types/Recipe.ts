
export interface Recipe {
  id: string;
  name: string;
  description: string;
  image?: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: string[];
  steps: string[];
  firebaseId?: string; // Optional Firebase document ID
}
