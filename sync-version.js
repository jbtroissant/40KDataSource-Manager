const fs = require('fs');
const path = require('path');

const packageJson = require('./package.json');
const envPath = path.resolve(__dirname, '.env');

const versionLine = `REACT_APP_VERSION=${packageJson.version}`;

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  // Supprime toute ancienne ligne REACT_APP_VERSION
  envContent = envContent.replace(/^REACT_APP_VERSION=.*$/m, '');
  envContent = envContent.trim();
  if (envContent.length > 0) envContent += '\n';
}
envContent += versionLine + '\n';

fs.writeFileSync(envPath, envContent, 'utf8');