# Hochzeitsbuffet von Mariella & Elias

Eine responsive Hochzeitswebsite für GitHub Pages. Gäste tragen ihren Namen und ihre mitgebrachte Speise ein; die gemeinsame Liste wird über Supabase für alle sichtbar und live aktualisiert.

## Lokal ansehen

Die `index.html` kann direkt geöffnet werden. Ohne Supabase läuft die Seite automatisch im Vorschaumodus und speichert Einträge nur im Browser.

## Gemeinsame Liste mit Supabase einrichten

1. Unter [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen.
2. Im **SQL Editor** den Inhalt von `supabase.sql` ausführen.
3. Unter **Project Settings → API** die **Project URL** und den **anon public key** kopieren.
4. Beide Werte in `config.js` eintragen:

```js
window.WEDDING_CONFIG = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "DEIN-ANON-PUBLIC-KEY"
};
```

Der öffentliche `anon`-Schlüssel darf auf einer Website stehen. Die Regeln in `supabase.sql` erlauben Gästen ausschließlich das Lesen und Anlegen von Beiträgen; Änderungen oder Löschungen sind nicht freigegeben.

## Auf GitHub Pages veröffentlichen

1. Ein neues GitHub-Repository anlegen und diese Dateien in den Branch `main` pushen.
2. Im Repository **Settings → Pages** öffnen.
3. Unter **Build and deployment → Source** die Option **GitHub Actions** auswählen.
4. Der mitgelieferte Workflow veröffentlicht die Seite automatisch. Die Adresse erscheint anschließend im Pages-Bereich und im Actions-Lauf.

## Inhalte anpassen

- Texte stehen in `index.html`.
- Farben und Gestaltung stehen am Anfang von `styles.css` als CSS-Variablen.
- Die Supabase-Verbindung steht in `config.js`.
