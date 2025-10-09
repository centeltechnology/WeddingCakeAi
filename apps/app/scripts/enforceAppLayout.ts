// scripts/enforceAppLayout.ts
import { Project, SyntaxKind } from "ts-morph";
import fg from "fast-glob";
import { relative, resolve } from "node:path";
import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";

type Config = { include: string[]; exclude: string[] };

const ROOT = resolve(process.cwd());
const CONFIG_PATH = resolve(ROOT, "scripts/enforceAppLayout.config.json");
const DRY = process.argv.includes("--write") ? false : true;

// ---------------- config ----------------
const config: Config = existsSync(CONFIG_PATH)
  ? JSON.parse(readFileSync(CONFIG_PATH, "utf8"))
  : { include: ["client/src/pages/**/*.{tsx,jsx}"], exclude: [] };

const includeGlobs = config.include.length ? config.include : ["client/src/pages/**/*.{tsx,jsx}"];
const excludeGlobs = config.exclude ?? [];

// Resolve target set using allow/deny
const includeFiles = new Set(
  fg.sync(includeGlobs, { cwd: ROOT, absolute: true, dot: false })
);
const excludeFiles = new Set(
  fg.sync(excludeGlobs, { cwd: ROOT, absolute: true, dot: false })
);

const targets = [...includeFiles].filter(f => !excludeFiles.has(f));
// ---------------------------------------

const project = new Project({
  tsConfigFilePath: resolve(ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: false,
});

const ensureImport = (sf: any, importName: string, importPath: string) => {
  const existing = sf.getImportDeclarations().find((d:any)=> d.getModuleSpecifierValue()===importPath);
  if (existing) {
    if (!existing.getDefaultImport()) {
      existing.setDefaultImport(importName);
    }
  } else {
    sf.addImportDeclaration({ moduleSpecifier: importPath, defaultImport: importName });
  }
};

const wrapWithAppLayout = (sf:any) => {
  const def = sf.getDefaultExportSymbol()?.getDeclarations()?.[0];
  if (!def) return false;

  // Get returns ONLY from the default export's body, not all returns in the file
  let componentBody: any = null;
  
  if (def.getKind() === SyntaxKind.FunctionDeclaration) {
    componentBody = def;
  } else if (def.getKind() === SyntaxKind.ExportAssignment) {
    const expr = def.getExpression();
    if (expr.getKind() === SyntaxKind.FunctionExpression || expr.getKind() === SyntaxKind.ArrowFunction) {
      componentBody = expr;
    } else if (expr.getKind() === SyntaxKind.Identifier) {
      const symbol = expr.getSymbol();
      const declarations = symbol?.getDeclarations() ?? [];
      if (declarations.length > 0) {
        const varDecl = declarations[0];
        if (varDecl.getKind() === SyntaxKind.FunctionDeclaration) {
          componentBody = varDecl;
        } else if (varDecl.getKind() === SyntaxKind.VariableDeclaration) {
          const init = varDecl.getInitializer();
          if (init && (init.getKind() === SyntaxKind.FunctionExpression || init.getKind() === SyntaxKind.ArrowFunction)) {
            componentBody = init;
          }
        }
      }
    }
  }
  
  if (!componentBody) return false;

  const returns = componentBody.getDescendantsOfKind(SyntaxKind.ReturnStatement);
  const jsxReturns = returns.filter((r:any)=>{
    const expr = r.getExpression();
    if (!expr) return false;
    return [
      SyntaxKind.JsxElement,
      SyntaxKind.JsxSelfClosingElement,
      SyntaxKind.ParenthesizedExpression,
      SyntaxKind.JsxFragment,
    ].includes(expr.getKind());
  });
  
  if (jsxReturns.length === 0) return false;

  // Collect all unwrapped expressions first (don't modify AST yet)
  const toWrap: Array<{expr: any, source: string}> = [];
  
  for (const jsxReturn of jsxReturns) {
    let expr:any = jsxReturn.getExpression();
    if (expr.getKind()===SyntaxKind.ParenthesizedExpression) expr = expr.getExpression();

    // already wrapped?
    const isWrapped =
      expr.getKind()===SyntaxKind.JsxElement &&
      expr.getOpeningElement().getTagNameNode().getText()==="AppLayout";
    if (isWrapped) continue;

    const source = expr.getText();
    toWrap.push({ expr, source });
  }
  
  if (toWrap.length === 0) return false;

  // Now apply all changes in reverse order (to avoid AST invalidation)
  ensureImport(sf, "AppLayout", "@/components/AppLayout");
  for (let i = toWrap.length - 1; i >= 0; i--) {
    const { expr, source } = toWrap[i];
    expr.replaceWithText(`<AppLayout>${source}</AppLayout>`);
  }
  
  return true;
};

const changed:string[] = [];
for (const file of targets) {
  const sf = project.addSourceFileAtPathIfExists(file) || project.getSourceFile(file);
  if (!sf) continue;

  const didWrap = wrapWithAppLayout(sf);
  if (didWrap) changed.push(file);
}

if (DRY) {
  console.log("DRY RUN — files that would be modified:");
  changed.forEach(f => console.log(" -", relative(ROOT, f)));
  process.exit(0);
}

// backups and save
for (const f of changed) {
  const backup = f + ".bak";
  if (!existsSync(backup)) copyFileSync(f, backup);
}
project.saveSync();
console.log("WROTE changes to:");
changed.forEach(f => console.log(" -", relative(ROOT, f)));
