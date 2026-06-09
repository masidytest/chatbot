"use client";

export function LanguageSelector() {
  return (
    <select 
      defaultValue="en"
      onChange={(e) => {
        localStorage.setItem("language", e.target.value);
        window.location.reload();
      }}
      className="h-8 px-2 rounded text-xs font-medium bg-background text-foreground border border-border/50 hover:border-border cursor-pointer transition-colors"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
      <option value="ja">日本語</option>
      <option value="pt">Português</option>
      <option value="ko">한국어</option>
      <option value="ru">Русский</option>
      <option value="zh">中文</option>
      <option value="it">Italiano</option>
    </select>
  );
}
