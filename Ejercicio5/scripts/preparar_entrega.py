"""Empaqueta entregables y comprueba ZIP, hashes y enlaces locales."""
from pathlib import Path
import hashlib
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "outputs" / "Ejercicio5-entrega"
ZIP = ROOT / "outputs" / "Ejercicio5-entrega.zip"
FILES = [
    "contracts/FinanciacionTorneo.sol", "README.md", "CASOS_DE_USO.md",
    "PRUEBAS_REMIX.md", "RESULTADOS_PRUEBAS.md", "REGISTRO_REMIX.md",
    "CAPTURAS_PENDIENTES.md", "package.json", "pnpm-lock.yaml",
    "pnpm-workspace.yaml", ".gitignore", "scripts/compile.cjs",
    "scripts/preparar_entrega.py", "scripts/consultar_remix.js", "scripts/verificar_evidencias.cjs",
    "test/torneo.test.cjs", "evidencias/remix-transacciones.json",
    "evidencias/remix-estados-finales.json", "evidencias/verificacion-remix.json",
]
FILES += [p.relative_to(ROOT).as_posix()
          for p in sorted((ROOT / "capturas").glob("*")) if p.is_file()]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    for rel in FILES:
        if not (ROOT / rel).is_file():
            raise FileNotFoundError(rel)
    links = []
    for rel in FILES:
        if rel.endswith(".md"):
            for target in re.findall(r"\]\(([^)]+)\)", (ROOT / rel).read_text(encoding="utf-8")):
                if "://" in target or target.startswith("#"):
                    continue
                target = target.split("#")[0]
                path = (ROOT / rel).parent / target
                if not path.is_file():
                    raise FileNotFoundError(f"Enlace roto en {rel}: {target}")
                links.append((rel, target))
    DEST.mkdir(parents=True, exist_ok=True)
    expected = set(FILES) | {"SHA256SUMS.txt"}
    existing = {p.relative_to(DEST).as_posix() for p in DEST.rglob("*") if p.is_file()}
    if existing - expected:
        raise RuntimeError(f"Archivos ajenos en destino, no se borran: {existing - expected}")
    for rel in FILES:
        target = DEST / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, target)
    manifest = "".join(f"{digest((DEST / rel).read_bytes())}  {rel}\n" for rel in sorted(FILES))
    (DEST / "SHA256SUMS.txt").write_text(manifest, encoding="utf-8")
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as archive:
        for rel in sorted(expected):
            archive.write(DEST / rel, "Ejercicio5-entrega/" + rel)
    with zipfile.ZipFile(ZIP) as archive:
        assert archive.testzip() is None, "CRC incorrecto"
        assert set(archive.namelist()) == {"Ejercicio5-entrega/" + rel for rel in expected}
        for rel in expected:
            assert archive.read("Ejercicio5-entrega/" + rel) == (DEST / rel).read_bytes()
    print(f"ZIP correcto: {ZIP}")
    print(f"{len(expected)} archivos; {len(links)} enlaces locales comprobados; CRC y contenido correctos.")
    print(f"SHA256 ZIP: {digest(ZIP.read_bytes())}")


if __name__ == "__main__":
    main()
