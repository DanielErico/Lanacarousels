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
      padding: '36px 32px', boxSizing: 'border-box',
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
          fontSize: '13px', fontWeight: 800, color: '#FFFFFF',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          {brandName || 'YOUR BRAND'}
        </div>
        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.8)',
          fontWeight: 700, background: 'rgba(0,0,0,0.25)',
          padding: '4px 10px', borderRadius: '12px', letterSpacing: '1px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Slide Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '34px', fontWeight: 900, lineHeight: 1.2,
            textTransform: 'uppercase', color: '#FFFFFF', letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#FDBA74' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: '20px', width: '70px', height: '5px',
            background: '#E8691C', borderRadius: '3px',
          }} />
          <div style={{
            marginTop: '18px', fontSize: '16px', color: 'rgba(255,255,255,0.9)',
            fontWeight: 500, lineHeight: 1.5,
          }}>
            Swipe to learn more →
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          {/* Number Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#E8691C', color: '#FFFFFF',
            padding: '6px 14px', borderRadius: '8px',
            fontSize: '14px', fontWeight: 900, letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            STEP {String(num).padStart(2, '0')}
          </div>

          <div style={{
            fontSize: '28px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: '-0.3px',
            marginBottom: '16px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.6, background: 'rgba(0,0,0,0.2)',
            padding: '18px 20px', borderRadius: '12px',
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
        paddingTop: '12px',
      }}>
        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '16px', color: '#FDBA74', fontWeight: 900 }}>››</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 2: Black White Blue Agency Wave ─────────────────────────────────
const AgencyBlackBlueWave: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AGENCY NAME', websiteUrl = 'www.yourwebsite.com'
}) => {
  const isHook = slideIndex === 0;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook ? '#09090B' : '#FFFFFF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '36px 32px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '14px', fontWeight: 900,
          color: isHook ? '#FFFFFF' : '#0F172A',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          <span>{brandName || 'AGENCY'} </span>
          <span style={{ color: '#0284C7' }}>•</span>
        </div>
        <div style={{
          fontSize: '13px',
          color: isHook ? 'rgba(255,255,255,0.8)' : '#0F172A',
          fontWeight: 700,
          background: isHook ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
          padding: '4px 10px', borderRadius: '8px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '36px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.15, letterSpacing: '-0.5px',
          }}>
            {slide.headline}
          </div>
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#0284C7', color: '#FFFFFF',
              padding: '10px 20px', fontSize: '13px',
              fontWeight: 800, letterSpacing: '1px',
              textTransform: 'uppercase', borderRadius: '8px',
            }}>
              SWIPE TO READ <span style={{ fontSize: '16px' }}>›</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          {/* Blue Step Badge */}
          <div style={{
            display: 'inline-block', background: '#E0F2FE', color: '#0284C7',
            padding: '6px 12px', borderRadius: '6px',
            fontSize: '13px', fontWeight: 800, letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            INSIGHT #{slideIndex}
          </div>

          <div style={{
            fontSize: '28px', fontWeight: 900, color: '#0284C7',
            textTransform: 'uppercase', lineHeight: 1.2,
            letterSpacing: '-0.3px', marginBottom: '16px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '19px', color: '#1E293B', lineHeight: 1.65,
            background: '#F8FAFC', padding: '20px 22px', borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 15, position: 'relative', borderTop: `1px solid ${isHook ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}`,
        paddingTop: '12px',
      }}>
        <div style={{
          fontSize: '13px',
          color: isHook ? 'rgba(255,255,255,0.7)' : '#64748B',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '16px', color: '#0284C7', fontWeight: 900 }}>››</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 3: AI Dark Tech Purple ─────────────────────────────────────────
const AiDarkTechPurple: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AI AGENCY', websiteUrl = '@lana.carousel'
}) => {
  const isHook = slideIndex === 0;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = String(slideIndex).padStart(2, '0');

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook
        ? 'linear-gradient(145deg, #0B0B2A 0%, #151545 100%)'
        : '#F5F3FF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '36px 32px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: isHook ? '#FFFFFF' : '#4C1D95',
        }}>
          {brandName || 'AI AGENCY'}
        </div>
        <div style={{
          fontSize: '13px',
          color: isHook ? 'rgba(255,255,255,0.8)' : '#5B21B6',
          fontWeight: 700,
          background: isHook ? 'rgba(255,255,255,0.1)' : '#EDE9FE',
          padding: '4px 10px', borderRadius: '8px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '34px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.18, letterSpacing: '-0.5px',
          }}>
            {slide.headline}
          </div>
          <div style={{
            marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            color: '#FFFFFF', padding: '10px 18px', borderRadius: '8px',
            fontSize: '14px', fontWeight: 800,
          }}>
            SWIPE TO EXPLORE ❯❯
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#6366F1', color: '#FFFFFF',
            padding: '6px 12px', borderRadius: '6px',
            fontSize: '13px', fontWeight: 800, letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            POINT {num}
          </div>

          <div style={{
            fontSize: '28px', fontWeight: 900, color: '#1E1B4B',
            textTransform: 'uppercase', lineHeight: 1.2, letterSpacing: '-0.3px',
            marginBottom: '16px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '19px', color: '#312E81', lineHeight: 1.65,
            background: '#FFFFFF', padding: '20px 22px', borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)',
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
        borderTop: `1px solid ${isHook ? 'rgba(255,255,255,0.15)' : '#DDD6FE'}`,
        paddingTop: '12px',
      }}>
        <div style={{
          fontSize: '13px',
          color: isHook ? 'rgba(255,255,255,0.7)' : '#6D28D9',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '15px', color: isHook ? '#A5B4FC' : '#6366F1', fontWeight: 900 }}>❯❯</div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 4: Dark Navy Blue Square Frame ──────────────────────────────────
