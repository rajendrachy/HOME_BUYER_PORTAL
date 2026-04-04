import React from 'react';
import { 
  Zap, Eye, Award, ShieldCheck, TrendingUp, Users, 
  MapPin, CheckCircle, FileText, Clock, Percent, Gift, Calculator, Rocket
} from "lucide-react";

export const TRANSLATIONS = {
  en: {
    nav: { home: "Home", features: "Features", guides: "Guides", stats: "Stats", login: "Sign In", register: "Register Now" },
    hero: {
      tag: "Secure. Transparent. Fast. Integrated.",
      title: "Nepal's Premier Home Buyer Platform",
      subtitle: "The unified digital ecosystem for government subsidies and ethical bank loans. Complete your home ownership journey in just 21 days.",
      primaryCTA: "Start Your Journey",
      secondaryCTA: "Track Application",
    },
    stats: [
      { label: "Families Housed", value: "12,450+", sub: "Verified citizens" },
      { label: "Subsidy Granted", value: "NPR 1.8B", sub: "Government support" },
      { label: "Bank Network", value: "24+", sub: "Tier-A partners" },
      { label: "Processing Time", value: "21 Days", sub: "Average duration" }
    ],
    features: {
      title: "Why Choose Our Platform?",
      subtitle: "We've digitized the entire process to eliminate corruption and delay.",
      items: [
        { title: "One-Stop Digital Portal", desc: "Apply for both government subsidy and bank loans in a single, unified application.", icon: Zap },
        { title: "Real-time Progress Tracker", desc: "Know exactly which officer is reviewing your file at any given moment.", icon: Eye },
        { title: "Automated Grant Calculation", desc: "Our algorithm ensures you receive the maximum government subsidy you're entitled to.", icon: Award },
        { title: "Enterprise-Grade Security", desc: "Your documents are protected by 2FA and encryption technology.", icon: ShieldCheck },
        { title: "Competitive Loan Bidding", desc: "Multiple banks bid for your loan, ensuring you get the best interest rates in Nepal.", icon: TrendingUp },
        { title: "Dedicated Support", desc: "Expert guidance available 24/7 to help you navigate the system.", icon: Users }
      ]
    },
    guides: {
        title: "Step-By-Step Excellence",
        subtitle: "A clear path for every stakeholder in the ecosystem.",
        citizen: {
          title: "For Citizens",
          description: "How to secure your home in 8 easy steps.",
          steps: [
            { title: "Create Account", desc: "Register with basic details and verify your identity." },
            { title: "Complete Profile", desc: "Fill in household info and income details." },
            { title: "Check Eligibility", desc: "Instant automated check for subsidy criteria." },
            { title: "Submit Request", desc: "Upload property and builder details." },
            { title: "Verify Documents", desc: "Upload citizenship and income proofs." },
            { title: "Municipality Review", desc: "Local officer validates your location and eligibility." },
            { title: "Receive Offers", desc: "Compare loan bids from multiple banks." },
            { title: "Final Closing", desc: "Choose a bank and receive your keys." }
          ]
        },
        bank: {
          title: "For Bank Officers",
          description: "Manage applications and send competitive offers.",
          steps: [
            { title: "Access Dashboard", desc: "View a pool of pre-verified potential homeowners." },
            { title: "Analyze Risk", desc: "Review automated credit scores and income stability." },
            { title: "Generate Offer", desc: "Set interest rates, tenure, and processing fees." },
            { title: "On-Boarding", desc: "Complete final KYC once citizen accepts your offer." }
          ]
        },
        municipality: {
          title: "For Municipal Officers",
          description: "Authorize subsidies and verify local status.",
          steps: [
            { title: "Incoming Queue", desc: "See applications within your jurisdiction." },
            { title: "Local Verification", desc: "Confirm permanent address and property status." },
            { title: "Authorize Grant", desc: "Sanction the government subsidy amount." },
            { title: "Progress Monitor", desc: "Ensure transparency in the final disbursement." }
          ]
        }
    },
    loanDetails: {
      title: "Detailed Loan & Subsidy Intelligence",
      sections: [
        {
          id: "eligibility",
          title: "Eligibility Criteria",
          icon: CheckCircle,
          content: [
            "Must be a Nepali citizen with valid photo identification.",
            "First-time home buyer (must not own property anywhere in Nepal).",
            "Family monthly income must be verified below NPR 80,000.",
            "Property cost must not exceed the current regulation limit of NPR 5,000,000.",
            "Applicant age must be between 21 and 65 years at loan maturity."
          ]
        },
        {
          id: "documents",
          title: "Required Documents",
          icon: FileText,
          content: [
            "Original and photocopy of Citizenship Certificate.",
            "Last 6 months of certified bank statements.",
            "Income certificate from employer or ward office.",
            "Property site plan and builder's cost estimate.",
            "Passport-sized photographs of all family members."
          ]
        },
        {
          id: "timeline",
          title: "21-Day Timeline",
          icon: Clock,
          content: [
            "Days 1-3: Profile completion and identity verification.",
            "Days 4-7: Municipality officer review and subsidy authorization.",
            "Days 8-15: Open bidding window for partner banks to send offers.",
            "Days 16-18: Citizen selection and final bank KYC.",
            "Days 19-21: Final disbursement and property registration."
          ]
        },
        {
          id: "rates",
          title: "Interest & Terms",
          icon: Percent,
          content: [
            "Interest Rates: 9.2% to 11.5% fixed (Base rate + 2.5% max).",
            "Tenure: Flexibile options from 15 to 25 years.",
            "Down Payment: Minimum 10% (Rest covered by loan + subsidy).",
            "Prepayment: Zero penalty after first 5 years."
          ]
        }
      ]
    },
    faqs: [
      { q: "What is the maximum subsidy amount?", a: "The government provides between NPR 200,000 to NPR 500,000 depending on the property location and applicant's income level." },
      { q: "Can I choose my own bank?", a: "Yes. Once your application is approved by the municipality, all partner banks can bid. You choose the offer that suits you best." },
      { q: "What happens if I miss an EMI?", a: "The portal includes a grace period tracker. However, consistent failure may result in loss of the government interest subsidy component." },
      { q: "Is the subsidy refundable?", a: "No, as long as you occupy the property as your primary residence for at least 10 years, the subsidy is a non-refundable grant." }
    ],
    cta: {
      title: "Empowering Nepali Home Ownership",
      subtitle: "Join over 12,000 citizens who have found their home through our transparent digital system.",
      button: "Begin Application"
    },
    footer: {
      desc: "The official digital conduit for housing subsidies and ethical banking in Nepal.",
      rights: "© 2024 Home Buyer Portal | Government of Nepal. All rights reserved."
    }
  },
  ne: {
    nav: { home: "गृह", features: "सुविधाहरू", guides: "गाइडहरू", stats: "तथ्याङ्क", login: "लग इन", register: "दर्ता गर्नुहोस्" },
    hero: {
      tag: "सुरक्षित। पारदर्शी। छिटो। एकीकृत।",
      title: "नेपालको उत्कृष्ट घर खरीद प्लेटफर्म",
      subtitle: "सरकारी अनुदान र बैंक ऋणको लागि एकीकृत डिजिटल प्रणाली। मात्र २१ दिनमा आफ्नो घरको यात्रा पूरा गर्नुहोस्।",
      primaryCTA: "यात्रा सुरु गर्नुहोस्",
      secondaryCTA: "स्थिति जाँच",
    },
    stats: [
      { label: "आवास प्राप्त परिवार", value: "१२,४५०+", sub: "प्रमाणित नागरिकहरू" },
      { label: "अनुदान वितरण", value: "१.८ अर्ब", sub: "सरकारी सहयोग" },
      { label: "बैंक संजाल", value: "२४+", sub: "साझेदार बैंकहरू" },
      { label: "प्रक्रिया समय", value: "२१ दिन", sub: "औसत अवधि" }
    ],
    features: {
      title: "हाम्रो प्लेटफर्म किन रोज्ने?",
      subtitle: "हामीले भ्रष्टाचार र ढिलाइ हटाउन सम्पूर्ण प्रक्रियालाई डिजिटल बनाएका छौं।",
      items: [
        { title: "एकीकृत डिजिटल पोर्टल", desc: "सरकारी अनुदान र बैंक ऋणका लागि एउटै आवेदनबाट आवेदन दिनुहोस्।", icon: Zap },
        { title: "वास्तविक समय ट्रयाकर", desc: "तपाईंको फाइल कुन अधिकारीले हेरिरहनुभएको छ, स्पष्ट थाहा पाउनुहोस्।", icon: Eye },
        { title: "स्वचालित अनुदान गणना", desc: "हाम्रो प्रणालीले तपाईंले पाउनुपर्ने अधिकतम अनुदान सुनिश्चित गर्दछ।", icon: Award },
        { title: "इन्टरप्राइज-ग्रेड सुरक्षा", desc: "तपाईंका कागजातहरू २FA र इन्क्रिप्शन प्रविधिद्वारा सुरक्षित छन्।", icon: ShieldCheck },
        { title: "प्रतिस्पर्धी ऋण बिडिङ", desc: "धेरै बैंकहरूले तपाईंको ऋणको लागि बिड गर्छन्, जसले गर्दा उत्तम ब्याज पाउनुहुन्छ।", icon: TrendingUp },
        { title: "समर्पित सहायता", desc: "प्रणाली चलाउन मद्दत गर्न २४/७ विज्ञ सहायता उपलब्ध छ।", icon: Users }
      ]
    },
    guides: {
        title: "उत्कृष्टताको चरणहरू",
        subtitle: "सरोकारवालाहरूका लागि स्पष्ट मार्गचित्र।",
        citizen: {
          title: "नागरिकहरूका लागि",
          description: "८ सजिलो चरणहरूमा आफ्नो घर सुरक्षित गर्नुहोस्।",
          steps: [
            { title: "खाता बनाउनुहोस्", desc: "आधारभूत विवरण सहित दर्ता गर्नुहोस्।" },
            { title: "प्रोफाइल पूरा गर्नुहोस्", desc: "पारिवारिक र आय विवरण भर्नुहोस्।" },
            { title: "योग्यता जाँच", desc: "अनुदानका लागि स्वचालित योग्यता जाँच।" },
            { title: "अनुरोध बुझाउनुहोस्", desc: "जग्गा र निर्माणकर्ताको विवरण अपलोड गर्नुहोस्।" },
            { title: "कागजात प्रमाणीकरण", desc: "नागरिकता र आयको प्रमाण अपलोड गर्नुहोस्।" },
            { title: "नगरपालिका समीक्षा", desc: "स्थानीय अधिकारीद्वारा प्रमाणीकरण।" },
            { title: "प्रस्तावहरू प्राप्त", desc: "बैंकहरूबाट ऋण प्रस्ताव तुलना गर्नुहोस्।" },
            { title: "अन्तिम सम्झौता", desc: "बैंक छान्नुहोस् र साँचो प्राप्त गर्नुहोस्।" }
          ]
        },
        bank: {
          title: "बैंक अधिकारीका लागि",
          description: "आवेदनहरू व्यवस्थापन गर्नुहोस् र प्रस्ताव पठाउनुहोस्।",
          steps: [
            { title: "ड्यासबोर्ड पहुँच", desc: "प्रमाणित नागरिकहरूको सूची हेर्नुहोस्।" },
            { title: "जोखिम विश्लेषण", desc: "स्वचालित क्रेडिट स्कोर र आयको समीक्षा गर्नुहोस्।" },
            { title: "प्रस्ताव तयार", desc: "ब्याज दर र अवधि निर्धारण गर्नुहोस्।" },
            { title: "अन-बोर्डिङ", desc: "अन्तिम KYC र प्रक्रिया पूरा गर्नुहोस्।" }
          ]
        },
        municipality: {
          title: "नगरपालिका अधिकारीका लागि",
          description: "अनुदान स्वीकृत र स्थानीय प्रमाणीकरण गर्नुहोस्।",
          steps: [
            { title: "आवेदन सूची", desc: "आफ्नो क्षेत्रका आवेदनहरू हेर्नुहोस्।" },
            { title: "स्थानीय प्रमाणीकरण", desc: "ठेगाना र सम्पत्तिको स्थिति पुष्टि गर्नुहोस्।" },
            { title: "अनुदान स्वीकृत", desc: "सरकारी अनुदान रकम स्वीकृत गर्नुहोस्।" },
            { title: "प्रवाह अनुगमन", desc: "अन्तिम भुक्तानीमा पारदर्शिता सुनिश्चित गर्नुहोस्।" }
          ]
        }
    },
    loanDetails: {
      title: "ऋण र अनुदान सम्बन्धी विस्तृत जानकारी",
      sections: [
        {
          id: "eligibility",
          title: "योग्यता मापदण्ड",
          icon: CheckCircle,
          content: [
            "नेपाली नागरिक हुनुपर्ने र वैध परिचयपत्र हुनुपर्ने।",
            "पहिलो पटक घर किन्ने हुनुपर्ने (नेपालभर कतै घर नभएको)।",
            "मासिक पारिवारिक आय ८०,००० भन्दा कम हुनुपर्ने।",
            "घरको कुल लागत ५० लाख भन्दा बढी हुन नहुने।",
            "आवेदकको उमेर २१ देखि ६५ वर्ष बीच हुनुपर्ने।"
          ]
        },
        {
          id: "documents",
          title: "आवश्यक कागजातहरू",
          icon: FileText,
          content: [
            "नागरिकताको प्रमाणपत्र (सक्कली र प्रतिलिपि)।",
            "पछिल्लो ६ महिनाको बैंक स्टेटमेन्ट।",
            "रोजगारदाता वा वडा कार्यालयबाट आय प्रमाणपत्र।",
            "जग्गाको नक्सा र निर्माण लागत अनुमान।",
            "परिवारका सबै सदस्यको फोटो।"
          ]
        },
        {
          id: "timeline",
          title: "२१ दिने समयावधि",
          icon: Clock,
          content: [
            "दिन १-३: प्रोफाइल र परिचय प्रमाणीकरण।",
            "दिन ४-७: नगरपालिका समीक्षा र अनुदान स्वीकृति।",
            "दिन ८-१५: बैंकहरूबाट बिडिङ र प्रस्ताव।",
            "दिन १६-१८: बैंक छनौट र अन्तिम KYC।",
            "दिन १९-२१: रकम वितरण र घर नामसारी।"
          ]
        },
        {
          id: "rates",
          title: "ब्याज र शर्तहरू",
          icon: Percent,
          content: [
            "ब्याज दर: ९.२% देखि ११.५% बीच (स्थिर)।",
            "अवधि: १५ देखि २५ वर्ष सम्मका विकल्पहरू।",
            "डाउन पेमेन्ट: न्यूनतम १०% (बाँकी ऋण र अनुदानले समेट्ने)।",
            "पूर्व भुक्तानी: ५ वर्षपछि कुनै जरिवाना नलाग्ने।"
          ]
        }
      ]
    },
    faqs: [
      { q: "अधिकतम अनुदान रकम कति हो?", a: "घरको स्थान र आम्दानीको आधारमा सरकारले २ लाख देखि ५ लाख सम्म अनुदान दिन्छ।" },
      { q: "के म आफ्नो मनपर्ने बैंक छान्न सक्छु?", a: "सक्नुहुन्छ। नगरपालिकाले स्वीकृत गरेपछि बैंकहरूले प्रस्ताव पठाउँछन् र तपाईंले रोज्न पाउनुहुन्छ।" },
      { q: "EMI तिर्न ढिला भयो भने के हुन्छ?", a: "पोर्टलमा ग्रेस पिरियड ट्र्याकर छ। तर धेरै ढिला हुँदा सरकारी अनुदानको ब्याज सुविधा हट्न सक्छ।" },
      { q: "के अनुदान फिर्ता गर्नुपर्छ?", a: "पर्दैन, तर कम्तिमा १० वर्ष सोही घरमा बस्नुपर्ने नियम छ।" }
    ],
    cta: {
      title: "नेपाली घर मालिक बन्ने सपना साकार पार्नुहोस्",
      subtitle: "हाम्रो पारदर्शी डिजिटल प्रणाली प्रयोग गर्ने १२,०००+ नागरिकहरूमा सामेल हुनुहोस्।",
      button: "आवेदन सुरु गर्नुहोस्"
    },
    footer: {
      desc: "आवास अनुदान र नैतिक बैंकिङका लागि नेपाल सरकारको आधिकारिक डिजिटल माध्यम।",
      rights: "© २०२४ होम बायर पोर्टल | नेपाल सरकार। सर्वाधिकार सुरक्षित।"
    }
  }
};
