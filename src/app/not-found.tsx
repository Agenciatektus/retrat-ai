export default function NotFound() {
  return (
    <html>
      <body style={{ 
        margin: 0, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            404 - Página não encontrada
          </h1>
          
          <p style={{ 
            marginBottom: '32px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            A página que você está procurando não existe.
          </p>

          <a 
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            Voltar para Home
          </a>
        </div>
      </body>
    </html>
  )
}

