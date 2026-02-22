// Map country names to their flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  // Americas
  "United States": "🇺🇸",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "Venezuela": "🇻🇪",
  
  // Europe
  "United Kingdom": "🇬🇧",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Netherlands": "🇳🇱",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Poland": "🇵🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Ireland": "🇮🇪",
  "Portugal": "🇵🇹",
  "Greece": "🇬🇷",
  "Czech Republic": "🇨🇿",
  "Romania": "🇷🇴",
  "Hungary": "🇭🇺",
  "Ukraine": "🇺🇦",
  "Russia": "🇷🇺",
  "Turkey": "🇹🇷",
  
  // Asia Pacific
  "China": "🇨🇳",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "India": "🇮🇳",
  "Singapore": "🇸🇬",
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "Philippines": "🇵🇭",
  "Indonesia": "🇮🇩",
  "Malaysia": "🇲🇾",
  "Pakistan": "🇵🇰",
  "Bangladesh": "🇧🇩",
  
  // Middle East & Africa
  "Israel": "🇮🇱",
  "Saudi Arabia": "🇸🇦",
  "UAE": "🇦🇪",
  "Egypt": "🇪🇬",
  "Nigeria": "🇳🇬",
  "Kenya": "🇰🇪",
  "South Africa": "🇿🇦",
  
  // Special
  "Local": "🏠",
};

export function getCountryFlag(country: string | undefined): string {
  if (!country) return "🌐";
  return COUNTRY_FLAGS[country] || "🌐";
}

export function getCountryWithFlag(country: string | undefined): string {
  if (!country) return "🌐 Unknown";
  const flag = COUNTRY_FLAGS[country] || "🌐";
  return `${flag} ${country}`;
}
