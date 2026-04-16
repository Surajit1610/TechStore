"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IconSend, IconSpeakerphone, IconLoader2, IconUsers } from '@tabler/icons-react';

export default function BroadcastPage() {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || message.trim() === '') {
            toast.error("Message cannot be empty!");
            return;
        }

        const confirmBroadcast = window.confirm("Are you sure you want to send this message to ALL registered customers? This action cannot be undone.");
        if (!confirmBroadcast) return;

        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/company/notification/broadcast', { message });
            toast.success(`Successfully sent to ${res.data.count} customers!`);
            setMessage('');
        } catch (error) {
            console.error("Broadcast failed:", error);
            toast.error("Failed to broadcast message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[70vh]">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <IconSpeakerphone size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Broadcast Alerts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Send marketing updates, sales, and announcements to all users.</p>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-10 mb-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <IconSpeakerphone size={200} />
                </div>
                
                <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            Notification Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g., Flash Sale! Get 20% off all laptops for the next 48 hours. Happy shopping!"
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                            <IconUsers size={14} /> This message will instantly appear on the Navbar of all registered clients.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || message.trim() === ''}
                            className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    Broadcasting...
                                </>
                            ) : (
                                <>
                                    <IconSend size={18} />
                                    Send Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
