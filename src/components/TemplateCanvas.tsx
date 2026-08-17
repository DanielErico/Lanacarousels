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
  const num = slideIndex; // 1-based for content slides

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook
        ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 60%, #075985 100%)'
        : slideIndex === 1 ? '#0284C7'
        : slideIndex === 2 ? '#0369A1'
        : slideIndex === 3 ? '#075985'
        : '#075985',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* Diagonal Orange Bands */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        opacity: isHook ? 1 : 1,
      }}>
        <div style={{
          position: 'absolute',
          width: '200%', height: '55%',
          background: slideIndex <= 1 ? '#C85A1A' : slideIndex === 2 ? '#C85A1A' : '#8B3A20',
          transform: 'rotate(-35deg)',
          top: '-10%', right: '-30%',
          transformOrigin: 'top right',
        }} />
        <div style={{
          position: 'absolute',
          width: '200%', height: '25%',
          background: slideIndex <= 1 ? '#A84510' : '#7A2E10',
          transform: 'rotate(-35deg)',
          top: '15%', right: '-30%',
          transformOrigin: 'top right',
        }} />
      </div>

      {/* Slide counter - top right */}
      <div style={{
        position: 'absolute', top: '5%', right: '6%',
        color: 'rgba(255,255,255,0.75)', fontSize: '12px', letterSpacing: '1.5px',
        fontWeight: 700, zIndex: 10,
      }}>
        {slideLabel}
      </div>

      {isHook ? (
        /* HOOK SLIDE */
        <div style={{
          position: 'absolute', bottom: '15%', left: '8%', right: '8%', zIndex: 10,
        }}>
          <div style={{
            fontSize: 'clamp(26px, 8vw, 36px)',
            fontWeight: 900, lineHeight: 1.15,
            textTransform: 'uppercase', letterSpacing: '-0.5px',
            color: '#FFFFFF',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#E8691C' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: '16px', width: '60px', height: '4px',
            background: '#E8691C', borderRadius: '2px',
          }} />
        </div>
      ) : (
        /* CONTENT SLIDES */
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10% 8%' }}>
          {/* Large ghost number */}
          <div style={{
            position: 'absolute', top: '10%', left: '5%',
            fontSize: 'clamp(90px, 28vw, 130px)',
            fontWeight: 900, color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.25)',
            lineHeight: 1, fontFamily: 'Georgia, serif',
            userSelect: 'none',
          }}>
            {num}
          </div>
          {/* Headline */}
          <div style={{ marginTop: '22%', zIndex: 2 }}>
            <div style={{
              fontSize: 'clamp(20px, 6vw, 26px)',
              fontWeight: 800, color: '#FFFFFF',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              lineHeight: 1.2, marginBottom: '10px',
            }}>
              {slide.headline}
            </div>
            <div style={{
              fontSize: 'clamp(13px, 3.8vw, 16px)',
              color: 'rgba(255,255,255,0.9)', lineHeight: 1.6,
              maxWidth: '92%',
            }}>
              {slide.subtext}
            </div>
          </div>
        </div>
      )}

      {/* Footer - website */}
      <div style={{
        position: 'absolute', bottom: '4%', left: '8%', right: '8%',
        zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.6)',
          letterSpacing: '1px', textTransform: 'lowercase', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
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
  const slideLabel = `0${slideIndex + 1}`;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook ? '#0A0A0A' : '#FFFFFF',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* Header: Agency Logo + Slide Number */}
      <div style={{
        position: 'absolute', top: '5%', left: '7%', right: '7%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 800,
          color: isHook ? '#FFFFFF' : '#000000',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          <span style={{ opacity: 0.5 }}>{brandName || 'AGENCY'} </span>
          <span style={{ color: '#0EA5E9' }}>LOGO</span>
        </div>
        <div style={{ fontSize: '12px', color: isHook ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontWeight: 700 }}>
          {slideLabel}
        </div>
      </div>

      {isHook ? (
        /* HOOK: Black slide */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '16% 8% 20%',
        }}>
          <div style={{
            fontSize: 'clamp(28px, 8.5vw, 36px)',
            fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {slide.headline || 'BUSINESS SOLUTION AGENCY'}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#0EA5E9', color: '#FFFFFF',
              padding: '7px 16px', fontSize: '11px',
              fontWeight: 800, letterSpacing: '1px',
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px',
              borderRadius: '4px',
            }}>
              SWIPE TO LEARN <span style={{ fontSize: '13px' }}>›</span>
            </div>
          </div>
          {/* Quote at bottom */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '8%',
            fontSize: '11px', color: 'rgba(255,255,255,0.6)',
            fontStyle: 'italic', maxWidth: '75%',
          }}>
            "Action Beats Inaction Every Time"
          </div>
        </div>
      ) : (
        /* CONTENT SLIDES: White with blue wave */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '16% 8% 0', justifyContent: 'center',
        }}>
          {/* Blue dots accent */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', background: '#0EA5E9', borderRadius: '2px' }} />
            ))}
          </div>

          {/* Headline */}
          <div style={{
            fontSize: 'clamp(22px, 6.5vw, 28px)',
            fontWeight: 900, color: '#0EA5E9',
            textTransform: 'uppercase', lineHeight: 1.15,
            letterSpacing: '-0.3px', marginBottom: '12px',
          }}>
            {slide.headline}
          </div>

          {/* Body text */}
          <div style={{
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#222222', lineHeight: 1.6, maxWidth: '92%',
          }}>
            {slide.subtext}
          </div>

          {/* Double arrow >> */}
          <div style={{
            position: 'absolute', bottom: '18%', right: '8%',
            fontSize: '18px', color: '#0EA5E9', fontWeight: 900,
          }}>
            ›› 
          </div>

          {/* Black wave blob at bottom */}
          <svg viewBox="0 0 200 80" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            width: '100%', height: '25%',
          }}>
            <path d="M0,80 L0,40 Q50,5 100,25 Q150,45 200,10 L200,80 Z" fill="#0A0A0A" />
          </svg>

          {/* Footer text on wave */}
          <div style={{
            position: 'absolute', bottom: '4%', left: '8%',
            fontSize: '11px', color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.5px', zIndex: 15, fontWeight: 600,
          }}>
            {websiteUrl}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TEMPLATE 3: AI Dark Tech Purple ─────────────────────────────────────────
