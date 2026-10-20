import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookA, BookOpen, ExternalLink, GraduationCap, LogOut, Menu, ScrollText, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { btn } from '../lib/ui';
import GoToReference from './GoToReference';
import EnvChip, { EnvStripe } from './EnvChip';
import SessionDialog from './SessionDialog';

const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL || 'https://biblia.ministeriomenorah.com';

const NAV = [
    { to: '/', label: 'Libros', Icon: BookOpen, isActive: (p) => p === '/' || p.startsWith('/libro') },
    { to: '/estudios', label: 'Estudios', Icon: GraduationCap, isActive: (p) => p.startsWith('/estudios') },
    { to: '/dedicatoria', label: 'Dedicatoria', Icon: ScrollText },
    { to: '/glosario', label: 'Glosario', Icon: BookA },
];

const Brand = () => (
    <div className="flex items-center gap-3">
        <img src="/favicon/web-app-manifest-192x192.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
        <div className="min-w-0">
            <p className="font-serif text-lg font-semibold leading-tight">Biblia Menorah</p>
            <p className="flex items-center gap-2 text-xs text-muted">
                Administrador <EnvChip />
            </p>
        </div>
    </div>
);

const SidebarContent = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();

    return (
        <div className="flex h-full flex-col gap-6 p-5">
            <Brand />
            <GoToReference onDone={onNavigate} />
            <nav aria-label="Secciones">
                <ul className="space-y-1">
                    {NAV.map(({ to, label, Icon, isActive }) => {
                        const active = isActive ? isActive(pathname) : pathname === to;
                        return (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-brand ${
                                        active ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-surface-2'
                                    }`}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                    {label}
                                </NavLink>
                            </li>
                        );
                    })}
                    <li>
                        <a
                            href={PUBLIC_APP_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
                        >
                            <ExternalLink size={18} aria-hidden="true" />
                            Ver app pública
                        </a>
                    </li>
                </ul>
            </nav>
            <div className="mt-auto border-t border-line pt-4">
                <p className="truncate text-xs text-muted" title={user}>
                    {user}
                </p>
                <button type="button" onClick={logout} className={`${btn.ghost} mt-2 -ml-3`}>
                    <LogOut size={16} aria-hidden="true" />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => setDrawerOpen(false), [pathname]);

    return (
        <div className="min-h-dvh bg-page text-ink">
            <EnvStripe />

            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">
                <SidebarContent />
            </aside>

            <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur lg:hidden">
                <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú" className={btn.icon}>
                    <Menu size={20} aria-hidden="true" />
                </button>
                <span className="font-serif font-semibold">Biblia Menorah</span>
                <EnvChip />
            </header>

            {drawerOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button type="button" aria-label="Cerrar menú" tabIndex={-1} onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/40" />
                    <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-2xl" aria-label="Menú">
                        <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú" className={`${btn.icon} absolute right-3 top-3`}>
                            <X size={18} aria-hidden="true" />
                        </button>
                        <SidebarContent onNavigate={() => setDrawerOpen(false)} />
                    </aside>
                </div>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 lg:py-10">
                    <Outlet />
                </div>
            </main>

            <SessionDialog />
        </div>
    );
};

export default Layout;
