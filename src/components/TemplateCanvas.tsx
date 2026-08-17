import React from 'react';
import { Slide, ContentStylePreset } from '../types/lana';

interface TemplateCanvasProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  stylePreset: ContentStylePreset;
  brandName?: string;
  websiteUrl?: string;
}

// ─── TEMPLATE 1: Navy + Orange Diagonal ──────────────────────────────────────
const NavyOrangeDiagonal: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'YOUR BRAND', websiteUrl = 'www.yourwebsite.com'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook
        ? 'linear-gradient(135deg, #0369A1 0%, #075985 60%, #0C4A6E 100%)'
        : '#075985',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '24px 22px', boxSizing: 'border-box',
    }}>

      {/* Diagonal Orange Bands */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: '220%', height: '50%',
          background: '#C85A1A', transform: 'rotate(-32deg)',
          top: '-12%', right: '-35%', transformOrigin: 'top right', opacity: 0.9,
        }} />
        <div style={{
          position: 'absolute', width: '220%', height: '22%',
          background: '#E8691C', transform: 'rotate(-32deg)',
          top: '12%', right: '-35%', transformOrigin: 'top right', opacity: 0.85,
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 800, color: '#FFFFFF',
          letterSpacing: '1.2px', textTransform: 'uppercase',
        }}>
          {brandName || 'YOUR BRAND'}
        </div>
        <div style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.9)',
          fontWeight: 700, background: 'rgba(0,0,0,0.3)',
          padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.8px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Slide Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, lineHeight: 1.2,
            textTransform: 'uppercase', color: '#FFFFFF', letterSpacing: '-0.4px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#FDBA74' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: '14px', width: '50px', height: '4px',
            background: '#E8691C', borderRadius: '2px',
          }} />
          <div style={{
            marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.9)',
            fontWeight: 500, lineHeight: 1.45,
          }}>
            {slide.subtext || 'Swipe to learn more →'}
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            fontSize: '13.5px', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55,
            background: 'rgba(0,0,0,0.25)', padding: '14px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {slide.subtext}
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          {/* Number Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#E8691C', color: '#FFFFFF',
            padding: '4px 10px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 900, letterSpacing: '0.8px',
            marginBottom: '10px',
          }}>
            STEP {String(num).padStart(2, '0')}
          </div>

          <div style={{
            fontSize: '20px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.22, letterSpacing: '-0.2px',
            marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '13.5px', color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.55, background: 'rgba(0,0,0,0.25)',
            padding: '13px 15px', borderRadius: '10px',
            borderLeft: '4px solid #E8691C',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.15)',
        paddingTop: '10px',
      }}>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '14px', color: '#FDBA74', fontWeight: 900 }}>››</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 2: Black White Blue Agency Wave ─────────────────────────────────
const AgencyBlackBlueWave: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AGENCY NAME', websiteUrl = 'www.yourwebsite.com'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook ? '#09090B' : isCTA ? '#09090B' : '#FFFFFF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '24px 22px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 900,
          color: isHook || isCTA ? '#FFFFFF' : '#0F172A',
          letterSpacing: '1.2px', textTransform: 'uppercase',
        }}>
          <span>{brandName || 'AGENCY'} </span>
          <span style={{ color: '#0284C7' }}>•</span>
        </div>
        <div style={{
          fontSize: '10px',
          color: isHook || isCTA ? 'rgba(255,255,255,0.8)' : '#0F172A',
          fontWeight: 700,
          background: isHook || isCTA ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '27px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.18, letterSpacing: '-0.4px',
          }}>
            {slide.headline}
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#0284C7', color: '#FFFFFF',
              padding: '8px 16px', fontSize: '11px',
              fontWeight: 800, letterSpacing: '0.8px',
              textTransform: 'uppercase', borderRadius: '6px',
            }}>
              SWIPE TO READ <span style={{ fontSize: '13px' }}>›</span>
            </div>
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            fontSize: '13.5px', color: '#E2E8F0', lineHeight: 1.55,
            background: 'rgba(255,255,255,0.06)', padding: '14px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            {slide.subtext}
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          {/* Blue Step Badge */}
          <div style={{
            display: 'inline-block', background: '#E0F2FE', color: '#0284C7',
            padding: '4px 10px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.8px',
            marginBottom: '10px',
          }}>
            INSIGHT #{slideIndex}
          </div>

          <div style={{
            fontSize: '20px', fontWeight: 900, color: '#0284C7',
            textTransform: 'uppercase', lineHeight: 1.22,
            letterSpacing: '-0.2px', marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '13.5px', color: '#1E293B', lineHeight: 1.55,
            background: '#F8FAFC', padding: '13px 15px', borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 15, position: 'relative', borderTop: `1px solid ${isHook || isCTA ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}`,
        paddingTop: '10px',
      }}>
        <div style={{
          fontSize: '11px',
          color: isHook || isCTA ? 'rgba(255,255,255,0.7)' : '#64748B',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '14px', color: '#0284C7', fontWeight: 900 }}>››</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 3: AI Dark Tech Purple ─────────────────────────────────────────
