#!/bin/bash

echo "🚀 Setting up KeystoneJS CMS for Kocky's Bar & Grill"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Database connection (same as NestJS backend)
DATABASE_URL=postgresql://postgres:password@localhost:5432/kockysbar

# Session secret (minimum 32 characters)
SESSION_SECRET=your-session-secret-min-32-characters-long-please

# Port for CMS admin panel
PORT=4000
EOL
    echo "✅ .env file created. Please update the database credentials!"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Update the database connection in .env"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:4000 in your browser"
echo "5. Create your first admin account"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "Happy content managing! 🎊"
