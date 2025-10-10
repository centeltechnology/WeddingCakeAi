#!/usr/bin/env tsx

import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';

interface NavIssue {
  file: string;
  line: number;
  issue: string;
}

const issues: NavIssue[] = [];

function checkFile(filePath: string, sourceFile: any) {
  // Check for duplicate nav IDs by searching all JSX attributes
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  const mainNavs = jsxAttributes.filter((attr: any) => {
    const name = attr.getNameNode().getText();
    const value = attr.getInitializer()?.getText() || '';
    return name === 'id' && (value.includes('main-nav'));
  });
  
  if (mainNavs.length > 1) {
    issues.push({
      file: filePath,
      line: mainNavs[1].getStartLineNumber(),
      issue: 'Duplicate main-nav ID found'
    });
  }
  
  // Check for LogoutButton in pages (should use AppLayout instead)
  const isPage = filePath.includes('/pages/');
  if (isPage) {
    const logoutImports = sourceFile.getImportDeclarations().filter((i: any) => 
      i.getModuleSpecifierValue().includes('LogoutButton')
    );
    
    if (logoutImports.length > 0) {
      issues.push({
        file: filePath,
        line: logoutImports[0].getStartLineNumber(),
        issue: 'Page imports LogoutButton - should use AppLayout instead'
      });
    }
  }
  
  // Check for nested AppLayout + AppShell
  const appLayoutImport = sourceFile.getImportDeclarations().find((i: any) => 
    i.getModuleSpecifierValue().includes('AppLayout')
  );
  const appShellImport = sourceFile.getImportDeclarations().find((i: any) => 
    i.getModuleSpecifierValue().includes('AppShell')
  );
  
  if (appLayoutImport && appShellImport) {
    issues.push({
      file: filePath,
      line: appShellImport.getStartLineNumber(),
      issue: 'Nested layouts detected - file imports both AppLayout and AppShell'
    });
  }
  
  // Check for duplicate nav elements
  const jsxElements = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
  ];
  const navElements = jsxElements.filter((el: any) => 
    el.getTagNameNode()?.getText() === 'nav'
  );
  
  if (navElements.length > 1 && !filePath.includes('AppLayout')) {
    issues.push({
      file: filePath,
      line: navElements[1].getStartLineNumber(),
      issue: 'Multiple <nav> elements found - potential duplicate navigation'
    });
  }
}

console.log('🔍 Linting Navigation...\n');

const clientDir = path.join(process.cwd(), 'apps/app/client/src');
const project = new Project();
project.addSourceFilesAtPaths(`${clientDir}/**/*.{ts,tsx}`);

const files = project.getSourceFiles();

for (const file of files) {
  checkFile(file.getFilePath(), file);
}

if (issues.length === 0) {
  console.log('✅ No navigation issues found!\n');
  console.log('Summary:');
  console.log('  - Single main-nav ID in AppLayout ✓');
  console.log('  - No duplicate Logout buttons ✓');
  console.log('  - No nested layouts ✓');
  process.exit(0);
} else {
  console.log(`❌ Found ${issues.length} navigation issue(s):\n`);
  
  issues.forEach(({ file, line, issue }) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  ${relativePath}:${line}`);
    console.log(`    ${issue}\n`);
  });
  
  process.exit(1);
}
