# 🍕 Quiz Pizza — la sfida delle pizze surgelate

Un sito per votare in casa una sfida di pizze surgelate: **ognuno vota dal proprio telefono**, e sul PC che ospita il server c'è una **dashboard live** con classifica, radar e premiazione finale.

Nessuna autenticazione (si entra solo con il nome), nessuna dipendenza da installare: **solo Python 3** (libreria standard) e HTML/JS puro.

## Avvio rapido

```bash
python server.py          # porta 8080 (oppure: python server.py 9000)
```

Su Windows basta fare doppio clic su `avvia.bat` (avvia il server e apre la dashboard).

All'avvio il server stampa gli indirizzi:

| Chi | Indirizzo |
|---|---|
| Telefoni (stessa rete Wi-Fi) | `http://<IP-del-PC>:8080/` |
| Dashboard (solo dal PC del server) | `http://localhost:8080/dashboard` |

> **Firewall di Windows:** per far collegare i telefoni apri la porta una volta, da PowerShell come amministratore:
> `netsh advfirewall firewall add rule name="Pizza Vote 8080" dir=in action=allow protocol=TCP localport=8080 profile=private,domain`

La dashboard e tutte le funzioni di amministrazione (aggiungere pizze, azzerare i voti, avviare la cerimonia…) funzionano **solo da `localhost`**: i giurati non possono sbirciare i punteggi dal telefono.

## Cosa c'è dentro

**Telefono (giurati)**
- Ingresso con solo il nome, elenco pizze con prezzo, stato di avanzamento e la prossima pizza da votare.
- Voto da 1 a 10 su 8 categorie (gusto, guarnitura, impasto, croccantezza, formaggio, aspetto, rapporto qualità/prezzo, aspettativa), con barra fissa in alto che ricorda quale pizza stai votando. Scorrere la pagina non cambia mai i voti.
- Area "Nell'attesa": **Pizza Ninja** (minigioco con classifica e bonus ⭐ da 500 punti), lista dei giurati con avanzamento, **pronostico sul vincitore** e curiosità.
- Reazioni emoji in diretta che volano anche sulla dashboard.
- **Condividi sui social** 📣: a fine partita di Pizza Ninja, a fine cerimonia e dalla dashboard si genera una cartolina PNG con i colori del tema e si apre il foglio di condivisione (condivisione nativa del telefono, WhatsApp, Telegram, X, messaggio, scarica immagine, copia testo).

**Dashboard (PC)**
- Classifica animata, **radar** di tutte le pizze sulle categorie, mappa di calore, "Sorpresa o delusione" (aspettativa vs realtà), chi ha votato, record di Pizza Ninja.
- **Cerimonia di premiazione** 🏆: conto alla rovescia, rullo di tamburi, podio, fuochi d'artificio e **premi speciali** calcolati dai voti (più divisiva, affare della serata, giurato più severo/generoso, anime gemelle, rivali di palato…). Parte in contemporanea su tutti i dispositivi.
- Gestione pizze (nome e prezzo), **avviso scorrevole** personalizzabile (compare sulla dashboard e sui telefoni), azzeramento voti, interruttore **temi on/off** e audio.
- **Pagina Statistiche per smanettoni** 📊 (`/stats`): medie e σ per categoria, istogrammi, correlazioni tra categorie, prezzo vs punteggio, bias dei giurati, matrice giurati × pizze ed export CSV/JSON. Si apre a fine serata (link in fondo alla cerimonia) ed è sempre disponibile dal PC del server.

**Temi** 🎨 — 20 temi (Gay Pride, Natale, Medievale, Matrix, Spazio, Tropicale, Halloween, Synthwave, Giappone, Far West, Abissi, Foresta incantata, Inferno, Tempesta pirata, Antico Egitto, Discoteca, Fumetti, Caramelle, Cinema Noir e la classica) che **ruotano ogni minuto in modo casuale**, uguali per tutti i dispositivi, con annuncio a schermo e senza ricaricare la pagina. Si possono disattivare dalla dashboard.

**Suoni** 🔊 — effetti sintetizzati con WebAudio (nessun file audio). Il browser li sblocca al primo tocco; si possono silenziare dall'etichetta in basso a sinistra o dalla dashboard.

## Configurazione

- **Pizze e prezzi:** si aggiungono dalla dashboard (sezione "Gestione pizze").
- **Categorie di voto:** lista `CATEGORIES` in `server.py`.
- **Temi:** definizioni, colori ed effetti in `static/assets/theme.js`; elenco/durata (`THEMES`, `THEME_SECS`) in `server.py`.
- **Dati:** tutto è salvato in `data.json` (pizze, voti, pronostici, record del gioco), accanto a `server.py`. Il file viene **creato automaticamente al primo avvio** (se è rovinato viene messo da parte come `data.json.bak`) ed è escluso da git: ogni copia del repo parte con una sfida vuota.

## Struttura

```
server.py                 server HTTP + API (solo libreria standard)
avvia.bat                 avvio rapido su Windows
static/
  index.html              app dei giurati (telefono)
  dashboard.html          dashboard sul PC
  assets/theme.js         temi, effetti e sincronizzazione
  assets/sfx.js           effetti sonori
  assets/ceremony.js      cerimonia di premiazione
  assets/share.js         cartolina e condivisione social
  stats.html              pagina statistiche
data.json                 creato a runtime, non versionato
```

## API in breve

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/api/config` | categorie e pizze |
| POST | `/api/vote` | `{name, pizza, scores}` |
| GET | `/api/results` | classifica e medie — **solo localhost** |
| GET/POST | `/api/bet` | pronostico del giurato |
| GET/POST | `/api/score` | record di Pizza Ninja |
| GET/POST | `/api/reactions`, `/api/react` | reazioni emoji in diretta |
| GET | `/api/theme` | tema corrente (cambia ogni 60 s) |
| GET | `/api/ceremony`, `/api/final`, `/api/stats`, `/api/export.csv` | cerimonia e dati finali: visibili solo a cerimonia avviata (o da localhost) |
| POST | `/api/pizzas`, `/api/reset`, `/api/ceremony/start`, `/api/settings/themes` … | amministrazione, **solo localhost** |

## Licenza

Rilasciato con licenza **MIT** (vedi [`LICENSE`](LICENSE)). Il progetto non include librerie di terze parti: gli avvisi su ciò che usa (libreria standard di Python, font ed emoji di sistema) sono in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Requisiti

Python 3.8+ e un browser moderno (testato su desktop e telefono). Funziona in rete locale, senza connessione a Internet.
