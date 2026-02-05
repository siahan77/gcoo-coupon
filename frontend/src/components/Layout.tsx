import { Outlet, Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/builder', label: '① 쿠폰타입', icon: '🔧' },
  { path: '/coupons', label: '② 쿠폰생성', icon: '🎫' },
  { path: '/simulator', label: '③ 시뮬레이터', icon: '🧪' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface-800 border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <span className="text-xl font-bold text-primary-400">
                쿠폰 시뮬레이터
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary-600 text-white'
                      : 'text-surface-300 hover:bg-surface-700 hover:text-white'
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-800 border-t border-surface-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-surface-500 text-sm">
          Coupon Simulator v1.0.0
        </div>
      </footer>
    </div>
  )
}
