
import React, { useState, useRef, useEffect } from 'react';
import { MdColorLens } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaUpload, FaTrash, FaUser } from 'react-icons/fa';
import { RiArchiveDrawerFill } from "react-icons/ri";
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';

export default function CustomizationPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeSection, setActiveSection] = useState<'custom' | 'upload'>('custom');
  const [pptxFile, setPptxFile]=useState<File | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [linkPages, setLinkPages] = useState<string[]>(['']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [sidebarColor, setSidebarColor] = useState('#2563eb');
  const [username, setUsername] = useState('Usuario123');
  const [logo, setLogo] = useState<string | null>(null);
  const [welcomeText, setWelcomeText] = useState('');
  const [linkPage, setLinkPage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const [loadingPptx, setLoadingPptx] = useState(false);
  const [pptxSuccess, setPptxSuccess] = useState(false);

  const [loadingWord, setLoadingWord] = useState(false);
  const [wordSuccess, setWordSuccess] = useState(false);

  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linksSuccess, setLinksSuccess] = useState(false);

  const renderButtonContent = (loading: boolean, success: boolean, label: string) => {
    if (loading) return <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Subiendo...</span>;
    if (success) return <span className="flex items-center gap-2">✅ Cargado</span>;
    return label;
  };
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleExcelUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!excelFile) return alert('Seleccione un archivo');

  const empresaId = localStorage.getItem('empresaId');
  if (!empresaId) return alert("Empresa no identificada");

  const reader = new FileReader();

  reader.onload = async (event) => {
    const data = new Uint8Array(event.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Preparamos el FormData
    const formData = new FormData();
    formData.append('empresaId', empresaId);
    formData.append('data', JSON.stringify(jsonData)); // como string
    formData.append('linkPages', JSON.stringify(linkPages));

    if (wordFile) {
      formData.append('termsFile', wordFile);
    }

    try {
  const res = await fetch('/api/upload-excel', {
    method: 'POST',
    body: formData,
  });

  let result;
  try {
    result = await res.json();
  } catch (err) {
    const errorText = await res.text();
    console.error('Respuesta no JSON:', errorText);
    alert('Error inesperado del servidor');
    return;
  }

  if (res.ok) {
    alert('Archivo procesado con éxito');
  } else {
    alert(result.message || 'Error al subir el archivo');
  }
} catch (error) {
  console.error('Error al enviar archivos:', error);
  alert('Error al subir el archivo');
}
  };

  reader.readAsArrayBuffer(excelFile);
};



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
  const handleLogout = () => {
    localStorage.removeItem('empresaId');
    router.push('/login');
  };
  const handleLinkChange = (index: number, value: string) => {
    const updated = [...linkPages];
    updated[index] = value;
    setLinkPages(updated);
  };

  const addLink = () => {
    setLinkPages([...linkPages, '']);
  };

  const removeLink = (index: number) => {
    setLinkPages(linkPages.filter((_, i) => i !== index));
  };
 //guardar datos de la empresa
  const saveToDatabase = async () => {
  const empresaId = localStorage.getItem('empresaId');
  if (!empresaId) return alert("Empresa no identificada");

  const res = await fetch('/api/savecustom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      empresaId,
      logo,
      bgColor,
      sidebarColor,
      welcomeText, // O tu input personalizado
    }),
  });

  const data = await res.json();
  if (res.ok) {
    alert('Cambios guardados en la base de datos');
  } else {
    alert(data.message || 'Error al guardar');
  }
};


  useEffect(() => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) {
      router.push('/login');
    } else {
    fetch(`/api/getcustom?empresaId=${empresaId}`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLogo(data.logo || null);
        setBgColor(data.bgColor || '#f8fafc');
        setSidebarColor(data.sidebarColor || '#2563eb');
        // También puedes cargar welcomeText si tienes el input
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error cargando configuración:', err);
        setIsLoading(false);
      });
  }
}, [router]);

  if (isLoading) return null;
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
              Bienvenido{config?.username ? `, ${config.username}` : ''}
            </h1>
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
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
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
  style={{ backgroundColor: '#11998e' }}>

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
  <button
    className="sidebar-item flex items-center px-6 py-3 hover:bg-blue-700 transition w-full"
    onClick={() => setActiveSection('upload')}
  >
    <div className="flex items-center justify-center mr-3">
      <RiArchiveDrawerFill size={30} />
    </div>
    {!sidebarCollapsed && <span>Cargue base de datos</span>}
  </button>

  {/* Botón 2 */}
  <button
    className="sidebar-item flex items-center px-6 py-3 hover:bg-blue-700 transition w-full"
    onClick={() => setActiveSection('custom')}
  >
    <div className="flex items-center justify-center mr-3">
      <MdColorLens size={30} />
    </div>
    {!sidebarCollapsed && <span>Personalización</span>}
  </button>
