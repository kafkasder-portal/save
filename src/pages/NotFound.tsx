import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ana Sayfaya Dön
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Veya</p>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Giriş yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
