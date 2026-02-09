
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'EN' | 'KO';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    EN: {
        hero_title_1: "Teach with",
        hero_title_2: "Intelligence.",
        hero_sub: "Transform raw assessment data into growth velocity, pods, and reports. Join our exclusive educational beta program today.",
        cta_start: "Start Premium Beta",
        cta_sandbox: "Interactive Demo",
        nav_login: "Log In",
        nav_join: "Join Free",
        feature_chat: "AI Chat Assistant",
        feature_chat_desc: "Your 24/7 co-pilot. Ask complex questions about data and get instant strategies.",
        feature_tracking: "Real-Time Tracking",
        feature_tracking_desc: "Monitor student growth across 8 domains with live dashboards.",
        feature_case: "Pedagogical Case Studies",
        feature_case_desc: "Generate deep-dive research reports for institutional review.",
        auth_login_title: "System Login",
        auth_signup_title: "Identity Creation",
        field_name: "Official Name",
        field_email: "Email Address",
        field_pass: "Security Key",
        btn_auth: "Authenticate",
        btn_init: "Initialize OS",
        link_request: "New Instance Request",
        link_existing: "Existing Node? Login",
        demo_banner: "Demo Mode Active: Changes will not be saved.",
        demo_cta: "Create Full Account"
    },
    KO: {
        hero_title_1: "데이터로 실현하는",
        hero_title_2: "교육의 미래.",
        hero_sub: "가공되지 않은 평가 데이터를 성장 속도, 소그룹 편성, 심층 보고서로 전환하세요. 지금 독점 교육 베타 프로그램에 참여하세요.",
        cta_start: "프리미엄 베타 시작",
        cta_sandbox: "인터랙티브 데모",
        nav_login: "로그인",
        nav_join: "무료 가입",
        feature_chat: "AI 대화 어시스턴트",
        feature_chat_desc: "연중무휴 교육 코파일럿. 데이터에 대한 복잡한 질문에 즉각적인 전략을 제공합니다.",
        feature_tracking: "실시간 대시보드",
        feature_tracking_desc: "8개 영역에 걸친 학생 성장을 라이브 차트로 모니터링하세요.",
        feature_case: "교육학적 사례 연구",
        feature_case_desc: "교육 기관 검토를 위한 심층 연구 보고서를 생성합니다.",
        auth_login_title: "시스템 로그인",
        auth_signup_title: "계정 생성",
        field_name: "사용자 성함",
        field_email: "이메일 주소",
        field_pass: "보안 키",
        btn_auth: "인증하기",
        btn_init: "시스템 초기화",
        link_request: "새 인스턴스 요청",
        link_existing: "이미 계정이 있나요? 로그인",
        demo_banner: "데모 모드 활성: 변경사항은 저장되지 않습니다.",
        demo_cta: "정식 계정 생성"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('benchmark_lang');
        return (saved as Language) || 'EN';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('benchmark_lang', lang);
    };

    const t = (key: string) => translations[language][key] || key;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage missing');
    return context;
};
