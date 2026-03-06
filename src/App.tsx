import { useState } from 'react';
import { FileText, Clock, TrendingUp, Package, Truck, Car, ChevronLeft } from 'lucide-react';
import NotebookForm from './components/NotebookForm';
import HistoricalRecords from './components/HistoricalRecords';
import SparePartsManager from './components/SparePartsManager';
import type { Category } from './types';

type Section = 'nueva-ficha' | 'historial' | 'gastos' | 'repuestos';
type View = 'home' | 'section';

function App() {
  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category>('G1');
  const [activeSection, setActiveSection] = useState<Section>('historial');

  const handleSaved = () => {
    setActiveSection('historial');
  };

  const navigateToCategory = (category: Category) => {
    setActiveCategory(category);
    setActiveSection('historial');
    setView('section');
  };

  const navigateToSection = (section: Section) => {
    setActiveSection(section);
    setView('section');
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <header className="bg-white shadow-md border-b-2 border-gray-300 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              PenCar
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigateToCategory('G1')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-4 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                <Car size={48} />
              </div>
              <span className="text-2xl font-bold text-gray-800">G1</span>
            </button>

            <button
              onClick={() => navigateToCategory('Camioneros')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-4 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-green-100 p-4 rounded-full text-green-600">
                <Truck size={48} />
              </div>
              <span className="text-2xl font-bold text-gray-800">Camioneros</span>
            </button>

            <button
              onClick={() => navigateToSection('gastos')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-4 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-yellow-100 p-4 rounded-full text-yellow-600">
                <TrendingUp size={48} />
              </div>
              <span className="text-2xl font-bold text-gray-800">Gastos/Entradas</span>
            </button>

            <button
              onClick={() => navigateToSection('repuestos')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center gap-4 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-purple-100 p-4 rounded-full text-purple-600">
                <Package size={48} />
              </div>
              <span className="text-2xl font-bold text-gray-800">Repuestos</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <nav className="bg-white shadow-md border-b-2 border-gray-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors"
            >
              <ChevronLeft size={20} />
              Volver al inicio
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeSection === 'gastos' ? 'Gastos/Entradas' : 
               activeSection === 'repuestos' ? 'Repuestos' : 
               activeCategory}
            </h1>
            <div className="w-24"></div> {/* Spacer to keep title centered */}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {(activeSection === 'historial' || activeSection === 'nueva-ficha') && (
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setActiveSection('nueva-ficha')}
                className={`flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-all border-b-4 ${
                  activeSection === 'nueva-ficha'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText size={20} />
                <span>Nueva Ficha</span>
              </button>
              <button
                onClick={() => setActiveSection('historial')}
                className={`flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-all border-b-4 ${
                  activeSection === 'historial'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Clock size={20} />
                <span>Historial</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          {activeSection === 'nueva-ficha' && (
            <NotebookForm category={activeCategory} onSaved={handleSaved} />
          )}
          {activeSection === 'historial' && (
            <HistoricalRecords category={activeCategory} />
          )}
          {activeSection === 'gastos' && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Gastos/Entradas
              </h2>
              <p className="text-gray-600">
                Esta sección estará disponible próximamente
              </p>
            </div>
          )}
          {activeSection === 'repuestos' && (
            <SparePartsManager />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

