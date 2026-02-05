import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CouponTypeBuilderPage from './pages/CouponTypeBuilderPage'
import CouponCreatePage from './pages/CouponCreatePage'
import SimulatorPage from './pages/SimulatorPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="builder" element={<CouponTypeBuilderPage />} />
          <Route path="builder/:id" element={<CouponTypeBuilderPage />} />
          <Route path="coupons" element={<CouponCreatePage />} />
          <Route path="simulator" element={<SimulatorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
