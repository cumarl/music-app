const express = require("express");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "./data.json";
const APPCONFIG_AGENT_URL = "http://localhost:2772/applications/MusicApp/environments/Production/configurations/FeatureFlags"; 

// Serve static files (CSS)
app.use(express.static("public"));

async function getFeatureFlags() {
    try {
        const response = await axios.get(APPCONFIG_AGENT_URL);
        return response.data.includeReleaseYear || false; // Default to false if not found
    } catch (error) {
        console.error("Error fetching feature flags from AppConfig agent:", error.message);
        return false;
    }
}

app.get("/", async (req, res) => {
    const includeReleaseYear = await getFeatureFlags();
    const rawData = fs.readFileSync(DATA_FILE);
    let albums = JSON.parse(rawData);

    // Build HTML content dynamically
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Music Albums</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <h1>Music Albums</h1>
            <ul class="album-list">
    `;

    albums.forEach(album => {
        htmlContent += `<li><strong>${album.artist}</strong> - ${album.title}`;
        if (includeReleaseYear) {
            htmlContent += ` (${album.year})`;
        }
        htmlContent += `</li>`;
    });

    htmlContent += `
            </ul>
        </body>
        </html>
    `;

    res.send(htmlContent);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
