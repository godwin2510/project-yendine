
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, User, Shield, Crown } from "lucide-react";
import { checkAdminStatus } from "@/services/api";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('user-info');
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setUser(userData);
      
      // Check admin status
      const checkAdmin = async () => {
        try {
          const result = await checkAdminStatus();
          setIsAdmin(result.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAdmin();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user-info');
    
    // Clear all state
    setUser(null);
    setIsAdmin(false);
    setIsMenuOpen(false);
    
    // Redirect to login page
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/home" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-yendine-navy">YEN-DINE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/home" className="text-sm font-medium transition-colors hover:text-yendine-teal">
            Home
          </Link>
          <Link to="/food" className="text-sm font-medium transition-colors hover:text-yendine-teal">
            Food
          </Link>
          <Link to="/community" className="text-sm font-medium transition-colors hover:text-yendine-teal">
            Community
          </Link>
          <Link to="/chatbot" className="text-sm font-medium transition-colors hover:text-yendine-teal">
            Chatbot
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-yendine-orange flex items-center gap-2">
              <Crown size={16} />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yendine-orange/10 text-yendine-orange rounded-full">
                  <Shield size={14} />
                  <span className="text-xs font-medium">Admin</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {user.image && (
                  <img 
                    src={user.image} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild variant="default" size="sm" className="bg-yendine-navy hover:bg-yendine-navy/90 text-white">
              <Link to="/">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/home" 
              className="text-base font-medium transition-colors hover:text-yendine-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/food" 
              className="text-base font-medium transition-colors hover:text-yendine-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Food
            </Link>
            <Link 
              to="/community" 
              className="text-base font-medium transition-colors hover:text-yendine-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link 
              to="/chatbot" 
              className="text-base font-medium transition-colors hover:text-yendine-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Chatbot
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-base font-medium transition-colors hover:text-yendine-orange flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown size={16} />
                Admin
              </Link>
            )}

            {user ? (
              <div className="space-y-3 pt-4 border-t">
                {isAdmin && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yendine-orange/10 text-yendine-orange rounded-lg">
                    <Shield size={16} />
                    <span className="text-sm font-medium">Admin Access</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {user.image && (
                    <img 
                      src={user.image} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="default" 
                size="sm" 
                className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/" className="w-full">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
