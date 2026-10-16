const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = process.env.PORT || 3000;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".pdf": "application/pdf",
};

http
  .createServer((request, response) => {
    const requestedPath = request.url === "/" ? "/index.html" : request.url;
    const filePath = path.resolve(root, `.${requestedPath}`);

    if (!filePath.startsWith(root + path.sep)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, file) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500);
        response.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      const headers = {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
        "Content-Length": file.length,
      };

      if (extension === ".pdf") {
        headers["Content-Disposition"] = "inline";
      }

      response.writeHead(200, headers);
      response.end(file);
    });
  })
  .listen(port, () => {
    console.log(`Viewer listening on port ${port}`);
  });
