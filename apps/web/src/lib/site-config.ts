/** Placeholder copy and addresses for the public page; edit these to match the real server. */
export const siteConfig = {
  name: "SPIATEK MC",
  description: "Wspólny serwer Minecraft. Wbijaj, buduj, eksploruj.",
  address: "spiatek.pl",
  minecraftEdition: "Java Edition",
  contact: "Masz pytanie albo chcesz się dopisać? Użyj formularza kontaktowego.",
  steps: [
    {
      title: "Odpal Grę",
      text: "Potrzebujesz konta Minecraft Java Edition w 26.2.",
    },
    {
      title: "Dodaj serwer",
      text: "Multiplayer → Add Server i wklej adres serwera. Nic więcej nie trzeba ustawiać.",
    },
    {
      title: "Daj się dopisać",
      text: "Serwer działa na whiteliście. Wyślij adminowi swój nick przez formularz kontaktowy, a dopisze Cię do listy.",
    },
  ],
  faq: [
    {
      question: "Jak dołączyć do serwera?",
      answer:
        "Dodaj adres serwera w zakładce Multiplayer w Minecraft Java Edition. Zanim wejdziesz, admin musi dodać Twój nick do whitelisty (wyślij go przez formularz kontaktowy na dole strony).",
    },
    {
      question: "Dlaczego widzę komunikat o whiteliście?",
      answer:
        "Serwer jest prywatny i wpuszcza tylko osoby z listy. Jeśli widzisz „You are not whitelisted on this server”, wyślij adminowi swój dokładny nick przez formularz kontaktowy na dole strony.",
    },
    {
      question: "Jakiej wersji Minecrafta potrzebuję?",
      answer:
        "Dokładna wersja jest widoczna w sekcji Status powyżej. Jeśli klient jest w innej wersji, launcher pozwala wybrać ją w profilu.",
    },
    {
      question: "Czy da się grać na Bedrocku, telefonie lub konsoli?",
      answer: "Serwer jest dla Minecraft Java Edition na komputerze. Wersje Bedrock nie są obsługiwane.",
    },
    {
      question: "Jakie są zasady?",
      answer:
        "Nie niszcz cudzych budowli, nie kradnij i nie używaj cheatów. Szczegóły ustal z adminem przez formularz kontaktowy.",
    },
    {
      question: "Gdzie zgłosić problem albo pomysł?",
      answer: "Napisz do admina przez formularz kontaktowy w sekcji „Napisz do admina” na dole strony.",
    },
  ],
} as const;
