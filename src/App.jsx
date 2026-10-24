import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SavoraProvider from './context/SavoraProvider'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'
import RecipePage from './pages/RecipePage'
import FavoritesPage from './pages/FavoritesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SavoraProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="recetas" element={<RecipesPage />} />
            <Route path="recetas/:slug" element={<RecipePage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SavoraProvider>
    </BrowserRouter>
  )
}
