/**
 * Test file for FileSystem module with gitignore support
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { FileSystem } from '../src/filesystem/index.js';

describe('FileSystem module', async () => {
  const testDir = resolve(process.cwd(), 'test-files');
  const gitignorePath = resolve(testDir, '.gitignore');
  
  // Create test files and directories before tests
  before(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a .gitignore file
    await fs.writeFile(gitignorePath, `
# Ignore node_modules
node_modules/

# Ignore generated files
*.log
*.tmp

# Ignore test directory
ignored-dir/

# Ignore specific files
ignored-file.txt
`);
    
    // Create test files
    await fs.writeFile(resolve(testDir, 'test-file.txt'), 'Test file content');
    await fs.writeFile(resolve(testDir, 'test-file.md'), '# Test markdown file');
    await fs.writeFile(resolve(testDir, 'test-file.log'), 'Log file should be ignored');
    await fs.writeFile(resolve(testDir, 'ignored-file.txt'), 'This file should be ignored');
    
    // Create test directories
    await fs.mkdir(resolve(testDir, 'test-dir'), { recursive: true });
    await fs.mkdir(resolve(testDir, 'ignored-dir'), { recursive: true });
    
    // Create files in test directories
    await fs.writeFile(resolve(testDir, 'test-dir', 'test-file.txt'), 'Test file in test-dir');
    await fs.writeFile(resolve(testDir, 'ignored-dir', 'test-file.txt'), 'Test file in ignored-dir');
  });
  
  // Clean up test files after tests
  after(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
  
  it('should initialize with gitignore rules', async () => {
    // Create a FileSystem instance with the test directory
    const fileSystem = new FileSystem({
      get: () => null
    });
    fileSystem.basePath = testDir;
    
    // Initialize the filesystem
    const initResult = await fileSystem.init();
    assert.strictEqual(initResult, true, 'FileSystem initialization should succeed');
    assert.ok(fileSystem.ignoreFilter, 'Ignore filter should be initialized');
  });
  
  it('should ignore files that match gitignore patterns', async () => {
    // Create a FileSystem instance with the test directory
    const fileSystem = new FileSystem({
      get: () => null
    });
    fileSystem.basePath = testDir;
    await fileSystem.init();
    
    // Check if files are ignored correctly
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'ignored-file.txt')), true, 'ignored-file.txt should be ignored');
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'test-file.log')), true, 'test-file.log should be ignored');
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'ignored-dir/test-file.txt')), true, 'Files in ignored-dir should be ignored');
    
    // Check if files are not ignored correctly
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'test-file.txt')), false, 'test-file.txt should not be ignored');
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'test-file.md')), false, 'test-file.md should not be ignored');
    assert.strictEqual(fileSystem.isFileIgnored(resolve(testDir, 'test-dir/test-file.txt')), false, 'Files in test-dir should not be ignored');
  });
  
  it('should find files respecting gitignore patterns', async () => {
    // Create a FileSystem instance with the test directory
    const fileSystem = new FileSystem({
      get: () => null
    });
    fileSystem.basePath = testDir;
    await fileSystem.init();
    
    // Find all text files
    const textFiles = await fileSystem.findFiles(['**/*.txt']);
    
    // Verify that ignored files are not included
    const textFileNames = textFiles.map(file => file.replace(testDir, '').replace(/^\//, ''));
    assert.ok(textFileNames.includes('test-file.txt'), 'test-file.txt should be found');
    assert.ok(textFileNames.includes('test-dir/test-file.txt'), 'test-dir/test-file.txt should be found');
    assert.ok(!textFileNames.includes('ignored-file.txt'), 'ignored-file.txt should not be found');
    assert.ok(!textFileNames.includes('ignored-dir/test-file.txt'), 'ignored-dir/test-file.txt should not be found');
  });
  
  it('should throw error when reading ignored files', async () => {
    // Create a FileSystem instance with the test directory
    const fileSystem = new FileSystem({
      get: () => null
    });
    fileSystem.basePath = testDir;
    await fileSystem.init();
    
    // Try to read an ignored file
    try {
      await fileSystem.readFile('ignored-file.txt');
      assert.fail('Reading ignored file should throw an error');
    } catch (error) {
      assert.ok(error.message.includes('File is ignored by gitignore rules'), 'Error message should indicate file is ignored');
    }
    
    // Try to read a non-ignored file
    const content = await fileSystem.readFile('test-file.txt');
    assert.strictEqual(content, 'Test file content', 'Should read content of non-ignored file');
  });
}); 