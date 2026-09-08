import tempfile, unittest
from pathlib import Path
from unittest.mock import patch
import news_service as n
class NewsTests(unittest.TestCase):
 def test_connections(self):
  text='Indonesia nickel MHP refining plant for battery supply'
  self.assertEqual(n.tags(text,n.MARKETS)[0]['label'],'배터리')
  self.assertEqual(n.tags(text,n.STAGES)[0]['label'],'제련·정제')
  self.assertEqual(n.tags('Market update',n.STAGES),[])
 def test_merge_and_failure_retention(self):
  with tempfile.TemporaryDirectory() as d, patch.object(n,'STORE',Path(d)/'news.json'):
   def feed(mid,lang,words):
    return [{'title':'Nickel cobalt battery', 'link':'https://example.com/a','pubDate':n.now(),'mineralIds':[mid],'markets':[],'stages':[]}]
   with patch.object(n,'fetch_feed',side_effect=feed): result=n.collect()
   self.assertEqual(len(result['articles']),1)
   self.assertEqual(len(result['articles'][0]['mineralIds']),8)
   first=result['articles'][0]['firstSeenAt']
   with patch.object(n,'fetch_feed',side_effect=RuntimeError('offline')): failed=n.collect()
   self.assertTrue(all(s['state']=='failed' for s in failed['status'].values()))
   self.assertEqual(failed['articles'][0]['firstSeenAt'],first)
   self.assertEqual(failed['lastSuccessAt'],result['lastSuccessAt'])
if __name__=='__main__': unittest.main()
