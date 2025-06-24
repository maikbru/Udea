import Link from 'next/link';
export default function Home() {
  
  return (
    <main className="p-6 text-center">
      <h1 className="text-3xl font-bold">Bienvenido a la App de Referidos</h1>
      <p className="mt-4">Escanea o crea campañas para tu negocio</p>
    <div className="mt-8 space-y-2">
        <Link href="/page1" className="text-blue-600 underline">Personalizar</Link><br />
        <Link href="/login" className="text-blue-600 underline">Login</Link>
      </div>
    </main>
  );
}
