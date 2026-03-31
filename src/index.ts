import app from './config/app';

const PORT = process.env.PORT || 3000;

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

export default app;