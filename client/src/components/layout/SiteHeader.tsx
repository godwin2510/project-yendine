
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState,useEffect } from "react";
import { Menu, X, User } from "lucide-react";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = false; // Will be replaced with actual auth state
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user-info');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  console.log(user);

  const handleLogout = () => {
    localStorage.removeItem('user-info');
    setUser(null);
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-yendine-navy">YEN-DINE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-yendine-teal">
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
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User size={16} />
              <span>My Account</span>
            </Button>
          ) : (
            <Button onClick={handleLogout} variant="default" size="sm" className="bg-yendine-navy hover:bg-yendine-navy/90 text-white">
              <Link to="/">Logout</Link>


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
              to="/" 
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

            {isLoggedIn ? (
              <Button variant="outline" size="sm" className="w-full justify-start flex items-center gap-2">
                <User size={16} />
                <span>My Account</span>
              </Button>
            ) : (
              <Button
                variant="default" 
                size="sm" 
                className="w-full bg-yendine-navy hover:bg-yendine-navy/90 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link onClick={handleLogout} to="/" className="w-full">Logout</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
