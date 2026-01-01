import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from './ToastContainer'
import { useUIStore } from '@/stores/uiStore'

export function AppLayout() {
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                        <Sidebar />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="lg:pl-72">
                <Header />
                <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
                    <Outlet />
                </main>
            </div>

            {/* Toast notifications */}
            <ToastContainer />
        </div>
    )
}
