import React from "react";
import { notFound } from "next/navigation";
import { getRecipeBySlug } from "../../../actions/recipes";
import PrintViewClient from "./PrintViewClient";

export default async function PrintPage({ params }: any) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  return <PrintViewClient recipe={recipe} />;
}
