export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        🏫 Sistema de Substituição Escolar
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Gestão de Faltas e Substituições de Professores
      </p>
      <div className="flex gap-4">
        <a 
          href="/login" 
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Login
        </a>
        <a 
          href="/dashboard" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Dashboard
        </a>
      </div>
    </main>
  );
}