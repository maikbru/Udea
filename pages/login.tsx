import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen bg-sky-200 flex flex-col items-center">
      {/* Barra superior negra */}
      <div className="w-full bg-black text-white flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-bold flex items-center gap-2">
          {/* Simulación de logo "ada" */}
          <span className="text-teal-400 text-3xl font-extrabold">X</span>
          <span className="text-white font-light text-lg">ada</span>
        </div>
        <a href="#" className="text-gray-300 hover:text-white text-sm underline">Iniciar sesión</a>
      </div>

      {/* Caja de login */}
      <div className="bg-white mt-20 shadow-lg p-10 rounded-md w-full max-w-md">
        <h2 className="text-center text-black text-xl bold font-bold border-b pb-2 mb-6">
          Acceso al administrador Agente virtual
        </h2>

        <label className="block text-black text-sm font-bold mb-1">Usuario</label>
        <input
          type="text"
          className="w-full mb-4 p-2 rounded shadow bg-teal-50 border border-gray-200 focus:outline-none"
        />

        <label className="block text-black text-sm font-bold mb-1">Clave</label>
        <input
          type="password"
          className="w-full mb-6 p-2 rounded shadow bg-teal-50 border border-gray-200 focus:outline-none"
        />
        <div className="w-full flex justify-center">
        <button className="w-50 text-black bg-teal-500 hover:bg-teal-600 text-white py-2 rounded font-semibold mb-4">
          Entrar
        </button>
        </div>

        <div className="flex justify-between text-sm">
          <a href="#" className="underline text-black hover:text-blue-600">Obtener usuario</a>
          <a href="#" className="underline text-black hover:text-blue-600">Olvidó la clave</a>
        </div>
      </div>
    </div>
  );
}
