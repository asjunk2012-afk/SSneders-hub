const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Simple static file serving
app.use(express.static(__dirname));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', directory: __dirname });
});

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log(`Directory: ${__dirname}`);
});
