"""Sfida delle pizze surgelate - server di votazione (solo libreria standard Python).

Avvio:  python server.py [porta]
Telefoni:  http://<IP-del-PC>:8080/
Dashboard: http://localhost:8080/dashboard   (solo dal PC che esegue il server)
"""
import csv
import io
import json
import random
import time
import mimetypes
import os
import socket
import sys
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

BASE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(BASE, "static")
DATA_FILE = os.path.join(BASE, "data.json")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

# Categorie di voto (voto 1-10). Modificale a piacere.
CATEGORIES = [
    {"id": "gusto", "label": "Gusto", "icon": "😋"},
    {"id": "guarnitura", "label": "Guarnitura", "icon": "🍅"},
    {"id": "impasto", "label": "Impasto / Base", "icon": "🍞"},
    {"id": "cottura", "label": "Croccantezza", "icon": "🔥"},
    {"id": "formaggio", "label": "Formaggio", "icon": "🧀"},
    {"id": "aspetto", "label": "Aspetto", "icon": "📸"},
    {"id": "prezzo", "label": "Rapporto qualità/prezzo", "icon": "💶"},
    {"id": "aspettativa", "label": "Aspettativa", "icon": "🤞"},
]
CAT_IDS = [c["id"] for c in CATEGORIES]

lock = threading.Lock()

THEMES = ["classica", "pride", "natale", "medievale", "matrix", "spazio", "tropicale", "halloween", "synthwave", "giappone",
          "western", "abissi", "foresta", "inferno", "tempesta", "egitto", "disco", "comics", "candy", "noir"]
THEME_SECS = 60
theme = {"id": None, "seq": 0, "until": 0.0}  # tema corrente, uguale per tutti i dispositivi


ceremony = {"active": False, "seq": 0, "t0": 0.0}  # cerimonia di premiazione in corso?


def themes_on():
    return db["settings"].get("themes", True)


def theme_state():  # da chiamare con il lock preso
    now = time.time()
    if not themes_on():
        return {"id": "classica", "seq": theme["seq"], "left": THEME_SECS, "total": THEME_SECS, "enabled": False}
    if now >= theme["until"]:
        theme["id"] = random.choice([t for t in THEMES if t != theme["id"]])
        theme["seq"] += 1
        theme["until"] = now + THEME_SECS
    return {"id": theme["id"], "seq": theme["seq"], "left": round(theme["until"] - now, 1), "total": THEME_SECS, "enabled": True}

REACTIONS = ["🔥", "😍", "🤤", "🤮", "😱", "👏", "💩", "🍍"]
reactions = []  # [{id, name, emoji}] solo in memoria, ultime 200
react_seq = 0


def load():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, encoding="utf-8-sig") as f:
                return json.load(f)
        except ValueError:  # file rovinato: lo metto da parte e riparto da zero
            os.replace(DATA_FILE, DATA_FILE + ".bak")
    return {"pizzas": [], "votes": {}}  # votes[pizza_id][voter_key] = {name, scores}


def save(db):
    tmp = DATA_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    os.replace(tmp, DATA_FILE)


db = load()
db.setdefault("bets", {})      # pronostici: bets[voter_key] = {name, pizza}
db.setdefault("settings", {})  # impostazioni dalla dashboard (es. temi on/off)
db.setdefault("scores", {})  # classifica del minigioco: scores[voter_key] = {name, best}


def top_scores(n):
    return sorted(db["scores"].values(), key=lambda s: -s["best"])[:n]


if not os.path.exists(DATA_FILE):
    save(db)  # prima esecuzione: crea data.json con la struttura vuota


def results():
    out = []
    voters = {}
    for p in db["pizzas"]:
        votes = db["votes"].get(p["id"], {})
        cats = {}
        for c in CAT_IDS:
            vals = [v["scores"][c] for v in votes.values() if c in v["scores"]]
            cats[c] = round(sum(vals) / len(vals), 2) if vals else None
        avgs = [x for x in cats.values() if x is not None]
        total = round(sum(avgs) / len(avgs), 2) if avgs else None
        for k, v in votes.items():
            voters.setdefault(k, {"name": v["name"], "count": 0})["count"] += 1
        real_vals = [v for k, v in cats.items() if k != "aspettativa" and v is not None]
        real = round(sum(real_vals) / len(real_vals), 2) if real_vals else None
        exp = cats.get("aspettativa")
        delta = round(real - exp, 2) if real is not None and exp is not None else None
        out.append({**p, "cats": cats, "total": total, "n": len(votes), "real": real, "expect": exp, "delta": delta})
    out.sort(key=lambda p: (p["total"] is None, -(p["total"] or 0)))
    return {
        "categories": CATEGORIES,
        "pizzas": out,
        "voters": sorted(voters.values(), key=lambda v: v["name"].lower()),
        "npizzas": len(db["pizzas"]),
        "scores": top_scores(5),
        "bets": len(db["bets"]),
        "notice": db["settings"].get("notice", ""),
    }


