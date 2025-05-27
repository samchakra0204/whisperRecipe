// src/services/unsplashService.ts
export async function fetchRecipeImage(query: string) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}&per_page=1`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const imageUrl = data.results?.[0]?.urls?.regular;

    return imageUrl || null;
  } catch (error) {
    console.error("Unsplash API Error:", error);
    return null;
  }
}

