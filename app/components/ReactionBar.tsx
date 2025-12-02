'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactionSender from './ReactionSender';

interface ReactionBarProps {
  messageId: string;
  userId: string;
  currentReactions: Record<string, string>;
  onReactionToggle: (messageId: string, reaction: string, userId: string) => void;
}

const EMOJI_LABELS: Record<string, string> = {
  '👍': 'Like',
  '❤️': 'Love',
  '😂': 'Laugh',
  '😊': 'Smile',
  '😮': 'Surprised',
  '😢': 'Sad',
  '😡': 'Angry',
  '🎉': 'Celebrate',
  '🔥': 'Fire',
  '💯': '100',
  '👏': 'Clap',
  '🙏': 'Pray',
  '🤔': 'Thinking',
  '😴': 'Sleepy',
  '🤮': 'Sick',
  '💪': 'Strong',
  '🎯': 'Target',
  '🚀': 'Rocket',
  '⭐': 'Star',
  '💎': 'Diamond'
};

const ReactionBar: React.FC<ReactionBarProps> = ({
  messageId,
  userId,
  currentReactions,
  onReactionToggle
}) => {
  const [localReactions, setLocalReactions] = useState<Record<string, string>>(currentReactions || {});
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  useEffect(() => {
    setLocalReactions(currentReactions || {});
  }, [currentReactions]);

  const isUserReaction = (reaction: string) => {
    if (!localReactions || typeof localReactions !== 'object') return false;
    return localReactions[userId] === reaction;
  };

  const aggregatedReactions = useMemo(() => {
    if (!localReactions) return [];
    const summary = Object.entries(localReactions).reduce((acc, [, reaction]) => {
      if (!reaction) return acc;
      if (!acc[reaction]) {
        acc[reaction] = { count: 0 };
      }
      acc[reaction].count += 1;
      return acc;
    }, {} as Record<string, { count: number }>);

    return Object.entries(summary).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      label: EMOJI_LABELS[emoji] || 'Custom'
    }));
  }, [localReactions]);

  const handleReactionToggle = (reaction: string) => {
    if (!messageId || messageId === 'undefined' || messageId === 'null') {
      console.error('ReactionBar: Invalid messageId for reaction:', messageId);
      return;
    }

    const newReactions = { ...localReactions };
    if (isUserReaction(reaction)) {
      delete newReactions[userId];
    } else {
      newReactions[userId] = reaction;
    }
    setLocalReactions(newReactions);
    onReactionToggle(messageId, reaction, userId);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-sm">
        {aggregatedReactions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {aggregatedReactions.map(({ emoji, count, label }) => (
              <button
                key={`reaction-pill-${emoji}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactionToggle(emoji);
                }}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow ${
                  isUserReaction(emoji)
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
                title={`${label} • Tap to ${isUserReaction(emoji) ? 'remove' : 'add'}`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-xs font-semibold rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                  {count}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Be the first to react</span>
            <span className="text-base">✨</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionPicker(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105"
          >
            <span>➕</span>
            <span>Add Reaction</span>
          </button>

          {localReactions && Object.keys(localReactions).length > 0 && (
            <span className="text-xs text-gray-400">
              {Object.keys(localReactions).length} total reaction{Object.keys(localReactions).length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <ReactionSender
        isVisible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSendReaction={(reaction) => {
          handleReactionToggle(reaction);
          setShowReactionPicker(false);
        }}
      />
    </div>
  );
};

export default ReactionBar;