def _sd(xs):
    m = sum(xs) / len(xs)
    return (sum((x - m) ** 2 for x in xs) / len(xs)) ** .5


def final_data():
    """Classifica finale + premi speciali + pronostici (da chiamare con il lock preso)."""
    res = results()
    pizzas = res["pizzas"]
    by_id = {p["id"]: p for p in pizzas}
    vm, voters, points = {}, {}, {}
    for pid, votes in db["votes"].items():
        if pid not in by_id:
            continue
        for key, v in votes.items():
            sc = {k: x for k, x in v["scores"].items() if k != "aspettativa"}
            if not sc:
                continue
            m = sum(sc.values()) / len(sc)
            vm.setdefault(pid, []).append(m)
            voters.setdefault(key, {"name": v["name"], "vals": []})["vals"].append(m)
            for c, x in sc.items():
                points.setdefault(key, {})[(pid, c)] = x
    awards = []
    icons = {c["id"]: c["icon"] for c in CATEGORIES}
    for cid, title in (("gusto", "Re del gusto"), ("guarnitura", "Guarnitura da urlo"), ("cottura", "Campione di croccantezza")):
        cand = [p for p in pizzas if p["cats"].get(cid) is not None]
        if cand:
            b = max(cand, key=lambda p: p["cats"][cid])
            awards.append({"icon": icons[cid], "title": title, "who": b["name"], "detail": ("media %.1f" % b["cats"][cid]).replace(".", ",")})
    cand = [p for p in pizzas if p.get("price") and p["total"] is not None]
    if cand:
        b = max(cand, key=lambda p: p["total"] / p["price"])
        awards.append({"icon": "💶", "title": "L'affare della serata", "who": b["name"], "detail": ("%.1f punti a %.2f €" % (b["total"], b["price"])).replace(".", ",")})
    div = [(_sd(vm[p["id"]]), p) for p in pizzas if len(vm.get(p["id"], [])) >= 2]
    if div:
        _, b = max(div, key=lambda t: t[0])
        vals = vm[b["id"]]
        awards.append({"icon": "⚔️", "title": "La più divisiva", "who": b["name"], "detail": ("voti da %.1f a %.1f" % (min(vals), max(vals))).replace(".", ",")})
    dl = [p for p in pizzas if p["delta"] is not None]
    if dl:
        worst, best = min(dl, key=lambda p: p["delta"]), max(dl, key=lambda p: p["delta"])
        if worst["delta"] < -0.3:
            awards.append({"icon": "📉", "title": "La più sopravvalutata", "who": worst["name"], "detail": ("aspettativa %.1f → realtà %.1f" % (worst["expect"], worst["real"])).replace(".", ",")})
        if best["delta"] > 0.3:
            awards.append({"icon": "🎁", "title": "La sorpresa della serata", "who": best["name"], "detail": ("aspettativa %.1f → realtà %.1f" % (best["expect"], best["real"])).replace(".", ",")})
    vs = [(sum(v["vals"]) / len(v["vals"]), v["name"]) for v in voters.values()]
    if len(vs) >= 2:
        lo, hi = min(vs), max(vs)
        awards.append({"icon": "🧐", "title": "Il giurato più severo", "who": lo[1], "detail": ("voto medio %.1f" % lo[0]).replace(".", ",")})
        awards.append({"icon": "🥰", "title": "Il giurato più generoso", "who": hi[1], "detail": ("voto medio %.1f" % hi[0]).replace(".", ",")})
    keys, pairs = list(points), []
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            a, b = points[keys[i]], points[keys[j]]
            common = a.keys() & b.keys()
            if len(common) >= 6:
                pairs.append((sum(abs(a[k] - b[k]) for k in common) / len(common), voters[keys[i]]["name"], voters[keys[j]]["name"]))
    if pairs:
        pairs.sort()
        d, x, y = pairs[0]
        awards.append({"icon": "👯", "title": "Anime gemelle", "who": f"{x} e {y}", "detail": "gusti quasi identici"})
        if len(pairs) > 1:
            d, x, y = pairs[-1]
            awards.append({"icon": "🥊", "title": "Rivali di palato", "who": f"{x} e {y}", "detail": "gusti opposti"})
    win = pizzas[0] if pizzas and pizzas[0]["total"] is not None else None
    bets = {"total": len(db["bets"]), "winner": win["id"] if win else None,
            "correct": sorted(b["name"] for b in db["bets"].values() if win and b["pizza"] == win["id"])}
    return {"pizzas": pizzas, "awards": awards, "bets": bets}


