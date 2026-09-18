"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, MessageSquare, ArrowLeft, Send, Paperclip, Trash2, Check, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { addMessageAction, deleteMessageAction } from "@/lib/actions";

const getContactStatus = (c: any, currentUser: any) => {
  if (currentUser?.hideOnlineStatus) return null;
  if (c.hideOnlineStatus) return null;
  
  const isOnline = !!c.isOnline;
  if (isOnline) {
    return (
      <>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">En ligne</p>
      </>
    );
  }
  const idNum = parseInt(c.id) || c.name.length;
  const minsAgo = (idNum % 1440) + 15;
  const date = new Date(Date.now() - minsAgo * 60000);
  return <p className="text-xs text-neutral-500 dark:text-neutral-400">Dernière connexion: {date.toLocaleDateString()} à {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>;
};

export default function ChatUI({ initialMessages, tenants }: { initialMessages: any[], tenants: any[] }) {
  const {  user: currentUser, getAllUsers , logActivity } = useUser();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages, activeChat]);

  if (!currentUser) return null;

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const usersDB = getAllUsers();
  const contacts = [
    ...usersDB.map((u: any) => ({ 
      id: u.id, 
      name: u.name, 
      type: u.role, 
      role: u.role, hideOnlineStatus: u.hideOnlineStatus,
      isTeam: true, projectId: undefined,
      avatar: u.avatar || getInitials(u.name),
      color: "from-blue-500 to-indigo-600"
    })),
    ...tenants.map((t: any) => ({ 
      id: t.id, 
      name: t.name, 
      type: "Locataire", 
      role: "Locataire",
      isTeam: false, projectId: t.projectId,
      avatar: getInitials(t.name),
      color: "from-emerald-500 to-teal-600"
    }))
  ];

  const activeContact = contacts.find(c => c.id === activeChat);
  
  const chatHistory = initialMessages.filter(m => {
    if (activeContact?.type === "project") {
      return m.projectId === activeContact.projectId;
    } else if (activeContact?.type === "direct" || activeContact) {
      return m.projectId === null && (
        (m.sender === currentUser.id && m.recipient === activeContact.id) ||
        (m.sender === activeContact.id && m.recipient === currentUser.id)
      );
    }
    return false;
  }).map(m => ({
    ...m,
    isMe: m.sender === currentUser.id
  }));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeContact) return;

    const formData = new FormData();
    formData.append("sender", currentUser.id);
    formData.append("content", message.trim());
    
    if (activeContact.type === "project") {
      formData.append("projectId", activeContact.projectId);
    } else {
      formData.append("recipient", activeContact.id);
    }

    setMessage("");
    await addMessageAction(formData);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce message ?")) {
      await deleteMessageAction(id);
    }
  };

  const filteredNewContacts = contacts.filter(c => 
    c.id !== currentUser.id && 
    c.name.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 max-w-6xl h-[calc(100vh-100px)] pt-4 flex gap-6">
      
      {/* Sidebar */}
      <div className={`w-full lg:w-80 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Messages</h1>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..." 
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 bg-neutral-50 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            {['all', 'projects', 'direct'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                {f === 'all' ? 'Tout' : f === 'projects' ? 'Projets' : 'Direct'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {contacts.filter(c => c.id !== currentUser.id && (filter === 'all' || (filter==='projects' && c.type==='project') || (filter==='direct' && c.type!=='project')) && (!searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()))).map(contact => (
              <motion.button 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                key={contact.id}
                onClick={() => setActiveChat(contact.id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left ${activeChat === contact.id ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}
              >
                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm bg-gradient-to-tr ${contact.color} overflow-hidden`}>
                    {contact.avatar?.startsWith('data:image') ? <img src={contact.avatar} className="w-full h-full object-cover" alt="avatar" /> : contact.avatar}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{contact.name}</h3>
                  </div>
                  <p className="text-sm truncate text-neutral-500 dark:text-neutral-400">
                    {contact.role}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat && activeContact ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="h-16 px-4 md:px-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center z-10 sticky top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveChat(null)}
                className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className={`h-10 w-10 bg-gradient-to-tr ${activeContact.color} rounded-lg flex items-center justify-center text-white font-medium text-sm hidden sm:flex overflow-hidden`}>
                {activeContact.avatar?.startsWith('data:image') ? <img src={activeContact.avatar} className="w-full h-full object-cover" alt="avatar" /> : activeContact.avatar}
              </div>
              <div>
                <h2 className="font-bold text-neutral-900 dark:text-white leading-tight">{activeContact.name}</h2>
                <div className="flex items-center gap-1.5">
                  {getContactStatus(activeContact, currentUser)}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-neutral-50/30 dark:bg-neutral-950/30">
            {chatHistory.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-neutral-400">
                <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-indigo-500" />
                </div>
                <p>Aucun message. Commencez la discussion !</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {chatHistory.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={msg.id} 
                    className={`flex flex-col group ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2">
                      {msg.isMe && (
                        <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all mb-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {!msg.isMe && (
                         <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${activeContact.color} flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden mb-1`}>
                            {activeContact.avatar?.startsWith('data:image') ? <img src={activeContact.avatar} className="w-full h-full object-cover" alt="avatar" /> : activeContact.avatar}
                         </div>
                      )}

                      <div className={`px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[70%] ${
                        msg.isMe 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-sm border border-neutral-200 dark:border-neutral-700/50'
                      }`}>
                        <p className="text-[14px] leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'mr-2' : 'ml-12'}`}>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {msg.isMe && !currentUser?.hideOnlineStatus && new Date(msg.date).getTime() < Date.now() - 60000 && (
                        <span className="text-[10px] text-indigo-500 font-medium ml-1 flex items-center gap-1">
                          <CheckCheck className="h-3 w-3" />
                          Vu le {new Date(new Date(msg.date).getTime() + 60000).toLocaleDateString()} à {new Date(new Date(msg.date).getTime() + 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                      {msg.isMe && (currentUser?.hideOnlineStatus || new Date(msg.date).getTime() >= Date.now() - 60000) && (
                        <Check className="h-3 w-3 text-neutral-400 ml-1" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <button type="button" className="p-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-transparent focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl relative flex items-center min-h-[48px] transition-all">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrire un message..." 
                  className="w-full bg-transparent px-4 py-3 outline-none text-sm dark:text-white"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!message.trim()}
                className={`p-3 rounded-xl transition-all flex-shrink-0 shadow-sm flex items-center justify-center ${
                  message.trim() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 shadow-lg scale-100' 
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 scale-95'
                }`}
              >
                <Send className="h-5 w-5 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 border border-indigo-100 dark:border-indigo-500/20">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Messagerie</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm text-center text-sm">
              Sélectionnez un projet ou un collaborateur pour échanger en toute sécurité.
            </p>
          </motion.div>
        </div>
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-[9999] z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nouvelle discussion</h3>
                <button onClick={() => setShowNewChatModal(false)} className="p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full text-neutral-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Chercher un contact..." 
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredNewContacts.length === 0 ? (
                  <p className="text-center text-sm text-neutral-500 py-6">Aucun contact trouvé.</p>
                ) : (
                  filteredNewContacts.map(contact => (
                    <button 
                      key={contact.id}
                      onClick={() => {
                        setActiveChat(contact.id);
                        setShowNewChatModal(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors text-left"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm bg-gradient-to-tr ${contact.color} overflow-hidden`}>
                        {contact.avatar?.startsWith('data:image') ? <img src={contact.avatar} className="w-full h-full object-cover" alt="avatar" /> : contact.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">{contact.name}</h4>
                        <p className="text-xs text-neutral-500">{contact.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
