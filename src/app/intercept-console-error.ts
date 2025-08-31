// Debe importarse lo MÁS arriba posible (por ejemplo en layout.tsx)
const originalError = console.error;

function shouldIgnoreConsoleError(args: any[]): boolean {
  const flat = args.map(String).join(" ").toLowerCase();
  // Palabras clave que aparecen en el stack
  return (
    flat.includes("wallet popup has been closed") ||
    flat.includes("failed to connect with auth provider") ||
    flat.includes("error while connecting to connector: auth")
  );
}

// Monkey-patch leve
// Si usas un "logger" propio, aplica el filtro ahí en lugar de tocar console.
console.error = (...args: any[]) => {
  if (shouldIgnoreConsoleError(args)) return;
  originalError(...args);
};
