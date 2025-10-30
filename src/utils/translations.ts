// Multilingual support for South African languages
export type Language = 'en' | 'zu' | 'xh' | 'st' | 'af'

export const languages = {
  en: 'English',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  st: 'Sesotho',
  af: 'Afrikaans',
}

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    services: 'Services',
    billing: 'Billing',
    issues: 'Issues',
    participation: 'Participation',
    procurement: 'Procurement',
    transparency: 'Transparency',
    admin: 'Admin Panel',
    signOut: 'Sign Out',
    
    // Common
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    
    // Service Portal
    unifiedServices: 'Unified Service Portal',
    allServices: 'All Your Municipal Services',
    quickAccess: 'Quick Access',
    recentActivity: 'Recent Activity',
    
    // Bills
    bills: 'Bills',
    myBills: 'My Bills',
    payBill: 'Pay Bill',
    viewBill: 'View Bill',
    dueDate: 'Due Date',
    amount: 'Amount',
    status: 'Status',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    
    // Issues
    reportIssue: 'Report Issue',
    myIssues: 'My Issues',
    issueType: 'Issue Type',
    description: 'Description',
    location: 'Location',
    photos: 'Photos',
    trackIssue: 'Track Issue',
    
    // E-Participation
    community: 'Community',
    forums: 'Forums',
    polls: 'Polls',
    feedback: 'Feedback',
    discussions: 'Discussions',
    vote: 'Vote',
    comment: 'Comment',
    share: 'Share',
    
    // Procurement
    tenders: 'Tenders',
    activeTenders: 'Active Tenders',
    suppliers: 'Suppliers',
    contracts: 'Contracts',
    tenderNumber: 'Tender Number',
    deadline: 'Deadline',
    value: 'Value',
    supplierRating: 'Supplier Rating',
    
    // Offline
    offlineMode: 'Offline Mode',
    syncPending: 'Sync Pending',
    syncComplete: 'Sync Complete',
    workingOffline: 'Working Offline',
  },
  zu: {
    // Navigation
    dashboard: 'Ibhodi',
    services: 'Izinsizakalo',
    billing: 'Izikweletu',
    issues: 'Izinkinga',
    participation: 'Ukubamba Iqhaza',
    procurement: 'Ukuthenga',
    transparency: 'Ukucaca',
    admin: 'Iphini Lokuphatha',
    signOut: 'Phuma',
    
    // Common
    welcome: 'Siyakwamukela',
    loading: 'Iyalayisha...',
    save: 'Gcina',
    cancel: 'Khansela',
    submit: 'Thumela',
    delete: 'Susa',
    edit: 'Hlela',
    view: 'Buka',
    search: 'Sesha',
    filter: 'Hlola',
    export: 'Khipha',
    
    // Service Portal
    unifiedServices: 'Iphothali Eliyodwa Lezinsizakalo',
    allServices: 'Zonke Izinsizakalo Zakho Zikamasipala',
    quickAccess: 'Ukufinyelela Ngokushesha',
    recentActivity: 'Imisebenzi Yakamuva',
    
    // Bills
    bills: 'Izikweletu',
    myBills: 'Izikweletu Zami',
    payBill: 'Khokha Isikweletu',
    viewBill: 'Buka Isikweletu',
    dueDate: 'Usuku Lokukhokha',
    amount: 'Inani',
    status: 'Isimo',
    paid: 'Kukhokhiwe',
    pending: 'Kulindile',
    overdue: 'Kudlulele',
    
    // Issues
    reportIssue: 'Bika Inkinga',
    myIssues: 'Izinkinga Zami',
    issueType: 'Uhlobo Lwenkinga',
    description: 'Incazelo',
    location: 'Indawo',
    photos: 'Izithombe',
    trackIssue: 'Landelela Inkinga',
    
    // E-Participation
    community: 'Umphakathi',
    forums: 'Amaforamu',
    polls: 'Ukuvota',
    feedback: 'Impendulo',
    discussions: 'Izingxoxo',
    vote: 'Vota',
    comment: 'Phawula',
    share: 'Yabelana',
    
    // Procurement
    tenders: 'Amathenda',
    activeTenders: 'Amathenda Asebenzayo',
    suppliers: 'Abahlinzeki',
    contracts: 'Izinkontileka',
    tenderNumber: 'Inombolo Yethenda',
    deadline: 'Umhla Wokugcina',
    value: 'Inani',
    supplierRating: 'Isilinganiso Somhlinzeki',
    
    // Offline
    offlineMode: 'Imodi Engaxhunyiwe',
    syncPending: 'Ukuvumelanisa Kulindile',
    syncComplete: 'Ukuvumelanisa Kuqediwe',
    workingOffline: 'Usebenza Ungaxhunyiwe',
  },
  xh: {
    // Navigation
    dashboard: 'Ibhodi',
    services: 'Iinkonzo',
    billing: 'Iiakhawunti',
    issues: 'Imiba',
    participation: 'Ukuthatha Inxaxheba',
    procurement: 'Ukuthenga',
    transparency: 'Ukucaca',
    admin: 'Iphaneli Yolawulo',
    signOut: 'Phuma',
    
    // Common
    welcome: 'Wamkelekile',
    loading: 'Iyalayisha...',
    save: 'Gcina',
    cancel: 'Rhoxisa',
    submit: 'Ngenisa',
    delete: 'Cima',
    edit: 'Hlela',
    view: 'Jonga',
    search: 'Khangela',
    filter: 'Hlola',
    export: 'Khupha',
    
    // Service Portal
    unifiedServices: 'Iportal Yenkonzo Emanyeneyo',
    allServices: 'Zonke Iinkonzo Zakho Zikamasipala',
    quickAccess: 'Ukufikelela Ngokukhawuleza',
    recentActivity: 'Imisebenzi Yamva Nje',
    
    // Bills
    bills: 'Iiakhawunti',
    myBills: 'Iiakhawunti Zam',
    payBill: 'Hlawula Iakhawunti',
    viewBill: 'Jonga Iakhawunti',
    dueDate: 'Umhla Wokuhlawula',
    amount: 'Isixa',
    status: 'Imeko',
    paid: 'Ihlawuliwe',
    pending: 'Ilindile',
    overdue: 'Idlulele',
    
    // Issues
    reportIssue: 'Xela Umba',
    myIssues: 'Imiba Yam',
    issueType: 'Uhlobo Lomba',
    description: 'Inkcazo',
    location: 'Indawo',
    photos: 'Imifanekiso',
    trackIssue: 'Landela Umba',
    
    // E-Participation
    community: 'Uluntu',
    forums: 'Iiforamu',
    polls: 'Ukuvota',
    feedback: 'Impendulo',
    discussions: 'Iingxoxo',
    vote: 'Vota',
    comment: 'Phawula',
    share: 'Yabelana',
    
    // Procurement
    tenders: 'Iitenda',
    activeTenders: 'Iitenda Ezisebenzayo',
    suppliers: 'Ababoneleli',
    contracts: 'Iikhontrakthi',
    tenderNumber: 'Inombolo Yetenda',
    deadline: 'Umhla Wokugqibela',
    value: 'Ixabiso',
    supplierRating: 'Ulinganiso Lomnikezeli',
    
    // Offline
    offlineMode: 'Imodi Engekho Kwintanethi',
    syncPending: 'Ukuvumelanisa Kulindile',
    syncComplete: 'Ukuvumelanisa Kugqityiwe',
    workingOffline: 'Usebenza Ungekho Kwintanethi',
  },
  st: {
    // Navigation
    dashboard: 'Boto',
    services: 'Ditshebeletso',
    billing: 'Dibili',
    issues: 'Mathata',
    participation: 'Ho Nka Karolo',
    procurement: 'Ho Reka',
    transparency: 'Ponaletso',
    admin: 'Panele ya Taolo',
    signOut: 'Tswa',
    
    // Common
    welcome: 'Rea o Amohela',
    loading: 'E a Laola...',
    save: 'Boloka',
    cancel: 'Hlakola',
    submit: 'Romela',
    delete: 'Hlakola',
    edit: 'Fetola',
    view: 'Sheba',
    search: 'Batla',
    filter: 'Kgetha',
    export: 'Ntsha',
    
    // Service Portal
    unifiedServices: 'Portal ya Ditshebeletso tse Kopaditsweng',
    allServices: 'Ditshebeletso Tsohle tsa Masepala',
    quickAccess: 'Ho Kena Kapele',
    recentActivity: 'Ditshebetso tsa Hamorao',
    
    // Bills
    bills: 'Dibili',
    myBills: 'Dibili Tsa Ka',
    payBill: 'Lefa Bili',
    viewBill: 'Sheba Bili',
    dueDate: 'Letsatsi la ho Lefa',
    amount: 'Tjhelete',
    status: 'Boemo',
    paid: 'E Lefetse',
    pending: 'E Emetse',
    overdue: 'E Feta',
    
    // Issues
    reportIssue: 'Tlaleha Bothata',
    myIssues: 'Mathata a Ka',
    issueType: 'Mofuta wa Bothata',
    description: 'Tlhaloso',
    location: 'Sebaka',
    photos: 'Ditshwantsho',
    trackIssue: 'Latela Bothata',
    
    // E-Participation
    community: 'Setjhaba',
    forums: 'Diforamo',
    polls: 'Dipatlisiso',
    feedback: 'Maikutlo',
    discussions: 'Dipuisano',
    vote: 'Vouta',
    comment: 'Hlahloba',
    share: 'Abelana',
    
    // Procurement
    tenders: 'Ditenda',
    activeTenders: 'Ditenda tse Sebetsang',
    suppliers: 'Bafani',
    contracts: 'Dikontrakeng',
    tenderNumber: 'Nomoro ya Tenda',
    deadline: 'Letsatsi la ho Qetela',
    value: 'Boleng',
    supplierRating: 'Tekanyetso ya Mofani',
    
    // Offline
    offlineMode: 'Mokgwa wa Offline',
    syncPending: 'Ho Kopanya Ho Emetse',
    syncComplete: 'Ho Kopanya Ho Phethahetseng',
    workingOffline: 'O Sebetsa Offline',
  },
  af: {
    // Navigation
    dashboard: 'Dashboard',
    services: 'Dienste',
    billing: 'Fakturering',
    issues: 'Kwessies',
    participation: 'Deelname',
    procurement: 'Verkryging',
    transparency: 'Deursigtigheid',
    admin: 'Admin Paneel',
    signOut: 'Teken Uit',
    
    // Common
    welcome: 'Welkom',
    loading: 'Laai...',
    save: 'Stoor',
    cancel: 'Kanselleer',
    submit: 'Dien In',
    delete: 'Verwyder',
    edit: 'Wysig',
    view: 'Bekyk',
    search: 'Soek',
    filter: 'Filter',
    export: 'Voer Uit',
    
    // Service Portal
    unifiedServices: 'Verenigte Diens Portaal',
    allServices: 'Al Jou Munisipale Dienste',
    quickAccess: 'Vinnige Toegang',
    recentActivity: 'Onlangse Aktiwiteit',
    
    // Bills
    bills: 'Rekeninge',
    myBills: 'My Rekeninge',
    payBill: 'Betaal Rekening',
    viewBill: 'Bekyk Rekening',
    dueDate: 'Vervaldatum',
    amount: 'Bedrag',
    status: 'Status',
    paid: 'Betaal',
    pending: 'Hangende',
    overdue: 'Agterstallig',
    
    // Issues
    reportIssue: 'Rapporteer Kwessie',
    myIssues: 'My Kwessies',
    issueType: 'Kwessie Tipe',
    description: 'Beskrywing',
    location: 'Ligging',
    photos: "Foto's",
    trackIssue: 'Volg Kwessie',
    
    // E-Participation
    community: 'Gemeenskap',
    forums: 'Forums',
    polls: 'Peilings',
    feedback: 'Terugvoer',
    discussions: 'Besprekings',
    vote: 'Stem',
    comment: 'Kommentaar',
    share: 'Deel',
    
    // Procurement
    tenders: 'Tenders',
    activeTenders: 'Aktiewe Tenders',
    suppliers: 'Verskaffers',
    contracts: 'Kontrakte',
    tenderNumber: 'Tender Nommer',
    deadline: 'Sperdatum',
    value: 'Waarde',
    supplierRating: 'Verskaffer Gradering',
    
    // Offline
    offlineMode: 'Aflyn Modus',
    syncPending: 'Sinkroniseer Hangende',
    syncComplete: 'Sinkroniseer Voltooi',
    workingOffline: 'Werk Aflyn',
  },
}

export function getTranslation(lang: Language, key: string): string {
  return translations[lang]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key
}