const AiDarkTechPurple: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AI AGENCY', websiteUrl = '@lana.carousel'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = String(slideIndex).padStart(2, '0');

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook
        ? 'linear-gradient(145deg, #0B0B2A 0%, #151545 100%)'
        : isCTA
        ? 'linear-gradient(145deg, #0B0B2A 0%, #151545 100%)'
        : '#F5F3FF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '24px 22px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 900, letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: isHook || isCTA ? '#FFFFFF' : '#4C1D95',
        }}>
          {brandName || 'AI AGENCY'}
        </div>
        <div style={{
          fontSize: '10px',
          color: isHook || isCTA ? 'rgba(255,255,255,0.8)' : '#5B21B6',
          fontWeight: 700,
          background: isHook || isCTA ? 'rgba(255,255,255,0.1)' : '#EDE9FE',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: '-0.4px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 800,
          }}>
            SWIPE TO EXPLORE ❯❯
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            fontSize: '13.5px', color: '#E0E7FF', lineHeight: 1.55,
            background: 'rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {slide.subtext}
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#6366F1', color: '#FFFFFF',
            padding: '4px 10px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.8px',
            marginBottom: '10px',
          }}>
            POINT {num}
          </div>

          <div style={{
            fontSize: '20px', fontWeight: 900, color: '#1E1B4B',
            textTransform: 'uppercase', lineHeight: 1.22, letterSpacing: '-0.2px',
            marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '13.5px', color: '#312E81', lineHeight: 1.55,
            background: '#FFFFFF', padding: '13px 15px', borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.06)',
            border: '1px solid #E0E7FF',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
        borderTop: `1px solid ${isHook || isCTA ? 'rgba(255,255,255,0.15)' : '#DDD6FE'}`,
        paddingTop: '10px',
      }}>
        <div style={{
          fontSize: '11px',
          color: isHook || isCTA ? 'rgba(255,255,255,0.7)' : '#6D28D9',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '13px', color: isHook || isCTA ? '#A5B4FC' : '#6366F1', fontWeight: 900 }}>❯❯</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 4: Dark Navy Blue Square Frame ──────────────────────────────────
const DarkNavyBlueFrame: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'COMPANY LOGO', websiteUrl = 'yourwebsite.com'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '24px 22px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 900, color: '#FFFFFF',
          letterSpacing: '1.2px', textTransform: 'uppercase',
        }}>
          {brandName || 'COMPANY LOGO'}
        </div>
        <div style={{
          fontSize: '10px', color: '#E0F2FE',
          fontWeight: 700, background: 'rgba(0,0,0,0.25)',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: '-0.4px',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#38BDF8' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '14px', width: '50px', height: '4px', background: '#38BDF8', borderRadius: '2px' }} />
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#E0F2FE', fontWeight: 500 }}>
            {slide.subtext || 'Swipe to see all steps →'}
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            fontSize: '13.5px', color: '#F0F9FF', lineHeight: 1.55,
            background: 'rgba(0,0,0,0.25)', padding: '14px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {slide.subtext}
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '22px', fontWeight: 900, color: '#38BDF8',
            lineHeight: 1, marginBottom: '8px',
          }}>
            #{num}
          </div>

          <div style={{
            fontSize: '20px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.22,
            marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '13.5px', color: '#F0F9FF', lineHeight: 1.55,
            background: 'rgba(0,0,0,0.25)', padding: '13px 15px', borderRadius: '10px',
            borderLeft: '4px solid #38BDF8',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '10px',
      }}>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '15px', color: '#38BDF8', fontWeight: 900 }}>→</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 5: Seamless Yellow Bold ─────────────────────────────────────────
