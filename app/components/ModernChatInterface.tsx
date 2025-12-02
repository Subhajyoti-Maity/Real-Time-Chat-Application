'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Message } from '../../types';
import ReactionBar from './ReactionBar';

interface ModernChatInterfaceProps {
  user: User;
  selectedUser: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onDeleteMessage?: (messageId: string, deleteType: 'for-me' | 'for-everyone') => void;
  onReactionToggle?: (messageId: string, reaction: string, userId: string) => void;
  onCloseChat?: () => void;
  onClearChat?: () => Promise<unknown> | unknown;
}

export default function ModernChatInterface({ 
  user, 
  selectedUser, 
  messages, 
  onSendMessage, 
  onDeleteMessage,
  onReactionToggle,
  onCloseChat,
  onClearChat,
}: ModernChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  
  // Debug logging removed for cleaner console
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Function to show notifications
  const showNotificationMessage = (type: 'success' | 'error', message: string) => {
    setShowNotification({ type, message });
    setTimeout(() => setShowNotification(null), 5000); // Auto-hide after 5 seconds
  };



  // Function to handle delete for everyone (WhatsApp-style)
  const handleDeleteForEveryone = (messageId: string) => {
    console.log('🌍 Delete for everyone button clicked for message:', messageId);
    
    // Find the message to check if user is the sender
    const message = messages.find(m => m.id === messageId);
    if (!message) {
      console.error('❌ Message not found for deletion:', messageId);
      showNotificationMessage('error', 'Message not found!');
      return;
    }
    
    // Check if this is a temporary message using the tempId property
    if (message.tempId) {
      console.log('⚠️ Cannot delete temporary message for everyone:', messageId);
      showNotificationMessage('error', 'Cannot delete a message that is still being sent!');
      return;
    }
    
    // Validate that the current user is the sender of the message
    if (message.senderId !== user?.id) {
      console.warn('⚠️ Unauthorized delete for everyone attempt:', {
        messageSender: message.senderId,
        currentUser: user?.id,
        messageId
      });
      showNotificationMessage('error', 'Only the message sender can delete for everyone!');
      return;
    }
    
    console.log('🔍 Message details:', {
      messageId,
      onDeleteMessage: !!onDeleteMessage,
      user: user?.id,
      selectedUser: selectedUser?.id
    });
    
    if (!onDeleteMessage) {
      console.error('❌ onDeleteMessage function is not available!');
      showNotificationMessage('error', 'Delete function not available!');
      return;
    }
    
    setDeletingMessage(messageId);
    
    // Show WhatsApp-style success message
    showNotificationMessage('success', '🗑️ Deleting message for everyone...');
    
    console.log('📞 Calling onDeleteMessage with:', messageId, 'for-everyone');
    onDeleteMessage(messageId, 'for-everyone');
    
    // Keep the deleting state for a moment to show loading
    setTimeout(() => {
      setDeletingMessage(null);
      showNotificationMessage('success', '✅ Message deleted for everyone successfully!');
    }, 2000);
  };

  // Function to handle delete for me
  const handleDeleteForMe = (messageId: string) => {
    console.log('👁️ Delete for me button clicked for message:', messageId);
    
    // Find the message to check if user is the sender
    const message = messages.find(m => m.id === messageId);
    if (!message) {
      console.error('❌ Message not found for deletion:', messageId);
      showNotificationMessage('error', 'Message not found!');
      return;
    }
    
    // Check if this is a temporary message using the tempId property
    if (message.tempId) {
      console.log('⚠️ Cannot delete temporary message for me:', messageId);
      showNotificationMessage('error', 'Cannot delete a message that is still being sent!');
      return;
    }
    
    // Validate that the current user is either sender or receiver
    if (message.senderId !== user?.id && message.receiverId !== user?.id) {
      console.warn('⚠️ Unauthorized delete for me attempt:', {
        messageSender: message.senderId,
        messageReceiver: message.receiverId,
        currentUser: user?.id,
        messageId
      });
      showNotificationMessage('error', 'You can only delete messages you sent or received!');
      return;
    }
    
    setDeletingMessage(messageId);
    
    // Show WhatsApp-style loading state
    showNotificationMessage('success', '👁️ Deleting message for you...');
    
    // Call the delete function
    onDeleteMessage?.(messageId, 'for-me');
    
    // Show success message after a short delay
    setTimeout(() => {
      showNotificationMessage('success', '✅ Message deleted for you successfully!');
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset deleting state when messages change
  useEffect(() => {
    setDeletingMessage(null);
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleReactionToggle = (messageId: string, reaction: string, userId: string) => {
    if (onReactionToggle) {
      onReactionToggle(messageId, reaction, userId);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (newMessage.trim()) {
          onSendMessage(newMessage.trim());
          setNewMessage('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [newMessage, onSendMessage]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showEmojiPicker && !target.closest('.emoji-picker')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!showSettingsMenu) {
      setShowContactInfo(false);
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (settingsMenuRef.current && target && !settingsMenuRef.current.contains(target)) {
        setShowSettingsMenu(false);
        setShowContactInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  const handleCloseChatFromSettings = () => {
    if (onCloseChat) {
      onCloseChat();
      setShowSettingsMenu(false);
      setShowContactInfo(false);
    }
  };

  const handleClearChatFromSettings = async () => {
    if (!onClearChat) {
      return;
    }

    try {
      setIsClearingChat(true);
      await onClearChat();
      showNotificationMessage('success', 'Chat cleared for you.');
      setShowSettingsMenu(false);
      setShowContactInfo(false);
    } catch (error) {
      console.error('❌ Error clearing chat:', error);
      showNotificationMessage('error', 'Failed to clear chat. Please try again.');
    } finally {
      setIsClearingChat(false);
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  // Filter messages to hide deleted ones
  const filteredMessages = messages.filter(message => {
    const isDeletedForMe = message.deletedFor?.includes(user.id);
    const isDeletedForEveryone = message.deletedForEveryone;
    
    // Debug logging for deletion flags
    if (isDeletedForMe || isDeletedForEveryone) {
      console.log(`🚫 Message ${message.id} filtered out:`, {
        messageId: message.id,
        text: message.text.substring(0, 50) + '...',
        deletedFor: message.deletedFor,
        deletedForEveryone: message.deletedForEveryone,
        currentUserId: user.id,
        isDeletedForMe,
        isDeletedForEveryone
      });
    }
    
    return !isDeletedForMe && !isDeletedForEveryone;
  });

  // Filter messages based on search query
  const searchFilteredMessages = searchQuery.trim() 
    ? filteredMessages.filter(message => 
        message.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredMessages;

  const messageGroups = groupMessagesByDate(searchFilteredMessages);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Success/Error Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          showNotification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{showNotification.type === 'success' ? '✅' : '❌'}</span>
            <span className="font-medium">{showNotification.message}</span>
            <button
              onClick={() => setShowNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Online</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <span>Sent</span>
                  <span className="text-blue-900 font-semibold">
                    {filteredMessages.filter(m => m.senderId === user.id).length}
                  </span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                  <span>Received</span>
                  <span className="text-pink-900 font-semibold">
                    {filteredMessages.filter(m => m.senderId !== user.id).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative flex items-center space-x-2" ref={settingsMenuRef}>
            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsMenu(prev => !prev)}
              className="p-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-blue-500 hover:text-purple-600 rounded-xl transition-all duration-200 hover:shadow-lg border border-transparent hover:border-purple-100"
              title="Chat settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="settings-gear-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path
                  stroke="url(#settings-gear-gradient)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke="url(#settings-gear-gradient)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-12 w-60 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20">
                <div className="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Quick actions
                </div>
                <button
                  onClick={() => setShowContactInfo(prev => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center space-x-3">
                    <span>📇</span>
                    <span>View contact</span>
                  </span>
                  <span className="text-xs text-gray-400">{showContactInfo ? 'Hide' : 'Show'}</span>
                </button>
                {showContactInfo && selectedUser && (
                  <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100 bg-gray-50">
                    <p className="font-semibold text-gray-900">{selectedUser.username}</p>
                    {selectedUser.email && (
                      <p className="text-xs text-gray-500 mt-1">{selectedUser.email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Status: {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                )}
                {onClearChat && (
                  <button
                    onClick={handleClearChatFromSettings}
                    disabled={isClearingChat}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 border-t border-gray-100 transition-colors ${
                      isClearingChat ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-3">
                      <span>🧹</span>
                      <span>Clear chat</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {isClearingChat ? 'Clearing…' : 'Keep inbox tidy'}
                    </span>
                  </button>
                )}
                {onCloseChat && (
                  <button
                    onClick={handleCloseChatFromSettings}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <span>🚪</span>
                    <span>Close chat</span>
                  </button>
                )}
                <div className="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 rounded-b-2xl">
                  More settings coming soon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-6">
        {/* Message Search Bar */}
        <div className="sticky top-0 z-10 mb-3">
          <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 shadow-sm w-full max-w-md mx-auto">
            <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search messages..."
              className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchQuery.trim() && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
            {searchQuery.trim() && (
              <div className="mt-1 text-xs text-gray-500">
                Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
        
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm text-gray-700 font-medium font-sans">{date}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {dateMessages.length} message{dateMessages.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-4">
                          {dateMessages
              .map((message, index) => {
                const isOwnMessage = message.senderId === user.id;
                
                // Ensure message has valid ID
                if (!message.id || message.id === 'undefined' || message.id === 'null') {
                  console.warn('⚠️ Message without valid ID found, skipping:', {
                    messageId: message.id,
                    messageIdType: typeof message.id
                  });
                  return null; // Skip rendering this message
                }
                
                // Ensure timestamp is a Date object and handle it safely
                const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
                // Use a combination of id, timestamp, and index for unique keys
                const uniqueKey = `${message.id || 'no-id'}-${timestamp.getTime()}-${index}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {/* Avatar for received messages */}
                      {!isOwnMessage && (
                        <div className="flex items-end space-x-2 mb-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md">
                            {selectedUser.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className="flex flex-col">
                        {/* User Avatar for other user's messages */}
                        {!isOwnMessage && (
                          <div className="flex items-end space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
                              {selectedUser.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{selectedUser.username}</span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md ${
                            deletingMessage === message.id
                              ? 'bg-yellow-100 border border-yellow-300 opacity-75 animate-pulse'
                              : isOwnMessage
                              ? message.tempId 
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white opacity-80'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Message Text */}
                          <div className="text-sm leading-relaxed font-sans">
                            {deletingMessage === message.id ? (
                              // Show deleting state
                              <span className="italic text-yellow-600 flex items-center space-x-2">
                                <span className="animate-spin">⏳</span>
                                <span>Deleting message...</span>
                              </span>
                            ) : (
                              <>
                                {message.text}
                                {message.tempId && (
                                  <span className="ml-2 text-xs opacity-70 flex items-center space-x-1">
                                    <span className="animate-pulse">⏳</span>
                                    <span>sending...</span>
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Timestamp, Status, and Actions */}
                        <div className={`flex items-center space-x-2 mt-2 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs font-sans text-gray-400">
                            <span title={`${formatDate(message.timestamp)} at ${formatTime(message.timestamp)}`}>
                              {formatTime(message.timestamp)}
                            </span>
                          </span>
                        </div>

                        {/* Lightweight Reaction Bar */}
                        {message.id && message.id !== 'undefined' && message.id !== 'null' && (
                          <div className="mt-3">
                            <ReactionBar
                              messageId={message.id}
                              userId={user.id}
                              currentReactions={message.reactions || {}}
                              onReactionToggle={handleReactionToggle}
                            />
                          </div>
                        )}
                        
                        {/* Delete Button - Always show for non-temporary messages */}
                        {(message.senderId === user.id || message.receiverId === user.id) && !message.tempId && (
                          <div className="flex space-x-2">
                            {/* Delete for Everyone - Only for sender */}
                            {isOwnMessage && (
                              <button
                                onClick={() => {
                                  if (onDeleteMessage) {
                                    onDeleteMessage(message.id, 'for-everyone');
                                  }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 transition-all duration-200 p-2 rounded-lg border border-red-200 hover:bg-red-50 hover:shadow-sm font-medium"
                                title="Delete for everyone"
                              >
                                🌍 Delete for everyone
                              </button>
                            )}
                            
                            {/* Delete for Me - Always available */}
                            <button
                              onClick={() => {
                                if (onDeleteMessage) {
                                  onDeleteMessage(message.id, 'for-me');
                                }
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 transition-all duration-200 p-2 rounded-lg border border-blue-200 hover:bg-blue-50 hover:shadow-sm font-medium"
                              title="Delete for me"
                            >
                              👁️ Delete for me
                            </button>

                            {/* Cancel - Always available for both sender and receiver */}
                            <button
                              onClick={() => {
                                // Cancel action - do nothing, just close any open modals or reset state
                                console.log('Cancel clicked - no action taken');
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 transition-all duration-200 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-sm font-medium"
                              title="Cancel - don't delete message"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        )}
                        
                        {/* Temporary Message Indicator */}
                        {message.tempId && (
                          <div className="text-xs text-gray-400 px-2 py-1 rounded-lg bg-gray-100 border border-gray-200" title="This message is still being sent and cannot be deleted">
                            ⏳ Sending...
                          </div>
                        )}
                      </div>


                    </div>
                  </div>
                );
              })
              .filter(Boolean)}
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">💬</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 font-sans">Start a conversation</h3>
            <p className="text-sm text-gray-500 font-sans">Send your first message to {selectedUser.username}</p>
          </div>
        )}
        
        {/* Search Results Empty State */}
        {searchQuery.trim() && filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
            <p className="text-sm text-gray-500">
              No messages match "{searchQuery}" in this conversation
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 p-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500 font-sans">{selectedUser.username} is typing...</span>
          </div>
        )}
        
        {/* Keyboard Shortcuts Info */}
        <div className="mt-4" />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="flex items-center space-x-3 p-4 bg-white border-t border-gray-200">
        {/* Emoji Picker Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          title="Add emoji"
        >
          😊
        </button>
        
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="emoji-picker absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <div className="grid grid-cols-6 gap-2 max-w-48">
              {['😊', '😂', '❤️', '👍', '😢', '😡', '🎉', '👏', '🔥', '💎', '⭐', '🚀', '🎯', '💯', '✨', '🌟', '💪', '🎊', '🎈', '🎁', '🍕', '☕', '🌺', '🌈'].map((emoji, index) => (
                <button
                  key={`emoji-${index}`}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-200 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Type a message to ${selectedUser?.username || 'someone'}...`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newMessage.trim()) {
              onSendMessage(newMessage.trim());
              setNewMessage('');
            }
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => {
            if (newMessage.trim()) {
              onSendMessage(newMessage.trim());
              setNewMessage('');
            }
          }}
          disabled={!newMessage.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Send
        </button>
      </div>

      {/* Forward modal removed for cleaner UI */}
      
      {/* Message Context Menu */}
      {/* This block is removed as context menu is no longer used */}
    </div>
  );
}
