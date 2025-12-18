import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import BlogPost from './components/BlogPost.tsx'
import CV from './components/CV.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/notes/:slug" element={<BlogPost />} />
        <Route path="/cv" element={<CV />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
