export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          404 - Página não encontrada
        </h1>
        
        <p className="mb-8">
          A página que você está procurando não existe.
        </p>

        <a 
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  )
}

