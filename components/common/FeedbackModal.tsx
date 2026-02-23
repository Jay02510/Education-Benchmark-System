
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Sentiment = 'satisfied' | 'confused' | 'inspired' | 'bug';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { activeTab } = useNavigation();
    const { showToast } = useToast();
    const [sentiment, setSentiment] = useState<Sentiment>('satisfied');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulation of the notification to jsn.benjamin@gmail.com
        // In a production environment, this would call a Firebase Cloud Function or EmailJS
        // Audit: Removed raw debug log

        setTimeout(() => {
            setIsSubmitting(false);
            showToast("Intelligence contribution received. Thank you.");
            setMessage('');
            onClose();
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Platform Intelligence Feedback" size="md">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sentiment Calibration</p>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { id: 'satisfied', icon: 'check', label: 'Great' },
                            { id: 'confused', icon: 'info', label: 'Help' },
                            { id: 'inspired', icon: 'brain', label: 'Idea' },
                            { id: 'bug', icon: 'alert', label: 'Issue' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSentiment(s.id as Sentiment)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${sentiment === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                            >
                                <Icon name={s.icon} className="w-5 h-5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Detailed Inquire / Request</label>
                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase">Context: {activeTab}</span>
                    </div>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we improve the Benchmark experience?"
                        className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 text-sm leading-relaxed"
                    />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 border-b-8 border-slate-950 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon name="refresh" className="w-4 h-4 animate-spin" />
                                Transmitting...
                            </>
                        ) : (
                            <>
                                <Icon name="chat" className="w-4 h-4" />
                                Submit Feedback
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
