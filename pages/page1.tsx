
import React, { useState, useRef, useEffect } from 'react';
import { MdColorLens } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaUpload, FaTrash, FaUser } from 'react-icons/fa';
import { RiArchiveDrawerFill } from "react-icons/ri";
export default function CustomizationPage() {
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [sidebarColor, setSidebarColor] = useState('#2563eb');
  const [username, setUsername] = useState('Usuario123');
  const [logo, setLogo] = useState<string | null>(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string); // Forzamos a string porque sabemos que es base64
    };
    reader.readAsDataURL(file);
  }
};
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string); // fuerza el tipo
    };
    reader.readAsDataURL(file);
  }
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


  return (
    <div className="back bg-gray-100 font-sans min-h-screen"
    style={{ backgroundColor: bgColor }}
    >
      
      {/* Top Bar */}
      <div className="bg-white shadow-md w-full h-16 border flex items-center justify-between px-6 fixed top-0 left-0 z-10" style={{ borderColor: '#11998e' }}>
        {/* Customizable Logo */}
        <div className="flex items-center">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl cursor-pointer"
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
              onChange={handleLogoUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          <span className="ml-3 text-black text-lg font-semibold hidden md:block">ModusPonens</span>
        </div>
        
        {/* User Options */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center">
            <span className="text-gray-700">Bienvenido,</span>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-semibold ml-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-32"
            />
          </div>
          <div className="relative" ref={userMenuRef}>
            <button 
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-300 transition"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUser />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <a href="1" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
                <a href="2" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configuración</a>
                <a href="login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar sesión</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
  className={`sidebar bg-blue-600 text-white fixed top-16 left-0 h-full py-4 flex flex-col items-start transition-all duration-300 z-10 ${
    sidebarCollapsed ? 'w-16' : 'w-64'
  }`}
  style={{ backgroundColor: '#11998e' }}
>
  {/* Botón colapsar/expandir */}
  <button
    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
    className="absolute -right-4 top-4 bg-white text-blue-600 rounded-full p-2 shadow hover:bg-blue-100 transition z-20"
  >
    {sidebarCollapsed ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"  />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
      </svg>
    )}
  </button>

  {/* Botón 1 */}
  <button className="sidebar-item flex items-center px-6 py-3 hover:bg-blue-700 transition w-full">
    <div className="flex items-center justify-center mr-3">
      <RiArchiveDrawerFill size={30} />
    </div>
    {!sidebarCollapsed && <span>Cargue base de datos</span>}
  </button>

  {/* Botón 2 */}
  <button className="sidebar-item flex items-center px-6 py-3 hover:bg-blue-700 transition w-full">
    <div className="flex items-center justify-center mr-3">
      <MdColorLens size={30} />
    </div>
    {!sidebarCollapsed && <span>Personalización</span>}
  </button>
</div>


      {/* Main Content */}
      <div 
        className={`main-content mt-16 p-8 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto rounded-lg" style={{ backgroundColor: '#11998e' }}>
          <div className="flex max-w justify-center mt-4">
          <h1 className="rounded-lg p-5 text-3xl font-bold text-white center" >Personalización agente virtual</h1>
          </div>
          </div>
          {/* File/Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Logo</h2>
            <div className="flex">
            <button 
              className="bg-white-50 border border-blue-700 rounded-3xl hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: '#11998e' }}
            >
              <div className="flex" >
                <h1 className='bg-gray-300 p-1 shadow shadow-lg shadow-gray-500 font-semibold text-gray-800'>Seleccionar archivo</h1>
                <h1 className='text text-blue-300 px-4 py mt-1'>ningun archivo seleccionado</h1>
              </div>
            </button>
            <button className="bg-white-50 ml-10 shadow shadow-lg shadow-gray-600 border border-blue-700 rounded-3xl hover:bg-blue-600 font-medium py-2 px-4 rounded transition"
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: '#11998e'}}>
                <h1 className='text text-black px-4 mt-1'>Cargar archivos</h1>{/*cargar achivos*/}
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <img src={imagePreview} className="max-h-60 mx-auto" alt="Vista previa" />
                <button 
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                  onClick={removeImage}
                >
                  <FaTrash className="inline mr-1" />Eliminar imagen
                </button>
              </div>
            )}

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
          
            <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">Ingrese pregunta inicio de chat</h2>
            <input 
              type="text" 
              placeholder="Escribe tu texto aquí" 
              className="w-full px-4 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
          
          
          {/* Color Pickers */}
          
            <h2 className="text-xl font-semibold text-gray-800 mt-7 mb-4">Colores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* buttons Color */}
              <div>
                <h2 className="font-bold text-black mb-2">Botones</h2>
                <div className="flex items-center">
                  <input 
                    type="color" 
                    value={sidebarColor}
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-600">{sidebarColor}</span>
                  <div 
                    className="color-preview" 
                    style={{ backgroundColor: sidebarColor }}
                  />
                </div>
              </div>
              
              {/* Fondo Color */}
              <div>
                <h2 className="block font-bold text-black mb-2">Fondo</h2>
                <div className="flex items-center">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-600">{bgColor}</span>
                  <div 
                    className="color-preview" 
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
              </div>
            </div>
            <div className="flex max-w justify-center mt-4">
            <button 
              className="bg-white-50 ml-10 text-black shadow shadow-lg shadow-gray-600 border border-green-500 rounded-3xl hover:bg-blue-600 font-medium py-1 px-7 rounded transition"
              onClick={applyColors}
            >
              Guardar
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};