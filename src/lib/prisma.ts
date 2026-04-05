import { PrismaClient } from "@prisma/client";

// Estende o objeto global do Node.js para incluir o cachedPrisma.
// Isso evita erros de tipagem do TypeScript ao acessar o global.cachedPrisma.
declare global {
   
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

// Verifica se estamos em ambiente de produção
if (process.env.NODE_ENV === "production") {
  // Em produção, criamos uma nova instância simples.
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, o Next.js faz "Hot Reload" (reinicia o código ao salvar).
  // Se não usarmos o objeto global, cada "save" criaria uma nova conexão.
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  // Reutiliza a conexão já existente no cache global.
  prisma = global.cachedPrisma;
}

// Exporta a instância como 'db' para ser usada em toda a aplicação.
// Exemplo de uso: import { db } from "@/lib/prisma";
export const db = prisma;
//Usa para chamar o banco de dados
