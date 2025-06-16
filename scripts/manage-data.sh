#!/bin/bash

# MangroveMatrix Data Management Script
# This script helps manage large data files that can't be stored in Git

echo "🌊 MangroveMatrix Data Management"
echo "================================="

# Create data directory if it doesn't exist
mkdir -p src/data

# Download function
download_file() {
    local url=$1
    local filename=$2
    local description=$3
    
    echo "📥 Downloading $description..."
    if [ -f "src/data/$filename" ]; then
        echo "✅ $filename already exists"
    else
        echo "🔄 Downloading $filename..."
        # Replace with actual download URLs when available
        echo "⚠️  Please manually download $filename from your data source"
        echo "   Expected location: src/data/$filename"
    fi
}

# Check if large files exist
check_data_files() {
    echo ""
    echo "📊 Checking data files..."
    
    files=(
        "gmw_v3_2020_vec.json:Global Mangrove Watch data"
        "mock_mangrove_predictions.json:AI prediction data"
        "gmw_v3_2020_centroids.json:Mangrove centroids"
    )
    
    for file_info in "${files[@]}"; do
        IFS=':' read -r filename description <<< "$file_info"
        if [ -f "src/data/$filename" ]; then
            size=$(ls -lh "src/data/$filename" | awk '{print $5}')
            echo "✅ $filename ($size) - $description"
        else
            echo "❌ $filename - $description (MISSING)"
        fi
    done
}

# Generate sample data for development
generate_sample_data() {
    echo ""
    echo "🔧 Generating sample data for development..."
    
    # Create small sample files for development
    cat > src/data/sample_mangroves.json << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "PXLVAL": 1,
        "Name": "Sample Mangrove 1",
        "Country": "Indonesia",
        "Area_Ha": 125.5,
        "healthIndex": 85,
        "floodProtection": 7.2,
        "carbonSequestration": 145.8,
        "biodiversityIndex": 8.1,
        "economicValue": 52300
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [106.8456, -6.2088],
          [106.8556, -6.2088],
          [106.8556, -6.1988],
          [106.8456, -6.1988],
          [106.8456, -6.2088]
        ]]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "PXLVAL": 1,
        "Name": "Sample Mangrove 2",
        "Country": "Philippines",
        "Area_Ha": 89.3,
        "healthIndex": 72,
        "floodProtection": 6.8,
        "carbonSequestration": 198.2,
        "biodiversityIndex": 7.9,
        "economicValue": 41200
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [121.0244, 14.5995],
          [121.0344, 14.5995],
          [121.0344, 14.6095],
          [121.0244, 14.6095],
          [121.0244, 14.5995]
        ]]
      }
    }
  ]
}
EOF

    echo "✅ Created src/data/sample_mangroves.json for development"
}

# Main script logic
case "${1:-check}" in
    "download")
        download_file "" "gmw_v3_2020_vec.json" "Global Mangrove Watch data"
        ;;
    "sample")
        generate_sample_data
        ;;
    "check")
        check_data_files
        ;;
    "setup")
        echo "🚀 Setting up development environment..."
        generate_sample_data
        check_data_files
        echo ""
        echo "📋 Next steps:"
        echo "1. Use sample data for development: src/data/sample_mangroves.json"
        echo "2. For production, download full datasets externally"
        echo "3. Consider using CDN or cloud storage for large files"
        ;;
    *)
        echo "Usage: $0 [download|sample|check|setup]"
        echo ""
        echo "Commands:"
        echo "  download  - Download large data files"
        echo "  sample    - Generate sample data for development"
        echo "  check     - Check status of data files"
        echo "  setup     - Setup development environment"
        ;;
esac