def _mean(xs):
    return sum(xs) / len(xs) if xs else None


def _pearson(xs, ys):
    n = len(xs)
    if n < 3:
        return None
    mx, my = _mean(xs), _mean(ys)
    sxx, syy = sum((x - mx) ** 2 for x in xs), sum((y - my) ** 2 for y in ys)
    if not sxx or not syy:
        return None
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sxx * syy) ** .5


def stats_data():
    """Numeri per la pagina /stats (da chiamare con il lock preso)."""
    res = results()
    cats = [c["id"] for c in CATEGORIES]
    by_id = {p["id"]: p for p in res["pizzas"]}
    rows = [(pid, key, v["name"], v["scores"]) for pid, votes in db["votes"].items() if pid in by_id for key, v in votes.items()]
    per = []
    for p in res["pizzas"]:
        mine = [r for r in rows if r[0] == p["id"]]
        hist, flat = [0] * 10, []
        for r in mine:
            for x in r[3].values():
                hist[x - 1] += 1
                flat.append(x)
        cs = {}
        for c in cats:
            xs = [r[3][c] for r in mine if c in r[3]]
            cs[c] = {"mean": round(_mean(xs), 2) if xs else None, "sd": round(_sd(xs), 2) if xs else None, "n": len(xs)}
        per.append({"id": p["id"], "name": p["name"], "price": p.get("price"), "n": p["n"], "total": p["total"],
                    "sd": round(_sd(flat), 2) if flat else None, "expect": p["expect"], "real": p["real"], "delta": p["delta"], "hist": hist, "cats": cs})
    corr = {}
    for a in cats:
        for b in cats:
            if a != b:
                prs = [(r[3][a], r[3][b]) for r in rows if a in r[3] and b in r[3]]
                v = _pearson([x for x, _ in prs], [y for _, y in prs])
                corr[a + "|" + b] = None if v is None else round(v, 3)
    drivers = []
    for c in CATEGORIES:
        xs, ys = [], []
        for r in rows:
            others = [v for k, v in r[3].items() if k != c["id"]]
            if c["id"] in r[3] and others:
                xs.append(r[3][c["id"]])
                ys.append(_mean(others))
        v = _pearson(xs, ys)
        drivers.append({"icon": c["icon"], "label": c["label"], "r": None if v is None else round(v, 3)})
    vm = {}
    for r in rows:
        sc = [x for k, x in r[3].items() if k != "aspettativa"]
        if sc:
            vm[(r[0], r[1])] = _mean(sc)
    names = {r[1]: r[2] for r in rows}
    voters = []
    for key, name in names.items():
        mine = {pid: m for (pid, k), m in vm.items() if k == key}
        if not mine:
            continue
        diffs = []
        for pid, m in mine.items():
            others = [mm for (p2, k2), mm in vm.items() if p2 == pid and k2 != key]
            if others:
                diffs.append(m - _mean(others))
        fav, least = max(mine, key=mine.get), min(mine, key=mine.get)
        voters.append({"name": name, "pizzas": len(mine), "mean": round(_mean(list(mine.values())), 2), "sd": round(_sd(list(mine.values())), 2),
                       "bias": round(_mean(diffs), 2) if diffs else None, "fav": by_id[fav]["name"], "least": by_id[least]["name"] if len(mine) > 1 else None})
    voters.sort(key=lambda v: v["name"].lower())
    matrix = {names[key] + "|" + pid: round(m, 2) for (pid, key), m in vm.items()}
    meta = {"votes": len(rows), "voters": len(names), "pizzas": len(res["pizzas"]), "points": sum(len(r[3]) for r in rows),
            "bets": len(db["bets"]), "generated": time.time()}
    return {"meta": meta, "categories": CATEGORIES, "pizzas": per, "corr": corr, "drivers": drivers, "voters": voters, "matrix": matrix,
            "game": sorted(db["scores"].values(), key=lambda s: -s["best"])}


def export_csv():
    out = io.StringIO()
    w = csv.writer(out)
    ids = [c["id"] for c in CATEGORIES]
    w.writerow(["pizza", "prezzo_eur", "giurato"] + ids)
    for p in db["pizzas"]:
        for v in db["votes"].get(p["id"], {}).values():
            w.writerow([p["name"], p.get("price") or "", v["name"]] + [v["scores"].get(c, "") for c in ids])
    return out.getvalue()


