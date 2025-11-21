import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export type Language = "en" | "hi";

interface Translations {
  en: { [key: string]: string };
  hi: { [key: string]: string };
}

export const translations: Translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    browse: "Browse Food",
    createListing: "Share Food",
    analytics: "Analytics",
    signOut: "Sign Out",
    
    // Dashboard
    welcomeBack: "Welcome back",
    readyToMake: "Ready to make a difference today?",
    shareFoodTitle: "Share Food",
    shareFoodDesc: "List your surplus food for others to claim",
    findFoodTitle: "Find Food",
    findFoodDesc: "Browse available food near you",
    mealsShared: "Meals Shared",
    mealsReceived: "Meals Received",
    co2Saved: "CO₂ Saved",
    recentActivity: "Recent Activity",
    noActivity: "No activity yet",
    startActivity: "Start by creating or browsing listings",
    
    // Browse
    filterByCategory: "Filter by category",
    allCategories: "All Categories",
    vegetables: "Vegetables",
    fruits: "Fruits",
    bakery: "Bakery",
    dairy: "Dairy",
    meals: "Prepared Meals",
    packaged: "Packaged Foods",
    other: "Other",
    noFood: "No food available right now",
    beFirst: "Be the first to share food in your community!",
    viewDetails: "View Details",
    claimFood: "Claim Food",
    
    // Create Listing
    createListingTitle: "Share Your Surplus Food",
    createListingDesc: "Fill in the details below to help others in your community",
    title: "Title",
    description: "Description",
    category: "Category",
    quantity: "Quantity",
    pickupLocation: "Pickup Location",
    availableUntil: "Available Until",
    create: "Create Listing",
    cancel: "Cancel",
    
    // Detail Page
    sharedBy: "Shared by",
    pickupDetails: "Pickup Location",
    posted: "Posted",
    chatWithDonor: "Chat with Donor",
    chatWithReceiver: "Chat with Receiver",
    confirmClaim: "Confirm Claim",
    
    // Chat
    typeMessage: "Type a message...",
    noMessages: "No messages yet. Start the conversation!",
    
    // Analytics
    yourImpact: "Your Impact",
    trackContribution: "Track your contribution to reducing food waste",
    totalDonations: "Total food donations",
    foodRescued: "Food rescued",
    environmental: "Environmental impact",
    activityTimeline: "Activity Timeline",
    yourBadges: "Your Badges",
    noBadges: "No badges earned yet",
    earnFirst: "Start sharing food to earn your first badge!",
    
    // Common
    loading: "Loading...",
    back: "Back",
    success: "Success!",
    error: "Error",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    browse: "भोजन खोजें",
    createListing: "भोजन साझा करें",
    analytics: "विश्लेषण",
    signOut: "साइन आउट",
    
    // Dashboard
    welcomeBack: "वापसी पर स्वागत है",
    readyToMake: "आज फर्क करने के लिए तैयार?",
    shareFoodTitle: "भोजन साझा करें",
    shareFoodDesc: "दूसरों के लिए अपना अतिरिक्त भोजन सूचीबद्ध करें",
    findFoodTitle: "भोजन खोजें",
    findFoodDesc: "अपने आस-पास उपलब्ध भोजन देखें",
    mealsShared: "साझा किए गए भोजन",
    mealsReceived: "प्राप्त किए गए भोजन",
    co2Saved: "CO₂ बचाया",
    recentActivity: "हाल की गतिविधि",
    noActivity: "अभी तक कोई गतिविधि नहीं",
    startActivity: "सूची बनाकर या ब्राउज़ करके शुरू करें",
    
    // Browse
    filterByCategory: "श्रेणी के अनुसार फ़िल्टर करें",
    allCategories: "सभी श्रेणियाँ",
    vegetables: "सब्जियां",
    fruits: "फल",
    bakery: "बेकरी",
    dairy: "डेयरी",
    meals: "तैयार भोजन",
    packaged: "पैक किया हुआ खाना",
    other: "अन्य",
    noFood: "अभी कोई भोजन उपलब्ध नहीं",
    beFirst: "अपने समुदाय में भोजन साझा करने वाले पहले व्यक्ति बनें!",
    viewDetails: "विवरण देखें",
    claimFood: "भोजन का दावा करें",
    
    // Create Listing
    createListingTitle: "अपना अतिरिक्त भोजन साझा करें",
    createListingDesc: "अपने समुदाय में दूसरों की मदद के लिए नीचे विवरण भरें",
    title: "शीर्षक",
    description: "विवरण",
    category: "श्रेणी",
    quantity: "मात्रा",
    pickupLocation: "पिकअप स्थान",
    availableUntil: "उपलब्ध है तक",
    create: "सूची बनाएं",
    cancel: "रद्द करें",
    
    // Detail Page
    sharedBy: "द्वारा साझा किया गया",
    pickupDetails: "पिकअप स्थान",
    posted: "पोस्ट किया गया",
    chatWithDonor: "दाता से चैट करें",
    chatWithReceiver: "प्राप्तकर्ता से चैट करें",
    confirmClaim: "दावा की पुष्टि करें",
    
    // Chat
    typeMessage: "संदेश टाइप करें...",
    noMessages: "अभी तक कोई संदेश नहीं। बातचीत शुरू करें!",
    
    // Analytics
    yourImpact: "आपका प्रभाव",
    trackContribution: "खाद्य अपशिष्ट को कम करने में अपने योगदान को ट्रैक करें",
    totalDonations: "कुल खाद्य दान",
    foodRescued: "बचाया गया भोजन",
    environmental: "पर्यावरणीय प्रभाव",
    activityTimeline: "गतिविधि समयरेखा",
    yourBadges: "आपके बैज",
    noBadges: "अभी तक कोई बैज नहीं मिला",
    earnFirst: "अपना पहला बैज अर्जित करने के लिए भोजन साझा करना शुरू करें!",
    
    // Common
    loading: "लोड हो रहा है...",
    back: "वापस",
    success: "सफलता!",
    error: "त्रुटि",
  },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { language, setLanguage, t };
};

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageSwitcher = ({ language, setLanguage }: LanguageSwitcherProps) => {
  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="hi">हिन्दी</SelectItem>
      </SelectContent>
    </Select>
  );
};
