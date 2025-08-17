const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

// Clean URL mappings (like .htaccess)
const cleanUrls = {
  '/': '/index.html',
  '/guide': '/guide.html'
};

const server = http.createServer((req, res) => {
  let filePath = url.parse(req.url).pathname;
  
  // Handle clean URLs
  if (cleanUrls[filePath]) {
    filePath = cleanUrls[filePath];
  }
  
  // Remove leading slash and resolve to current directory
  filePath = path.join(__dirname, filePath);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Get file extension
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - try with .html extension
        const htmlPath = filePath + '.html';
        fs.readFile(htmlPath, (htmlErr, htmlContent) => {
          if (htmlErr) {
            // Try to find the file with URL decoding
            const decodedPath = decodeURIComponent(filePath);
            if (decodedPath !== filePath) {
              fs.readFile(decodedPath, (decodedErr, decodedContent) => {
                if (decodedErr) {
                  res.writeHead(404);
                  res.end(`
                    <html>
                      <head><title>404 - Not Found</title></head>
                      <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <p>Try:</p>
                        <ul>
                          <li><a href="/">Home</a></li>
                          <li><a href="/guide">Guide</a></li>
                        </ul>
                      </body>
                    </html>
                  `);
                } else {
                  res.writeHead(200, { 'Content-Type': contentType });
                  res.end(decodedContent);
                }
              });
            } else {
              res.writeHead(404);
              res.end(`
                <html>
                  <head><title>404 - Not Found</title></head>
                  <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <p>Try:</p>
                    <ul>
                      <li><a href="/">Home</a></li>
                      <li><a href="/guide">Guide</a></li>
                    </ul>
                  </body>
                </html>
              `);
            }
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🔗 Clean URLs supported:`);
  console.log(`   - http://localhost:${PORT}/ → index.html`);
  console.log(`   - http://localhost:${PORT}/guide → guide.html`);
  console.log(`\n💡 Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
}); 