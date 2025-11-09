import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('pdpi-lang', lng);
  };

  const currentLang = i18n.language === 'en' ? '🇬🇧 EN' : '🇮🇩 ID';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 px-3 text-sm font-medium"
          aria-label="Pilih Bahasa"
        >
          <Languages className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">{currentLang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem 
          onClick={() => changeLanguage('id')}
          className={i18n.language === 'id' ? 'bg-accent' : ''}
        >
          <span className={i18n.language === 'id' ? 'font-semibold' : ''}>
            🇮🇩 ID
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-accent' : ''}
        >
          <span className={i18n.language === 'en' ? 'font-semibold' : ''}>
            🇬🇧 EN
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
