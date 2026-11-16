# Re-pack a GLB with its textures resized (JPEG, or PNG when there is real alpha) and named nodes dropped. No Blender involved.
import sys, json, struct, io
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
src, dst, limit = sys.argv[1], sys.argv[2], int(sys.argv[3]); drop = sys.argv[4:]
f = open(src, 'rb'); f.read(12); n, _ = struct.unpack('<II', f.read(8)); j = json.loads(f.read(n)); n2, _ = struct.unpack('<II', f.read(8)); bin_ = f.read(n2)
views = j['bufferViews']; blobs = [bin_[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
for im in j.get('images', []):
    i = im['bufferView']; pic = Image.open(io.BytesIO(blobs[i])); pic.load()
    if pic.mode in ('I;16', 'I'): pic = pic.point(lambda v: v / 256).convert('L')
    alpha = pic.mode in ('RGBA', 'LA') and pic.getchannel('A').getextrema()[0] < 250
    k = min(1, limit / max(pic.size)); pic = pic.resize((max(int(pic.width * k), 1), max(int(pic.height * k), 1)), Image.LANCZOS)
    out = io.BytesIO()
    if alpha: pic.convert('RGBA').save(out, 'PNG', optimize=True); im['mimeType'] = 'image/png'
    else: pic.convert('RGB').save(out, 'JPEG', quality=82); im['mimeType'] = 'image/jpeg'
    blobs[i] = out.getvalue()
dead = {i for i, nd in enumerate(j['nodes']) if any(nd.get('name', '').startswith(d) for d in drop)}
for nd in j['nodes']:
    if 'children' in nd: nd['children'] = [c for c in nd['children'] if c not in dead]
for sc in j['scenes']: sc['nodes'] = [c for c in sc['nodes'] if c not in dead]
buf = bytearray()
for v, b in zip(views, blobs):
    while len(buf) % 4: buf.append(0)
    v['byteOffset'] = len(buf); v['byteLength'] = len(b); buf += b
while len(buf) % 4: buf.append(0)
j['buffers'] = [{'byteLength': len(buf)}]
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
open(dst, 'wb').write(b'glTF' + struct.pack('<II', 2, 28 + len(js) + len(buf)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(buf), 0x004E4942) + bytes(buf))
print(dst, (28 + len(js) + len(buf)) // 1024, 'KB', 'dropped', len(dead))
