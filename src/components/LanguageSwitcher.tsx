import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export type Language = "en" | "hi" | "te" | "ta";

interface Translations {
  en: { [key: string]: string };
  hi: { [key: string]: string };
  te: { [key: string]: string };
  ta: { [key: string]: string };
}

export const translations: Translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    browse: "Browse Food",
    browseDonations: "Browse Donations",
    shareFood: "Share Food",
    createListing: "Share Food",
    analytics: "Analytics",
    signOut: "Sign Out",
    community: "Community",
    leaderboard: "Leaderboard",
    history: "History",
    
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
    requestFood: "Request Food",
    
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
    pendingRequests: "Pending Requests",
    approve: "Approve",
    reject: "Reject",
    
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
    browseDonations: "दान ब्राउज़ करें",
    shareFood: "भोजन साझा करें",
    createListing: "भोजन साझा करें",
    analytics: "विश्लेषण",
    signOut: "साइन आउट",
    community: "समुदाय",
    leaderboard: "लीडरबोर्ड",
    history: "इतिहास",
    
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
    requestFood: "भोजन का अनुरोध करें",
    
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
    pendingRequests: "लंबित अनुरोध",
    approve: "स्वीकृत करें",
    reject: "अस्वीकार करें",
    
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
  te: {
    // Navigation (Telugu)
    dashboard: "డాష్‌బోర్డ్",
    browse: "ఆహారం శోధించండి",
    browseDonations: "విరాళాలు బ్రౌజ్ చేయండి",
    shareFood: "ఆహారం పంచుకోండి",
    createListing: "ఆహారం పంచుకోండి",
    analytics: "విశ్లేషణలు",
    signOut: "సైన్ అవుట్",
    community: "సంఘం",
    leaderboard: "లీడర్‌బోర్డ్",
    history: "చరిత్ర",
    
    // Dashboard
    welcomeBack: "తిరిగి స్వాగతం",
    readyToMake: "ఈరోజు మార్పు తీసుకురావడానికి సిద్ధంగా ఉన్నారా?",
    shareFoodTitle: "ఆహారం పంచుకోండి",
    shareFoodDesc: "ఇతరులు క్లెయిమ్ చేయడానికి మీ అదనపు ఆహారాన్ని జాబితా చేయండి",
    findFoodTitle: "ఆహారం కనుగొనండి",
    findFoodDesc: "మీ సమీపంలో అందుబాటులో ఉన్న ఆహారాన్ని బ్రౌజ్ చేయండి",
    mealsShared: "పంచుకున్న భోజనాలు",
    mealsReceived: "అందుకున్న భోజనాలు",
    co2Saved: "CO₂ సేవ్ చేయబడింది",
    recentActivity: "ఇటీవలి కార్యాచరణ",
    noActivity: "ఇంకా కార్యాచరణ లేదు",
    startActivity: "జాబితాలను సృష్టించడం లేదా బ్రౌజ్ చేయడం ద్వారా ప్రారంభించండి",
    
    // Browse
    filterByCategory: "వర్గం ద్వారా ఫిల్టర్ చేయండి",
    allCategories: "అన్ని వర్గాలు",
    vegetables: "కూరగాయలు",
    fruits: "పండ్లు",
    bakery: "బేకరీ",
    dairy: "పాల ఉత్పత్తులు",
    meals: "సిద్ధమైన భోజనాలు",
    packaged: "ప్యాక్ చేసిన ఆహారాలు",
    other: "ఇతరం",
    noFood: "ప్రస్తుతం ఆహారం అందుబాటులో లేదు",
    beFirst: "మీ సంఘంలో ఆహారం పంచుకునే మొదటి వ్యక్తి అవ్వండి!",
    viewDetails: "వివరాలు చూడండి",
    claimFood: "ఆహారాన్ని క్లెయిమ్ చేయండి",
    requestFood: "ఆహారాన్ని అభ్యర్థించండి",
    
    // Create Listing
    createListingTitle: "మీ అదనపు ఆహారాన్ని పంచుకోండి",
    createListingDesc: "మీ సంఘంలో ఇతరులకు సహాయం చేయడానికి క్రింద వివరాలను పూరించండి",
    title: "శీర్షిక",
    description: "వివరణ",
    category: "వర్గం",
    quantity: "పరిమాణం",
    pickupLocation: "పికప్ స్థానం",
    availableUntil: "వరకు అందుబాటులో ఉంటుంది",
    create: "జాబితా సృష్టించండి",
    cancel: "రద్దు చేయండి",
    
    // Detail Page
    sharedBy: "పంచుకున్నది",
    pickupDetails: "పికప్ స్థానం",
    posted: "పోస్ట్ చేయబడింది",
    chatWithDonor: "దాతతో చాట్ చేయండి",
    chatWithReceiver: "స్వీకరించేవారితో చాట్ చేయండి",
    confirmClaim: "క్లెయిమ్‌ని నిర్ధారించండి",
    pendingRequests: "పెండింగ్‌లో ఉన్న అభ్యర్థనలు",
    approve: "ఆమోదించండి",
    reject: "తిరస్కరించండి",
    
    // Chat
    typeMessage: "సందేశం టైప్ చేయండి...",
    noMessages: "ఇంకా సందేశాలు లేవు. సంభాషణ ప్రారంభించండి!",
    
    // Analytics
    yourImpact: "మీ ప్రభావం",
    trackContribution: "ఆహార వ్యర్థాలను తగ్గించడంలో మీ సహకారాన్ని ట్రాక్ చేయండి",
    totalDonations: "మొత్తం ఆహార విరాళాలు",
    foodRescued: "రక్షించబడిన ఆహారం",
    environmental: "పర్యావరణ ప్రభావం",
    activityTimeline: "కార్యాచరణ టైమ్‌లైన్",
    yourBadges: "మీ బ్యాడ్జ్‌లు",
    noBadges: "ఇంకా బ్యాడ్జ్‌లు సంపాదించలేదు",
    earnFirst: "మీ మొదటి బ్యాడ్జ్ సంపాదించడానికి ఆహారం పంచుకోవడం ప్రారంభించండి!",
    
    // Common
    loading: "లోడ్ అవుతోంది...",
    back: "వెనక్కి",
    success: "విజయం!",
    error: "లోపం",
  },
  ta: {
    // Navigation (Tamil)
    dashboard: "டாஷ்போர்டு",
    browse: "உணவைத் தேடு",
    browseDonations: "நன்கொடைகளை உலாவு",
    shareFood: "உணவைப் பகிரவும்",
    createListing: "உணவைப் பகிரவும்",
    analytics: "பகுப்பாய்வு",
    signOut: "வெளியேறு",
    community: "சமூகம்",
    leaderboard: "தலைமை பலகை",
    history: "வரலாறு",
    
    // Dashboard
    welcomeBack: "மீண்டும் வருக",
    readyToMake: "இன்று மாற்றம் செய்ய தயாரா?",
    shareFoodTitle: "உணவைப் பகிரவும்",
    shareFoodDesc: "மற்றவர்கள் உரிமை கோர உங்கள் கூடுதல் உணவைப் பட்டியலிடுங்கள்",
    findFoodTitle: "உணவைக் கண்டுபிடி",
    findFoodDesc: "உங்கள் அருகில் கிடைக்கும் உணவை உலாவவும்",
    mealsShared: "பகிரப்பட்ட உணவுகள்",
    mealsReceived: "பெறப்பட்ட உணவுகள்",
    co2Saved: "CO₂ சேமிக்கப்பட்டது",
    recentActivity: "சமீபத்திய செயல்பாடு",
    noActivity: "இன்னும் செயல்பாடு இல்லை",
    startActivity: "பட்டியல்களை உருவாக்குவதன் மூலம் அல்லது உலாவவதன் மூலம் தொடங்கவும்",
    
    // Browse
    filterByCategory: "வகையின்படி வடிகட்டு",
    allCategories: "அனைத்து வகைகளும்",
    vegetables: "காய்கறிகள்",
    fruits: "பழங்கள்",
    bakery: "பேக்கரி",
    dairy: "பால் பொருட்கள்",
    meals: "தயாரிக்கப்பட்ட உணவுகள்",
    packaged: "பேக்கேஜ் செய்யப்பட்ட உணவுகள்",
    other: "மற்றவை",
    noFood: "தற்போது உணவு கிடைக்கவில்லை",
    beFirst: "உங்கள் சமூகத்தில் உணவைப் பகிரும் முதல் நபர் ஆகுங்கள்!",
    viewDetails: "விவரங்களைக் காண்க",
    claimFood: "உணவை உரிமை கோரு",
    requestFood: "உணவைக் கோரு",
    
    // Create Listing
    createListingTitle: "உங்கள் கூடுதல் உணவைப் பகிரவும்",
    createListingDesc: "உங்கள் சமூகத்தில் மற்றவர்களுக்கு உதவ கீழே விவரங்களை நிரப்பவும்",
    title: "தலைப்பு",
    description: "விளக்கம்",
    category: "வகை",
    quantity: "அளவு",
    pickupLocation: "எடுப்பு இடம்",
    availableUntil: "வரை கிடைக்கும்",
    create: "பட்டியல் உருவாக்கு",
    cancel: "ரத்து செய்",
    
    // Detail Page
    sharedBy: "பகிர்ந்தவர்",
    pickupDetails: "எடுப்பு இடம்",
    posted: "இடுகையிடப்பட்டது",
    chatWithDonor: "நன்கொடையாளருடன் அரட்டை",
    chatWithReceiver: "பெறுநருடன் அரட்டை",
    confirmClaim: "உரிமையை உறுதிப்படுத்து",
    pendingRequests: "நிலுவையில் உள்ள கோரிக்கைகள்",
    approve: "அங்கீகரி",
    reject: "நிராகரி",
    
    // Chat
    typeMessage: "செய்தியை தட்டச்சு செய்யவும்...",
    noMessages: "இன்னும் செய்திகள் இல்லை. உரையாடலைத் தொடங்குங்கள்!",
    
    // Analytics
    yourImpact: "உங்கள் தாக்கம்",
    trackContribution: "உணவு வீணாக்கத்தைக் குறைப்பதில் உங்கள் பங்களிப்பைக் கண்காணிக்கவும்",
    totalDonations: "மொத்த உணவு நன்கொடைகள்",
    foodRescued: "மீட்கப்பட்ட உணவு",
    environmental: "சுற்றுச்சூழல் தாக்கம்",
    activityTimeline: "செயல்பாடு காலவரிசை",
    yourBadges: "உங்கள் பேட்ஜ்கள்",
    noBadges: "இன்னும் பேட்ஜ்கள் சம்பாதிக்கவில்லை",
    earnFirst: "உங்கள் முதல் பேட்ஜைப் பெற உணவைப் பகிரத் தொடங்குங்கள்!",
    
    // Common
    loading: "ஏற்றுகிறது...",
    back: "பின்",
    success: "வெற்றி!",
    error: "பிழை",
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
      <SelectTrigger className="w-[160px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
      </SelectContent>
    </Select>
  );
};
