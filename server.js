const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Set Cross-Origin headers for cross-origin isolation
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

// Serve static files from the "public" directory (adjust this path based on your project structure)
app.use(express.static(path.join(__dirname, 'player')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
