#!/bin/bash

# Root directory
cd src || exit

# Backend structure
mkdir -p backend/{controllers,models,routes,config}
touch backend/controllers/dpsController.js
touch backend/models/{index.js,DpsEntry.js}
touch backend/routes/dpsRoutes.js
touch backend/config/database.js
touch backend/app.js
touch backend/server.js

# Public frontend structure
mkdir -p public/{css,js}
touch public/index.html
touch public/css/style.css
touch public/js/main.js

# Optional: create .env and README
touch .env
touch README.md

# Optional: Initialize npm (uncomment the next line if needed)
# npm init -y

echo "Project structure created successfully!"