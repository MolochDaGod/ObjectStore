# 🚀 Deployment & Releases Guide

Complete guide for deploying ObjectStore and creating releases across the Grudge Studio ecosystem.

**Last Updated**: 2026-02-27

---

## 📦 ObjectStore Deployment

### GitHub Pages (Primary)

ObjectStore is deployed via GitHub Pages for maximum availability and CDN distribution.

**Live URL**: https://molochdagod.github.io/ObjectStore

#### Deployment Process

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "feat: add new items to ObjectStore

   Co-Authored-By: Oz <oz-agent@warp.dev>"
   git push origin main
   ```

2. **GitHub Actions** automatically deploys to GitHub Pages
3. **CDN propagation** takes 1-5 minutes
4. **Verify** at https://molochdagod.github.io/ObjectStore

#### Manual Deployment

```bash
# Build if necessary (for static sites)
npm run build

# Force deploy to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Vercel (Alternative)

For preview deployments and testing:

**Deployment Links**:
- Production: `https://object-store-grudge.vercel.app`
- Preview: Auto-generated per PR

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🏷️ Release Management

### Semantic Versioning

ObjectStore follows [SemVer](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 2.1.0
```

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

Set these once before running release commands:

```bash
VERSION=2.1.0
RELEASE_DATE=2026-02-27
```

```powershell
$VERSION = "2.1.0"
$RELEASE_DATE = "2026-02-27"
```

#### 1. Update Version

Update version in relevant files:

```json
// api/v1/weapons.json
{
  "version": "2.1.0",
   "updated": "2026-02-27"
}
```

#### 2. Update CHANGELOG.md

```markdown
## [2.1.0] - 2026-02-27

### Added
- AI image generation with Puter.js
- Tier-based visual system
- Item registry for single source of truth

### Changed
- UUID system now uses Arsenal format
- Improved search and filtering

### Fixed
- Icon path resolution
- Null pointer errors in SPRITE_DATABASE.html
```

#### 3. Create Git Tag

```bash
# Create annotated tag
git tag -a "v$VERSION" -m "Release v$VERSION - AI Integration & Tier System

Added:
- AI image generation
- Tier-based visuals
- Item registry

Co-Authored-By: Oz <oz-agent@warp.dev>"

# Push tag
git push origin "v$VERSION"
```

#### 4. Create GitHub Release

Via GitHub CLI:

```bash
gh release create "v$VERSION" \
   --title "v$VERSION - AI Integration & Tier System" \
  --notes "## What's New

### 🎨 AI Image Generation
- Integrated Puter.js for dynamic item icon generation
- Replaces all emoji with real AI-generated images

### 🎯 Tier-Based System
- T1-T8 items share images with different borders
- Gold gradients for higher tiers
- Legendary T8 shimmer effects

### 🔗 Integration Improvements
- Arsenal UUID system integration
- Consolidated item registry
- Enhanced search across all items

### 📚 Documentation
- Comprehensive Wiki
- Integration guides for all Grudge projects

**Deployment**: https://molochdagod.github.io/ObjectStore

Co-Authored-By: Oz <oz-agent@warp.dev>"
```

Or via GitHub Web UI:
1. Go to https://github.com/MolochDaGod/ObjectStore/releases
2. Click "Draft a new release"
3. Choose tag `v$VERSION`
4. Fill in release notes
5. Click "Publish release"

---

## 🔄 Integration Releases

### Warlord-Crafting-Suite

When updating ObjectStore integration:

```bash
# In Warlord-Crafting-Suite repo
cd ../Warlord-Crafting-Suite

# Update ObjectStore endpoint
git commit -am "feat: integrate ObjectStore v2.1.0

- Update API endpoints to use new format
- Add GRUDGE UUID system
- Integrate tier-based item display

Refs: MolochDaGod/ObjectStore#v2.1.0
Co-Authored-By: Oz <oz-agent@warp.dev>"

# Deploy to Vercel
git push origin main
```

**Update Arsenal Tab**:
1. Arsenal should fetch from `https://molochdagod.github.io/ObjectStore/api/v1/weapons.json`
2. Use GRUDGE UUIDs for all items
3. Display tier-based visuals

### GrudgeStudioNPM Package

Publish ObjectStore SDK to NPM:

```bash
cd GrudgeStudioNPM

# Copy SDK files
cp ../ObjectStore/sdk/grudge-sdk.js ./src/
cp ../ObjectStore/utils/item-registry.js ./src/
cp ../ObjectStore/utils/image-generator.js ./src/

# Update package.json
npm version 2.1.0

# Publish
npm publish

# Tag release
git tag -a npm-v2.1.0 -m "Publish @grudge-studio/tools v2.1.0

Includes:
- ObjectStore SDK
- GRUDGE UUID utilities
- Item registry system
- AI image generator

Co-Authored-By: Oz <oz-agent@warp.dev>"
git push origin npm-v2.1.0
```

---

## 📋 Release Checklist

Use this checklist for every release:

### Pre-Release
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in all files
- [ ] No breaking changes (or documented)
- [ ] Icons/sprites validated
- [ ] API endpoints tested

### Release
- [ ] Git tag created
- [ ] GitHub Release created
- [ ] Deployed to GitHub Pages
- [ ] Vercel preview tested
- [ ] Release notes complete

### Post-Release
- [ ] Integration projects notified
- [ ] Wiki updated
- [ ] Discord announcement
- [ ] Update dependent repos
- [ ] Monitor for issues

### Integration Updates
- [ ] Warlord-Crafting-Suite updated
- [ ] GrudgeStudioNPM published
- [ ] GrudgeWarlords integrated
- [ ] WebGL builds updated

---

## 🌐 Multi-Project Deployment Strategy

### Deployment Order

When releasing changes across ecosystem:

1. **ObjectStore** (Core data)
   - Deploy first as source of truth
   - Wait for CDN propagation

2. **GrudgeStudioNPM** (SDK)
   - Publish after ObjectStore is live
   - Ensures SDK points to correct API

3. **Warlord-Crafting-Suite** (Primary consumer)
   - Update after SDK is published
   - Test Arsenal tab thoroughly

4. **Game Clients** (Unity/WebGL)
   - Deploy last
   - Ensures all data sources are updated

### Rollback Procedure

If issues arise:

```bash
# Revert ObjectStore
git revert "v$VERSION"
git push origin main

# Deprecate problematic NPM package version (safer than unpublish)
npm deprecate "@grudge-studio/tools@$VERSION" "Deprecated due to rollback from ObjectStore v$VERSION"

# Notify integrations
# Post in Discord/Slack about rollback
```

---

## 🔍 Monitoring & Verification

### Post-Deployment Checks

```bash
# Check API availability
curl https://molochdagod.github.io/ObjectStore/api/v1/weapons.json

# Windows PowerShell alternative
Invoke-RestMethod https://molochdagod.github.io/ObjectStore/api/v1/weapons.json

# Verify SDK
node -e "
  import('https://molochdagod.github.io/ObjectStore/sdk/grudge-sdk.js')
    .then(m => new m.GrudgeSDK())
    .then(sdk => sdk.getWeapons())
    .then(data => console.log('✅ SDK working:', data.total))
"

# Check sprites
curl -I https://molochdagod.github.io/ObjectStore/icons/weapons_full/Sword_01.png
```

### Integration Verification

Test each integration point:

- [ ] **Arsenal**: Weapons load correctly
- [ ] **Crafting**: Materials available
- [ ] **Unity WebGL**: Assets load in game
- [ ] **NPM Package**: Import works
- [ ] **Puter Backend**: AI generation functional

---

## 📊 Release Notes Template

Use this template for consistency:

```markdown
## [VERSION] - YYYY-MM-DD

### 🎉 Highlights
Brief overview of major changes

### ✨ Added
- New feature 1
- New feature 2

### 🔄 Changed
- Changed behavior 1
- Updated system 2

### 🐛 Fixed
- Bug fix 1
- Issue resolution 2

### 🗑️ Deprecated
- Deprecated feature 1

### ❌ Removed
- Removed feature 1

### 📚 Documentation
- Wiki updates
- Integration guides

### 🔗 Links
- **Deployment**: https://molochdagod.github.io/ObjectStore
- **Release**: https://github.com/MolochDaGod/ObjectStore/releases/tag/vVERSION
- **Docs**: https://github.com/MolochDaGod/ObjectStore/wiki

### 🤝 Contributors
Co-Authored-By: Oz <oz-agent@warp.dev>

### 📦 Integration Updates
Projects that should update:
- Warlord-Crafting-Suite
- GrudgeStudioNPM
- GrudgeWarlords
```

---

## 🎯 Current Release: v2.1.0

**Deployed**: 2026-02-27
**Status**: ✅ Live
**URL**: https://molochdagod.github.io/ObjectStore

### Integration Status

| Project | Status | Version | Notes |
|---------|--------|---------|-------|
| ObjectStore | ✅ Live | 2.1.0 | Core API |
| Warlord-Crafting-Suite | 🚧 Pending | - | Update in progress |
| GrudgeStudioNPM | 📋 Planned | - | Awaiting publish |
| GrudgeWarlords | 📋 Planned | - | Integration needed |
| WebGL Builds | 📋 Planned | - | Batch update |

---

## 📞 Support & Issues

- **Deployment Issues**: [GitHub Issues](https://github.com/MolochDaGod/ObjectStore/issues)
- **Integration Help**: Discord #grudge-dev channel
- **API Questions**: [Discussions](https://github.com/MolochDaGod/ObjectStore/discussions)

---

**Made with ⚔️ by Grudge Studio** • **Co-Authored-By: Oz <oz-agent@warp.dev>**
