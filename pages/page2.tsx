
import React, { useState, useRef, useEffect } from 'react';
import { MdColorLens } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaUpload, FaTrash, FaUser } from 'react-icons/fa';
import { RiArchiveDrawerFill } from "react-icons/ri";
import { useRouter } from 'next/router';

export default function CustomizationPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!currentQuestion.trim() || loading) return;

const questionToSend = currentQuestion.trim();
setMessages((prev) => [...prev, { role: 'user', text: questionToSend }]);
setCurrentQuestion('');
  setLoading(true);

  try {
    const response = await fetch('https://chatbot-backend-y8bz.onrender.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ question: questionToSend })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error en el servidor');
    }

    const data = await response.json();
    setMessages((prev) => [...prev, { role: 'bot', text: data.answer || 'No se obtuvo respuesta del servidor' }]);
  } catch (err) {
    console.error('Error al consultar el backend:', err);
  } finally {
    setLoading(false);
  }
};
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [sidebarColor, setSidebarColor] = useState('#2563eb');
  const [welcomeText, setWelcomeText] = useState('');
  const [username, setUsername] = useState('Usuario123');
  const [logo, setLogo] = useState<string | null>(null);
    const { empresaId } = router.query;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  

  // Refs
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  
const TermsModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Términos y Condiciones</h2>
      <div className="overflow-y-auto max-h-60 whitespace-pre-wrap text-sm text-black border p-3 mb-4 bg-gray-50 rounded">
        {config?.terminos}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowTermsModal(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
);
 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const targetSize = 100;

      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx?.drawImage(img, 0, 0, targetSize, targetSize);
      const resizedDataUrl = canvas.toDataURL('image/png');
      setLogo(resizedDataUrl);
    };
    img.src = reader.result as string;
  };

  reader.readAsDataURL(file);
};

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply colors
  const applyColors = () => {
  const backcolor = document.querySelector('.back');
  if (backcolor) {
    (backcolor as HTMLElement).style.backgroundColor = bgColor;
    localStorage.setItem('bgColor', bgColor);
    alert('cambios guardados con exito')    
  } else {
    alert('no se encontró el fondo')
  }
  const sidebarelement = document.querySelector('.sidebar');
  
};

  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
  const savedBg = localStorage.getItem('bgColor');
  const fondo = document.querySelector('.back');
  if (fondo && savedBg) {
    (fondo as HTMLElement).style.backgroundColor= savedBg;
  }
  
}, []);
  

 //guardar datos de la empresa
  


  useEffect(() => {
    if (!empresaId) return;
    fetch(`/api/getcustom?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLogo(data.logo || null);
        setBgColor(data.bgColor || '#f8fafc');
        setSidebarColor(data.sidebarColor || '#2563eb');
        setWelcomeText(data.welcomeText || '');
        setIsLoading(false);

        if (data.terminos) {
        setShowTermsModal(true); // Mostrar modal
      }
      })
      .catch(err => {
        console.error('Error cargando configuración:', err);
        setIsLoading(false);
      });
  
}, [router]);

  if (isLoading) return null;
  return (
    
    <div className="back bg-gray-100 font-sans min-h-screen"
    style={{ backgroundColor: bgColor }}
    >
      {showTermsModal && <TermsModal />}

      {/* Top Bar */}
      <div className="bg-white shadow-md w-full h-16 border flex items-center justify-between px-6 fixed top-0 left-0 z-10" style={{ borderColor: '#11998e' }}>
        {/* Customizable Logo */}
        <div className="flex items-center">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl cursor-pointer overflow-hidden"
              style={{
                backgroundImage: logo ? `url(${logo})` : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => logoInputRef.current?.click()}
            >
              {!logo && 'MP'}
            </div>
            <input 
              type="file" 
              ref={logoInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          
        </div>
        
        {/* User Options */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`main-content center justify-center mt-16 p-8 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto rounded-lg" style={{ backgroundColor: '#11998e' }}>
          <div className="flex max-w justify-center mt-4">
          <h1 className="rounded-lg p-5 text-3xl font-bold text-white center" >{welcomeText || "Bienvenido al agente virtual"}</h1>
          </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* ✅ VIDEO PREVIEW AQUÍ */}
            <div className="mt-6 border-1 border-gray-300 rounded-lg p-4 text-center">
              <video
                controls
                className="mx-auto max-w-100 h-auto rounded shadow"
              >
                <source src="/avatar.mp4" type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
            </div>
          
          
          {/* Text Input */}
          <h2 className="text-xl text-black font-semibold text-gray-800 mt-10 mb-4">Conversación con el agente</h2>

          {/* Historial de conversación */}
<div className="max-h-[400px] overflow-y-auto mb-4 bg-gray-50 text-black rounded p-4 border border-gray-200">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`mb-2 p-3 rounded-lg w-fit max-w-[80%] ${
        msg.role === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-green-100'
      }`}
    >
      <p className="text-sm text-black">{msg.text}</p>
    </div>
  ))}

  {/* Indicador de que el bot está escribiendo */}
  {loading && (
    <div className="mb-2 p-3 rounded-lg w-fit max-w-[80%] bg-green-100">
      <div className="flex space-x-1">
        <span className="animate-bounce">•</span>
        <span className="animate-bounce delay-150">•</span>
        <span className="animate-bounce delay-300">•</span>
      </div>
    </div>
  )}
</div>
          
          {/* Input y botón */}
          <div className="flex gap-2">
            
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-grow px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Enviar
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

