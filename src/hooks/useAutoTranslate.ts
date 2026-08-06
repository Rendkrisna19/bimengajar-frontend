import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const memoryCache: Record<string, string> = {};

export function useAutoTranslate(originalText: string): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(originalText);

  useEffect(() => {
    if (lang === 'ID' || !originalText || !originalText.trim()) {
      setTranslated(originalText);
      return;
    }

    const cacheKey = `tr_en_${originalText.length}_${originalText.substring(0, 40)}`;
    
    // Check in-memory cache
    if (memoryCache[cacheKey]) {
      setTranslated(memoryCache[cacheKey]);
      return;
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        memoryCache[cacheKey] = stored;
        setTranslated(stored);
        return;
      }
    } catch (e) {}

    // Fetch fast AI translation from /api/translate
    let isMounted = true;
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: originalText, targetLang: 'EN' })
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.translatedText) {
          memoryCache[cacheKey] = data.translatedText;
          try {
            localStorage.setItem(cacheKey, data.translatedText);
          } catch (e) {}
          setTranslated(data.translatedText);
        }
      })
      .catch((err) => {
        console.error('Translation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [originalText, lang]);

  return lang === 'EN' ? translated : originalText;
}
