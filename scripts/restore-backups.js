#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

function restoreBackups() {
  console.log('🔄 Restoring backups...\n');
  
  const backupFiles = glob.sync('src/**/*.vue.backup');
  
  backupFiles.forEach(backupPath => {
    const originalPath = backupPath.replace('.backup', '');
    
    try {
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      fs.writeFileSync(originalPath, backupContent);
      fs.unlinkSync(backupPath);
      
      console.log(`✅ Restored: ${originalPath}`);
    } catch (error) {
      console.error(`❌ Error restoring ${originalPath}:`, error.message);
    }
  });
  
  console.log('\n✨ Backup restoration complete!');
}

if (require.main === module) {
  restoreBackups();
}
