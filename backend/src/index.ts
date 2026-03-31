import app from './config/app';

// Vercel serverless - detecta automaticamente a porta
const PORT = process.env.PORT || 3000;

// Para desenvolvimento local
const isLocal = process.env.NODE_ENV !== 'production';

if (isLocal) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏫 Servidor - Substituição de Professores                ║
║                                                              ║
║   📡 API Rodando em: http://localhost:${PORT}                ║
║   📚 Documentação: http://localhost:${PORT}/api/v1           ║
║   ❤️  Health Check: http://localhost:${PORT}/health          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

// Export para Vercel Serverless Functions
export default app;