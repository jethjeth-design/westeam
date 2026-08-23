import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Index({
    conversations = [],
    activeConversation = null,
    messages = [],
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [search, setSearch] = useState('');
    const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'direct', 'team'
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const form = useForm({
        body: '',
        attachment: null,
    });

    const [attachmentPreview, setAttachmentPreview] = useState(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            form.setData('attachment', file);
            if (file.type.startsWith('image/')) {
                setAttachmentPreview(URL.createObjectURL(file));
            } else {
                setAttachmentPreview({ name: file.name, type: file.type });
            }
        }
    };

    const clearAttachment = () => {
        form.setData('attachment', null);
        setAttachmentPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!form.data.body || !form.data.body.trim()) && !form.data.attachment) return;

        form.post(route('messages.store', activeConversation.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body', 'attachment');
                setAttachmentPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    // Filter conversations
    const filteredConversations = conversations.filter((c) => {
        const matchesSearch =
            !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.other_participants?.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));

        const matchesTab =
            selectedTab === 'all' ||
            (selectedTab === 'direct' && c.type === 'direct') ||
            (selectedTab === 'team' && (c.type === 'team_internal' || c.type === 'team_coordinator'));

        return matchesSearch && matchesTab;
    });

    return (
        <DashboardLayout>
            <Head title="Messages - Westeam" />

            <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden bg-slate-50">
                {/* Conversations Sidebar Pane */}
                <div className={`w-full lg:w-96 flex flex-col border-r border-slate-200 bg-white ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="border-b border-slate-100 p-5">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                                💬 Messages
                            </h1>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)} unread
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative mt-4">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search messages or suppliers..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1">
                            {[
                                { label: 'All', value: 'all' },
                                { label: 'Direct', value: 'direct' },
                                { label: 'Team Chats', value: 'team' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setSelectedTab(tab.value)}
                                    className={`flex-1 rounded-lg py-1.5 text-center text-xs font-bold transition ${
                                        selectedTab === tab.value
                                            ? 'bg-white text-indigo-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const isActive = activeConversation?.id === conv.id;
                                const otherUser = conv.other_participants?.[0];

                                return (
                                    <Link
                                        key={conv.id}
                                        href={route('messages.index', { conversation: conv.id })}
                                        className={`flex items-start gap-3.5 p-4 transition duration-150 ${
                                            isActive
                                                ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                                                : 'hover:bg-slate-50/80'
                                        }`}
                                    >
                                        {/* Avatar / Icon */}
                                        <div className="relative shrink-0">
                                            {conv.type === 'team_internal' ? (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 font-bold text-base shadow-xs">
                                                    👥
                                                </div>
                                            ) : conv.type === 'team_coordinator' ? (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-base shadow-xs">
                                                    ⭐
                                                </div>
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm shadow-xs overflow-hidden">
                                                    {otherUser?.avatar ? (
                                                        <img src={otherUser.avatar} alt={otherUser.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        otherUser?.name?.charAt(0) || '👤'
                                                    )}
                                                </div>
                                            )}

                                            {conv.unread_count > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-extrabold text-white">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="truncate text-xs font-bold text-slate-900">
                                                    {conv.title}
                                                </h3>
                                                {conv.latest_message && (
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {conv.latest_message.created_at}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex items-center justify-between">
                                                <p className="truncate text-xs text-slate-500">
                                                    {conv.latest_message ? (
                                                        <>
                                                            <span className="font-semibold text-slate-700">
                                                                {conv.latest_message.sender_name}:{' '}
                                                            </span>
                                                            {conv.latest_message.has_attachment && '📎 '}
                                                            {conv.latest_message.body || 'Attachment'}
                                                        </>
                                                    ) : (
                                                        <span className="italic text-slate-400">No messages yet</span>
                                                    )}
                                                </p>

                                                {conv.type === 'team_internal' && (
                                                    <span className="shrink-0 rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                                                        Team Internal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400">
                                No conversations found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Chat Conversation Area */}
                <div className={`flex-1 flex flex-col h-full bg-slate-50/60 ${!activeConversation ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.get(route('messages.index'))}
                                        className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                                    >
                                        ←
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm">
                                            {activeConversation.type === 'team_internal' ? '👥' : '💬'}
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                                                {activeConversation.title}
                                            </h2>
                                            <p className="text-[11px] text-slate-400">
                                                {activeConversation.type === 'team_internal'
                                                    ? '🔒 Internal Team Collaboration'
                                                    : activeConversation.type === 'team_coordinator'
                                                    ? '⭐ Customer & Team Coordinator Chat'
                                                    : '💬 Direct Messaging'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {activeConversation.team && (
                                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                        Team: {activeConversation.team.name}
                                    </span>
                                )}
                            </div>

                            {/* Message Stream */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                                                <span className="font-bold text-slate-700">{msg.sender_name}</span>
                                                <span>•</span>
                                                <span>{msg.created_at}</span>
                                            </div>

                                            <div
                                                className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                                                    msg.is_me
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                                                }`}
                                            >
                                                {/* Text Body */}
                                                {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}

                                                {/* Attachment */}
                                                {msg.attachment_url && (
                                                    <div className="mt-2.5">
                                                        {msg.attachment_type?.startsWith('image/') ? (
                                                            <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
                                                                <img
                                                                    src={msg.attachment_url}
                                                                    alt={msg.attachment_name || 'Attachment'}
                                                                    className="max-h-60 rounded-xl object-cover hover:opacity-95"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={msg.attachment_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`inline-flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold underline ${
                                                                    msg.is_me ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-600'
                                                                }`}
                                                            >
                                                                <span>📎</span>
                                                                <span className="truncate max-w-xs">{msg.attachment_name || 'Download file'}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <span className="text-4xl">👋</span>
                                        <p className="mt-2 text-sm font-bold text-slate-700">Start the conversation</p>
                                        <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                                            Send a message, discuss booking requirements, schedules, or share attachments.
                                        </p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Composer */}
                            <div className="border-t border-slate-200 bg-white p-4">
                                {attachmentPreview && (
                                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-2.5">
                                        {typeof attachmentPreview === 'string' ? (
                                            <img src={attachmentPreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                                        ) : (
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg">
                                                📄
                                            </span>
                                        )}
                                        <div className="flex-1 text-xs">
                                            <p className="font-bold text-slate-800">
                                                {form.data.attachment?.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400">Ready to upload</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearAttachment}
                                            className="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.zip"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
                                        title="Attach photo or document"
                                    >
                                        📎
                                    </button>

                                    <input
                                        type="text"
                                        value={form.data.body}
                                        onChange={(e) => form.setData('body', e.target.value)}
                                        placeholder="Type your message here..."
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                                    >
                                        <span>Send</span>
                                        <span>➤</span>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl">
                                💬
                            </div>
                            <h3 className="mt-4 text-base font-extrabold text-slate-900">
                                Select a conversation
                            </h3>
                            <p className="mt-1 text-xs text-slate-400 max-w-sm">
                                Choose a supplier, customer, or internal team collaboration channel from the left to start messaging.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