const DarkNavyBlueFrame: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'COMPANY LOGO', websiteUrl = 'yourwebsite.com'
}) => {
  const isHook = slideIndex === 0;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '36px 32px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20, position: 'relative',
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 900, color: '#FFFFFF',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          {brandName || 'COMPANY LOGO'}
        </div>
        <div style={{
          fontSize: '13px', color: '#E0F2FE',
          fontWeight: 700, background: 'rgba(0,0,0,0.25)',
          padding: '4px 10px', borderRadius: '8px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Content */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '35px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.18, letterSpacing: '-0.5px',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#38BDF8' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '20px', width: '80px', height: '4px', background: '#38BDF8', borderRadius: '2px' }} />
          <div style={{ marginTop: '16px', fontSize: '15px', color: '#E0F2FE', fontWeight: 600 }}>
            Swipe to see all steps →
          </div>
        </div>
      ) : (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '36px', fontWeight: 900, color: '#38BDF8',
            lineHeight: 1, marginBottom: '12px',
          }}>
            #{num}
          </div>

          <div style={{
            fontSize: '28px', fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.2,
            marginBottom: '16px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '19px', color: '#F0F9FF', lineHeight: 1.65,
            background: 'rgba(0,0,0,0.25)', padding: '20px 22px', borderRadius: '12px',
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
        paddingTop: '12px',
      }}>
        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        <div style={{ fontSize: '18px', color: '#38BDF8', fontWeight: 900 }}>→</div>
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
      padding: '36px 32px', boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
      }}>
        <div style={{
          fontSize: '14px', fontWeight: 900,
          color: isCTA ? '#FACC15' : '#000000',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          {brandName || 'BRAND'}
        </div>
        <div style={{
          fontSize: '13px',
          color: isCTA ? '#FACC15' : '#000000',
          fontWeight: 800,
          background: isCTA ? 'rgba(250,204,21,0.15)' : 'rgba(0,0,0,0.08)',
          padding: '4px 10px', borderRadius: '8px',
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Main Content Area */}
      {isHook ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0' }}>
          <div style={{
            fontSize: '36px', fontWeight: 900, color: '#000000',
            lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '-0.5px',
          }}>
            {slide.headline}
          </div>
          <div style={{ marginTop: '22px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#000000', color: '#FACC15',
              padding: '10px 18px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 900, letterSpacing: '1px',
            }}>
              SWIPE TO READ ▷▷▷
            </div>
          </div>
        </div>
      ) : isCTA ? (
        <div style={{ zIndex: 10, position: 'relative', margin: 'auto 0', textAlign: 'center' }}>
          <div style={{
            fontSize: '44px', fontWeight: 900, color: '#FACC15',
            lineHeight: 1.1, textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Save & Share
          </div>
          <div style={{
            fontSize: '19px', color: '#E5E7EB', lineHeight: 1.6,
            maxWidth: '90%', margin: '0 auto',
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
            padding: '6px 14px', borderRadius: '8px',
            fontSize: '16px', fontWeight: 900, letterSpacing: '1px',
            marginBottom: '16px',
          }}>
            #{num}
          </div>

          <div style={{
            fontSize: '30px', fontWeight: 900, color: '#000000',
            lineHeight: 1.18, textTransform: 'uppercase',
            letterSpacing: '-0.5px', marginBottom: '16px',
          }}>
            {slide.headline}
          </div>

          <div style={{
            fontSize: '19px', color: '#000000', lineHeight: 1.65,
            fontWeight: 500, background: 'rgba(255,255,255,0.75)',
            padding: '20px 22px', borderRadius: '14px',
            border: '2px solid rgba(0,0,0,0.1)',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, position: 'relative',
        borderTop: `1px solid ${isCTA ? 'rgba(250,204,21,0.2)' : 'rgba(0,0,0,0.15)'}`,
        paddingTop: '12px',
      }}>
        <div style={{
          fontSize: '13px',
          color: isCTA ? '#FACC15' : '#000000',
          letterSpacing: '0.5px', fontWeight: 700,
        }}>
          {websiteUrl}
        </div>
        <div style={{
          fontSize: '16px',
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
