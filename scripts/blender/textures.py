"""Procedural PBR textures (albedo / roughness / normal), generated with numpy — no photo sources."""
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '_tex')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def noise(w, h, octaves=5, base=4, stretch=(1, 1)):
    acc, amp, tot = np.zeros((h, w)), 1.0, 0.0
    for o in range(octaves):
        gw, gh = max(int(base * 2 ** o * stretch[0]), 2), max(int(base * 2 ** o * stretch[1]), 2)
        g = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        acc += np.asarray(g) / 255.0 * amp; tot += amp; amp *= 0.5
    return acc / tot


def save(name, arr):
    arr = np.clip(arr, 0, 1)
    if arr.ndim == 2: arr = np.stack([arr] * 3, -1)
    path = os.path.join(OUT, name + '.png')
    Image.fromarray((arr * 255).astype(np.uint8)).save(path)
    return path


def normal_from(height, strength=2.0):
    dy, dx = np.gradient(height)
    n = np.stack([-dx * strength, dy * strength, np.ones_like(height) / max(height.shape) * 8], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


def rgb(c, n=None):
    c = np.array(c) / 255.0
    return c if n is None else c[None, None, :] * n[..., None]


def build():
    t = {}
    S = 512
    yy, xx = np.mgrid[0:S, 0:S] / S

    # forged steel: polish streaks along the blade, a cloudy hamon near the edge (v -> 1)
    streak = noise(S, S, 4, 2, (1, 24))
    ham = 0.74 + 0.05 * np.sin(xx * 46) + 0.03 * np.sin(xx * 113 + 1.3) + (noise(S, S, 3, 6) - 0.5) * 0.08
    edge = np.clip((yy - ham) * 14, 0, 1)
    t['steel_a'] = save('steel_a', rgb((168, 172, 180), 0.86 + streak * 0.14) + edge[..., None] * 0.22)
    t['steel_r'] = save('steel_r', 0.1 + streak * 0.12 + edge * 0.26)
    t['steel_n'] = save('steel_n', normal_from(streak * 0.4 + noise(S, S, 2, 60) * 0.1, 1.2))

    # black lacquer armour plates: rows of small scales laced with dark red silk
    rows, cols = 6, 16
    ry, cx = (yy * rows) % 1, (xx * cols) % 1
    scale_h = np.sin(np.pi * np.clip(cx, 0, 1)) ** 0.35 * (1 - np.clip((ry - 0.72) * 6, 0, 1))
    lace = ((ry > 0.74) & (ry < 0.96) & (np.abs(cx - 0.5) < 0.3)).astype(float)
    wear = noise(S, S, 5, 5)
    t['armor_a'] = save('armor_a', rgb((17, 14, 15), 0.7 + wear * 0.6) * (1 - lace[..., None]) + rgb((96, 16, 22), 0.6 + wear * 0.6) * lace[..., None])
    t['armor_r'] = save('armor_r', 0.36 + wear * 0.3 + lace * 0.4)
    t['armor_n'] = save('armor_n', normal_from(scale_h * 0.6 + lace * 0.5 + wear * 0.08, 3.0))

    # plain worn lacquer and dark iron
    w2 = noise(S, S, 6, 4)
    t['lacq_a'] = save('lacq_a', rgb((15, 12, 13), 0.6 + w2 * 0.8))
    t['lacq_r'] = save('lacq_r', 0.16 + w2 * 0.32)
    t['lacq_n'] = save('lacq_n', normal_from(noise(S, S, 3, 40) * 0.25 + w2 * 0.2, 1.4))
    t['redl_a'] = save('redl_a', rgb((74, 12, 16), 0.55 + w2 * 0.9))
    iron = noise(S, S, 6, 8)
    t['iron_a'] = save('iron_a', rgb((38, 36, 38), 0.6 + iron * 0.8))
    t['iron_r'] = save('iron_r', 0.38 + iron * 0.4)
    t['iron_n'] = save('iron_n', normal_from(iron + noise(S, S, 2, 90) * 0.3, 2.4))
    t['brass_a'] = save('brass_a', rgb((150, 108, 46), 0.45 + iron * 0.9))
    t['brass_r'] = save('brass_r', 0.26 + iron * 0.35)

    # woven cloth and silk braid
    weave = 0.5 + 0.25 * np.sin(xx * 520) * np.cos(yy * 80) + 0.25 * np.sin(yy * 520) * np.cos(xx * 80)
    t['cloth_a'] = save('cloth_a', rgb((20, 16, 18), 0.6 + weave * 0.5 + w2 * 0.3))
    t['cloth_n'] = save('cloth_n', normal_from(weave * 0.5 + w2 * 0.6, 2.2))
    t['silk_a'] = save('silk_a', rgb((112, 20, 28), 0.55 + weave * 0.5 + w2 * 0.3))
    braid = 0.5 + 0.5 * np.sin((xx + yy) * 190) * np.sin((xx - yy) * 190)
    t['silk_n'] = save('silk_n', normal_from(braid * 0.7 + w2 * 0.2, 2.6))
    # ray skin under the handle wrap
    nod = noise(S, S, 2, 70)
    t['same_a'] = save('same_a', rgb((205, 196, 178), 0.75 + nod * 0.35))
    t['same_n'] = save('same_n', normal_from(nod, 4.0))

    # weathered vermilion timber, dark timber, stone, bark
    grain = noise(S, S, 5, 3, (1, 26))
    flake = np.clip((noise(S, S, 5, 5) - 0.42) * 5, 0, 1)
    t['wood_a'] = save('wood_a', rgb((122, 26, 18), 0.6 + grain * 0.6) * flake[..., None] + rgb((66, 50, 42), 0.6 + grain * 0.7) * (1 - flake[..., None]))
    t['wood_r'] = save('wood_r', 0.5 + grain * 0.3 + (1 - flake) * 0.15)
    t['wood_n'] = save('wood_n', normal_from(grain * 0.8 + flake * 0.25, 3.0))
    t['dwood_a'] = save('dwood_a', rgb((30, 24, 22), 0.6 + grain * 0.8))
    st = noise(S, S, 6, 6)
    speck = noise(S, S, 2, 120)
    t['stone_a'] = save('stone_a', rgb((74, 72, 74), 0.5 + st * 0.7 + speck * 0.25))
    t['stone_r'] = save('stone_r', 0.55 + st * 0.35)
    t['stone_n'] = save('stone_n', normal_from(st * 0.9 + speck * 0.35, 3.2))
    ridge = np.abs(noise(S, S, 4, 5, (5, 0.6)) - 0.5) * 2
    t['bark_a'] = save('bark_a', rgb((46, 34, 30), 0.35 + ridge * 0.9))
    t['bark_n'] = save('bark_n', normal_from(1 - ridge, 5.0))

    # a sprig of cherry blossom on transparency
    B = 256
    img = np.zeros((B, B, 4))
    by, bx = np.mgrid[0:B, 0:B]
    for _ in range(11):
        cx0, cy0, r = rng.uniform(40, 216), rng.uniform(40, 216), rng.uniform(20, 34)
        rot = rng.uniform(0, 6.28)
        dx, dy = bx - cx0, by - cy0
        ang, dist = np.arctan2(dy, dx) + rot, np.hypot(dx, dy)
        petal = r * (0.55 + 0.45 * np.abs(np.cos(ang * 2.5)) ** 0.6)
        notch = 1 - 0.12 * np.exp(-((np.abs(np.cos(ang * 2.5)) - 1) ** 2) * 400)
        inside = dist < petal * notch
        shade = 1 - 0.35 * np.clip(1 - dist / (r * 0.9), 0, 1)
        tone = rng.uniform(0.8, 1.0)
        col = np.stack([np.full_like(dist, 1.0) * tone, (0.62 + 0.3 * dist / r) * shade * tone, (0.74 + 0.22 * dist / r) * shade * tone], -1)
        col[dist < r * 0.16] = (0.75, 0.22, 0.32)
        img[inside, :3] = col[inside]; img[inside, 3] = 1
    p = os.path.join(OUT, 'blossom.png')
    Image.fromarray((img * 255).astype(np.uint8), 'RGBA').save(p)
    t['blossom'] = p
    return t


if __name__ == '__main__':
    print(len(build()), 'textures')
