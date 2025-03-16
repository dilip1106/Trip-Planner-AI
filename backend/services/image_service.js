// backend/services/image.service.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

dotenv.config();

// Initialize with Unsplash API access key
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Generate an image of a destination using Unsplash
 * @param {string} destination - The travel destination
 * @returns {Promise<string>} - Base64 encoded image string
 */
const generateDestinationImage = async (destination) => {
  try {
    
    if (!UNSPLASH_ACCESS_KEY) {
      return getPlaceholderImage();
    }
    
    // Clean up the destination string to improve search
    const cleanDestination = destination.replace(/,/g, ' ').trim();
    
    // Create more specific search terms for the destination
    const searchTerms = [
      `${cleanDestination} landmark`,
      `${cleanDestination} skyline`,
      `${cleanDestination} famous`,
      `${cleanDestination} tourism`,
      `${cleanDestination} landscape`,
      `${cleanDestination} attraction`
    ];
    
    // Try different search terms until we find a good image
    let imageBase64 = null;
    
    for (const searchTerm of searchTerms) {
      try {
        // Search Unsplash for images related to the destination with the current search term
        const searchResponse = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: searchTerm,
            per_page: 5,
            orientation: 'landscape',
            content_filter: 'high',
            order_by: 'relevant'
          },
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        });
        
        // Check if we got any results
        if (searchResponse.data && searchResponse.data.results && searchResponse.data.results.length > 0) {
          // Get the URL of the best image (first result)
          const imageUrl = searchResponse.data.results[0].urls.regular;
          
          // Download the image as binary data
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
          });
          
          // Convert the binary data to base64
          imageBase64 = Buffer.from(imageResponse.data).toString('base64');
          
          // Log the successful search term
        
          // Break the loop as we found a good image
          break;
        }
      } catch (error) {
        console.error(`Error with search term "${searchTerm}":`, error.message);
        // Continue to the next search term
        continue;
      }
    }
    
    // If no image was found after trying all search terms, use a placeholder
    if (!imageBase64) {
      
      return getPlaceholderImage();
    }
    
    return imageBase64;
  } catch (error) {
    console.error("Image fetch error:", error.message);
    
    // If image fetch fails, return a placeholder image
    return getPlaceholderImage();
  }
};

/**
 * Get a placeholder image or create a simple one if file doesn't exist
 * @returns {string} - Base64 encoded placeholder image
 */
const getPlaceholderImage = () => {
  try {
    // Get the current file's directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Try to read the placeholder image file
    const placeholderPath = path.join(__dirname, '../assets/placeholder_destination.jpg');
    
    // Check if the file exists before trying to read it
    if (fs.existsSync(placeholderPath)) {
      const imageBuffer = fs.readFileSync(placeholderPath);
      return imageBuffer.toString('base64');
    } else {
      
      // Create the assets directory if it doesn't exist
      const assetsDir = path.join(__dirname, '../assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      
      // Return a simple 1x1 pixel transparent GIF as base64
      return 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  } catch (error) {
    console.error("Failed to get placeholder image:", error.message);
    // Return an empty string if even the placeholder fails
    return "";
  }
};

export { generateDestinationImage };