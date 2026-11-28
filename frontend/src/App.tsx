import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './shared/components/MainLayout';
import EnviosLista from './features/envios/components/EnviosLista';
// import EnvioDetalle from './features/envios/components/EnvioDetalle'; // Lo crearemos luego

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigimos la raíz a /envios por ahora */}
        <Route path="/" element={<Navigate to="/envios" replace />} />

        {/* Rutas con Layout (Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/envios" element={<EnviosLista />} />
          {/* <Route path="/envios/:id" element={<EnvioDetalle />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;