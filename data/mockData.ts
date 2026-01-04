import type { Recipe } from "../types";

export const mockRecipes: Recipe[] = [
  {
    id: "egg-curry",
    youtubeUrl: "https://youtube.com/watch?v=example1",
    thumbnail: "/thumbnails/egg-curry.jpg",
    title: {
      en: "Easy Egg Curry",
      bn: "সহজ ডিমের কারি",
    },
    ingredients: {
      en: ["Egg", "Onion", "Oil", "Salt", "Turmeric"],
      bn: ["ডিম", "পেঁয়াজ", "তেল", "লবণ", "হলুদ"],
    },
    instructions: {
      en: "Boil eggs, fry with onion and spices, simmer in sauce.",
      bn: "ডিম সেদ্ধ করুন, পেঁয়াজ ও মসলার সঙ্গে ভাজুন, সস-এ রান্না করুন।",
    },
  },
  {
    id: "veg-fried-rice",
    youtubeUrl: "https://youtube.com/watch?v=example2",
    thumbnail: "/thumbnails/veg-fried-rice.jpg",
    title: { en: "Veg Fried Rice", bn: "সবজি ভাজা ভাত" },
    ingredients: {
      en: ["Rice", "Carrot", "Peas", "Soy Sauce", "Oil"],
      bn: ["চাল", "গাজর", "মটরশুটি", "সয় সস", "তেল"],
    },
    instructions: {
      en: "Stir fry vegetables, add cooked rice, flavor with soy sauce.",
      bn: "সবজি ভাজুন, সেদ্ধ ভাত যোগ করুন, সয় সস দিয়ে স্বাদ দিন।",
    },
  },
  {
    id: "lentil-soup",
    youtubeUrl: "https://youtube.com/watch?v=example3",
    thumbnail: "/thumbnails/lentil-soup.jpg",
    title: { en: "Simple Lentil Soup", bn: "সহজ ডাল স্যুপ" },
    ingredients: {
      en: ["Lentils", "Onion", "Garlic", "Salt", "Water"],
      bn: ["ডাল", "পেঁয়াজ", "রসুন", "লবণ", "পানি"],
    },
    instructions: {
      en: "Simmer lentils with aromatics until soft, season and serve.",
      bn: "ডাল নরম হওয়া পর্যন্ত পেঁয়াজ-রসুন দিয়ে সিদ্ধ করুন, মসলাদার করে পরিবেশন করুন।",
    },
  },
];
