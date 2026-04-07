const dict = {
  ko: {
    // Calendar
    together: "함께한 날",
    anniversary: "기념일",
    daysUnit: "일",
    upcoming: "다가오는 일정",
    addSchedule: "일정 추가",
    me: "나",
    partner: "상대",

    // Date detail
    photos: "사진",
    addPhotos: "사진 추가",
    schedule: "일정",
    places: "장소",
    note: "메모",
    noteplaceholder: "오늘 하루 어땠나요?",
    saving: "저장 중...",
    setCover: "대표 사진으로 설정",
    delete: "삭제",
    deleteConfirm: "삭제할까요?",
    yes: "네",
    no: "아니요",

    // Date flags
    didWeMeet: "만났나요?",
    didWeLove: "사랑을 나눴나요?",

    // Places
    searchOnMap: "지도에서 보기",

    // Add page
    addRecord: "기록 추가",
    scheduleTab: "일정",
    placeTab: "장소",
    title: "제목",
    titlePlaceholder: "약속, 저녁식사 등",
    time: "시간",
    allDay: "하루 종일",
    category: "카테고리",
    placeName: "장소 이름",
    placeNamePlaceholder: "어디에 갔나요?",
    notePlaceholder: "간단한 메모 (선택)",
    save: "저장",
    cancel: "취소",

    // Categories
    catFood: "맛집",
    catCafe: "카페",
    catBar: "술집",
    catTravel: "여행",
    catShop: "쇼핑",
    catMovie: "영화",
    catPark: "공원",
    catOther: "기타",

    // Settings
    settings: "설정",
    couple: "커플",
    connected: "연결됨",
    waiting: "상대방 대기중...",
    inviteCode: "초대 코드",
    copy: "복사",
    copied: "복사됨!",
    createCouple: "커플 만들기",
    joinWithCode: "코드로 참여",
    join: "참여",
    background: "배경 사진",
    bgDesc: "커플 사진을 배경으로 설정하세요",
    choosePhoto: "사진 선택",
    uploading: "업로드 중...",
    account: "계정",
    signOut: "로그아웃",
    connectPartner: "상대방과 연결하세요",

    // Auth
    email: "이메일",
    password: "비밀번호",
    signIn: "로그인",
    createAccount: "회원가입",
    noAccount: "계정이 없으신가요?",
    hasAccount: "이미 계정이 있으신가요?",
    signUp: "가입하기",
    checkEmail: "이메일을 확인하세요",
    confirmSent: "확인 링크를 보냈습니다",
  },
  en: {
    together: "Together",
    anniversary: "Anniversary",
    daysUnit: "days",
    upcoming: "Upcoming",
    addSchedule: "Add Schedule",
    me: "Me",
    partner: "Partner",

    photos: "Photos",
    addPhotos: "Add Photos",
    schedule: "Schedule",
    places: "Places",
    note: "Note",
    noteplaceholder: "How was your day together?",
    saving: "Saving...",
    setCover: "Set as Cover",
    delete: "Delete",
    deleteConfirm: "Delete?",
    yes: "Yes",
    no: "No",

    didWeMeet: "Did we meet?",
    didWeLove: "Did we love?",

    searchOnMap: "View on Map",

    addRecord: "Add Record",
    scheduleTab: "Schedule",
    placeTab: "Place",
    title: "Title",
    titlePlaceholder: "Meeting, Dinner, etc.",
    time: "Time",
    allDay: "All day",
    category: "Category",
    placeName: "Place Name",
    placeNamePlaceholder: "Where did you go?",
    notePlaceholder: "Short note (optional)",
    save: "Save",
    cancel: "Cancel",

    catFood: "Food",
    catCafe: "Cafe",
    catBar: "Bar",
    catTravel: "Travel",
    catShop: "Shop",
    catMovie: "Movie",
    catPark: "Park",
    catOther: "Other",

    settings: "Settings",
    couple: "Couple",
    connected: "Connected",
    waiting: "Waiting for partner...",
    inviteCode: "Invite Code",
    copy: "Copy",
    copied: "Copied!",
    createCouple: "Create Couple",
    joinWithCode: "Join with Code",
    join: "Join",
    background: "Background",
    bgDesc: "Set a couple photo as background",
    choosePhoto: "Choose Photo",
    uploading: "Uploading...",
    account: "Account",
    signOut: "Sign Out",
    connectPartner: "Connect with your partner to begin.",

    email: "Email",
    password: "Password",
    signIn: "Sign In",
    createAccount: "Create Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signUp: "Sign up",
    checkEmail: "Check your email",
    confirmSent: "Confirmation link sent to",
  },
} as const;

export type Locale = keyof typeof dict;
export type DictKey = keyof typeof dict.ko;

let currentLocale: Locale = "ko";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("dayswemet-locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("dayswemet-locale") as Locale | null;
    if (saved && dict[saved]) return saved;
  }
  return currentLocale;
}

export function t(key: DictKey): string {
  const locale = getLocale();
  return dict[locale]?.[key] ?? dict.ko[key] ?? key;
}
