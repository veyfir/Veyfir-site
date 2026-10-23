# Veyfir website — v2

Deze versie is gebouwd in **HTML + CSS + JavaScript**. Je kunt `index.html` openen in een browser of alle bestanden uploaden naar GitHub Pages, Netlify, Vercel of Hostinger. Houd de map `assets` naast je HTML-bestand.

## Wat zit erin?

- Donkergroen ontwerp met twee grote downloadknoppen (Windows / macOS).
- **Echt bewegende oranje SVG-lijnen** (dunne, open contouren vormen een samenhangend stromingsveld; geen gif, foto of videobackground).
- Camera-shutter-animatie die draait en rustig opent/sluit, met zacht meebewegend app-icoon.
- Alleen **Capture** als app-preview, zonder macOS-verkeerslichtjes. De bovenrand is Windows-stijl; de originele screenshot is aangepast zodat de naam Veyfir staat.
- Responsive desktop/mobiel; op apparaten met 'reduce motion' worden de animaties uitgezet.
- Report-a-bug-formulier, klaar om te verbinden aan EmailJS.

## 1. Downloads activeren

Open `config.js` en vul `downloads.windows` en `downloads.mac` in met de echte links naar de `.exe` (of `.msi`) en `.dmg` (of `.pkg`). Je kunt bijvoorbeeld HTTPS-links van een GitHub Releases-pagina gebruiken.

Staan ze leeg, dan wordt **niet** gedaan alsof er een installer is. De website laat dan een duidelijke melding zien.

## 2. Bugreports per e-mail ontvangen (EmailJS)

Deze site werkt met EmailJS zonder eigen backend. Maak op [emailjs.com](https://www.emailjs.com/) een account aan, koppel je ontvangende e-mailadres en maak een template voor Veyfir. Vul daarna in `config.js` in:

- `emailjs.publicKey`
- `emailjs.serviceId`
- `emailjs.templateId`

Voorbeeld van een EmailJS-template:

**Subject**: `{{subject}}`

**Body**:

```text
New Veyfir bug report

From: {{from_email}}
Platform: {{platform}}

{{message}}
```

Zet eventueel **Reply To** in het EmailJS-template op `{{reply_to}}`.

`supportEmail` is een optionele fallback: als EmailJS nog niet is ingesteld, opent dit de e-mailapp van de bezoeker met een ingevuld bericht. Dat is **niet** hetzelfde als direct verzenden. Met lege instellingen zal het formulier aangeven dat verzending nog niet is ingesteld.

Let op: E-mailadressen, templates en diensten in de configuratie zijn placeholders. Totdat jij ze configureert is het verzenden niet actief.

## 3. Publiceren

Upload de **inhoud** van deze map (niet noodzakelijk de map zelf) naar je hosting. De site werkt zonder installatieproces of build tools.

## Aanpassen

- Teksten: `index.html`
- Kleuren / typografie / layout: `styles.css`
- Snelheid en vorm van de oranje lijnen: `script.js` → `updateLines()`
- Open- en sluitbeweging van de shutter: `script.js` → `updateBlades()`
- Shutter-rotatiesnelheid: `script.js` → `updateBlades()` (4 graden per seconde, rond SVG-punt 0,0)
- App-screenshot: `assets/capture-preview.webp`


## Lokale preview en verificatie

Start vanuit deze map `python3 -m http.server 8000 --bind 127.0.0.1` en open http://127.0.0.1:8000.
Zie `verification/TEST-REPORT.md` voor de uitgevoerde controles en beperkingen, en de desktop- en mobiele screenshots in dezelfde map.

De lijnvoering is op verzoek bijgesteld naar een compact stromingsveld met open segmenten en plaatselijk uitwaaierende contouren. De shutter gebruikt expliciete SVG-rotatie rond (0,0), zodat de bladen binnen de ring blijven. Animaties behouden hun fase bij pauzeren en stoppen buiten beeld, bij een verborgen tab en bij verminderde beweging. Op mobiel vervalt de decoratieve achtergrond om de inhoud rustig te houden.