def is_local(addr):
    return addr in ("127.0.0.1", "::1", "::ffff:127.0.0.1")


class Handler(BaseHTTPRequestHandler):
    server_version = "PizzaVote/1.0"

    def log_message(self, *a):
        pass

    # ---- helpers
    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, name):
        path = os.path.join(STATIC, name)
        if not os.path.isfile(path):
            return self.send_json({"error": "not found"}, 404)
        with open(path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            return {}

    def local_only(self):
        if is_local(self.client_address[0]):
            return True
        self.send_json({"error": "solo dal PC del server"}, 403)
        return False

    # ---- routes
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/":
            return self.send_file("index.html")
        if path.startswith("/assets/"):
            f = os.path.join(STATIC, "assets", os.path.basename(path))
            if not os.path.isfile(f):
                return self.send_json({"error": "not found"}, 404)
            with open(f, "rb") as fh:
                body = fh.read()
            self.send_response(200)
            ctype = "text/javascript; charset=utf-8" if f.endswith(".js") else (mimetypes.guess_type(f)[0] or "application/octet-stream")
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store" if f.endswith(".js") else "max-age=3600")
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/dashboard":
            if not self.local_only():
                return
            return self.send_file("dashboard.html")
        if path == "/api/config":
            with lock:
                return self.send_json({"categories": CATEGORIES, "pizzas": db["pizzas"], "notice": db["settings"].get("notice", "")})
        if path == "/api/mine":
            name = unquote(self.headers.get("X-Voter") or "").strip().lower()
            with lock:
                mine = {
                    p["id"]: db["votes"][p["id"]][name]["scores"]
                    for p in db["pizzas"]
                    if name in db["votes"].get(p["id"], {})
                }
            return self.send_json(mine)
        if path == "/api/results":
            if not self.local_only():
                return
            with lock:
                return self.send_json(results())
        if path == "/stats":
            return self.send_file("stats.html")
        if path in ("/api/stats", "/api/export.csv"):   # visibili a cerimonia avviata (o dal PC del server)
            if not (ceremony["active"] or is_local(self.client_address[0])):
                return self.send_json({"error": "non ancora"}, 403)
            with lock:
                if path == "/api/stats":
                    return self.send_json(stats_data())
                body = export_csv().encode("utf-8-sig")
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="sfida-pizze.csv"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/ceremony":
            with lock:
                return self.send_json({"active": ceremony["active"], "seq": ceremony["seq"], "t0": ceremony["t0"], "now": time.time()})
        if path == "/api/final":
            with lock:
                if not (ceremony["active"] or is_local(self.client_address[0])):
                    return self.send_json({"error": "non ancora"}, 403)
                return self.send_json(final_data())
        if path == "/api/bet":
            who = unquote(self.headers.get("X-Voter") or "").strip().lower()
            with lock:
                b = db["bets"].get(who)
                return self.send_json({"pizza": b["pizza"] if b else None, "locked": ceremony["active"]})
        if path == "/api/theme":
            with lock:
                return self.send_json(theme_state())
        if path == "/api/reactions":
            since = int((parse_qs(urlparse(self.path).query).get("since") or ["0"])[0] or 0)
            with lock:
                return self.send_json({"last": react_seq, "items": [r for r in reactions if r["id"] > since]})
        if path == "/api/jury":
            with lock:
                cnt = {}
                for votes in db["votes"].values():
                    for v in votes.values():
                        cnt[v["name"]] = cnt.get(v["name"], 0) + 1
                return self.send_json({"n": len(db["pizzas"]), "jury": [{"name": k, "count": c} for k, c in sorted(cnt.items(), key=lambda kv: kv[0].lower())]})
        if path == "/api/scores":
            with lock:
                return self.send_json(top_scores(10))
        if path == "/api/info":
            return self.send_json({"ip": lan_ip(), "port": PORT})
        self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        data = self.body()
        if path == "/api/vote":
            name = str(data.get("name", "")).strip()[:30]
            pid = data.get("pizza")
            scores = data.get("scores", {})
            if not name:
                return self.send_json({"error": "nome mancante"}, 400)
            clean = {}
            for c in CAT_IDS:
                v = scores.get(c)
                if isinstance(v, (int, float)) and 1 <= v <= 10:
                    clean[c] = int(v)
            with lock:
                if not any(p["id"] == pid for p in db["pizzas"]):
                    return self.send_json({"error": "pizza inesistente"}, 404)
                db["votes"].setdefault(pid, {})[name.lower()] = {"name": name, "scores": clean}
                save(db)
            return self.send_json({"ok": True})
        if path == "/api/theme/next":
            if not self.local_only():
                return
            with lock:
                theme["until"] = 0
                return self.send_json(theme_state())
        if path == "/api/theme/set":
            if not self.local_only():
                return
            with lock:
                if data.get("id") in THEMES:
                    theme.update(id=data["id"], seq=theme["seq"] + 1, until=time.time() + THEME_SECS)
                return self.send_json(theme_state())
        if path == "/api/settings/themes":
            if not self.local_only():
                return
            with lock:
                db["settings"]["themes"] = bool(data.get("enabled"))
                save(db)
                theme["seq"] += 1
                theme["until"] = 0
                return self.send_json(theme_state())
        if path == "/api/settings/notice":
            if not self.local_only():
                return
            with lock:
                db["settings"]["notice"] = str(data.get("text", "")).strip()[:300]
                save(db)
            return self.send_json({"ok": True})
        if path == "/api/ceremony/start":
            if not self.local_only():
                return
            with lock:
                ceremony.update(active=True, seq=ceremony["seq"] + 1, t0=time.time() + 1.5)
            return self.send_json({"ok": True})
        if path == "/api/ceremony/stop":
            if not self.local_only():
                return
            with lock:
                ceremony["active"] = False
            return self.send_json({"ok": True})
        if path == "/api/bet":
            name = str(data.get("name", "")).strip()[:30]
            pid = data.get("pizza")
            with lock:
                if ceremony["active"]:
                    return self.send_json({"error": "pronostici chiusi"}, 409)
                if not name or not any(p["id"] == pid for p in db["pizzas"]):
                    return self.send_json({"error": "dati non validi"}, 400)
                db["bets"][name.lower()] = {"name": name, "pizza": pid}
                save(db)
            return self.send_json({"ok": True})
        if path == "/api/react":
            global react_seq
            name = str(data.get("name", "")).strip()[:30]
            emoji = data.get("emoji")
            if not name or emoji not in REACTIONS:
                return self.send_json({"error": "dati non validi"}, 400)
            with lock:
                react_seq += 1
                reactions.append({"id": react_seq, "name": name, "emoji": emoji})
                del reactions[:-200]
            return self.send_json({"ok": True})
        if path == "/api/score":
            name = str(data.get("name", "")).strip()[:30]
            score = data.get("score")
            if not name or not isinstance(score, (int, float)) or not 0 <= score <= 5000:
                return self.send_json({"error": "dati non validi"}, 400)
            score, key = int(score), name.lower()
            with lock:
                cur = db["scores"].get(key)
                if not cur or score > cur["best"]:
                    db["scores"][key] = {"name": name, "best": score}
                    save(db)
                best = db["scores"][key]["best"]
                ranking = sorted(db["scores"], key=lambda k: -db["scores"][k]["best"])
                return self.send_json({"best": best, "rank": ranking.index(key) + 1, "top": top_scores(5)})
        if path == "/api/pizzas":
            if not self.local_only():
                return
            name = str(data.get("name", "")).strip()[:60]
            if not name:
                return self.send_json({"error": "nome mancante"}, 400)
            with lock:
                price = data.get("price")
                price = round(float(price), 2) if isinstance(price, (int, float)) and price > 0 else None
                db["pizzas"].append({"id": uuid.uuid4().hex[:8], "name": name, "price": price})
                save(db)
            return self.send_json({"ok": True})
        if path == "/api/reset":
            if not self.local_only():
                return
            with lock:
                db["votes"] = {}
                db["bets"] = {}
                ceremony["active"] = False
                save(db)
            return self.send_json({"ok": True})
        self.send_json({"error": "not found"}, 404)

    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith("/api/pizzas/"):
            if not self.local_only():
                return
            pid = path.rsplit("/", 1)[1]
            with lock:
                db["pizzas"] = [p for p in db["pizzas"] if p["id"] != pid]
                db["votes"].pop(pid, None)
                db["bets"] = {k: v for k, v in db["bets"].items() if v["pizza"] != pid}
                save(db)
            return self.send_json({"ok": True})
        self.send_json({"error": "not found"}, 404)


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    ip = lan_ip()
    print(f"\n🍕 Sfida delle pizze in ascolto\n")
    print(f"  Telefoni:   http://{ip}:{PORT}/")
    print(f"  Dashboard:  http://localhost:{PORT}/dashboard  (solo da questo PC)\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
