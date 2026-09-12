'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { 
    Search, Plus, Paperclip, Smile, Send, 
    Bold, Italic, Underline, Link2, List, MoreVertical, X, Phone,
    Edit, Trash2
} from 'lucide-react';

export default function WhatsAppChat() {
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [editContact, setEditContact] = useState({ _id: '', name: '', phone: '' });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const activeChatRef = useRef(activeChat);

    // Keep activeChatRef updated so setInterval can access the current active chat
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        fetchContacts();

        // Polling for contacts and active chat messages every 5 seconds
        const intervalId = setInterval(() => {
            fetchContacts();
            if (activeChatRef.current) {
                fetchMessages(activeChatRef.current._id, false);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    const fetchContacts = async () => {
        try {
            const res = await api.get('/whatsapp/contacts');
            setContacts(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchMessages = async (contactId, scroll = true) => {
        try {
            const res = await api.get(`/whatsapp/contacts/${contactId}/messages`);
            const messages = Array.isArray(res) ? res : (res.data || []);
            
            // Only update if it's still the active chat
            if (activeChatRef.current && activeChatRef.current._id === contactId) {
                setActiveChat(prev => ({
                    ...prev,
                    messages
                }));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleContactClick = async (contact) => {
        setActiveChat(contact);
        await fetchMessages(contact._id);
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            await api.post('/whatsapp/contacts', newContact);
            setNewContact({ name: '', phone: '' });
            setShowAddModal(false);
            fetchContacts();
        } catch (error) {
            console.error('Error adding contact:', error);
            alert(error.message || 'Failed to add contact');
        }
    };

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/whatsapp/contacts/${editContact._id}`, {
                name: editContact.name,
                phone: editContact.phone
            });
            setShowEditModal(false);
            fetchContacts();
            
            if (activeChat?._id === editContact._id) {
                setActiveChat(prev => ({
                    ...prev,
                    name: editContact.name,
                    phone: editContact.phone
                }));
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            alert(error.message || 'Failed to update contact');
        }
    };

    const handleDeleteContact = async (contactId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        
        try {
            await api.delete(`/whatsapp/contacts/${contactId}`);
            if (activeChat?._id === contactId) {
                setActiveChat(null);
            }
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Failed to delete contact');
        }
    };

    const openEditModal = (contact, e) => {
        e.stopPropagation();
        setEditContact(contact);
        setShowEditModal(true);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !activeChat) return;
        
        try {
            const currentText = messageText;
            setMessageText('');
            
            // Optimistic update
            const newMessage = { 
                _id: Date.now().toString(), 
                sender: 'admin', 
                text: currentText,
                status: 'pending'
            };
            
            setActiveChat(prev => ({
                ...prev,
                messages: [...(prev.messages || []), newMessage]
            }));
            
            await api.post('/whatsapp/messages', { 
                contactId: activeChat._id, 
                text: currentText 
            });
            
            // Fetch messages to get the real message object and updated status
            fetchMessages(activeChat._id);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        try {
            // Optimistic update
            setActiveChat(prev => ({
                ...prev,
                messages: prev.messages.filter(m => m._id !== msgId)
            }));
            
            await api.delete(`/whatsapp/messages/${msgId}`);
        } catch (error) {
            console.error('Error deleting message:', error);
            // Revert on failure
            if (activeChat) fetchMessages(activeChat._id, false);
        }
    };

    const EMOJIS = ['😀','😂','🥰','😎','🤔','👍','🙏','🎉','🔥','❤️'];

    const onEmojiClick = (emoji) => {
        setMessageText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const renderStatus = (status) => {
        if (!status) return null;
        if (status === 'pending') return <span className="text-[10px] ml-1.5 opacity-70">◷</span>;
        if (status === 'sent') return <span className="text-[10px] ml-1.5 opacity-80">✓</span>;
        if (status === 'delivered') return <span className="text-[10px] ml-1.5 opacity-80">✓✓</span>;
        if (status === 'read') return <span className="text-[10px] ml-1.5 text-blue-200">✓✓</span>;
        if (status === 'failed') return <span className="text-[10px] ml-1.5 text-red-300 font-bold">!</span>;
        return null;
    };

    return (
        <div className="flex h-full min-h-[calc(100vh-6rem)] bg-zinc-50 text-zinc-950 p-4 gap-4">
            {/* Left Column: Chat List */}
            <div className="w-80 bg-white border border-zinc-200 rounded-lg flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-200 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold tracking-tight">WhatsApp</h2>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-zinc-900 hover:bg-zinc-600 text-white p-1.5 px-3 rounded-md flex items-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            <Plus size={16} /> NEW CHAT
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search contacts..." 
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-md py-2 pl-9 pr-4 text-sm text-zinc-950 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {contacts.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">No contacts found</div>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact._id} 
                                onClick={() => handleContactClick(contact)}
                                className={`group p-4 border-b border-zinc-200/50 cursor-pointer hover:bg-zinc-100 transition-colors flex justify-between items-center ${activeChat?._id === contact._id ? 'bg-zinc-100 border-l-4 border-l-zinc-900' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div>
                                    <div className="font-medium text-sm">{contact.name}</div>
                                    <div className="text-xs text-zinc-500 mt-1">{contact.phone}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                        <button 
                                            onClick={(e) => openEditModal(contact, e)}
                                            className="p-1.5 text-zinc-500 hover:text-zinc-600 hover:bg-zinc-700/50 rounded-md transition-colors"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteContact(contact._id, e)}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700/50 rounded-md transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    {contact.unreadCount > 0 && (
                                        <div className="bg-zinc-600 rounded-full px-2 py-0.5 text-xs text-white font-medium">
                                            {contact.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className="flex-1 bg-white border border-zinc-200 rounded-lg flex flex-col overflow-hidden relative shadow-sm">
                {!activeChat ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                <Phone size={32} className="text-zinc-600" />
                            </div>
                            <p className="text-base font-medium">Select a contact to start messaging</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-white/80">
                            <div>
                                <h3 className="font-semibold text-base">{activeChat.name}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">{activeChat.phone}</p>
                            </div>
                            <button className="text-zinc-500 hover:text-zinc-950 transition-colors p-2 rounded-md hover:bg-zinc-900">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-zinc-50/50">
                            {(activeChat.messages || []).map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`group flex ${isAdmin ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                                        {isAdmin && (
                                            <button 
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-md transition-all"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <div className={`max-w-[75%] px-4 py-2 text-sm shadow-sm ${
                                            isAdmin 
                                                ? 'bg-zinc-900 text-white rounded-2xl rounded-br-sm' 
                                                : 'bg-white border border-zinc-200 text-zinc-900 rounded-2xl rounded-bl-sm'
                                        }`}>
                                            <div className="flex items-end gap-2">
                                                <span className="break-words">{msg.text}</span>
                                                {isAdmin && (
                                                    <span className="shrink-0 mb-[-2px]">
                                                        {renderStatus(msg.status || 'sent')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!isAdmin && (
                                            <button 
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-md transition-all"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-200 bg-white">
                            <div className="border border-zinc-700 rounded-xl bg-zinc-50 flex flex-col overflow-visible relative focus-within:border-zinc-600 transition-colors shadow-sm">
                                {/* Cosmetic Toolbar */}
                                <div className="flex items-center gap-2 p-2 px-3 border-b border-zinc-200 text-zinc-500 bg-white/50 rounded-t-xl">
                                    <button className="hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded transition-colors"><Bold size={14} /></button>
                                    <button className="hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded transition-colors"><Italic size={14} /></button>
                                    <button className="hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded transition-colors"><Underline size={14} /></button>
                                    <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                                    <button className="hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded transition-colors"><Link2 size={14} /></button>
                                    <button className="hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded transition-colors"><List size={14} /></button>
                                </div>
                                
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="w-full bg-transparent p-4 text-sm text-zinc-950 focus:outline-none resize-none min-h-[80px]"
                                />
                                
                                <div className="flex items-center justify-between p-2 px-3 bg-white/30 rounded-b-xl">
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                            title="Attach File"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className={`p-2 hover:bg-zinc-100 rounded-lg transition-colors ${showEmojiPicker ? 'text-zinc-600' : 'text-zinc-500 hover:text-zinc-600'}`}
                                                title="Add Emoji"
                                            >
                                                <Smile size={18} />
                                            </button>
                                            
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-full left-0 mb-3 bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 z-10 w-56">
                                                    {EMOJIS.map(emoji => (
                                                        <button 
                                                            key={emoji}
                                                            onClick={() => onEmojiClick(emoji)}
                                                            className="hover:bg-zinc-700 p-1.5 rounded-lg text-xl transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!messageText.trim()}
                                        className="bg-zinc-900 hover:bg-zinc-600 disabled:bg-zinc-900 disabled:text-zinc-500 text-white p-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
                                    >
                                        Send <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold tracking-tight">New Contact</h3>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="text-zinc-500 hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded-md transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddContact} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 mb-1.5">Name</label>
                                <input 
                                    type="text"
                                    value={newContact.name}
                                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-950 focus:outline-none focus:border-zinc-600 transition-colors"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 mb-1.5">WhatsApp Number</label>
                                <input 
                                    type="text"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-950 focus:outline-none focus:border-zinc-600 transition-colors"
                                    placeholder="e.g. +923000000000"
                                />
                            </div>
                            
                            <div className="mt-4 flex justify-end gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Contact Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold tracking-tight">Edit Contact</h3>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="text-zinc-500 hover:text-zinc-950 hover:bg-zinc-900 p-1.5 rounded-md transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateContact} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 mb-1.5">Name</label>
                                <input 
                                    type="text"
                                    value={editContact.name}
                                    onChange={e => setEditContact({...editContact, name: e.target.value})}
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-950 focus:outline-none focus:border-zinc-600 transition-colors"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-500 mb-1.5">WhatsApp Number</label>
                                <input 
                                    type="text"
                                    value={editContact.phone}
                                    onChange={e => setEditContact({...editContact, phone: e.target.value})}
                                    required
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-950 focus:outline-none focus:border-zinc-600 transition-colors"
                                    placeholder="e.g. +923000000000"
                                />
                            </div>
                            
                            <div className="mt-4 flex justify-end gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Update Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
