// scripts/enforceAppLayout.ts
import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement } from "ts-morph";
import fg from "fast-glob";
import micromatch from "micromatch";
import { relative, resolve } from "node:path";
import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";

const ROOT = resolve(process.cwd());
const PAGES = resolve(ROOT, "client/src/pages");
const DRY = process.argv.includes("--write") ? false : true;

console.log("Loading config...");

// Load config
const configPath = resolve(ROOT, "scripts/enforceAppLayout.config.json");
const config = existsSync(configPath) 
  ? JSON.parse(readFileSync(configPath, "utf-8"))
  : { include: ["**/*.tsx"], exclude: [] };

console.log("Creating ts-morph project...");

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
  compilerOptions: {
    jsx: 1,
    module: 99,
    target: 99
  }
});

console.log("Finding TSX files...");

// Get all TSX files from pages directory
const allFiles = fg.sync(["**/*.tsx"], { cwd: PAGES, absolute: true });

console.log(`Found ${allFiles.length} total files`);

// Filter using micromatch for better performance
const files = allFiles.filter((file: string) => {
  const relPath = relative(ROOT, file);
  
  // Check if excluded
  const isExcluded = micromatch.isMatch(relPath, config.exclude || []);
  
  return !isExcluded;
});

console.log(`After filtering: ${files.length} files to process`);

const ensureImport = (sf: any, importName: string, importPath: string) => {
  const existing = sf.getImportDeclarations().find((d:any)=> d.getModuleSpecifierValue()===importPath);
  if (existing) {
    const named = existing.getNamedImports().map((n:any)=>n.getName());
    if (!named.includes(importName)) existing.addNamedImport({ name: importName });
  } else {
    sf.addImportDeclaration({ moduleSpecifier: importPath, namedImports:[{ name: importName }] });
  }
};

const wrapWithAppLayout = (sf:any) => {
  // find default export function component and its return
  const def = sf.getDefaultExportSymbol()?.getDeclarations()?.[0];
  if (!def) return false;

  // Find first return JSX in the component
  const returns = sf.getDescendantsOfKind(SyntaxKind.ReturnStatement);
  const jsxReturn = returns.find((r:any)=>{
    const expr = r.getExpression();
    if (!expr) return false;
    return expr.getKind()===SyntaxKind.JsxElement
        || expr.getKind()===SyntaxKind.JsxSelfClosingElement
        || expr.getKind()===SyntaxKind.ParenthesizedExpression
        || expr.getKind()===SyntaxKind.JsxFragment;
  });
  if (!jsxReturn) return false;

  let expr:any = jsxReturn.getExpression();
  if (expr.getKind()===SyntaxKind.ParenthesizedExpression) expr = expr.getExpression();

  // Heuristic: already wrapped?
  const isWrapped = (() => {
    if (expr.getKind()===SyntaxKind.JsxElement) {
      const tag = expr.getOpeningElement().getTagNameNode().getText();
      return tag==="AppLayout";
    }
    return false;
  })();
  if (isWrapped) return false;

  // Inject imports
  ensureImport(sf, "AppLayout", "@/components/AppLayout");

  // Replace return expression with <AppLayout>{old}</AppLayout>
  const source = expr.getText();
  const replacement = `<AppLayout>${source}</AppLayout>`;
  expr.replaceWithText(replacement);
  return true;
};

const changed:string[] = [];
console.log("Processing files...");

for (const file of files) {
  console.log(`  Checking ${relative(ROOT, file)}...`);
  const sf = project.addSourceFileAtPathIfExists(file) || project.getSourceFile(file);
  if (!sf) {
    console.log(`    Skipped (no source file)`);
    continue;
  }

  // Quick check: does file contain "<AppLayout" already?
  const hasAppLayout = sf.getText().includes("<AppLayout");
  if (hasAppLayout) {
    console.log(`    Skipped (already has AppLayout)`);
    continue;
  }

  const didWrap = wrapWithAppLayout(sf);
  if (didWrap) {
    console.log(`    ✓ Will wrap with AppLayout`);
    changed.push(file);
  } else {
    console.log(`    Skipped (unable to wrap)`);
  }
}

if (DRY) {
  console.log("DRY RUN — files that would be modified:");
  changed.forEach(f => console.log(" -", relative(ROOT, f)));
  process.exit(0);
}

// back up and save
for (const f of changed) {
  const backup = f + ".bak";
  if (!existsSync(backup)) copyFileSync(f, backup);
}
project.saveSync();
console.log("WROTE changes to:");
changed.forEach(f => console.log(" -", relative(ROOT, f)));
