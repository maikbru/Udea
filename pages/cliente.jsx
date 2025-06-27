import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function UsuarioFinal() {
  const router = useRouter();
  const { empresaId } = router.query;

  const [config, setConfig] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (empresaId) {
      // Simulación de fetch a base de datos o API
      const mockConfig = {
        logoURL: '/uploads/logo-empresa123.png',
        videoURL: '/uploads/avatar-empresa123.mp4',
        faq: [
          { pregunta: '¿Dónde están ubicados?', respuesta: 'Estamos en Medellín.' },
          { pregunta: '¿Cuál es el horario?', respuesta: 'De lunes a viernes, 8am a 6pm.' },
        ],
      };
      setConfig(mockConfig);
    }
  }, [empresaId]);

  const handleEnviar = () => {
    if (!mensaje.trim()) return;

    // Buscar respuesta similar (simulación)
    const match = config?.faq.find((f) => mensaje.toLowerCase().includes(f.pregunta.toLowerCase()));
    const respuesta = match?.respuesta || 'Lo siento, no tengo una respuesta para eso.';

    setHistorial((prev) => [...prev, { user: mensaje, bot: respuesta }]);
    setMensaje('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Encabezado */}
      <div className="bg-white shadow flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
        
          <h1 className="ml-4 text-2xl font-semibold">Asistente Virtual</h1>
        </div>
        <span className="text-gray-600">Powered by Tu Plataforma</span>
      </div>

    

      {/* Chat */}
      <div className="mt-8 max-w-2xl mx-auto bg-white rounded shadow p-6">
        <div className="h-60 overflow-y-auto border-b mb-4 pb-4">
          {historial.map((item, idx) => (
            <div key={idx} className="mb-2">
              <p><strong>Tú:</strong> {item.user}</p>
              <p><strong>Bot:</strong> {item.bot}</p>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-grow border px-4 py-2 rounded-l"
          />
          <button onClick={handleEnviar} className="bg-blue-600 text-white px-6 py-2 rounded-r">Enviar</button>
        </div>
      </div>
    </div>
  );
}