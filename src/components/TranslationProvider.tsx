"use client";

import { useEffect, useState } from "react";
// We will import the translations JSON created by the subagent
import allTranslations from "@/lib/translations.json";

export function TranslationProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const lang = localStorage.getItem("anta_lang");
    if (lang === "EN") {
      const observer = new MutationObserver((mutations) => {
        // Debounce or directly translate
        translateNode(document.body);
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      translateNode(document.body);
    }
  }, []);

  return null;
}

// Ensure the keys are sorted by length descending so that longer phrases are translated first, 
// avoiding partial replacements that break longer phrases.
const sortedKeys = Object.keys(allTranslations).sort((a, b) => b.length - a.length);

function translateNode(rootNode: Node) {
  // Translate Text Nodes
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim() !== '') {
      let text = node.nodeValue;
      let changed = false;
      
      // Because this runs on every DOM mutation, we only replace if needed
      for (const fr of sortedKeys) {
        if (text.includes(fr)) {
          const en = (allTranslations as Record<string, string>)[fr];
          // We use split/join instead of regex to avoid regex injection from characters like ?, (, etc.
          text = text.split(fr).join(en);
          changed = true;
        }
      }
      
      if (changed) {
        node.nodeValue = text;
      }
    }
  }

  // Translate Attributes
  const elements = rootNode.nodeType === Node.ELEMENT_NODE 
    ? [rootNode as Element, ...(rootNode as Element).querySelectorAll('*')] 
    : [];
    
  for (const el of elements) {
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    
    ['placeholder', 'title'].forEach(attr => {
      if (el.hasAttribute(attr)) {
        let text = el.getAttribute(attr);
        if (text) {
          let changed = false;
          for (const fr of sortedKeys) {
            if (text.includes(fr)) {
              const en = (allTranslations as Record<string, string>)[fr];
              text = text.split(fr).join(en);
              changed = true;
            }
          }
          if (changed) el.setAttribute(attr, text);
        }
      }
    });
  }
}
