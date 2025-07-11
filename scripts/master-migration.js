#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function runMasterMigration() {
  console.log('🎯 Mathlly Style Migration Master Script\n');
  
  try {
    // Step 1: Pre-migration check
    console.log('Step 1: Running pre-migration checks...');
    execSync('node scripts/pre-migration-check.js', { stdio: 'inherit' });
    
    const continueCheck = await askQuestion('\n❓ Continue with migration? (y/N): ');
    if (continueCheck.toLowerCase() !== 'y') {
      console.log('Migration cancelled.');
      rl.close();
      return;
    }
    
    // Step 2: Dry run
    console.log('\nStep 2: Running dry run to preview changes...');
    execSync('node scripts/run-complete-migration.js --dry-run', { stdio: 'inherit' });
    
    const continueDryRun = await askQuestion('\n❓ Apply these changes? (y/N): ');
    if (continueDryRun.toLowerCase() !== 'y') {
      console.log('Migration cancelled.');
      rl.close();
      return;
    }
    
    // Step 3: Create git checkpoint
    console.log('\nStep 3: Creating git checkpoint...');
    try {
      execSync('git add -A && git commit -m "Pre-migration checkpoint"', { stdio: 'inherit' });
      console.log('✅ Git checkpoint created.');
    } catch (error) {
      console.log('⚠️  Could not create git checkpoint (this is okay if no changes to commit).');
    }
    
    // Step 4: Run migration
    console.log('\nStep 4: Running migration...');
    execSync('node scripts/run-complete-migration.js --verbose', { stdio: 'inherit' });
    
    // Step 5: Validation
    console.log('\nStep 5: Validating migration results...');
    execSync('node scripts/post-migration-validation.js', { stdio: 'inherit' });
    
    // Step 6: Final steps
    console.log('\n✨ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test your application: npm run dev');
    console.log('   2. Check the changes: git diff');
    console.log('   3. If satisfied, commit: git add -A && git commit -m "Migrate to semantic CSS classes"');
    console.log('   4. If issues found, restore: npm run migrate-styles:restore');
    console.log('   5. Clean backups when ready: npm run migrate-styles:clean-backups');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n🔄 You can restore backups with: npm run migrate-styles:restore');
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  runMasterMigration();
}
