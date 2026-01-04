export interface Recipe {
  id: string;
  youtubeUrl: string;
  thumbnail: string;
  title: { en: string; bn: string };
  ingredients: { en: string[]; bn: string[] };
  instructions: { en: string; bn: string };
}
