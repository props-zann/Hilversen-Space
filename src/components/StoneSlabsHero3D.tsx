import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import heroArtImage from '../assets/images/hero_beranda_isolated_1791247171795.jpg';

interface StoneSlabsHero3DProps {
  heroImageUrl?: string;
}

export const StoneSlabsHero3D: React.FC<StoneSlabsHero3DProps> = ({ heroImageUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  useEffect(() => {
    setImageLoaded(true);
  }, [heroImageUrl]);

  return (
    <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none">
      {/* Floating 3D Artwork Container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateZ: [0, 0.4, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 9,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-full h-full p-2 flex items-center justify-center"
      >
        {imageLoaded ? (
          <div className="relative w-full h-full overflow-hidden rounded-2xl flex items-center justify-center bg-transparent">
            <img
              src={heroImageUrl || heroArtImage}
              alt="Minimalist Abstract 3D Slabs Composition"
              onError={() => setImageLoaded(false)}
              className="w-full h-full object-contain p-2 transition-all duration-300"
              loading="eager"
              referrerPolicy="no-referrer"
            />
            {/* Smooth looping metallic sweep/shine sheen beam */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
              style={{
                maskImage: `url(${heroImageUrl || heroArtImage})`,
                WebkitMaskImage: `url(${heroImageUrl || heroArtImage})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            >
              <motion.div
                initial={{ left: '-100%', top: '100%', opacity: 0 }}
                animate={{
                  left: ['-100%', '0%', '110%'],
                  top: ['100%', '0%', '-110%'],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4.2,
                  ease: 'easeInOut',
                  repeatDelay: 2.5
                }}
                className="absolute w-[500px] h-[340px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_75%)]"
                style={{
                  transform: 'rotate(-30deg)'
                }}
              />
            </div>
          </div>
        ) : (
          /* High Precision Vector SVG Composition matching prompt specification */
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full rounded-2xl shadow-md overflow-hidden bg-[#FAFAF7]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Canvas */}
            <rect width="500" height="500" fill="#FAFAF7" />

            {/* Light Studio Shadows & Occlusion */}
            <defs>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1A202C" floodOpacity="0.08" />
              </filter>
              
              <linearGradient id="blueGleam1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3E5CB8" />
                <stop offset="100%" stopColor="#283E82" />
              </linearGradient>

              <linearGradient id="blueGleam2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3552AC" />
                <stop offset="100%" stopColor="#253B7C" />
              </linearGradient>

              <linearGradient id="redGleam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C92829" />
                <stop offset="100%" stopColor="#A01B1C" />
              </linearGradient>

              <linearGradient id="sideShadowDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* OBJECT 1: UPPER BLUE DIAGONAL FORM (#304A9A) */}
            <g filter="url(#softShadow)">
              {/* 3D Extrusion Side */}
              <path
                d="M 10 195 L 200 0 L 275 90 L 265 110 L 10 215 Z"
                fill="url(#sideShadowDark)"
              />
              {/* Main Front Slab */}
              <path
                d="M 10 195 C 10 180, 185 0, 200 0 C 220 0, 260 80, 275 90 C 285 100, 260 120, 265 110 C 250 125, 20 220, 10 195 Z"
                fill="url(#blueGleam1)"
              />
              {/* Bevel Highlight */}
              <path
                d="M 200 5 L 270 92"
                stroke="#6B82D6"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>

            {/* OBJECT 2: CENTRAL LARGE BLUE DIAGONAL SLAB (#304A9A) */}
            <g filter="url(#softShadow)">
              {/* 3D Extrusion Side */}
              <path
                d="M 0 300 L 440 255 L 435 275 L 10 320 Z"
                fill="url(#sideShadowDark)"
              />
              {/* Main Central Slab */}
              <path
                d="M 0 240 Q 200 180 385 105 C 410 95, 440 240, 440 255 C 440 270, 420 280, 10 300 C 0 300, 0 260, 0 240 Z"
                fill="url(#blueGleam2)"
              />
              {/* Bevel Highlight */}
              <path
                d="M 10 238 L 380 110"
                stroke="#6B82D6"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>

            {/* OBJECT 3: LOWER LARGE RED TERRACOTTA SLAB (#B51F20) */}
            <g filter="url(#softShadow)">
              {/* 3D Extrusion Side */}
              <path
                d="M 0 355 L 500 320 L 500 500 L 0 500 Z"
                fill="url(#sideShadowDark)"
              />
              {/* Main Lower Slab */}
              <path
                d="M 0 340 C 20 330, 480 300, 500 305 L 500 500 L 0 500 Z"
                fill="url(#redGleam)"
              />
              {/* Bevel Highlight */}
              <path
                d="M 5 340 Q 250 318 495 306"
                stroke="#E54B4C"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </svg>
        )}
      </motion.div>
    </div>
  );
};
