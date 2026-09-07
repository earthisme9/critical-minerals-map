#!/usr/bin/env python3
"""Python 3.9+, standard library only. python3 news_service.py [--collect]"""
import concurrent.futures, datetime as dt, email.utils, functools, http.server, json, os, re, threading, time, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
ROOT = Path(__file__).resolve().parent
STORE = ROOT / 'news.json'
LOCK = threading.Lock()
TERMS = {
 'cu': ['구리 동정광 전기동', 'copper cathode concentrate'],
 'li': ['리튬 탄산리튬 수산화리튬', 'lithium spodumene'],
 'ni': ['니켈 황산니켈', 'nickel MHP'],
 'mn': ['망간 황산망간 페로망간', 'manganese ferromanganese'],
 'co': ['코발트 황산코발트', 'cobalt'],
 'graphite': ['흑연 음극재', 'graphite'],
 'ree': ['네오디뮴 프라세오디뮴 터븀 영구자석', 'neodymium praseodymium terbium NdPr NdFeB'],
 'lree': ['세륨 란타넘 산화세륨', 'cerium lanthanum']}
MARKETS = {'배터리': r'배터리|양극|음극|battery|batteries|cathode|anode', '철강': r'철강|스테인리스|steel|ferromanganese', '전력망': r'전력망|전선|grid|cable', 'EV·모터': r'전기차|모터|electric vehicle|motor', '풍력': r'풍력|wind', '촉매·정유': r'촉매|정유|catalyst|catalytic|petroleum', '반도체·연마': r'반도체|연마|semiconductor|polishing'}
STAGES = {'채굴': r'채굴|광산|정광|mine\b|mining|concentrate|ore\b', '제련·정제': r'제련|정제|정련|분리|refin|smelt|separation|MHP', '소재': r'양극|음극|황산|탄산|산화|cathode|anode|sulfate|carbonate|oxide', '부품': r'자석|모터|magnet|motor', '최종 수요': r'전기차|풍력|electric vehicle|wind turbine', '재활용': r'재활용|recycl'}
def now(): return dt.datetime.now(dt.timezone.utc).isoformat()
def read_store():
 try: return json.loads(STORE.read_text())
 except (OSError, ValueError): return {'articles': [], 'status': {}, 'updatedAt': None}
def tags(text, rules):
 return [{'label': label, 'evidence': match.group(0)} for label, pattern in rules.items() if (match := re.search(pattern, text, re.I))]
def fetch_feed(mid, language, words):
 query = '(' + ' OR '.join('"'+w+'"' for w in words.split()) + ') when:14d'
 locale = {'hl': 'ko', 'gl': 'KR', 'ceid': 'KR:ko'} if language == 0 else {'hl': 'en-US', 'gl': 'US', 'ceid': 'US:en'}
 url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode(dict(q=query, **locale))
 for attempt in range(3):
  try:
   req = urllib.request.Request(url, headers={'User-Agent': 'MineralNewsMonitor/1.0'})
   with urllib.request.urlopen(req, timeout=20) as response: root = ET.fromstring(response.read())
   if root.tag != 'rss': raise ValueError('RSS 형식이 아닙니다')
   items = []
   for item in root.findall('./channel/item'):
    title, link = item.findtext('title', '').strip(), item.findtext('link', '').strip()
    if not title or not link.startswith(('https://', 'http://')): continue
    try: published = email.utils.parsedate_to_datetime(item.findtext('pubDate', '')).astimezone(dt.timezone.utc)
    except (ValueError, TypeError): continue
    if published < dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=14): continue
    items.append({'title': title, 'link': link, 'source': item.findtext('source', ''), 'pubDate': published.isoformat(), 'mineralIds': [mid], 'markets': tags(title, MARKETS), 'stages': tags(title, STAGES), 'classificationBasis': '제목 키워드 · 검색 광물 기준'})
   return items
  except Exception:
   if attempt == 2: raise
   time.sleep(2 ** attempt)
def collect():
 if not LOCK.acquire(blocking=False): return read_store()
 try:
  previous = read_store(); stamp = now(); status = {}; found = []; errors = {}
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   jobs = {pool.submit(fetch_feed, mid, lang, words): (mid, lang) for mid, variants in TERMS.items() for lang, words in enumerate(variants)}
   for future in concurrent.futures.as_completed(jobs):
    mid, lang = jobs[future]
    try: found.extend(future.result())
    except Exception as exc: errors.setdefault(mid, []).append(('한국어' if lang == 0 else '영어') + ': ' + str(exc))
  for mid in TERMS:
   count = sum(mid in a['mineralIds'] for a in found)
   status[mid] = {'state': ('failed' if len(errors.get(mid, [])) == 2 else 'partial') if mid in errors else ('ok' if count else 'empty'), 'count': count, 'checkedAt': stamp, 'errors': errors.get(mid, [])}
  merged = {}
  cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=60)
  for article in previous.get('articles', []) + sorted(found, key=lambda a: a['link']):
   if dt.datetime.fromisoformat(article['pubDate']) < cutoff: continue
   key = article['link']
   if key in merged:
    merged[key]['mineralIds'] = sorted(set(merged[key]['mineralIds'] + article['mineralIds']))
   else: merged[key] = dict(article, firstSeenAt=article.get('firstSeenAt', stamp))
  result = {'updatedAt': stamp, 'lastSuccessAt': stamp if len(errors) < 8 or any(len(v)<2 for v in errors.values()) else previous.get('lastSuccessAt'), 'status': status, 'articles': sorted(merged.values(), key=lambda a: a['pubDate'], reverse=True)[:3000]}
  temp = STORE.with_suffix('.tmp'); temp.write_text(json.dumps(result, ensure_ascii=False, indent=2)); os.replace(temp, STORE)
  return result
 finally: LOCK.release()
class Handler(http.server.SimpleHTTPRequestHandler):
 def do_GET(self):
  if urllib.parse.urlparse(self.path).path == '/api/news':
   data = read_store(); updated = data.get('updatedAt')
   if not updated or (dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(updated)).total_seconds() > 3600:
    threading.Thread(target=collect, daemon=True).start()
   body = json.dumps(dict(data, collecting=LOCK.locked()), ensure_ascii=False).encode()
   self.send_response(200); self.send_header('Content-Type', 'application/json; charset=utf-8'); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(body)
  else: super().do_GET()
def schedule():
 while True:
  try:
   data = read_store(); last = data.get('updatedAt')
   retry_after = 3600 if any(s['state'] in ('failed', 'partial') for s in data.get('status', {}).values()) else 86400
   if not last or (dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(last)).total_seconds() >= retry_after: collect()
  except Exception as exc: print('수집 오류:', exc, flush=True)
  time.sleep(60)
if __name__ == '__main__':
 import argparse
 parser = argparse.ArgumentParser(); parser.add_argument('--collect', action='store_true'); parser.add_argument('--port', type=int, default=8080); args = parser.parse_args()
 if args.collect:
  result = collect(); print(json.dumps(result['status'], ensure_ascii=False, indent=2))
  raise SystemExit(1 if all(s['state']=='failed' for s in result['status'].values()) else 0)
 threading.Thread(target=schedule, daemon=True).start()
 print(f'http://localhost:{args.port} 에서 열어주세요. 종료: Ctrl+C', flush=True)
 http.server.ThreadingHTTPServer(('127.0.0.1', args.port), functools.partial(Handler, directory=str(ROOT))).serve_forever()
