import { NextRequest, NextResponse } from "next/server";
import { importRecipeFromYoutube } from "@/app/actions/importer";

// GET /api/youtube/[videoId] - Get YouTube video metadata and optionally import
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const { searchParams } = new URL(request.url);
  const shouldImport = searchParams.get("import") === "true";

  try {
    // If importing, skip metadata extraction and go straight to import
    if (shouldImport) {
      const result = await importRecipeFromYoutube(videoId);
      return NextResponse.json(result);
    }

    // Method 1: Try to scrape from YouTube page (no API key needed)
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video");
    }

    const html = await response.text();

    // Extract data from the initial player response
    const match = html.match(
      /var ytInitialPlayerResponse = ({.+?});var/
    );
    
    if (match && match[1]) {
      const playerResponse = JSON.parse(match[1]);
      const videoDetails = playerResponse.videoDetails;
      const microformat = playerResponse.microformat?.playerMicroformatRenderer;

      if (videoDetails) {
        // Convert seconds to readable format
        const seconds = parseInt(videoDetails.lengthSeconds || "0");
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const duration = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;

        // Format view count
        const views = parseInt(videoDetails.viewCount || "0");
        const viewCount = views.toLocaleString();

        return NextResponse.json({
          title: videoDetails.title,
          duration,
          durationSeconds: seconds,
          viewCount,
          views,
          author: videoDetails.author,
          thumbnail: videoDetails.thumbnail?.thumbnails?.slice(-1)[0]?.url,
          publishDate: microformat?.publishDate,
          uploadDate: microformat?.uploadDate,
        });
      }
    }

    // Fallback: Return basic info
    return NextResponse.json({
      error: "Could not extract full metadata",
      videoId,
    });
  } catch (error: any) {
    console.error("Error fetching YouTube metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch video metadata", videoId },
      { status: 500 }
    );
  }
}
