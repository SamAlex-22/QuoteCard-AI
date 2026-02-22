/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Quote
} from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [quote, setQuote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!quote.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    
    const gemini = new GeminiService();

    try {
      const image = await gemini.generateImage(quote);
      if (!image) throw new Error('Failed to generate image');
      setGeneratedImage(image);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    // Create a canvas to combine image and text for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Draw overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Font size based on image width
        const fontSize = Math.floor(canvas.width / 20);
        ctx.font = `italic 300 ${fontSize}px Georgia, serif`;
        
        // Wrap text
        const maxWidth = canvas.width * 0.8;
        const words = `"${quote}"`.split(' ');
        let line = '';
        const lines = [];
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let y = (canvas.height - totalHeight) / 2 + lineHeight / 2;
        
        for (let k = 0; k < lines.length; k++) {
          ctx.fillText(lines[k], canvas.width / 2, y);
          y += lineHeight;
        }
        
        // Trigger download
        const link = document.createElement('a');
        link.download = 'quote-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = generatedImage;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Quote className="text-black w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">QuoteCard AI</h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Input & Controls */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight leading-none">
                CRAFT <span className="text-orange-500">BEAUTIFUL</span> QUOTE CARDS.
              </h2>
              <p className="text-white/50 text-lg max-w-md">
                Enter a quote and let AI generate a cinematic background for it.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Enter your inspirational quote here..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-xl resize-none focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/20"
                  disabled={isGenerating}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setQuote('')}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                    title="Clear"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !quote.trim()}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-white/20 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>GENERATING IMAGE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>GENERATE CARD</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </section>

          {/* Right Column: Preview */}
          <section className="relative aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden group shadow-2xl">
            <AnimatePresence mode="wait">
              {!isGenerating && !generatedImage ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-white/20"
                >
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p className="font-medium uppercase tracking-widest text-xs">Preview will appear here</p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm animate-pulse">
                    Crafting Imagery
                  </p>
                </motion.div>
              ) : generatedImage ? (
                <motion.div 
                  key="image-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  <img
                    src={generatedImage}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Generated background"
                  />
                  
                  {/* Quote Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-12 text-center">
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl md:text-3xl font-serif italic font-light leading-tight drop-shadow-2xl"
                    >
                      "{quote}"
                    </motion.p>
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download Card
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>

        {/* Footer Info */}
        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs uppercase tracking-[0.2em]">
          <p>© 2026 QUOTECARD AI • POWERED BY GEMINI</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><ImageIcon className="w-3 h-3" /> 16:9 ASPECT</span>
            <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> AI GENERATED</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
