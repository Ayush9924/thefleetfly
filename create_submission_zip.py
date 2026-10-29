"""
Packaging script to build the clean submission ZIP for college evaluation.
Strictly excludes secrets (.env), node_modules, virtual environments, build artifacts, and caches.
"""
import os
import zipfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
ZIP_OUTPUT_PATH = PROJECT_ROOT / "FleetFly_MongoDB_PyMongo_ML_Submission.zip"

# Exclusion rules
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    ".pytest_cache",
    "dist",
    "build",
    ".venv",
    "venv",
    ".idea",
    ".vscode"
}

EXCLUDE_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".log",
    ".DS_Store"
}

def is_excluded(path: Path) -> bool:
    rel_path = path.relative_to(PROJECT_ROOT)
    parts = rel_path.parts

    # Exclude directories
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True

    # Exclude real .env files (keep .env.example)
    name = path.name
    if name.startswith(".env") and not name.endswith(".example"):
        return True

    # Exclude uploaded user media
    if "uploads" in parts and path.is_file() and name != ".gitkeep":
        return True

    # Exclude compiled bytecode
    if path.suffix in EXCLUDE_EXTENSIONS:
        return True

    # Do not include the output zip itself
    if path == ZIP_OUTPUT_PATH:
        return True

    return False

def make_submission_zip():
    print(f"Creating submission zip: {ZIP_OUTPUT_PATH.name}...")
    included_count = 0
    excluded_count = 0

    with zipfile.ZipFile(ZIP_OUTPUT_PATH, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in PROJECT_ROOT.rglob("*"):
            if not file_path.is_file():
                continue

            if is_excluded(file_path):
                excluded_count += 1
                continue

            rel_path = file_path.relative_to(PROJECT_ROOT)
            zipf.write(file_path, arcname=str(rel_path))
            included_count += 1

    file_size_mb = ZIP_OUTPUT_PATH.stat().st_size / (1024 * 1024)
    print(f"[SUCCESS] Submission ZIP created: {ZIP_OUTPUT_PATH}")
    print(f"  - Total files packaged: {included_count}")
    print(f"  - Files excluded (secrets, caches, dependencies): {excluded_count}")
    print(f"  - Package size: {file_size_mb:.2f} MB")

    # Verify contents of ZIP
    with zipfile.ZipFile(ZIP_OUTPUT_PATH, "r") as zipf:
        names = zipf.namelist()
        real_env_files = [n for n in names if Path(n).name.startswith(".env") and not n.endswith(".example")]
        has_env = len(real_env_files) > 0
        has_node_modules = any("node_modules" in n for n in names)
        has_report_pdf = any("FUEL_INTELLIGENCE_PROJECT_REPORT.pdf" in n for n in names)
        has_metrics = any("metrics.json" in n for n in names)
        has_models = any(".joblib" in n for n in names)

        print("\n[VERIFICATION]")
        print(f"  * Real .env files present: {has_env} (Must be False, found: {real_env_files})")
        print(f"  * node_modules present:    {has_node_modules} (Must be False)")
        print(f"  * PDF Report present:      {has_report_pdf} (Must be True)")
        print(f"  * metrics.json present:    {has_metrics} (Must be True)")
        print(f"  * Trained models present:  {has_models} (Must be True)")

        if not has_env and not has_node_modules and has_report_pdf and has_metrics and has_models:
            print("\n>>> ALL SUBMISSION INTEGRITY CHECKS PASSED PERFECTLY! <<<")
        else:
            print("\n>>> WARNING: Integrity checks failed! <<<")

if __name__ == "__main__":
    make_submission_zip()
