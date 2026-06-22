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
                EN: `Last Updated: June 2025. Benchmark AI ("Platform") is committed to protecting student and educator data. We adhere to COPPA and GDPR principles for educational data. 1. Data Collection: We collect student performance scores, teacher observations, and profile photos solely for educational analysis. 2. AI Processing: Data is processed via Google Gemini API; we do not use your proprietary student data to train public foundation models. 3. Security: School data is encrypted at rest and in transit via Firebase protocols.`,
                KO: `최종 업데이트: 2025년 6월. Benchmark AI("플랫폼")는 학생 및 교육자의 데이터를 보호하기 위해 최선을 다하고 있습니다. 당사는 한국의 개인정보보호법(PIPA) 및 국제 표준인 COPPA/GDPR 원칙을 준수합니다. 1. 데이터 수집: 교육적 분석을 위해 학생 성적, 교사 관찰 기록 및 프로필 사진을 수집합니다. 2. AI 처리: 모든 데이터는 Google Gemini API를 통해 처리되며, 귀하의 전용 학생 데이터를 공용 AI 학습용으로 사용하지 않습니다. 3. 보안: 모든 데이터는 전송 및 보관 시 암호화됩니다.`
            }
        },
        terms: {
            title: { EN: "Terms of Service", KO: "이용약관" },
            body: {
                EN: `By accessing Benchmark AI, you agree to: 1. Ethical AI Use: Not use generated resources for illegal or harmful purposes. 2. Accuracy: Understand that AI-generated educational insights are advisory and require human verification. 3. School Responsibility: Schools are responsible for obtaining parental consent for data entry as required by local law.`,
                KO: `Benchmark AI를 이용함으로써 귀하는 다음 사항에 동의합니다: 1. 윤리적 AI 사용: 생성된 리소스를 불법적이거나 유해한 목적으로 사용하지 않습니다. 2. 정확성: AI가 생성한 통찰은 자문용이며 반드시 인간(교사)의 검증이 필요합니다. 3. 기관의 책임: 학교는 현지 법률에 따라 데이터 입력에 대한 학부모 동의를 얻을 책임이 있습니다.`
            }
        },
        billing: {
            title: { EN: "Pricing & Billing", KO: "결제 및 환불 정책" },
            body: {
                EN: `1. Subscription: Pro features are billed monthly or annually. 2. Refunds: We offer a 14-day 'no-questions-asked' refund policy for new subscriptions. 3. Free Tier: The Starter plan is free forever for up to 25 students. 4. School Licensing: High-volume accounts are handled via direct support contact to ensure volume discount calibration. 5. AI Usage: High-volume AI features are subject to fair use limits.`,
                KO: `1. 구독: 프로 기능은 월간 또는 연간 단위로 청구됩니다. 2. 환불: 신규 구독에 대해 14일간의 '조건 없는 환불' 정책을 제공합니다. 3. 무료 티어: 스타터 플랜은 최대 25명의 학생까지 평생 무료입니다. 4. 기관 라이선싱: 대량 또는 학원 전체 계정은 기술 지원팀과의 직접 연락을 통해 볼륨 할인이 적용됩니다. 5. AI 사용: 대량의 AI 기능은 공정 사용 제한의 적용을 받을 수 있습니다.`
            }
        },
        dpa: {
            title: { EN: "Data Processing Addendum", KO: "데이터 처리 합의서" },
            body: {
                EN: `This DPA governs the processing of personal data by the Platform on behalf of the Customer (School). We act as a Data Processor under instructions from the School (Data Controller). Data is deleted upon account termination or within 90 days of inactivity.`,
                KO: `본 합의서는 기관(개인정보 컨트롤러)의 지침에 따라 플랫폼이 수행하는 데이터 처리를 규정합니다. 데이터는 계정 해지 시 또는 90일간 비활성 시 삭제됩니다.`
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content[activeTab].title[language]} size="lg">
            <div className="flex flex-col gap-5 font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-90 w-full p-1.5 rounded-[4px] border border-zinc-900 gap-3">
                    <div className="flex gap-1 overflow-x-auto shrink-0 w-full sm:w-auto pb-1 sm:pb-0">
                        {(['privacy', 'terms', 'billing', 'dpa'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors ${
                                    activeTab === tab ? 'bg-zinc-950 text-zinc-100' : 'text-zinc-500 hover:text-zinc-350'
                                }`}
                            >
                                {tab === 'dpa' ? 'DPA' : tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-zinc-950 border border-zinc-900 p-0.5 rounded-[4px] ml-auto sm:ml-4 shrink-0 select-none">
                        <button 
                            onClick={() => setLanguage('EN')} 
                            className={`px-3 py-1 text-[9px] font-mono tracking-wider rounded-[2.5px] cursor-pointer transition-colors ${
                                language === 'EN' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500'
                            }`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => setLanguage('KO')} 
                            className={`px-3 py-1 text-[9px] font-mono tracking-wider rounded-[2.5px] cursor-pointer transition-colors ${
                                language === 'KO' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500'
                            }`}
                        >
                            KO
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-90 w-full border border-zinc-900 p-5 rounded-[4px] max-h-[300px] overflow-y-auto">
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap font-sans">
                        {content[activeTab].body[language]}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