const AiDarkTechPurple: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AGENCY LOGO', websiteUrl = '@lana.carousel'
}) => {
  const isHook = slideIndex === 0;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = String(slideIndex).padStart(2, '0');

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook ? '#0B0B2A' : '#EDE8F8',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* Circuit / grid pattern for hook slide */}
      {isHook && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15 }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="70" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="55" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#7B7BFF" strokeWidth="0.3" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#7B7BFF" strokeWidth="0.3" />
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 30 - 10} cy={r * 30 - 10} r="1" fill="#7B7BFF" />
              ))
            )}
          </svg>
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'absolute', top: '5%', left: '7%', right: '7%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{
            fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: isHook ? '#FFFFFF' : '#0B0B2A',
          }}>
            {brandName || 'AGENCY LOGO'}
          </div>
          <div style={{ fontSize: '10px', color: isHook ? 'rgba(255,255,255,0.5)' : 'rgba(11,11,42,0.5)', fontWeight: 600 }}>
            {websiteUrl || '@brand'}
          </div>
        </div>
        <div style={{
          fontSize: '12px', color: isHook ? 'rgba(255,255,255,0.6)' : 'rgba(11,11,42,0.6)',
          fontWeight: 700,
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Dot grid decoration */}
      <div style={{
        position: 'absolute', bottom: '16%', left: '6%',
        display: 'grid', gridTemplateColumns: 'repeat(4,8px)', gap: '4px',
        opacity: 0.5,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: isHook ? '#FFFFFF' : '#0B0B2A',
          }} />
        ))}
      </div>

      {isHook ? (
        /* HOOK: Dark navy */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '18% 8%',
        }}>
          <div style={{
            fontSize: 'clamp(28px, 8.5vw, 36px)',
            fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {slide.headline || 'FUTURE BUSINESS WITH ARTIFICIAL INTELLIGENCE'}
          </div>
          {/* >>> arrows */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '7%',
            fontSize: '20px', color: 'rgba(255,255,255,0.7)', letterSpacing: '-1px', fontWeight: 900,
          }}>
            {'>>>'}
          </div>
        </div>
      ) : (
        /* CONTENT SLIDES: Light purple */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '16% 8%', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 'clamp(22px, 6.5vw, 28px)',
            fontWeight: 900, color: '#0B0B2A',
            textTransform: 'uppercase', lineHeight: 1.15, letterSpacing: '-0.3px',
          }}>
            <span style={{ color: '#6366F1' }}>{num}: </span>
            {slide.headline}
          </div>
          <div style={{
            marginTop: '14px', fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#22223B', lineHeight: 1.6, maxWidth: '92%',
          }}>
            {slide.subtext}
          </div>
          {/* <<< arrows at bottom */}
          <div style={{
            position: 'absolute', bottom: '8%', right: '7%',
            fontSize: '16px', color: 'rgba(11,11,42,0.6)', letterSpacing: '-1px', fontWeight: 900,
          }}>
            {'<<<'}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '4%', left: '8%',
        fontSize: '11px',
        color: isHook ? 'rgba(255,255,255,0.6)' : 'rgba(11,11,42,0.6)',
        letterSpacing: '0.5px', zIndex: 10, fontWeight: 600,
      }}>
        {websiteUrl}
      </div>
    </div>
  );
};