</div>


      {/* Main Content */}
      <div className={`main-content mt-16 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {activeSection === 'custom' ? (
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
                <div className="flex">
                  <h1 className='bg-gray-300 p-1 shadow shadow-lg shadow-gray-500 font-semibold text-gray-800'>Seleccionar archivo</h1>
                  <h1 className='text text-blue-300 px-4 py mt-1'>{logo ? 'Archivo cargado' : 'ningún archivo seleccionado'}</h1>
                </div>
              </button>
              <button className="bg-white-50 ml-10 shadow shadow-lg shadow-gray-600 border border-blue-700 rounded-3xl hover:bg-blue-600 font-medium py-2 px-4 rounded transition"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: '#11998e' }}>
                <h1 className='text text-black px-4 mt-1'>Cargar archivos</h1>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />

            {logo && (
              <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <img src={logo} className="max-h-60 mx-auto object-contain" alt="Vista previa" />
                <button 
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                  onClick={() => setLogo(null)}
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
          
            <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">Ingrese el nombre del agente virtual</h2>
            <input 
              type="text" 
              placeholder="Escribe tu texto aquí" 
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
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
              onClick={() => {
                applyColors();
                saveToDatabase();
              }}
            >
              Guardar
            </button>
            </div>
          </div>
        </div>
        ) : (// Contenido de subida de Excel
    // Reemplaza este fragmento en tu componente React para separar las subidas:

<div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Cargar base de conocimiento</h2>

  {/* Subida de Excel */}
  <div className="mb-4">
    <label className="block mb-2 text-black font-semibold">Archivo Preguntas Y Respuestas (Excel)</label>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
      className="text-black border p-2 rounded w-full mb-2"
    />
    <button
  type="button"
  onClick={async () => {
    if (!excelFile) return;
    setLoadingExcel(true);
    setExcelSuccess(false);
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const res = await fetch('/api/upload-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, data: jsonData }),
      });

      const result = await res.json();
      setLoadingExcel(false);
      setExcelSuccess(res.ok);
    };
    reader.readAsArrayBuffer(excelFile);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {renderButtonContent(loadingExcel, excelSuccess, 'Guardar Excel')}
</button>
  </div>
  {/* Subida de PDF como texto */}
<div className="mb-4">
  <label className="block mb-2 text-black font-semibold">Archivo PDF</label>
  <input
    type="file"
    accept=".pdf"
    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
    className="text-black border p-2 rounded w-full mb-2"
  />
  <button
  type="button"
  onClick={async () => {
    if (!pdfFile) return;
    setLoadingPdf(true);
    setPdfSuccess(false);
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) return;

    const formData = new FormData();
    formData.append('empresaId', empresaId);
    formData.append('pdfFile', pdfFile);

    const res = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });

    await res.json();
    setLoadingPdf(false);
    setPdfSuccess(res.ok);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {renderButtonContent(loadingPdf, pdfSuccess, 'Guardar contenido del PDF')}
</button>

</div>
      {/* Subida de PowerPoint */}
<div className="mb-4">
  <label className="block mb-2 text-black font-semibold">Presentación PowerPoint (.pptx)</label>
  <input
    type="file"
    accept=".ppt,.pptx"
    onChange={(e) => setPptxFile(e.target.files?.[0] || null)}
    className="text-black border p-2 rounded w-full mb-2"
  />
  <button
  type="button"
  onClick={async () => {
    if (!pptxFile) return;
    setLoadingPptx(true);
    setPptxSuccess(false);
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) return;

    const formData = new FormData();
    formData.append('empresaId', empresaId);
    formData.append('pptxFile', pptxFile);

    const res = await fetch('/api/upload-powerpoint', {
      method: 'POST',
      body: formData,
    });

    await res.json();
    setLoadingPptx(false);
    setPptxSuccess(res.ok);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {renderButtonContent(loadingPptx, pptxSuccess, 'Guardar PowerPoint')}
</button>

</div>
  {/* Subida de Word */}
  <div className="mb-4">
    <label className="block mb-2 text-black font-semibold">Términos y condiciones (.docx)</label>
    <input
      type="file"
      accept=".doc,.docx"
      onChange={(e) => setWordFile(e.target.files?.[0] || null)}
      className="text-black border p-2 rounded w-full mb-2"
    />
    <button
  type="button"
  onClick={async () => {
    if (!wordFile) return;
    setLoadingWord(true);
    setWordSuccess(false);
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) return;

    const formData = new FormData();
    formData.append('empresaId', empresaId);
    formData.append('termsFile', wordFile);

    const res = await fetch('/api/upload-word', {
      method: 'POST',
      body: formData,
    });

    await res.json();
    setLoadingWord(false);
    setWordSuccess(res.ok);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {renderButtonContent(loadingWord, wordSuccess, 'Guardar Word')}
</button>

  </div>

  {/* Links */}
  <div className="mb-4">
    <h2 className='text-2xl font-bold text-black mb-3'>Links de alimentación</h2>
    {linkPages.map((link, index) => (
      <div key={index} className="flex gap-2 mb-2">
        <input
          type="text"
          value={link}
          onChange={(e) => handleLinkChange(index, e.target.value)}
          className="flex-grow px-4 text-black py-2 border border-gray-300 rounded-md"
          placeholder={`Link ${index + 1}`}
        />
        <button
          type="button"
          onClick={() => removeLink(index)}
          className="text-red-500 font-bold"
        >
          ✕
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={addLink}
      className="text-blue-600 underline text-sm mb-4 px-4"
    >
      + Agregar otro link
    </button>
    <button
  type="button"
  onClick={async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) return;
    setLoadingLinks(true);
    setLinksSuccess(false);

    const res = await fetch('/api/upload-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresaId, links: linkPages }),
    });

    await res.json();
    setLoadingLinks(false);
    setLinksSuccess(res.ok);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  {renderButtonContent(loadingLinks, linksSuccess, 'Guardar Links')}
</button>

  </div>
</div>
)
    }
      </div>
    </div>
  );
};
