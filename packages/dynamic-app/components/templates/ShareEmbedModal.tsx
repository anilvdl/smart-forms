import React, { useState, useEffect } from 'react';
import { X, Copy, Lock, Unlock, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './ShareEmbedModal.module.css';

interface ShareEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  version: number;
  formTitle: string;
}

interface ShareInfo {
  shareUrl: string;
  embedCode: {
    html: string;
    iframe: string;
    nodejs: string;
  };
  shortCode: string;
  isPublic: boolean;
}

export default function ShareEmbedModal({
  isOpen,
  onClose,
  formId,
  version,
  formTitle
}: ShareEmbedModalProps) {
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'embed'>('share');
  const [embedType, setEmbedType] = useState<'html' | 'iframe' | 'nodejs'>('html');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  useEffect(() => {
    if (isOpen && formId) {
      fetchShareInfo();
    }
  }, [isOpen, formId, version]);

  const fetchShareInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/designer/${formId}/${version}/share`);
      if (!response.ok) throw new Error('Failed to fetch share info');
      
      const data = await response.json();
      setShareInfo(data);
    } catch (error) {
      console.error('Error fetching share info:', error);
      toast.error('Failed to load share information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      toast.success('Copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const togglePrivacy = async () => {
    if (!shareInfo) return;
    
    setIsUpdatingPrivacy(true);
    try {
      const response = await fetch(`/api/forms/designer/${formId}/${version}/privacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !shareInfo.isPublic })
      });
      
      if (!response.ok) throw new Error('Failed to update privacy');
      
      const data = await response.json();
      setShareInfo({ ...shareInfo, isPublic: data.isPublic });
      toast.success(`Form is now ${data.isPublic ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('Failed to update form privacy');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Share & Embed</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading share information...</div>
        ) : shareInfo ? (
          <>
            {/* Form Title & Privacy */}
            <div className={styles.formInfo}>
              <h3>{formTitle}</h3>
              <button
                className={`${styles.privacyToggle} ${shareInfo.isPublic ? styles.public : styles.private}`}
                onClick={togglePrivacy}
                disabled={isUpdatingPrivacy}
              >
                {shareInfo.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                {shareInfo.isPublic ? 'Public' : 'Private'}
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'share' ? styles.active : ''}`}
                onClick={() => setActiveTab('share')}
              >
                Share Link
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'embed' ? styles.active : ''}`}
                onClick={() => setActiveTab('embed')}
              >
                Embed Code
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'share' ? (
                <div className={styles.shareContent}>
                  <p className={styles.description}>
                    Share this link with others to let them fill out your form
                    {!shareInfo.isPublic && ' (requires authentication)'}.
                  </p>
                  
                  <div className={styles.shareUrl}>
                    <input
                      type="text"
                      value={shareInfo.shareUrl}
                      readOnly
                      className={styles.urlInput}
                    />
                    <button
                      className={styles.copyButton}
                      onClick={() => copyToClipboard(shareInfo.shareUrl, 'url')}
                    >
                      {copiedItem === 'url' ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>

                  <div className={styles.qrCode}>
                    <p>QR Code (coming soon)</p>
                  </div>
                </div>
              ) : (
                <div className={styles.embedContent}>
                  <p className={styles.description}>
                    Embed this form directly into your website or application.
                  </p>

                  {/* Embed Type Selector */}
                  <div className={styles.embedTypes}>
                    <button
                      className={`${styles.embedType} ${embedType === 'html' ? styles.active : ''}`}
                      onClick={() => setEmbedType('html')}
                    >
                      HTML
                    </button>
                    <button
                      className={`${styles.embedType} ${embedType === 'iframe' ? styles.active : ''}`}
                      onClick={() => setEmbedType('iframe')}
                    >
                      iFrame
                    </button>
                    <button
                      className={`${styles.embedType} ${embedType === 'nodejs' ? styles.active : ''}`}
                      onClick={() => setEmbedType('nodejs')}
                    >
                      Node.js
                    </button>
                  </div>

                  {/* Code Display */}
                  <div className={styles.codeWrapper}>
                    <pre className={styles.code}>
                      <code>{shareInfo.embedCode[embedType]}</code>
                    </pre>
                    <button
                      className={styles.copyCodeButton}
                      onClick={() => copyToClipboard(shareInfo.embedCode[embedType], embedType)}
                    >
                      {copiedItem === embedType ? <Check size={18} /> : <Copy size={18} />}
                      Copy Code
                    </button>
                  </div>

                  {embedType === 'nodejs' && (
                    <p className={styles.note}>
                      Note: The Node.js SDK is coming soon. This is a preview of the integration code.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.error}>Failed to load share information</div>
        )}
      </div>
    </div>
  );
}