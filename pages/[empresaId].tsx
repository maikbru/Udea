import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function EmpresaAssistantPage() {
  const router = useRouter();
  const { empresaId } = router.query;
  const [customization, setCustomization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) return;

    fetch(`/api/assistant/${empresaId}`)
      .then(res => res.json())
      .then(data => {
        setCustomization(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando personalización:', err);
        setLoading(false);
      });
  }, [empresaId]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Cargando asistente...</div>;
  }

  if (!customization || !customization.public) {
    return <div className="text-center mt-10 text-red-500">Este asistente no está disponible públicamente.</div>;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-6"
      style={{ backgroundColor: customization.colorBackground || '#f9fafb' }}
    >
      {/* Logo */}
      <div className="w-full flex justify-between items-center py-4 px-6 bg-white shadow mb-6">
        <div className="flex items-center">
          {customization.logoUrl ? (
            <img src={customization.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded" />
          ) : (
            <div className="h-10 w-10 bg-gray-300 rounded"></div>
          )}
          <span className="ml-4 font-semibold text-xl text-gray-700">Asistente Virtual</span>
        </div>
      </div>

      {/* Avatar */}
      {customization.avatarVideoUrl && (
        <video
          src={customization.avatarVideoUrl}
          className="w-64 h-64 object-cover rounded shadow mb-4"
          autoPlay
          muted
          loop
        />
      )}

      {/* Mensaje de bienvenida */}
      <h2 className="text-lg text-gray-800 mb-4 text-center">
        {customization.welcomeMessage || 'Hola, soy tu asistente virtual, ¿cómo puedo ayudarte?'}
      </h2>

      {/* Input de conversación */}
      <input
        type="text"
        placeholder="Escribe tu pregunta..."
        className="w-full max-w-md border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Aquí puedes integrar el chat con IA luego */}
    </div>
  );
}
