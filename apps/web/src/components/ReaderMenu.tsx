interface ReaderMenuProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function ReaderMenu({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  fontFamily,
  setFontFamily,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  isFullscreen,
  onToggleFullscreen,
}: ReaderMenuProps) {
  const themePresets = [
    { name: 'Light', bg: '#ffffff', text: '#000000' },
    { name: 'Dark', bg: '#1a1a1a', text: '#ffffff' },
    { name: 'Sepia', bg: '#f4ecd8', text: '#5c4033' },
  ];

  return (
    <div className="bg-muted border-b border-border p-6 space-y-6 overflow-y-auto max-h-96">
      {/* Font Size */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-foreground">Font Size</label>
          <span className="text-sm text-foreground/60">{fontSize}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Adjust font size"
        />
        <div className="flex justify-between text-xs text-foreground/40 mt-2">
          <span>12</span>
          <span>24</span>
        </div>
      </div>

      {/* Line Height */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-foreground">Line Height</label>
          <span className="text-sm text-foreground/60">{lineHeight.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Adjust line height"
        />
        <div className="flex justify-between text-xs text-foreground/40 mt-2">
          <span>1</span>
          <span>2.5</span>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Font</label>
        <div className="flex gap-2">
          {['serif', 'sans-serif'].map((font) => (
            <button
              key={font}
              onClick={() => setFontFamily(font)}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                fontFamily === font
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border hover:bg-background/80'
              }`}
              aria-pressed={fontFamily === font}
            >
              {font === 'serif' ? 'Serif' : 'Sans'}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Presets */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-2">
          {themePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setBackgroundColor(preset.bg);
                setTextColor(preset.text);
              }}
              className="flex flex-col items-center gap-2 p-3 rounded border border-border hover:border-primary transition-colors"
              aria-label={`Apply ${preset.name} theme`}
            >
              <div
                className="w-8 h-8 rounded border border-foreground/20"
                style={{ backgroundColor: preset.bg }}
              />
              <span className="text-xs text-foreground/60">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Custom Colors</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-foreground/60 w-20">Background</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
              aria-label="Background color"
            />
            <span className="text-xs text-foreground/60 font-mono">{backgroundColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-foreground/60 w-20">Text</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
              aria-label="Text color"
            />
            <span className="text-xs text-foreground/60 font-mono">{textColor}</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <div>
        <button
          onClick={onToggleFullscreen}
          className="w-full px-4 py-2 rounded border border-border hover:bg-background transition-colors text-sm font-medium text-foreground"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold text-foreground mb-2">Shortcuts</p>
        <div className="text-xs text-foreground/60 space-y-1">
          <p>← → : Previous/Next page</p>
          <p>+ - : Increase/Decrease font</p>
          <p>F : Toggle fullscreen</p>
        </div>
      </div>
    </div>
  );
}
