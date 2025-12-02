'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import ReactionBar from './ReactionBar';

interface MessageProps {
  message: {
    id: string;
    text: string;
    timestamp: string;
    senderId: string;
    receiverId: string;
    reactions?: Record<string, string>;
    deletedFor?: string[];
    deletedForEveryone?: boolean;
  };
  isOwnMessage: boolean;
  currentUserId: string;
  onReactionToggle: (messageId: string, reaction: string, userId: string) => void;
  onDeleteMessage?: (messageId: string, deleteType: 'for-me' | 'for-everyone') => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  isOwnMessage, 
  currentUserId,
  onReactionToggle,
  onDeleteMessage
}) => {
  const [currentReactions, setCurrentReactions] = useState<Record<string, string>>(
    message.reactions || {}
  );
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Update reactions when they change
  useEffect(() => {
    if (message.reactions) {
      setCurrentReactions(message.reactions);
    }
  }, [message.reactions]);

  // Handle long press for mobile devices
  const handleMouseDown = () => {
    if (message.deletedFor?.includes(currentUserId) || message.deletedForEveryone) {
      return; // Don't allow long press on deleted messages
    }
    
    const timer = setTimeout(() => {
      setIsLongPressed(true);
      setShowDeleteOptions(true);
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressed(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressed(false);
  };

  // Touch events for mobile
  const handleTouchStart = () => {
    if (message.deletedFor?.includes(currentUserId) || message.deletedForEveryone) {
      return;
    }
    
    const timer = setTimeout(() => {
      setIsLongPressed(true);
      setShowDeleteOptions(true);
    }, 500);
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressed(false);
  };

  const handleReactionToggle = (reaction: string) => {
    onReactionToggle(message.id, reaction, currentUserId);
  };

  const handleDeleteForMe = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id, 'for-me');
      setShowDeleteOptions(false);
    }
  };

  const handleDeleteForEveryone = () => {
    if (onDeleteMessage && isOwnMessage) {
      onDeleteMessage(message.id, 'for-everyone');
      setShowDeleteOptions(false);
    }
  };

  // Check if message is deleted
  const isDeletedForMe = message.deletedFor?.includes(currentUserId);
  const isDeletedForEveryone = message.deletedForEveryone;
  const isDeleted = isDeletedForMe || isDeletedForEveryone;

  // Don't render deleted messages
  if (isDeleted) {
    return null;
  }

  return (
    <>
      <div 
        ref={messageRef}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6 group relative`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`max-w-xs lg:max-w-md relative ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Avatar for other user's messages */}
          {!isOwnMessage && (
            <div className="flex items-end space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
                U
              </div>
              <span className="text-xs text-gray-500 font-medium">User</span>
            </div>
          )}
          
          <div className={`relative ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
            <div className={`
              px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105
              ${isOwnMessage 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-200/50' 
                : 'bg-white text-gray-800 shadow-gray-200/50 border border-gray-100'
              }
              ${isLongPressed ? 'scale-105 shadow-xl' : ''}
            `}>
              {/* Message Text */}
              <div className="text-sm leading-relaxed">{message.text}</div>
              
              {/* Message Actions */}
              <div className={`flex items-center justify-between mt-3 pt-2 ${
                isOwnMessage ? 'border-t border-white/20' : 'border-t border-gray-100'
              }`}>
                <span className={`text-xs ${
                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
                
              </div>
            </div>
            
            {/* Message Actions Bar */}
            <div className="mt-3 flex items-center justify-end">
              {/* Reactions */}
              {message.id && message.id !== 'undefined' && message.id !== 'null' && (
                <div className="w-full">
                  <ReactionBar
                    messageId={message.id}
                    userId={currentUserId}
                    currentReactions={currentReactions}
                    onReactionToggle={handleReactionToggle}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simple Delete Options - WhatsApp Style */}
        {showDeleteOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteOptions(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 min-w-[280px] max-w-[320px] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 text-xl">🗑️</span>
                  <span className="text-lg text-gray-800 font-semibold">Delete message?</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 space-y-2">
                {/* Delete for Everyone - Only for sender */}
                {isOwnMessage && (
                  <button
                    onClick={handleDeleteForEveryone}
                    className="w-full text-sm bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Delete from everyone's view (like WhatsApp)"
                  >
                    <span className="text-lg">🌍</span>
                    <span>Delete for everyone</span>
                  </button>
                )}

                {/* Delete for Me - Always available */}
                <button
                  onClick={handleDeleteForMe}
                  className="w-full text-sm bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  title="Delete only from your view"
                >
                  <span className="text-lg">👁️</span>
                  <span>Delete for me</span>
                </button>

                {/* Cancel */}
                <button
                  onClick={() => setShowDeleteOptions(false)}
                  className="w-full text-sm bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forward modal removed to simplify UI */}
    </>
  );
};

export default Message;
