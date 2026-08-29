import React from 'react';
import EnterpriseChatbot from '../EnterpriseChatbot';

export interface AlphaAssistantProps {
  onOpenInquire?: () => void;
}

/**
 * AlphaAssistant — Re-exported wrapper for the consolidated multi-enterprise
 * scripted FAQ & live broker triage chatbot.
 */
export const AlphaAssistant: React.FC<AlphaAssistantProps> = ({ onOpenInquire }) => {
  return <EnterpriseChatbot onOpenInquire={onOpenInquire} />;
};

export default AlphaAssistant;
