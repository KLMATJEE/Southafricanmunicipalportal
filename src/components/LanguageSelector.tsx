import { Globe } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Language, languages } from '../utils/translations'

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="w-4 h-4 mr-2" />
          {languages[currentLanguage]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onLanguageChange(code as Language)}
            className={currentLanguage === code ? 'bg-sa-green/10' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
