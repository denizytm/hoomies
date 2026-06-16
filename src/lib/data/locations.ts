// Region-based location data (il / ilçe). Full address is never collected — only
// district-level, per the privacy model. Extend as new cities open up.

export const LOCATIONS: Record<string, string[]> = {
  Ankara: [
    "Çankaya",
    "Yenimahalle",
    "Keçiören",
    "Mamak",
    "Etimesgut",
    "Sincan",
    "Altındağ",
    "Pursaklar",
    "Gölbaşı",
    "Çubuk",
    "Polatlı",
    "Elmadağ",
  ],
  İstanbul: [
    "Kadıköy",
    "Beşiktaş",
    "Şişli",
    "Beyoğlu",
    "Üsküdar",
    "Maltepe",
    "Kartal",
    "Ataşehir",
    "Bakırköy",
    "Beylikdüzü",
    "Esenyurt",
    "Sarıyer",
    "Fatih",
    "Bahçelievler",
    "Pendik",
    "Ümraniye",
  ],
  İzmir: [
    "Konak",
    "Bornova",
    "Buca",
    "Karşıyaka",
    "Bayraklı",
    "Gaziemir",
    "Balçova",
    "Narlıdere",
    "Çiğli",
    "Karabağlar",
  ],
  Eskişehir: ["Tepebaşı", "Odunpazarı"],
  Bursa: ["Nilüfer", "Osmangazi", "Yıldırım"],
  Adana: ["Seyhan", "Çukurova", "Yüreğir"],
  Antalya: ["Muratpaşa", "Konyaaltı", "Kepez"],
  Trabzon: ["Ortahisar", "Akçaabat"],
  Konya: ["Selçuklu", "Meram", "Karatay"],
  Kayseri: ["Melikgazi", "Kocasinan", "Talas"],
  Gaziantep: ["Şahinbey", "Şehitkamil"],
  Erzurum: ["Yakutiye", "Palandöken"],
  Samsun: ["İlkadım", "Atakum"],
  Denizli: ["Pamukkale", "Merkezefendi"],
};

export const CITIES = Object.keys(LOCATIONS);

export function districtsFor(city: string): string[] {
  return LOCATIONS[city] ?? [];
}
