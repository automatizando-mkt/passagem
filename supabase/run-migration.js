const fs = require("fs");
const path = require("path");

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const MIGRATION_FILE = process.argv[2];

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error(
    "Variaveis de ambiente obrigatorias:\n" +
      "  SUPABASE_PROJECT_REF  — ref do projeto (ex: xcliwxewpjtiajquiwzu)\n" +
      "  SUPABASE_ACCESS_TOKEN — token de acesso (sbp_...)\n\n" +
      "Uso: SUPABASE_PROJECT_REF=xxx SUPABASE_ACCESS_TOKEN=yyy node supabase/run-migration.js <arquivo>\n" +
      "Exemplo: node supabase/run-migration.js 003_consolidate_public.sql"
  );
  process.exit(1);
}

if (!MIGRATION_FILE) {
  console.error("Informe o arquivo de migracao como argumento.");
  console.error("Exemplo: node supabase/run-migration.js 003_consolidate_public.sql");
  process.exit(1);
}

const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSQL(sql, label) {
  console.log(`\n>> Executando: ${label}...`);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`   ERRO (${res.status}): ${text}`);
    return false;
  }
  console.log(`   OK`);
  return true;
}

async function main() {
  const filePath = path.join(__dirname, "migrations", MIGRATION_FILE);
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo nao encontrado: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`=== Executando migracao: ${MIGRATION_FILE} ===`);

  // Dividir SQL em blocos separados por linhas "-- ========================"
  // Cada bloco com label "PARTE N: descricao"
  const blocks = [];
  let currentBlock = "";
  let currentLabel = MIGRATION_FILE;

  for (const line of sql.split("\n")) {
    const parteMatch = line.match(/^-- PARTE \d+:/);
    const sectionMatch = line.match(/^-- ={10,}/);

    if (parteMatch) {
      // Flush bloco anterior se tiver conteudo SQL
      if (currentBlock.trim()) {
        blocks.push({ label: currentLabel, sql: currentBlock });
        currentBlock = "";
      }
      currentLabel = line.replace(/^-- /, "").trim();
    } else if (!sectionMatch) {
      currentBlock += line + "\n";
    }
  }

  // Flush ultimo bloco
  if (currentBlock.trim()) {
    blocks.push({ label: currentLabel, sql: currentBlock });
  }

  let allOk = true;
  for (const block of blocks) {
    const ok = await runSQL(block.sql, block.label);
    if (!ok) {
      allOk = false;
      console.error(`\n!! Falha em "${block.label}". Abortando restante.`);
      break;
    }
  }

  if (allOk) {
    console.log(`\n=== Migracao ${MIGRATION_FILE} completa! ===`);
  } else {
    console.log("\n=== Migracao interrompida com erros. ===");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