const SeamlessYellowBold: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'LANA', websiteUrl = '@lana.carousel'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook ? '#FFFFFF' : isCTA ? '#111827' : '#FACC15',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '24px 22px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 900,
          color: isCTA ? '#FACC15' : '#000000',
          letterSpacing: '1.2px', textTransform: 'uppercase',
        }}>
          {brandName || 'BRAND'}
        </div>
        <div style={{
          fontSize: '10px',
          color: isCTA ? '#FACC15' : '#000000',
          fontWeight: 800,
          background: isCTA ? 'rgba(250,204,21,0.15)' : 'rgba(0,0,0,0.08)',
          padding: '3px 8px', borderRadius: '6px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Content Area */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '27px', fontWeight: 900, color: '#000000',
            lineHeight: 1.18, textTransform: 'uppercase', letterSpacing: '-0.4px',
          }}>
            {slide.headline}
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#000000', color: '#FACC15',
              padding: '8px 14px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 900, letterSpacing: '0.8px',
            }}>
              SWIPE TO READ ▷▷▷
            </div>
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '26px', fontWeight: 900, color: '#FACC15',
            lineHeight: 1.2, textTransform: 'uppercase', marginBottom: '12px',
          }}>
            Save & Share
          </div>
          <div style={{
            fontSize: '13.5px', color: '#E5E7EB', lineHeight: 1.55,
            maxWidth: '92%', margin: '0 auto',
          }}>
            {slide.subtext || 'Follow for more actionable insights and daily growth strategies.'}
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          {/* Big Number Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#000000', color: '#FACC15',
            padding: '4px 10px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 900, letterSpacing: '0.8px',
            marginBottom: '10px',
          }}>
            #{num}
          </div>

          <div style={{
            fontSize: '20px', fontWeight: 900, color: '#000000',
            lineHeight: 1.22, textTransform: 'uppercase',
            letterSpacing: '-0.2px', marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '13.5px', color: '#000000', lineHeight: 1.55,
            fontWeight: 500, background: 'rgba(255,255,255,0.75)',
            padding: '13px 15px', borderRadius: '10px',
            border: '1.5px solid rgba(0,0,0,0.1)',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
        borderTop: `1px solid ${isCTA ? 'rgba(250,204,21,0.2)' : 'rgba(0,0,0,0.12)'}`,
        paddingTop: '10px',
      }}>
        <div style={{
          fontSize: '11px',
          color: isCTA ? '#FACC15' : '#000000',
          letterSpacing: '0.5px', fontWeight: 700,
        }}>
          {websiteUrl}
        </div>
        <div style={{
          fontSize: '14px',
          color: isCTA ? '#FACC15' : '#000000',
          fontWeight: 900,
        }}>
          {isCTA ? '★' : '▷▷▷'}
        </div>
      </div>
    </div>
  );
};

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
export const TemplateCanvas: React.FC<TemplateCanvasProps> = (props) => {
  switch (props.stylePreset) {
    case 'navy_orange_diagonal':
      return <NavyOrangeDiagonal {...props} />;
    case 'agency_black_blue_wave':
      return <AgencyBlackBlueWave {...props} />;
    case 'ai_dark_tech_purple':
      return <AiDarkTechPurple {...props} />;
    case 'dark_navy_blue_frame':
      return <DarkNavyBlueFrame {...props} />;
    case 'seamless_yellow_bold':
      return <SeamlessYellowBold {...props} />;
    default:
      return <NavyOrangeDiagonal {...props} />;
  }
};
