#!/usr/bin/env node
/**
 * Changelog Generator
 * Generates CHANGELOG.md, api/changelog.json, and feed.xml from git history.
 * Usage: node scripts/generate-changelog.mjs
 */
import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const MAX_ENTRIES = 50;

function getGitLog() {
  try {
    const log = execSync(
      'git log --pretty=format:"%H|%ai|%an|%s" --no-merges -n 100 -- api/ sprites/ icons/ backgrounds/ images/ sdk/ scripts/',
      { cwd: ROOT, encoding: 'utf8' }
    );
    return log.split('\n').filter(Boolean).map(line => {
      const [hash, date, author, subject] = line.split('|');
      return { hash, date, author, subject };
    });
  } catch {
    return [];
  }
}

function categorize(subject) {
  const lower = subject.toLowerCase();
  if (lower.startsWith('feat')) return 'Added';
  if (lower.startsWith('fix')) return 'Fixed';
  if (lower.startsWith('chore') || lower.startsWith('ci')) return 'Maintenance';
  if (lower.startsWith('docs')) return 'Documentation';
  if (lower.startsWith('refactor')) return 'Changed';
  return 'Changed';
}

function generateMarkdown(entries) {
  let md = '# Changelog\nAll notable changes to the ObjectStore API and assets.\n\n';
  const byDate = {};
  for (const e of entries) {
    const day = e.date.split(' ')[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(e);
  }
  for (const [day, items] of Object.entries(byDate)) {
    md += `## ${day}\n`;
    const grouped = {};
    for (const item of items) {
      const cat = categorize(item.subject);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    for (const [cat, catItems] of Object.entries(grouped)) {
      md += `### ${cat}\n`;
      for (const item of catItems) {
        md += `- ${item.subject} (${item.hash.slice(0, 7)})\n`;
      }
    }
    md += '\n';
  }
  return md;
}

function generateJSON(entries) {
  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalEntries: entries.length,
    entries: entries.map(e => ({
      hash: e.hash.slice(0, 7),
      date: e.date,
      author: e.author,
      subject: e.subject,
      category: categorize(e.subject)
    }))
  };
}

function generateRSS(entries) {
  const items = entries.slice(0, 20).map(e => `    <item>
      <title>${escapeXML(e.subject)}</title>
      <link>https://github.com/MolochDaGod/ObjectStore/commit/${e.hash}</link>
      <guid>${e.hash}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <description>${escapeXML(categorize(e.subject) + ': ' + e.subject)}</description>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Grudge Studio ObjectStore Changelog</title>
    <link>https://molochdagod.github.io/ObjectStore</link>
    <description>Updates to the ObjectStore game data API</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function escapeXML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

console.log('📝 Generating changelog...');

const entries = getGitLog().slice(0, MAX_ENTRIES);
if (entries.length === 0) {
  console.log('   No git history found for tracked paths. Skipping.');
  process.exit(0);
}

writeFileSync(join(ROOT, 'CHANGELOG.md'), generateMarkdown(entries));
writeFileSync(join(ROOT, 'api', 'changelog.json'), JSON.stringify(generateJSON(entries), null, 2));
writeFileSync(join(ROOT, 'feed.xml'), generateRSS(entries));

console.log(`✅ Generated: CHANGELOG.md (${entries.length} entries), api/changelog.json, feed.xml`);
