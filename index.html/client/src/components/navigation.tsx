import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Eye } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report Issue" },
    { href: "/admin", label: "Admin" },
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-4' : 'items-baseline space-x-4'}`}>
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <a
            className={`text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === link.href ? 'text-primary' : ''
            }`}
            onClick={() => mobile && setIsOpen(false)}
            data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
          >
            {link.label}
          </a>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center space-x-3" data-testid="logo-civic-lens">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Civic Lens</h1>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavLinks />
          </div>

          <div className="hidden md:block">
            <Link href="/report">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-report-issue"
              >
                Report Issue
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-6 mt-6">
                  <NavLinks mobile />
                  <Link href="/report">
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-mobile-report"
                    >
                      Report Issue
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
