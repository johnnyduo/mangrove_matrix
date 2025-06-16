# 📊 Data Management Guide

## Problem: Large Files in Git

The MangroveMatrix project uses large geospatial datasets that exceed Git's recommended file size limits:

- `gmw_v3_2020_vec.json` (284MB) - Global Mangrove Watch data
- `mock_mangrove_predictions.json` (153MB) - AI prediction data

These files are **too large for Git repositories** and have been excluded via `.gitignore`.

## 🚀 Solutions Implemented

### 1. **Data Service with Fallbacks** ✅
The app automatically handles missing data files with a cascading fallback system:

```
Full Dataset → Sample Data → Demo Data (hardcoded)
```

### 2. **Data Management Script** ✅
Use the provided script for easy data management:

```bash
# Setup development environment with sample data
./scripts/manage-data.sh setup

# Check data file status
./scripts/manage-data.sh check

# Generate sample data only
./scripts/manage-data.sh sample
```

### 3. **Git LFS Ready** ✅
`.gitattributes` is configured for Git LFS if you choose to use it:

```bash
# To enable Git LFS (optional)
git lfs install
git lfs track "*.json"
git add .gitattributes
```

### 4. **Visual Data Status** ✅
The map displays current data source status:
- 🟢 **Green**: Full Dataset loaded
- 🟡 **Yellow**: Sample Data loaded  
- 🟠 **Orange**: Demo Data (fallback)

## 🛠️ For Developers

### Quick Start
```bash
# Clone the repository
git clone <your-repo>
cd MangroveMatrix

# Install dependencies
yarn install

# Setup sample data for development
./scripts/manage-data.sh setup

# Start development server
yarn dev
```

### Data Files Overview
| File | Size | Purpose | Git Status |
|------|------|---------|------------|
| `sample_mangroves.json` | ~2KB | Development | ✅ Included |
| `mock_mangroves.geojson` | ~2KB | Basic demo | ✅ Included |
| `mock_impacts.json` | ~2KB | Impact data | ✅ Included |
| `gmw_v3_2020_vec.json` | 284MB | Full dataset | ❌ Excluded |
| `mock_mangrove_predictions.json` | 153MB | AI predictions | ❌ Excluded |

## 🌐 For Production

### Option 1: External Data Storage (Recommended)
Store large files in cloud storage (AWS S3, Google Cloud, etc.):

```typescript
// Update dataService.ts to fetch from CDN
const CDN_BASE_URL = 'https://your-cdn.com/data/';

async loadMangroveData() {
  const response = await fetch(`${CDN_BASE_URL}mock_mangrove_predictions.json`);
  // ... rest of implementation
}
```

### Option 2: Git LFS
For team repositories with Git LFS support:

```bash
# Install Git LFS
git lfs install

# Track large files (already configured in .gitattributes)
git lfs track "src/data/*.json"

# Add and commit normally
git add src/data/large-file.json
git commit -m "Add large dataset"
git push
```

### Option 3: Data Download on Deploy
Add to your CI/CD pipeline:

```yaml
# In your deploy script
- name: Download large datasets
  run: |
    curl -o src/data/gmw_v3_2020_vec.json "https://your-data-source.com/gmw_v3_2020_vec.json"
    curl -o src/data/mock_mangrove_predictions.json "https://your-data-source.com/predictions.json"
```

## 🔍 Monitoring Data Usage

The app provides built-in monitoring:

```typescript
// Check data availability programmatically
const availability = await dataService.checkDataAvailability();
console.log(availability);
// { fullDataset: false, sampleData: true, dataSource: 'sample' }
```

## 📋 Best Practices

### ✅ Do's
- Use sample data for development
- Store large files externally for production
- Monitor data source status in UI
- Use the data management script for setup
- Document data sources and formats

### ❌ Don'ts
- Don't commit files > 100MB to Git
- Don't hardcode large datasets in code
- Don't assume data files always exist
- Don't skip fallback mechanisms

## 🆘 Troubleshooting

### "No data showing on map"
1. Check data status indicator (top-right of map)
2. Run: `./scripts/manage-data.sh check`
3. Generate sample data: `./scripts/manage-data.sh setup`

### "Sample data is too small"
This is expected for development. The sample includes just 2 mangrove regions for testing UI components.

### "Need real data for demo"
For demonstrations, consider:
1. Using a subset of the full dataset
2. Hosting data on a CDN
3. Using Git LFS for the repository

## 🎯 Next Steps

1. **For Development**: Use the generated sample data
2. **For Demo**: Consider hosting a subset of real data externally
3. **For Production**: Implement CDN or external storage solution
4. **For Collaboration**: Consider Git LFS if team has access

## 📚 Additional Resources

- [Git LFS Documentation](https://git-lfs.github.io/)
- [GitHub File Size Limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Mapbox Data Optimization](https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/)

---

*The data management system ensures your app works regardless of data availability while keeping your Git repository clean and fast.*
