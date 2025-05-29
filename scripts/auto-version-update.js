/**
 * 自動バージョン更新スクリプト
 * 修正が依頼されるたびに自動的にパッチバージョンを0.0.1ずつ増加
 * 使用方法:
 * node scripts/auto-version-update.js [説明]
 * 
 * 例:
 * node scripts/auto-version-update.js "UIの修正"
 */

const fs = require('fs');
const path = require('path');

// 引数の取得
const [,, description] = process.argv;

if (!description) {
  console.error('修正内容の説明を入力してください。');
  console.error('使用方法: node scripts/auto-version-update.js "修正内容の説明"');
  process.exit(1);
}

// package.jsonの読み込み
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 現在のバージョンを解析
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// パッチバージョンを0.0.1増加
const newVersion = `${major}.${minor}.${patch + 1}`;

console.log(`🔄 自動バージョン更新`);
console.log(`バージョンを ${currentVersion} から ${newVersion} に更新します...`);
console.log(`更新内容: ${description}`);

// package.jsonの更新
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ package.json を更新しました');

// version-check.jsの更新
const versionCheckPath = path.join(__dirname, '..', 'public', 'version-check.js');
let versionCheckContent = fs.readFileSync(versionCheckPath, 'utf8');
versionCheckContent = versionCheckContent.replace(
  /const currentVersion = '[^']+';/,
  `const currentVersion = '${newVersion}';`
);
fs.writeFileSync(versionCheckPath, versionCheckContent);
console.log('✓ version-check.js を更新しました');

// CHANGELOG.mdの更新
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const today = new Date().toISOString().split('T')[0];
const changelogEntry = `## [${newVersion}] - ${today}\n\n### Changed\n- ${description}\n\n`;

let changelogContent = '';
if (fs.existsSync(changelogPath)) {
  changelogContent = fs.readFileSync(changelogPath, 'utf8');
  // 既存のCHANGELOGの適切な位置に新しいエントリを追加
  const lines = changelogContent.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## ['));
  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, changelogEntry);
    changelogContent = lines.join('\n');
  } else {
    // 最初のエントリの場合
    const titleIndex = lines.findIndex(line => line.includes('All notable changes'));
    if (titleIndex !== -1) {
      lines.splice(titleIndex + 2, 0, changelogEntry);
      changelogContent = lines.join('\n');
    }
  }
} else {
  // 新しいCHANGELOGを作成
  changelogContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${changelogEntry}`;
}

fs.writeFileSync(changelogPath, changelogContent);
console.log('✓ CHANGELOG.md を更新しました');

console.log('\n🎉 自動バージョン更新が完了しました！');
console.log(`新しいバージョン: ${newVersion}`);
console.log('\n📱 スマートフォンでキャッシュクリア後、新しいバージョンが自動適用されます');
console.log('\n次のステップ:');
console.log('1. 変更をコミット: git add . && git commit -m "chore: auto bump version to ' + newVersion + '"');
console.log('2. デプロイ後、ユーザーに最新版が自動配信されます');