// Design Tokens for MyNextBook - Creating a unique visual identity

export const designTokens = {
  // Animation timings following cubic-bezier for smooth, premium feel
  animation: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms'
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      premium: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
    }
  },
  
  // Premium gradients for unique visual identity
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #feca57 100%)',
    midnight: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
    sunset: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
    ocean: 'linear-gradient(135deg, #1CB5E0 0%, #000851 100%)',
    forest: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
    // Glassmorphism backgrounds
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    darkGlass: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)'
  },
  
  // Shadows for depth and dimension
  shadows: {
    glow: {
      primary: '0 0 40px rgba(102, 126, 234, 0.4)',
      secondary: '0 0 40px rgba(240, 147, 251, 0.4)',
      success: '0 0 40px rgba(52, 211, 153, 0.4)',
      danger: '0 0 40px rgba(248, 113, 113, 0.4)'
    },
    elevation: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      md: '0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
      lg: '0 10px 25px rgba(0, 0, 0, 0.12), 0 5px 10px rgba(0, 0, 0, 0.08)',
      xl: '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
      xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    }
  },
  
  // Unique border styles
  borders: {
    gradient: 'border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
    glow: 'box-shadow: inset 0 0 0 1px rgba(102, 126, 234, 0.5)',
    shimmer: 'box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
  },
  
  // Unique effects
  effects: {
    glassmorphism: {
      light: 'background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);',
      dark: 'background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);'
    },
    shimmer: {
      animation: 'shimmer 2s linear infinite',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)'
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }
  },
  
  // Spacing scale for consistency
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem'    // 128px
  },
  
  // Typography scale
  typography: {
    fonts: {
      heading: "'Poppins', 'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'Fira Code', 'SF Mono', monospace"
    },
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem'      // 128px
    },
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  },
  
  // Unique interactive states
  states: {
    hover: {
      transform: 'translateY(-2px)',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    },
    active: {
      transform: 'translateY(0)',
      shadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
    },
    focus: {
      outline: '2px solid #667eea',
      outlineOffset: '2px'
    }
  }
};

// Export utility functions for using design tokens
export const getGradient = (name: keyof typeof designTokens.gradients) => designTokens.gradients[name];
export const getShadow = (type: keyof typeof designTokens.shadows, level: string) => designTokens.shadows[type][level as keyof typeof designTokens.shadows[typeof type]];
export const getAnimation = (property: keyof typeof designTokens.animation, value: string) => designTokens.animation[property][value as keyof typeof designTokens.animation[typeof property]];