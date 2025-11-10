import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { FileText, User as UserIcon, LogOut } from 'lucide-react';
import { User, PageView } from '../App';

interface NavigationProps {
  user?: User | null;
  currentPage?: PageView;
  onNavigate?: (page: PageView) => void;
  onLogout?: () => void;
  onGetStarted?: () => void;
  showAuthButtons?: boolean;
  onLogoClick?: () => void;
  onSignIn?: () => void;
  scrollToSection?: (section: string) => void;
}

export function Navigation({ user, currentPage, onNavigate, onLogout, onGetStarted, showAuthButtons, onLogoClick, onSignIn, scrollToSection }: NavigationProps) {
  const getUserInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Resume Improver</span>
          </button>
          
          <div className="flex items-center gap-6">
            {user && onNavigate && currentPage ? (
              <>
                <Button
                  variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  variant={currentPage === 'profile' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('profile')}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : user && !currentPage ? (
              // User is logged in but on landing page
              <>
                <button 
                  onClick={() => scrollToSection?.('features')}
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection?.('how-it-works')}
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                >
                  How It Works
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button onClick={onGetStarted}>
                    Go to Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              showAuthButtons && (
                <>
                  <button 
                    onClick={() => scrollToSection?.('features')}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection?.('how-it-works')}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                  >
                    How It Works
                  </button>
                  <button 
                    onClick={onGetStarted}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Try It Now
                  </button>
                  <button 
                    onClick={onSignIn}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Sign In
                  </button>
                  <Button onClick={onGetStarted}>
                    Get Started
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}