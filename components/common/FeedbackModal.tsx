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
        
        setTimeout(() => {
            setIsSubmitting(false);
            showToast("Intelligence contribution received. Thank you.");
            setMessage('');
            onClose();
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configure feedback parameters" size="md">
            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                <div className="bg-zinc-90 w-full p-5 rounded-[4px] border border-zinc-900">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-3 select-none">Sentiment calibration</p>
                    <div className="grid grid-cols-4 gap-2.5">
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
                                className={`flex flex-col items-center gap-2 p-3 rounded-[4px] transition-all border cursor-pointer select-none ${
                                    sentiment === s.id 
                                        ? 'bg-[oklch(0.72_0.18_145)]/10 border-[oklch(0.72_0.18_145)] text-[oklch(0.72_0.18_145)]' 
                                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                }`}
                            >
                                <Icon name={s.icon} className="w-4 h-4 shrink-0" />
                                <span className="text-[9px] font-mono uppercase tracking-wider">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center select-none">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Detailed inquiry / context note</label>
                        <span className="text-[9px] font-mono text-[oklch(0.72_0.18_145)] bg-[oklch(0.72_0.18_145)]/10 px-2 py-0.5 rounded-[2px] border border-[oklch(0.72_0.18_145)]/20 uppercase">Context: {activeTab}</span>
                    </div>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we improve the Benchmark experience?"
                        className="w-full h-32 p-4 bg-zinc-90 border border-zinc-900 focus:border-zinc-700 rounded-[4px] outline-none transition-colors text-xs text-zinc-200 leading-relaxed font-sans placeholder-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-900">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                                <span>Transmitting...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="chat" className="w-3.5 h-3.5" />
                                <span>Submit Feedback</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
