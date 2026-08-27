#!/usr/bin/env python3
"""由 jobhunt.html 生成可安装的 PWA 包（jobhunt-app/ 目录 + jobhunt-app.zip）。

用法：把本脚本和 jobhunt.html、manifest.json、sw.js、icon.svg、
icon-192.png、icon-512.png、apple-touch-icon.png、README.txt 放同一目录，执行：
    python3 build_pwa.py
无任何第三方依赖；路径全部相对脚本所在目录，任何机器可跑。
"""
import pathlib, shutil, zipfile

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "jobhunt-app"
ZIP = HERE / "jobhunt-app.zip"

STATIC = ["manifest.json", "sw.js", "icon.svg",
          "icon-192.png", "icon-512.png", "apple-touch-icon.png", "README.txt",
          "netlify.toml"]

html = (HERE / "jobhunt.html").read_text(encoding="utf-8")

# 注入 manifest / 图标引用与 service worker 注册（幂等：已有则跳过）
if 'rel="manifest"' not in html:
    html = html.replace("</head>",
        '  <link rel="manifest" href="manifest.json">\n'
        '  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
        '  <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n'
        "</head>", 1)
if "serviceWorker" not in html:
    html = html.replace("</body>",
        '  <script>\n'
        '  if("serviceWorker" in navigator){window.addEventListener("load",function(){'
        'navigator.serviceWorker.register("sw.js").catch(function(){});});}\n'
        "  </script>\n</body>", 1)

OUT.mkdir(exist_ok=True)
(OUT / "index.html").write_text(html, encoding="utf-8")
for name in STATIC:
    src = HERE / name
    if src.exists():
        shutil.copy(src, OUT / name)
    else:
        print("警告：缺少", name)

# 云函数目录
fn_src = HERE / "netlify" / "functions"
if fn_src.exists():
    fn_out = OUT / "netlify" / "functions"
    fn_out.mkdir(parents=True, exist_ok=True)
    for f in fn_src.iterdir():
        shutil.copy(f, fn_out / f.name)

with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    for f in ["index.html"] + STATIC:
        p = OUT / f
        if p.exists():
            z.write(p, f)
    if fn_src.exists():
        for f in (OUT / "netlify" / "functions").iterdir():
            z.write(f, "netlify/functions/" + f.name)

print("OK ->", ZIP)
print("目录 ->", OUT)
