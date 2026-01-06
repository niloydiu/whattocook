import { importRecipeFromYoutube } from "../app/actions/importer";

async function main() {
    // Test with a simple video ID
    const videoId = "dQw4w9WgXcQ"; // Example - replace with an actual cooking video
    
    console.log("Testing import for video:", videoId);
    const result = await importRecipeFromYoutube(videoId);
    
    console.log("\n=== RESULT ===");
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
