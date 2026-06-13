// App — Layout con autenticación via Supabase.

import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { CollectionProvider } from './context/CollectionContext'
import { NotificacionesProvider } from './context/NotificacionesContext'
import NavBar           from './components/NavBar'
import HomeView         from './views/HomeView'
import AlbumView        from './views/AlbumView'
import SectionsView     from './views/SectionsView'
import GroupsView       from './views/GroupsView'
import ProgressView     from './views/ProgressView'
import ExploreView      from './views/ExploreView'
import TableView        from './views/TableView'
import IntercambioView  from './views/IntercambioView'
import HelpView         from './views/HelpView'
import LoginView        from './views/LoginView'
import RegisterView     from './views/RegisterView'
import RecoverView      from './views/RecoverView'
import NewPasswordView  from './views/NewPasswordView'

export default function App() {
  return (
    <AuthProvider>
      <CollectionProvider>
        <NotificacionesProvider>
          <LoadingProvider>
            <BrowserRouter>
              <Inner />
            </BrowserRouter>
          </LoadingProvider>
        </NotificacionesProvider>
      </CollectionProvider>
    </AuthProvider>
  )
}

function Inner() {
  const { user, loading, isRecovering } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink-soft">
        Preparando el álbum…
      </div>
    )
  }

  if (isRecovering) return <NewPasswordView />

  if (!user) return <AuthRouter />

  return (
    <div className="min-h-full bg-paper bg-paper-grain">
      <NavBar />
      <main>
        <Routes>
          <Route path="/"            element={<HomeView />} />
          <Route path="/album"       element={<AlbumView />} />
          <Route path="/secciones"   element={<SectionsView />} />
          <Route path="/grupos"      element={<GroupsView />} />
          <Route path="/progreso"    element={<ProgressView />} />
          <Route path="/exploracion" element={<ExploreView />} />
          <Route path="/cartilla"      element={<TableView />} />
          <Route path="/intercambios" element={<IntercambioView />} />
          <Route path="/ayuda"        element={<HelpView />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-[11px] text-ink-soft">
        WorldCapp · FIFA World Cup 2026™
      </footer>
    </div>
  )
}

function AuthRouter() {
  const [screen, setScreen] = useState('login')
  if (screen === 'register') return <RegisterView onGoLogin={() => setScreen('login')} />
  if (screen === 'recover')  return <RecoverView  onGoLogin={() => setScreen('login')} />
  return (
    <LoginView
      onGoRegister={() => setScreen('register')}
      onGoRecover={() => setScreen('recover')}
    />
  )
}
