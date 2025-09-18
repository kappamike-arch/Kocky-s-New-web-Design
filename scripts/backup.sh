#!/bin/bash

# Kocky's Bar & Grill - Backup Script

BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Creating backup in $BACKUP_DIR..."

# Backup database
cp backend/prisma/kockys.db $BACKUP_DIR/

# Backup uploads
cp -r backend/uploads $BACKUP_DIR/

# Backup environment file
cp .env $BACKUP_DIR/

# Create tarball
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "✅ Backup created: $BACKUP_DIR.tar.gz"
