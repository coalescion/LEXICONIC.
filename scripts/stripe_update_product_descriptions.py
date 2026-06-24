#!/usr/bin/env python3

import argparse
import csv
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import stripe


DEFAULT_FROM = "albuquerque, new mexico"
DEFAULT_TO = "brooklyn, new york"


def script_path() -> str:
    return str(Path(__file__).resolve())


def stripe_get(obj: Any, key: str, default: Any = None) -> Any:
    """Read a key from a dict or StripeObject through item or attribute access."""
    if obj is None:
        return default

    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        return default

    try:
        return obj[key]
    except (KeyError, TypeError, AttributeError):
        pass

    try:
        return getattr(obj, key)
    except AttributeError:
        return default


def stripe_id(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        return value

    value_id = stripe_get(value, "id")
    if value_id is None:
        return None
    return str(value_id)


def build_pattern(find_text: str, case_sensitive: bool) -> re.Pattern[str]:
    flags = 0 if case_sensitive else re.IGNORECASE
    return re.compile(re.escape(find_text), flags)


def replace_description(
    description: Optional[str],
    pattern: re.Pattern[str],
    replacement: str,
) -> Optional[str]:
    if not description:
        return None

    updated = pattern.sub(replacement, description)
    if updated == description:
        return None

    return updated


def write_csv(rows: List[Dict[str, str]]) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"stripe_update_product_descriptions_{timestamp}.csv"

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "product_id",
                "product_name",
                "active",
                "old_description",
                "new_description",
                "status",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    return filename


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Replace text inside Stripe Product descriptions. Defaults to a dry run "
            "that makes no Stripe changes."
        )
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually update matching Stripe Product descriptions.",
    )
    parser.add_argument(
        "--find",
        default=DEFAULT_FROM,
        help=f"Text to replace. Default: {DEFAULT_FROM!r}",
    )
    parser.add_argument(
        "--replace",
        default=DEFAULT_TO,
        help=f"Replacement text. Default: {DEFAULT_TO!r}",
    )
    parser.add_argument(
        "--case-sensitive",
        action="store_true",
        help="Only replace exact casing. By default matching is case-insensitive.",
    )
    parser.add_argument(
        "--active-only",
        action="store_true",
        help="Only scan active Stripe Products.",
    )
    parser.add_argument(
        "--debug-path",
        action="store_true",
        help="Print the script path and exit.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.debug_path:
        print(script_path())
        return

    print(f"Executing script: {script_path()}")

    api_key = os.environ["STRIPE_SECRET_KEY"] if "STRIPE_SECRET_KEY" in os.environ else None
    if not api_key:
        print("Missing STRIPE_SECRET_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    stripe.api_key = api_key

    pattern = build_pattern(args.find, case_sensitive=bool(args.case_sensitive))
    list_params: Dict[str, Any] = {"limit": 100}
    if args.active_only:
        list_params["active"] = True

    print("Scanning Stripe Products...")
    print(f"Find: {args.find!r}")
    print(f"Replace with: {args.replace!r}")
    print(f"Mode: {'apply' if args.apply else 'dry run'}")
    print(f"Scope: {'active products only' if args.active_only else 'all products'}")

    rows: List[Dict[str, str]] = []
    scanned = 0

    products = stripe.Product.list(**list_params)
    for product in products.auto_paging_iter():
        scanned += 1

        product_id = stripe_id(product)
        if not product_id:
            print("SKIP product without ID.")
            continue

        name = stripe_get(product, "name", "") or ""
        active = stripe_get(product, "active")
        description = stripe_get(product, "description")
        new_description = replace_description(description, pattern, args.replace)

        if new_description is None:
            continue

        print()
        print(f"Matched product: {name}")
        print(f"  Product ID: {product_id}")
        print(f"  Active: {active}")
        print(f"  Old description: {description}")
        print(f"  New description: {new_description}")

        status = "would_update"
        if args.apply:
            stripe.Product.modify(product_id, description=new_description)
            status = "updated"
            print("  Updated.")
        else:
            print("  Dry run: no change made.")

        rows.append(
            {
                "product_id": product_id,
                "product_name": str(name),
                "active": str(active),
                "old_description": str(description),
                "new_description": str(new_description),
                "status": status,
            }
        )

    print()
    print(f"Scanned {scanned} products.")
    print(f"Matched {len(rows)} products.")

    if rows:
        csv_file = write_csv(rows)
        print(f"Wrote audit CSV: {csv_file}")

    if args.apply:
        print("Done.")
    else:
        print("Dry run complete. No Stripe objects were changed. Re-run with --apply to update Stripe.")


if __name__ == "__main__":
    main()
