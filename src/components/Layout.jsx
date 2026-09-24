import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, FileSearch, History, LogOut, Plus, Sparkles, UserRound } from 'lucide-react'
import { api } from '../lib/api'

const nav = [
  { to: '/', label: 'Overview', icon: BarChart3 },
  { to: '/analyze', label: 'Analyze Resume', icon: FileSearch },
  { to: '/history', label: 'History', icon: History },
]

export default function Layout({ children, user }) {
  const navigate = useNavigate()
  const logout = async () => { try { await api.post('/auth/logout') } finally { navigate('/login') } }
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0d0d10] px-5 py-6 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime-300 text-zinc-950"><Sparkles size={20}/></div>
          <div><p className="font-semibold tracking-tight">ResumeAI</p><p className="text-xs text-zinc-500">Career intelligence</p></div>
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-white/8 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'}`}><Icon size={18}/>{label}</NavLink>)}
        </nav>
        <NavLink to="/analyze" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-lime-200"><Plus size={17}/> New analysis</NavLink>
        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-800"><UserRound size={17}/></div><div className="min-w-0"><p className="truncate text-sm">{user?.name || 'User'}</p><p className="truncate text-xs text-zinc-500">{user?.email || 'Account'}</p></div></div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-white/5 hover:text-white"><LogOut size={17}/> Sign out</button>
        </div>
      </aside>
      <main className="min-h-screen lg:pl-64"><header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090b]/85 px-5 py-4 backdrop-blur-xl lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="lg:hidden flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 text-zinc-950"><Sparkles size={16}/></div><span className="font-semibold">ResumeAI</span></div><p className="hidden text-sm text-zinc-500 lg:block">AI-powered resume feedback</p><div className="flex items-center gap-2 text-sm text-zinc-400"><span className="hidden sm:block">{user?.name || 'Welcome back'}</span><div className="grid h-8 w-8 place-items-center rounded-full bg-zinc-800"><UserRound size={15}/></div></div></div></header><div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">{children}</div></main>
    </div>
  )
}
