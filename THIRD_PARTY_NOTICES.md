# Avvisi sulle componenti di terze parti

Il progetto è distribuito con licenza MIT (vedi `LICENSE`). Questo file elenca tutto ciò che il progetto **usa** ma **non possiede**,
così da sapere quali licenze si applicano.

## Librerie importate

**Nessuna libreria di terze parti è inclusa o scaricata.** Non ci sono `pip install`, `npm install`, CDN, framework o file `.min.js`.

| Componente | Uso | Licenza | Inclusa nel repo? |
|---|---|---|---|
| Libreria standard di Python (`http.server`, `json`, `csv`, `io`, `mimetypes`, `os`, `random`, `socket`, `sys`, `threading`, `time`, `uuid`, `urllib.parse`) | server HTTP e salvataggio dati | [PSF License](https://docs.python.org/3/license.html) | No: è l'interprete Python già installato nel PC |
| API del browser (Canvas 2D, WebAudio, Web Share, Clipboard, Web Animations, View Transitions) | grafica, suoni, condivisione | standard web (nessuna licenza da rispettare) | No |

## Risorse grafiche, font e audio

- **Font:** vengono usati solo i font di sistema (`system-ui`, Segoe UI, Georgia, Courier New, Comic Sans MS, ecc.). Nessun file di font è distribuito o scaricato.
- **Emoji:** sono disegnate dal sistema operativo/browser dell'utente (per esempio Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji), ciascuno con la licenza del proprio produttore. Il progetto non ne ridistribuisce alcuna.
- **Grafici e effetti:** disegnati a mano in SVG/Canvas dal codice del progetto (radar, istogrammi, particelle, temi).
- **Suoni:** sintetizzati in tempo reale con WebAudio; non ci sono file audio.
- **Immagini:** nessuna immagine è inclusa nel repository.

## Servizi esterni

Nessuna chiamata a servizi esterni durante l'uso: l'app funziona in rete locale, anche senza Internet. I pulsanti di condivisione aprono
semplicemente link a WhatsApp, Telegram, X o SMS nel browser dell'utente; nessun SDK di terze parti è caricato.

## Marchi

I nomi di prodotti e marche delle pizze, se inseriti, restano nel file locale `data.json` (escluso dal repository) e appartengono ai rispettivi proprietari.

## Se aggiungi dipendenze

Se in futuro importi una libreria o una risorsa (JS, font, icone, immagini, audio), aggiungila alla tabella qui sopra con nome, versione, licenza e link,
e copia il testo della licenza se richiesto (MIT, BSD e Apache-2.0 richiedono di mantenere l'avviso di copyright).
