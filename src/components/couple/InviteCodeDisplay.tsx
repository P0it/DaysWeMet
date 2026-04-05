"use client";

import { useState } from "react";

interface InviteCodeDisplayProps {
  code: string;
}

export default function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 text-center">
      <p className="text-sm text-text-secondary mb-3">
        Share this code with your partner
      </p>
      <p className="text-3xl font-mono font-bold text-accent tracking-widest mb-4">
        {code}
      </p>
      <button
        onClick={handleCopy}
        className="px-6 py-2 bg-primary text-background text-sm font-medium rounded-button hover:bg-primary-muted transition-colors"
      >
        {copied ? "Copied!" : "Copy Code"}
      </button>
    </div>
  );
}
