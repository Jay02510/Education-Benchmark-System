
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'privacy' | 'terms' | 'dpa' | 'billing';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'privacy' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [language, setLanguage] = useState<'EN' | 'KO'>('EN');

    const content = {
        privacy: {
            title: { EN: "Privacy Policy", KO: "개인정보처리방침" },
            body: {
                EN: `Last Updated: June 2025. Benchmark AI ("Platform") is committed to protecting student and educator data. We adhere to COPPA and GDPR principles for educational data. 1. Data Collection: We collect student performance scores, teacher observations, and profile photos solely for pedagogical analysis. 2. AI Processing: Data is processed via Google Gemini API; we do not use your proprietary student data to train public foundation models. 3. Security: Institutional data is encrypted at rest and in transit via Firebase protocols.`,
                KO: `최종 업데이트: 2025년 6월. Benchmark AI("플랫폼")는 학생 및 교육자의 데이터를 보호하기 위해 최선을 다하고 있습니다. 당사는 교육 데이터에 대해 한국의 개인정보보호법(PIPA) 및 국제 표준인 COPPA/GDPR 원칙을 준수합니다. 1. 데이터 수집: 당사는 교육적 분석을 목적으로 학생 성적, 교사 관찰 기록 및 프로필 사진을 수집합니다. 2. AI 처리: 데이터는 Google Gemini API를 통해 처리되며, 귀하의 전용 학생 데이터를 공용 AI 모델의 학습용으로 사용하지 않습니다. 3. 보안: 모든 기관 데이터는 Firebase 프로토콜을 통해 전송 및 보관 시 암호화됩니다.`
            }
        },
        terms: {
            title: { EN: "Terms of Service", KO: "이용약관" },
            body: {
                EN: `By accessing Benchmark AI, you agree to: 1. Ethical AI Use: Not use generated resources for illegal or harmful purposes. 2. Accuracy: Understand that AI-generated pedagogical insights are advisory and require human verification. 3. Institutional Responsibility: Schools are responsible for obtaining parental consent for data entry as required by local law.`,
                KO: `Benchmark AI를 이용함으로써 귀하는 다음 사항에 동의합니다: 1. 윤리적 AI 사용: 생성된 리소스를 불법적이거나 유해한 목적으로 사용하지 않습니다. 2. 정확성: AI가 생성한 교육적 통찰은 자문용이며 반드시 인간(교사)의 검증이 필요함을 이해합니다. 3. 기관의 책임: 학교는 현지 법률에 따라 데이터 입력에 대한 학부모의 동의를 얻을 책임이 있습니다.`
            }
        },
        billing: {
            title: { EN: "Pricing & Billing", KO: "결제 및 환불 정책" },
            body: {
                EN: `1. Subscription: Pro features are billed monthly or annually. 2. Refunds: We offer a 14-day 'no-questions-asked' refund policy for new subscriptions. 3. Free Tier: The Starter plan is free forever for up to 25 students. 4. AI Usage: High-volume AI features (Vision Scoring, Report Gen) are subject to fair use limits to ensure system stability.`,
                KO: `1. 구독: 프로 기능은 월간 또는 연간 단위로 청구됩니다. 2. 환불: 신규 구독에 대해 14일간의 '조건 없는 환불' 정책을 제공합니다. 3. 무료 티어: 스타터 플랜은 최대 25명의 학생까지 평생 무료입니다. 4. AI 사용: 시스템 안정성을 위해 대량의 AI 기능(비전 채점, 리포트 생성)은 공정 사용 제한(Fair Use Limit)의 적용을 받을 수 있습니다.`
            }
        },
        dpa: {
            title: { EN: "Data Processing Addendum", KO: "데이터 처리 합의서" },
            body: {
                EN: `This DPA governs the processing of personal data by the Platform on behalf of the Customer (Institution). We act as a Data Processor under instructions from the Institution (Data Controller). Data is deleted upon account termination or within 90 days of inactivity.`,
                KO: `본 합의서는 고객(교육기관)을 대신하여 플랫폼이 수행하는 개인정보 처리에 관한 사항을 규정합니다. 당사는 기관(개인정보 컨트롤러)의 지침에 따라 개인정보 처리자로서 역할을 수행합니다. 데이터는 계정 해지 시 또는 90일간 비활성 시 삭제됩니다.`
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content[activeTab as keyof typeof content].title[language]} size="lg">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 overflow-x-auto">
                    <div className="flex gap-1 shrink-0">
                        {(['privacy', 'terms', 'billing', 'dpa'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab === 'dpa' ? 'DPA' : tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-indigo-100 p-1 rounded-xl ml-4 shrink-0">
                        <button onClick={() => setLanguage('EN')} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${language === 'EN' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400'}`}>EN</button>
                        <button onClick={() => setLanguage('KO')} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${language === 'KO' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400'}`}>KO</button>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-inner max-h-[400px] overflow-y-auto">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {content[activeTab as keyof typeof content].body[language]}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                    <button onClick={onClose} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Close</button>
                </div>
            </div>
        </Modal>
    );
};
