const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'videoIdeas.json');

// Increase payload size limits for large files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
app.use(cors());

// Serve static files (HTML, CSS, JS, images) with increased limits
app.use(express.static(__dirname, {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    setHeaders: (res, filePath) => {
        // Set appropriate headers for large files
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper functions
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return [];
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// API Routes

// Get all video ideas
app.get('/api/video-ideas', (req, res) => {
    try {
        const ideas = readDatabase();
        res.json(ideas);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video ideas' });
    }
});

// Add a new video idea
app.post('/api/video-ideas', (req, res) => {
    try {
        const ideas = readDatabase();
        const newIdea = {
            id: Date.now().toString(),
            ...req.body,
            timestamp: Date.now()
        };
        
        ideas.push(newIdea);
        
        if (writeDatabase(ideas)) {
            res.json({ success: true, idea: newIdea });
        } else {
            res.status(500).json({ error: 'Failed to save video idea' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add video idea' });
    }
});

// Delete a video idea (admin only)
app.delete('/api/video-ideas/:id', (req, res) => {
    try {
        const ideas = readDatabase();
        const filteredIdeas = ideas.filter(idea => idea.id !== req.params.id);
        
        if (writeDatabase(filteredIdeas)) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to delete video idea' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete video idea' });
    }
});

// Get database statistics
app.get('/api/stats', (req, res) => {
    try {
        const ideas = readDatabase();
        const stats = {
            totalIdeas: ideas.length,
            categories: {},
            recentSubmissions: ideas.filter(idea => 
                Date.now() - idea.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
            ).length
        };
        
        // Count by category
        ideas.forEach(idea => {
            stats.categories[idea.category] = (stats.categories[idea.category] || 0) + 1;
        });
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Video Ideas API server running on http://localhost:${PORT}`);
    console.log(`Database file: ${DB_FILE}`);
});
