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
        {/* Main large diagonal band */}
        <div style={{
          position: 'absolute',
          width: '200%', height: '55%',
          background: slideIndex <= 1 ? '#C85A1A' : slideIndex === 2 ? '#C85A1A' : '#8B3A20',
          transform: 'rotate(-35deg)',
          top: '-10%', right: '-30%',
          transformOrigin: 'top right',
        }} />
        {/* Secondary smaller diagonal band */}
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
        position: 'absolute', top: '6%', right: '6%',
        color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1.5px',
        fontWeight: 500, zIndex: 10,
      }}>
        {slideLabel}
      </div>

      {isHook ? (
        /* HOOK SLIDE */
        <div style={{
          position: 'absolute', bottom: '18%', left: '8%', zIndex: 10,
          maxWidth: '70%',
        }}>
          <div style={{
            fontSize: 'clamp(18px, 5.8vw, 28px)',
            fontWeight: 900, lineHeight: 1.1,
            textTransform: 'uppercase', letterSpacing: '-0.5px',
            color: '#FFFFFF',
          }}>
            {slide.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i % 3 === 1 ? '#E8691C' : '#FFFFFF' }}>
                {word}{' '}
              </span>
            ))}
          </div>
          {/* Orange accent line */}
          <div style={{
            marginTop: '12px', width: '50px', height: '3px',
            background: '#E8691C',
          }} />
        </div>
      ) : (
        /* CONTENT SLIDES */
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8% 8%' }}>
          {/* Large ghost number */}
          <div style={{
            position: 'absolute', top: '15%', left: '5%',
            fontSize: 'clamp(80px, 28vw, 140px)',
            fontWeight: 900, color: 'transparent',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.3)',
            lineHeight: 1, fontFamily: 'Georgia, serif',
            userSelect: 'none',
          }}>
            {num}
          </div>
          {/* Headline */}
          <div style={{ marginTop: '30%', zIndex: 2 }}>
            <div style={{
              fontSize: 'clamp(11px, 3.5vw, 15px)',
              fontWeight: 700, color: '#FFFFFF',
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              {slide.headline}
            </div>
            <div style={{
              fontSize: 'clamp(8px, 2.5vw, 11px)',
              color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
              maxWidth: '85%',
            }}>
              {slide.subtext}
            </div>
          </div>
        </div>
      )}

      {/* Footer - website */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '8%', right: '8%',
        zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: '8px', color: 'rgba(255,255,255,0.5)',
          letterSpacing: '1px', textTransform: 'lowercase',
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
        position: 'absolute', top: '5%', left: '6%', right: '6%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: '8px', fontWeight: 700,
          color: isHook ? '#FFFFFF' : '#000000',
          letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          <span style={{ opacity: 0.5 }}>{brandName || 'AGENCY'} </span>
          <span style={{ color: '#0EA5E9' }}>LOGO</span>
        </div>
        <div style={{ fontSize: '9px', color: isHook ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
          {slideLabel}
        </div>
      </div>

      {isHook ? (
        /* HOOK: Black slide */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '18% 8% 25%',
        }}>
          <div style={{
            fontSize: 'clamp(22px, 7vw, 36px)',
            fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.05, letterSpacing: '-0.5px',
          }}>
            {slide.headline || 'BUSINESS SOLUTION AGENCY'}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#0EA5E9', color: '#FFFFFF',
              padding: '5px 12px', fontSize: '8px',
              fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              LEARN MORE <span style={{ fontSize: '10px' }}>›</span>
            </div>
          </div>
          {/* Three dot menu */}
          <div style={{
            position: 'absolute', right: '7%', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '3px',
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '4px', height: '4px', background: '#0EA5E9', borderRadius: '50%' }} />
            ))}
          </div>
          {/* Quote at bottom */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '8%',
            fontSize: '8px', color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic', maxWidth: '70%',
          }}>
            "Always Research And Be Unique"
          </div>
        </div>
      ) : (
        /* CONTENT SLIDES: White with blue wave */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '18% 8% 0',
        }}>
          {/* Blue dots accent */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
            {[0,1].map(i => (
              <div key={i} style={{ width: '5px', height: '5px', background: '#0EA5E9', borderRadius: '1px' }} />
            ))}
          </div>

          {/* Headline */}
          <div style={{
            fontSize: 'clamp(13px, 4vw, 18px)',
            fontWeight: 900, color: '#0EA5E9',
            textTransform: 'uppercase', lineHeight: 1.1,
            letterSpacing: '-0.3px', marginBottom: '10px',
          }}>
            {slide.headline}
          </div>

          {/* Body text */}
          <div style={{
            fontSize: 'clamp(7px, 2.2vw, 10px)',
            color: '#333333', lineHeight: 1.65, maxWidth: '90%',
          }}>
            {slide.subtext}
          </div>

          {/* Double arrow >> */}
          <div style={{
            position: 'absolute', bottom: '15%', right: '7%',
            fontSize: '14px', color: '#0EA5E9', fontWeight: 700,
          }}>
            ›› 
          </div>

          {/* Black wave blob at bottom */}
          <svg viewBox="0 0 200 80" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            width: '100%', height: '30%',
          }}>
            <path d="M0,80 L0,40 Q50,5 100,25 Q150,45 200,10 L200,80 Z" fill="#0A0A0A" />
          </svg>

          {/* Footer text on wave */}
          <div style={{
            position: 'absolute', bottom: '5%', left: '8%',
            fontSize: '7px', color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.5px', zIndex: 5,
          }}>
            {websiteUrl}
          </div>
        </div>
      )}

      {!isHook && (
        <div style={{
          position: 'absolute', bottom: '5%', left: '8%',
          fontSize: '7px', color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.5px', zIndex: 15,
        }}>
          {websiteUrl}
        </div>
      )}
    </div>
  );
};

