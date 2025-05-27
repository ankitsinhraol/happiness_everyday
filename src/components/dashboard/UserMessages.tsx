import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Send, ChevronRight, ChevronLeft, Search, User } from 'lucide-react';

const UserMessages: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  
  // Mock conversations data - in a real app, this would come from Supabase
  const mockConversations = [
    {
      id: '1',
      vendorId: '101',
      vendorName: 'Royal Caterers',
      vendorImage: 'https://images.pexels.com/photos/5779787/pexels-photo-5779787.jpeg',
      lastMessage: 'Yes, we can definitely accommodate your dietary requirements.',
      lastMessageTime: '10:45 AM',
      unread: true,
      messages: [
        {
          id: 'm1',
          sender: 'vendor',
          text: 'Hello! Thank you for your inquiry about our catering services for your wedding.',
          time: '9:30 AM'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Hi! Yes, we\'re planning a wedding for 150 guests on September 15, 2025. Do you have availability?',
          time: '9:45 AM'
        },
        {
          id: 'm3',
          sender: 'vendor',
          text: 'We do have availability on that date! Would you like to discuss menu options?',
          time: '10:00 AM'
        },
        {
          id: 'm4',
          sender: 'user',
          text: 'That would be great. We have some guests with dietary restrictions (vegetarian and gluten-free). Can you accommodate that?',
          time: '10:30 AM'
        },
        {
          id: 'm5',
          sender: 'vendor',
          text: 'Yes, we can definitely accommodate your dietary requirements.',
          time: '10:45 AM'
        }
      ]
    },
    {
      id: '2',
      vendorId: '102',
      vendorName: 'ClickPerfect Photography',
      vendorImage: 'https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg',
      lastMessage: 'I\'ve sent you our portfolio via email. Please check and let me know your thoughts.',
      lastMessageTime: 'Yesterday',
      unread: false,
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'Hi, I\'m interested in your photography services for my wedding.',
          time: 'Yesterday'
        },
        {
          id: 'm2',
          sender: 'vendor',
          text: 'Hello! Thank you for reaching out. I\'d be happy to discuss your wedding photography needs.',
          time: 'Yesterday'
        },
        {
          id: 'm3',
          sender: 'user',
          text: 'Great! Can you share some examples of your wedding photography?',
          time: 'Yesterday'
        },
        {
          id: 'm4',
          sender: 'vendor',
          text: 'I\'ve sent you our portfolio via email. Please check and let me know your thoughts.',
          time: 'Yesterday'
        }
      ]
    },
    {
      id: '3',
      vendorId: '103',
      vendorName: 'Grand Celebrations Venue',
      vendorImage: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
      lastMessage: 'We look forward to hosting your corporate event!',
      lastMessageTime: '2 days ago',
      unread: false,
      messages: [
        {
          id: 'm1',
          sender: 'vendor',
          text: 'Thank you for booking our venue for your corporate event.',
          time: '2 days ago'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'You\'re welcome! We\'re excited about it. Is there anything specific we need to prepare?',
          time: '2 days ago'
        },
        {
          id: 'm3',
          sender: 'vendor',
          text: 'We\'ll handle most of the setup. Just send us your schedule and any branding materials if needed.',
          time: '2 days ago'
        },
        {
          id: 'm4',
          sender: 'user',
          text: 'Perfect, I\'ll send those over by next week.',
          time: '2 days ago'
        },
        {
          id: 'm5',
          sender: 'vendor',
          text: 'We look forward to hosting your corporate event!',
          time: '2 days ago'
        }
      ]
    }
  ];
  
  const activeConversation = mockConversations.find(c => c.id === activeConversationId) || null;
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, you would save the message to Supabase here
    setNewMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleMobileView = () => {
    setShowMobileList(!showMobileList);
  };
  
  return (
    <div>
      <div className="md:flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <div className="relative mt-2 md:mt-0 max-w-xs">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full py-2 pl-9 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
      
      {/* Mobile Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={toggleMobileView}
          className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400"
        >
          {showMobileList ? (
            <>
              <ChevronRight size={16} />
              {activeConversation && `View conversation with ${activeConversation.vendorName}`}
            </>
          ) : (
            <>
              <ChevronLeft size={16} />
              Back to messages list
            </>
          )}
        </button>
      </div>
      
      <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 h-[600px]">
        {/* Conversations List */}
        <div className={`w-full md:w-1/3 md:block border-r border-gray-200 dark:border-gray-700 ${showMobileList ? 'block' : 'hidden'}`}>
          <div className="h-full flex flex-col">
            <div className="overflow-y-auto flex-1">
              {mockConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversationId(conversation.id);
                    setShowMobileList(false);
                  }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition ${
                    activeConversationId === conversation.id ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                  } ${conversation.unread ? 'border-l-4 border-purple-600 dark:border-purple-400' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={conversation.vendorImage}
                        alt={conversation.vendorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.unread && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-purple-600 rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold ${conversation.unread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {conversation.vendorName}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{conversation.lastMessageTime}</span>
                      </div>
                      <p className={`text-sm truncate ${conversation.unread ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Conversation Area */}
        <div className={`w-full md:w-2/3 flex flex-col ${showMobileList ? 'hidden' : 'block'} md:block`}>
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <img
                  src={activeConversation.vendorImage}
                  alt={activeConversation.vendorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{activeConversation.vendorName}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} className="mr-1" />
                    <span>Usually responds within 1 hour</span>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:text-white resize-none h-12"
                  ></textarea>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`ml-2 p-2 rounded-full ${
                      newMessage.trim()
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    } transition`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <User size={32} className="text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessages;