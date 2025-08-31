// Footer.tsx
import { Heart, BookOpen, Info, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        
        {/* Left side */}
        <p>
          © {new Date().getFullYear()} Kidney Health Dashboard. All rights reserved.
        </p>

        {/* Right side links */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a
            href="https://www.kidney.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Learn More</span>
          </a>
          <a
            href="/about"
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </a>
          <a
            href="/contact"
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </a>
        </div>
      </div>

      {/* Bottom center */}
      <div className="text-center text-xs py-3 text-muted-foreground border-t">
        Made with <Heart className="inline w-4 h-4 text-red-500 mx-1" /> to raise kidney health awareness
      </div>
    </footer>
  );
}