// ─── TEMPLATE 3: AI Dark Tech Purple ─────────────────────────────────────────
const AiDarkTechPurple: React.FC<TemplateCanvasProps> = ({
  slide, slideIndex, totalSlides, brandName = 'AGENCY LOGO', websiteUrl = 'youre website goes here'
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
          {/* Circular arc lines */}
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="70" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="55" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="#7B7BFF" strokeWidth="0.5" fill="none" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#7B7BFF" strokeWidth="0.3" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#7B7BFF" strokeWidth="0.3" />
            {/* Dots grid */}
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
        position: 'absolute', top: '5%', left: '6%', right: '6%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{
            fontSize: '7px', fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: isHook ? '#FFFFFF' : '#0B0B2A',
          }}>
            AGENCY LOGO
          </div>
          <div style={{ fontSize: '6px', color: isHook ? 'rgba(255,255,255,0.4)' : 'rgba(11,11,42,0.4)' }}>
            Tagline Here
          </div>
        </div>
        <div style={{
          fontSize: '8px', color: isHook ? 'rgba(255,255,255,0.5)' : 'rgba(11,11,42,0.5)',
          fontWeight: 500,
        }}>
          {slideLabel}
        </div>
      </div>

      {/* Dot grid decoration */}
      <div style={{
        position: 'absolute', bottom: '20%', left: '5%',
        display: 'grid', gridTemplateColumns: 'repeat(4,6px)', gap: '3px',
        opacity: 0.4,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            width: '3px', height: '3px', borderRadius: '50%',
            background: isHook ? '#FFFFFF' : '#0B0B2A',
          }} />
        ))}
      </div>

      {isHook ? (
        /* HOOK: Dark navy */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '22% 8%',
        }}>
          <div style={{
            fontSize: 'clamp(20px, 6.5vw, 34px)',
            fontWeight: 900, color: '#FFFFFF',
            textTransform: 'uppercase', lineHeight: 1.05, letterSpacing: '-0.5px',
          }}>
            {slide.headline || 'FUTURE BUSINESS WITH ARTIFICIAL INTELLIGENCE'}
          </div>
          {/* >>> arrows */}
          <div style={{
            position: 'absolute', bottom: '12%', left: '6%',
            fontSize: '16px', color: 'rgba(255,255,255,0.6)', letterSpacing: '-2px',
          }}>
            {'>>>'}
          </div>
        </div>
      ) : (
        /* CONTENT SLIDES: Light purple */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '20% 8% 18%', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 'clamp(18px, 5.5vw, 28px)',
            fontWeight: 900, color: '#0B0B2A',
            textTransform: 'uppercase', lineHeight: 1.05, letterSpacing: '-0.3px',
          }}>
            <span style={{ color: '#0B0B2A', opacity: 0.6 }}>{num}: </span>
            {slide.headline}
          </div>
          <div style={{
            marginTop: '10px', fontSize: 'clamp(7px, 2.3vw, 10px)',
            color: '#333', lineHeight: 1.65, maxWidth: '88%',
          }}>
            {slide.subtext}
          </div>
          {/* <<< arrows at bottom */}
          <div style={{
            position: 'absolute', bottom: '8%', right: '6%',
            fontSize: '13px', color: 'rgba(11,11,42,0.4)', letterSpacing: '-2px',
          }}>
            {'<<<'}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '8%',
        fontSize: '7px',
        color: isHook ? 'rgba(255,255,255,0.4)' : 'rgba(11,11,42,0.45)',
        letterSpacing: '0.3px', zIndex: 10,
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
  const slideLabel = String(slideIndex + 1).padStart(2, '0') + String(totalSlides).padStart(2, '0');
  const num = slideIndex;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#0369A1',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        position: 'absolute', top: '5%', left: '6%', right: '6%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          {isHook ? 'COMPANY LOGO' : 'COMPANY LOGO'}
        </div>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)' }}>
          {slideLabel}
        </div>
      </div>

      {isHook ? (
        /* HOOK SLIDE */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '22% 8%',
        }}>
          <div style={{
            fontSize: 'clamp(18px, 5.8vw, 28px)',
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
          <div style={{ marginTop: '14px', width: '100%', height: '1.5px', background: '#38BDF8' }} />
          {/* Arrow right */}
          <div style={{
            position: 'absolute', bottom: '12%', right: '7%',
            fontSize: '18px', color: '#FFFFFF',
          }}>→</div>
        </div>
      ) : (
        /* CONTENT SLIDES */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '20% 8%', justifyContent: 'center',
        }}>
          {/* Blue square frame */}
          <div style={{
            position: 'absolute',
            top: '18%', left: '7%',
            width: '55%', height: '65%',
            border: '2.5px solid #38BDF8',
            borderRadius: '4px',
          }} />
          {/* Arrow pointing right inside frame */}
          <div style={{
            position: 'absolute', top: '22%', left: '12%',
            fontSize: '14px', color: '#38BDF8',
          }}>→</div>

          {/* Number + headline */}
          <div style={{ marginLeft: '5%', marginTop: '8%', zIndex: 5 }}>
            <div style={{
              fontSize: 'clamp(22px, 7vw, 36px)',
              fontWeight: 900, color: '#38BDF8',
              lineHeight: 1, marginBottom: '5px',
            }}>
              #{num}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 3vw, 14px)',
              fontWeight: 700, color: '#FFFFFF',
              textTransform: 'uppercase', lineHeight: 1.2,
              marginBottom: '8px', maxWidth: '80%',
            }}>
              {slide.headline}
            </div>
            <div style={{
              fontSize: 'clamp(7px, 2.2vw, 10px)',
              color: 'rgba(255,255,255,0.65)', lineHeight: 1.6,
              maxWidth: '80%',
            }}>
              {slide.subtext}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '8%', right: '8%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: '7px', color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.5px',
        }}>
          {websiteUrl}
        </div>
        {!isHook && (
          <div style={{ fontSize: '14px', color: '#FFFFFF', opacity: 0.6 }}>→</div>
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
          padding: '12% 10%',
        }}>
          {/* Yellow right panel peek */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%',
            background: '#F5D300',
          }} />
          {/* Vertical zigzag line at edge */}
          <svg style={{ position: 'absolute', right: '28%', top: 0, height: '100%', width: '24px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          {/* Triangle arrows */}
          <div style={{
            position: 'absolute', top: '30%', left: '8%',
            display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {['▽','▽','▽'].map((t, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#000', opacity: 0.7 }}>{t}</div>
            ))}
          </div>

          {/* Headline */}
          <div style={{ marginTop: '35%', maxWidth: '60%' }}>
            <div style={{
              fontSize: 'clamp(16px, 5vw, 26px)',
              fontWeight: 900, color: '#000000', lineHeight: 1.1,
            }}>
              {slide.headline}
            </div>
          </div>

          {/* Gray image placeholder */}
          <div style={{
            position: 'absolute', bottom: '18%', left: '8%',
            width: '55px', height: '55px', background: '#BBBBBB',
          }} />

          {/* Bottom arrows */}
          <div style={{
            position: 'absolute', bottom: '8%', left: '8%',
            fontSize: '14px', color: '#000', letterSpacing: '-2px',
          }}>▷▷▷</div>
        </div>
      ) : isCTA ? (
        /* THANK YOU slide */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '12%',
        }}>
          {/* Yellow left panel peek */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%',
            background: '#F5D300',
          }} />
          <svg style={{ position: 'absolute', left: '28%', top: 0, height: '100%', width: '24px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          <div style={{ marginLeft: '20%' }}>
            <div style={{
              fontSize: 'clamp(22px, 7vw, 36px)',
              fontWeight: 900, color: '#000000', textAlign: 'center',
            }}>
              Thank<br />You
            </div>
          </div>

          {/* Gray image placeholder */}
          <div style={{
            position: 'absolute', bottom: '18%', right: '10%',
            width: '55px', height: '55px', background: '#BBBBBB',
          }} />

          <div style={{
            position: 'absolute', bottom: '8%', right: '8%',
            fontSize: '13px', color: '#000', letterSpacing: '-2px',
          }}>◁◁◁</div>
        </div>
      ) : (
        /* CONTENT SLIDES: Yellow */
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          padding: '12% 10%', background: '#F5D300',
        }}>
          {/* Zigzag left edge */}
          <svg style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '20px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>
          {/* Zigzag right edge */}
          <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '20px' }} viewBox="0 0 24 200" preserveAspectRatio="none">
            <path d="M12,0 L20,20 L4,40 L20,60 L4,80 L20,100 L4,120 L20,140 L4,160 L20,180 L12,200" stroke="#000" strokeWidth="1.5" fill="none" />
          </svg>

          {/* Square decoration top */}
          <div style={{
            width: '38px', height: '38px',
            border: '2.5px solid #000000',
            background: '#FFFFFF', alignSelf: 'center',
          }} />

          {/* Number */}
          <div style={{
            fontSize: 'clamp(36px, 11vw, 56px)',
            fontWeight: 900, color: '#000000', lineHeight: 1,
            background: '#F5D300', display: 'inline-block',
            padding: '4px 10px', marginTop: '4%', alignSelf: 'flex-start', marginLeft: '8%',
          }}>
            {num}
          </div>

          {/* Headline */}
          <div style={{
            marginTop: '5%', marginLeft: '8%',
            fontSize: 'clamp(13px, 4vw, 18px)',
            fontWeight: 900, color: '#000000', lineHeight: 1.1,
            textTransform: 'capitalize',
          }}>
            {slide.headline}
          </div>

          {/* Body text */}
          <div style={{
            marginTop: '6%', marginLeft: '8%',
            fontSize: 'clamp(7px, 2.3vw, 10px)',
            color: '#222', lineHeight: 1.65, maxWidth: '85%',
          }}>
            {slide.subtext}
          </div>

          {/* Square decoration bottom */}
          <div style={{
            position: 'absolute', bottom: '14%', right: '12%',
            width: '28px', height: '28px',
            border: '2px solid #000000', background: '#FFFFFF',
          }} />
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
