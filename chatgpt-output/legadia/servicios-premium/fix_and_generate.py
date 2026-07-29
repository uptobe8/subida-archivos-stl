from pathlib import Path
import runpy

path = Path(__file__).with_name("generate.py")
source = path.read_text(encoding="utf-8")
replacements = {
    '(TEXT["hero_k"], TEXT["hero_h"], [TEXT["hero_p"], TEXT["hero_label"], TEXT["hero_card"]),': '(TEXT["hero_k"], TEXT["hero_h"], [TEXT["hero_p"], TEXT["hero_label"], TEXT["hero_card"]]),',
    '(TEXT["services_k"], TEXT["services_h"], [TEXT["services_p"], TEXT["s1_h"], TEXT["s1_p"], TEXT["s2_h"], TEXT["s2_p"], TEXT["s3_h"], TEXT["s3_p"]),': '(TEXT["services_k"], TEXT["services_h"], [TEXT["services_p"], TEXT["s1_h"], TEXT["s1_p"], TEXT["s2_h"], TEXT["s2_p"], TEXT["s3_h"], TEXT["s3_p"]]),',
    '(TEXT["access_k"], TEXT["access_h"], [TEXT["access_p"], TEXT["contacted_h"], TEXT["contacted_p"], TEXT["partners_h"], TEXT["partners_p"]),': '(TEXT["access_k"], TEXT["access_h"], [TEXT["access_p"], TEXT["contacted_h"], TEXT["contacted_p"], TEXT["partners_h"], TEXT["partners_p"]]),',
    '(TEXT["class_k"], TEXT["class_h"], [TEXT["class_p1"], TEXT["class_p2"], TEXT["class_q"]),': '(TEXT["class_k"], TEXT["class_h"], [TEXT["class_p1"], TEXT["class_p2"], TEXT["class_q"]]),',
}
for old, new in replacements.items():
    if old not in source:
        raise RuntimeError(f"Expected source fragment not found: {old}")
    source = source.replace(old, new)
path.write_text(source, encoding="utf-8")
compile(source, str(path), "exec")
runpy.run_path(str(path), run_name="__main__")
