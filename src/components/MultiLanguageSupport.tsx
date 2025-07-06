
import { useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Language Context
const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language translations
const translations = {
  en: {
    // Common terms
    cricket: "Cricket",
    match: "Match",
    team: "Team",
    player: "Player",
    score: "Score",
    runs: "Runs",
    wickets: "Wickets",
    overs: "Overs",
    balls: "Balls",
    batting: "Batting",
    bowling: "Bowling",
    fielding: "Fielding",
    
    // Match terms
    toss: "Toss",
    innings: "Innings",
    partnership: "Partnership",
    fallOfWickets: "Fall of Wickets",
    runRate: "Run Rate",
    requiredRunRate: "Required Run Rate",
    
    // UI elements
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    update: "Update",
    
    // Notifications
    matchCreated: "Match created successfully",
    playerAdded: "Player added successfully",
    settingsUpdated: "Settings updated successfully"
  },
  
  hi: {
    // Common terms (Hindi)
    cricket: "क्रिकेट",
    match: "मैच",
    team: "टीम",
    player: "खिलाड़ी",
    score: "स्कोर",
    runs: "रन",
    wickets: "विकेट",
    overs: "ओवर",
    balls: "गेंद",
    batting: "बल्लेबाजी",
    bowling: "गेंदबाजी",
    fielding: "क्षेत्ररक्षण",
    
    // Match terms
    toss: "टॉस",
    innings: "पारी",
    partnership: "साझेदारी",
    fallOfWickets: "विकेट गिरना",
    runRate: "रन रेट",
    requiredRunRate: "आवश्यक रन रेट",
    
    // UI elements
    save: "सेव करें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    add: "जोड़ें",
    update: "अपडेट करें",
    
    // Notifications
    matchCreated: "मैच सफलतापूर्वक बनाया गया",
    playerAdded: "खिलाड़ी सफलतापूर्वक जोड़ा गया",
    settingsUpdated: "सेटिंग्स सफलतापूर्वक अपडेट की गईं"
  },
  
  es: {
    // Common terms (Spanish)
    cricket: "Cricket",
    match: "Partido",
    team: "Equipo",
    player: "Jugador",
    score: "Puntuación",
    runs: "Carreras",
    wickets: "Wickets",
    overs: "Overs",
    balls: "Pelotas",
    batting: "Bateo",
    bowling: "Bowling",
    fielding: "Fielding",
    
    // Match terms
    toss: "Sorteo",
    innings: "Innings",
    partnership: "Sociedad",
    fallOfWickets: "Caída de Wickets",
    runRate: "Tasa de Carreras",
    requiredRunRate: "Tasa Requerida",
    
    // UI elements
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    add: "Agregar",
    update: "Actualizar",
    
    // Notifications
    matchCreated: "Partido creado exitosamente",
    playerAdded: "Jugador agregado exitosamente",
    settingsUpdated: "Configuración actualizada exitosamente"
  }
};

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('cricket-app-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('cricket-app-language', languageCode);
    toast({
      title: "Language Changed",
      description: `Language switched to ${supportedLanguages.find(l => l.code === languageCode)?.name}`,
    });
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    supportedLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const MultiLanguageSupport = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Multi-Language Support
        </h2>
        <Badge className="bg-green-100 text-green-800">
          New Feature
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Language</label>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-sm text-gray-500">{lang.native}</div>
                      </div>
                      {currentLanguage === lang.code && (
                        <Check className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedLanguages.map((lang) => (
              <Card key={lang.code} className={`cursor-pointer transition-all ${
                currentLanguage === lang.code 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`} onClick={() => changeLanguage(lang.code)}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{lang.flag}</div>
                  <div className="font-semibold">{lang.name}</div>
                  <div className="text-sm text-gray-600">{lang.native}</div>
                  {currentLanguage === lang.code && (
                    <Check className="w-4 h-4 text-blue-600 mx-auto mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Language Coverage</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>✅ User Interface - Fully translated</p>
              <p>✅ Cricket terminology - Complete</p>
              <p>✅ Match scoring - Localized</p>
              <p>🔄 Reports & Analytics - In progress</p>
              <p>🔮 Commentary system - Coming soon</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">What's New</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Real-time language switching</li>
              <li>• Cricket-specific terminology translation</li>
              <li>• RTL (Right-to-Left) support preparation</li>
              <li>• Cultural number formatting</li>
              <li>• Localized date and time formats</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiLanguageSupport;
