// scripts/enforceAppLayout.ts
import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement } from "ts-morph";
import fg from "fast-glob";
import { relative, resolve } from "node:path";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";

const ROOT = resolve(process.cwd());
const PAGES = resolve(ROOT, "client/src/pages");
const DRY = process.argv.includes("--write") ? false : true;

const project = new Project({
  tsConfigFilePath: resolve(ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: false,
});

const files = fg.sync(["**/*.tsx"], { cwd: PAGES, absolute: true });

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
for (const file of files) {
  const sf = project.addSourceFileAtPathIfExists(file) || project.getSourceFile(file);
  if (!sf) continue;

  // Quick check: does file contain "<AppLayout" already?
  const hasAppLayout = sf.getText().includes("<AppLayout");
  if (hasAppLayout) continue;

  const didWrap = wrapWithAppLayout(sf);
  if (didWrap) changed.push(file);
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
