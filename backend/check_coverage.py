import json
import sys
import os

# Thresholds as per requirements
THRESHOLDS = {
    "total": 85,
    "app/api/v1/endpoints/auth": 95,
    "app/api/v1/endpoints/billing": 95,
    "app/services/billing": 95,
    "app/core/security": 95,
    "app/db/base_class": 95, # Ownership/Base logic
}

def check_coverage(report_file):
    with open(report_file) as f:
        data = json.load(f)

    totals = data["totals"]
    total_pct = totals["percent_covered"]
    
    print(f"Global Coverage: {total_pct:.2f}% (Required: {THRESHOLDS['total']}%)")
    failed = False
    
    if total_pct < THRESHOLDS["total"]:
        print("❌ Global coverage threshold failed!")
        failed = True
    else:
        print("✅ Global coverage threshold passed.")

    # Module-level checks
    for path, threshold in THRESHOLDS.items():
        if path == "total": continue
        
        # Find matching files/dirs in report
        module_covered = 0
        module_total = 0
        found = False
        
        for file_path, file_data in data["files"].items():
            if file_path.startswith(path):
                module_covered += file_data["summary"]["num_statements"] - file_data["summary"]["missing_lines"]
                module_total += file_data["summary"]["num_statements"]
                found = True
        
        if found:
            pct = (module_covered / module_total) * 100
            status = "✅" if pct >= threshold else "❌"
            print(f"{status} {path}: {pct:.2f}% (Required: {threshold}%)")
            if pct < threshold:
                failed = True
        else:
            print(f"⚠️ Warning: Module path {path} not found in coverage report.")

    if failed:
        print("\nFATAL: Coverage gates failed. Blocking CI pipeline.")
        sys.exit(1)
    else:
        print("\nSUCCESS: All coverage gates passed.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_coverage.py coverage.json")
        sys.exit(1)
    check_coverage(sys.argv[1])