// ─── TEMPLATE 4: Dark Navy Blue Square Frame ──────────────────────────────────
const DarkNavyBlueFrame: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'COMPANY LOGO', websiteUrl = 'your website goes here'
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const slideLabel = `${String(slideIndex + 1).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#0369A1',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        position: 'absolute', top: '5%', left: '7%', right: '7%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          {brandName || 'COMPANY LOGO'}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
          {slideLabel}
        </div>
      </div>

      {isHook ? (
        /* HOOK SLIDE */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '18% 8%',
        }}>
          <div style={{
            fontSize: 'clamp(28px, 8.5vw, 36px)',
            fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#38BDF8' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          {/* Blue underline */}
          <div style={{ marginTop: '16px', width: '100%', height: '3px', background: '#38BDF8', borderRadius: '2px' }} />
          {/* Arrow right */}
          <div style={{
            position: 'absolute', bottom: '10%', right: '8%',
            fontSize: '22px', color: '#FFFFFF', fontWeight: 900,
          }}>→</div>
        </div>
      ) : (
        /* CONTENT SLIDES */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '16% 8%', justifyContent: 'center',
        }}>
          <div style={{ marginLeft: '4%', zIndex: 5 }}>
            <div style={{
              fontSize: 'clamp(28px, 8vw, 42px)',
              fontWeight: 900, color: '#38BDF8',
              lineHeight: 1, marginBottom: '8px',
            }}>
              #{num}
            </div>
            <div style={{
              fontSize: 'clamp(20px, 6vw, 26px)',
              fontWeight: 800, color: '#FFFFFF',
              textTransform: 'uppercase', lineHeight: 1.2,
              marginBottom: '12px', maxWidth: '92%',
            }}>
              {slide.headline}
            </div>
            <div style={{
              fontSize: 'clamp(14px, 4vw, 16px)',
              color: 'rgba(255,255,255,0.85)', lineHeight: 1.6,
              maxWidth: '92%',
            }}>
              {slide.subtext}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '4%', left: '8%', right: '8%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.5px', fontWeight: 600,
        }}>
          {websiteUrl}
        </div>
        {!isHook && (
          <div style={{ fontSize: '18px', color: '#FFFFFF', opacity: 0.8, fontWeight: 900 }}>→</div>
        )}
      </div>
    </div>
  );
};

// ─── TEMPLATE 5: Seamless Yellow Bold ─────────────────────────────────────────
const SeamlessYellowBold: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = '', websiteUrl = ''
}) => {
  const isHook = slideIndex === 0;
  const isCTA = slideIndex === totalSlides - 1;
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: isHook || isCTA ? '#FFFFFF' : '#F5D300',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {isHook ? (
        /* HOOK: White side */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '14% 8%', justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '25%',
            background: '#F5D300',
          }} />
          <svg style={{ position: 'absolute', right: '23%', top: 0, height: '100%', width: '24px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          {/* Headline */}
          <div style={{ maxWidth: '68%', zIndex: 10 }}>
            <div style={{
              fontSize: 'clamp(28px, 8.5vw, 36px)',
              fontWeight: 900, color: '#000000', lineHeight: 1.1,
            }}>
              {slide.headline}
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: '8%', left: '8%',
            fontSize: '18px', color: '#000', letterSpacing: '-2px', fontWeight: 900,
          }}>▷▷▷</div>
        </div>
      ) : isCTA ? (
        /* THANK YOU slide */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '12%',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '25%',
            background: '#F5D300',
          }} />
          <svg style={{ position: 'absolute', left: '23%', top: 0, height: '100%', width: '24px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          <div style={{ marginLeft: '15%' }}>
            <div style={{
              fontSize: 'clamp(32px, 10vw, 44px)',
              fontWeight: 900, color: '#000000', textAlign: 'center', lineHeight: 1.1,
            }}>
              Thank<br />You
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: '8%', right: '8%',
            fontSize: '18px', color: '#000', letterSpacing: '-2px', fontWeight: 900,
          }}>◁◁◁</div>
        </div>
      ) : (
        /* CONTENT SLIDES: Yellow */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '14% 10%', background: '#F5D300', justifyContent: 'center',
        }}>
          <svg style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '20px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>
          <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '20px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          {/* Number */}
          <div style={{
            fontSize: 'clamp(36px, 10vw, 48px)',
            fontWeight: 900, color: '#000000', lineHeight: 1,
            display: 'inline-block',
            alignSelf: 'flex-start', marginLeft: '6%', marginBottom: '6px',
          }}>
            #{num}
          </div>

          {/* Headline */}
          <div style={{
            marginLeft: '6%',
            fontSize: 'clamp(22px, 6.5vw, 28px)',
            fontWeight: 900, color: '#000000', lineHeight: 1.15,
            textTransform: 'uppercase', marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          {/* Body text */}
          <div style={{
            marginLeft: '6%',
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#111', lineHeight: 1.6, maxWidth: '90%',
          }}>
            {slide.subtext}
          </div>
        </div>
      )}
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
