# YouTube Import Testing Guide

## Fixed Issues
1. ✅ Removed dependency on metadata extraction for import
2. ✅ Added detailed logging throughout the import process
3. ✅ Improved error handling with stack traces
4. ✅ Added real-time status updates on the UI
5. ✅ Display full Gemini AI response with copy button

## How to Test

1. **Navigate to Import Page**
   - Go to: http://localhost:3000/admin/import

2. **Find a Cooking Video**
   - Use any Bengali or English cooking video from YouTube
   - Example: Search for "chicken curry recipe" or "মাছের রেসিপি"

3. **Paste URL and Import**
   - Paste the full YouTube URL
   - Click "Import Recipe with AI"
   - Watch the status updates:
     - "Initializing..."
     - "Extracting recipe from video: [videoId]..."
     - "Recipe imported successfully!"

4. **View Results**
   - Success modal will show the recipe title
   - Scroll down to see the "✨ Gemini AI Response" section
   - Click "Copy JSON" to copy the full response

## Example URLs to Test
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- Just the video ID: VIDEO_ID

## Troubleshooting

### Error: "No transcript available"
- The video may not have captions enabled
- Try a different video with auto-generated or manual captions

### Error: "GEMINI_API_KEY is not set"
- Check .env file has: GEMINI_API_KEY="your-api-key"
- Restart the dev server

### Error: "Recipe with this slug already exists"
- The recipe was already imported
- Check the database or use a different video

## Viewing Logs
Watch the terminal where `npm run dev` is running to see detailed logs:
```
[Import] Starting import for video: ABC123
[Import] Fetching transcript...
[Import] Transcript fetched: 12543 characters
[Import] Calling Gemini AI...
[Import] Gemini response received
[Import] Parsing JSON...
[Import] Recipe parsed: Chicken Tikka Masala
[Import] Checking if slug exists: chicken-tikka-masala
[Import] Creating recipe in database...
[Import] Recipe created successfully! ID: 123
```

## What Gets Imported
- ✅ Recipe title (English & Bengali)
- ✅ Ingredients with exact quantities and units
- ✅ Step-by-step instructions with timestamps
- ✅ Blog content (intro, tips, serving, storage)
- ✅ Metadata (cuisine, category, difficulty, prep time, cook time)
- ✅ Auto-matched ingredients from database
- ✅ Auto-created missing ingredients

## Database Connection
Current DB: Prisma Remote Database
- Connection string is in .env file
- All imports save directly to production database
