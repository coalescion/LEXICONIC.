#!/usr/bin/env python3

import argparse
import csv
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import stripe


BATCH_TAG = "bulk_reprice_2026_06_24"

# Amounts are in cents.
PRICE_RULES = [
    (re.compile(r"\b10\s*-?\s*pack\b", re.IGNORECASE), 1800, "10pack"),
    (re.compile(r"\b5\s*-?\s*pack\b", re.IGNORECASE), 1100, "5pack"),
    (re.compile(r"\b3\s*-?\s*pack\b", re.IGNORECASE), 700, "3pack"),
    (re.compile(r"\bshirt\b", re.IGNORECASE), 3000, "shirt"),
]

MISSING = object()


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


def stripe_has(obj: Any, key: str) -> bool:
    return stripe_get(obj, key, MISSING) is not MISSING


def stripe_id(value: Any) -> Optional[str]:
    """Return an ID whether Stripe gives us a string, dict, or StripeObject."""
    if value is None:
        return None
    if isinstance(value, str):
        return value

    value_id = stripe_get(value, "id")
    if value_id is None:
        return None
    return str(value_id)


def stripe_to_dict(value: Any) -> Any:
    """Convert Stripe values only when preparing create-compatible payloads."""
    if value is None:
        return None

    if hasattr(value, "to_dict"):
        value = value.to_dict()

    if isinstance(value, dict):
        return {str(k): stripe_to_dict(v) for k, v in value.items()}

    if isinstance(value, (list, tuple)):
        return [stripe_to_dict(v) for v in value]

    return value


def remove_none(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: remove_none(v) for k, v in value.items() if v is not None}

    if isinstance(value, list):
        return [remove_none(v) for v in value]

    return value


def contains_market(text: Optional[str]) -> bool:
    return "market" in (text or "").lower()


def metadata_to_dict(metadata: Any) -> Dict[str, Any]:
    plain = stripe_to_dict(metadata)
    if isinstance(plain, dict):
        return plain
    return {}


def match_product_name(name: str) -> Optional[Tuple[int, str]]:
    matches = []

    for pattern, amount, label in PRICE_RULES:
        if pattern.search(name or ""):
            matches.append((amount, label))

    if not matches:
        return None

    if len(matches) > 1:
        raise ValueError(f"Ambiguous product name matches multiple rules: {name!r}")

    return matches[0]


def retrieve_price(price_id: str, expand_product: bool = False) -> Any:
    params: Dict[str, Any] = {}
    if expand_product:
        params["expand"] = ["product"]
    return stripe.Price.retrieve(price_id, **params)


def retrieve_product(product_id: str) -> Any:
    return stripe.Product.retrieve(product_id, expand=["default_price"])


def get_default_or_first_active_price(product: Any) -> Any:
    default_price_id = stripe_id(stripe_get(product, "default_price"))

    if default_price_id:
        return retrieve_price(default_price_id)

    product_id = stripe_id(product)
    if not product_id:
        raise RuntimeError("Product is missing an ID while looking up active prices.")

    prices = stripe.Price.list(product=product_id, active=True, limit=100)

    for price_obj in prices.auto_paging_iter():
        return price_obj

    product_name = stripe_get(product, "name", "")
    raise RuntimeError(f"Product {product_id} / {product_name!r} has no active prices.")


def find_existing_batch_price(
    product_id: str,
    unit_amount: int,
    currency: str,
) -> Optional[str]:
    prices = stripe.Price.list(product=product_id, active=True, limit=100)

    for price in prices.auto_paging_iter():
        metadata = metadata_to_dict(stripe_get(price, "metadata"))

        if (
            stripe_get(metadata, "migration_batch") == BATCH_TAG
            and stripe_get(price, "unit_amount") == unit_amount
            and stripe_get(price, "currency") == currency
        ):
            return stripe_id(price)

    return None


def build_recurring_params(old_price: Any) -> Optional[Dict[str, Any]]:
    recurring = stripe_get(old_price, "recurring")
    if not recurring:
        return None

    params: Dict[str, Any] = {}
    for key in ["interval", "interval_count", "usage_type"]:
        value = stripe_get(recurring, key)
        if value is not None:
            params[key] = value

    if not params:
        return None
    return params


def create_replacement_price(
    product: Any,
    old_price: Any,
    unit_amount: int,
    rule_label: str,
    apply: bool,
) -> str:
    product_id = stripe_id(product)
    old_price_id = stripe_id(old_price)
    currency = stripe_get(old_price, "currency")

    if not product_id or not old_price_id or not currency:
        raise RuntimeError("Cannot create replacement price because product/price data is incomplete.")

    existing = find_existing_batch_price(
        product_id=product_id,
        unit_amount=unit_amount,
        currency=str(currency),
    )

    if existing:
        print(f"  Reusing existing batch price: {existing}")
        return existing

    params: Dict[str, Any] = {
        "product": product_id,
        "currency": currency,
        "unit_amount": unit_amount,
        "metadata": {
            "migration_batch": BATCH_TAG,
            "old_price_id": old_price_id,
            "pricing_rule": rule_label,
        },
    }

    recurring = build_recurring_params(old_price)
    if recurring:
        params["recurring"] = recurring

    tax_behavior = stripe_get(old_price, "tax_behavior")
    if tax_behavior:
        params["tax_behavior"] = tax_behavior

    nickname = stripe_get(old_price, "nickname")
    if nickname:
        params["nickname"] = f"{nickname} - repriced"

    if not apply:
        return f"DRY_RUN_new_price_for_{product_id}"

    new_price = stripe.Price.create(**params)
    new_price_id = stripe_id(new_price)
    if not new_price_id:
        raise RuntimeError("Stripe created a Price without returning an ID.")
    return new_price_id


def set_product_default_price(product_id: str, new_price_id: str, apply: bool) -> None:
    if not apply:
        print(f"  Would set product.default_price = {new_price_id}")
        return

    stripe.Product.modify(product_id, default_price=new_price_id)
    print(f"  Set default price: {new_price_id}")


def get_payment_link_line_items(payment_link_id: str) -> List[Any]:
    result = stripe.PaymentLink.list_line_items(
        payment_link_id,
        limit=100,
        expand=["data.price.product"],
    )
    return list(result.auto_paging_iter())


def clean_custom_fields(fields: Any) -> List[Dict[str, Any]]:
    cleaned = []

    for field in fields or []:
        item = {
            "key": stripe_get(field, "key"),
            "label": stripe_to_dict(stripe_get(field, "label")),
            "type": stripe_get(field, "type"),
            "optional": stripe_get(field, "optional"),
        }

        field_type = stripe_get(field, "type")

        if field_type == "dropdown":
            item["dropdown"] = stripe_to_dict(stripe_get(field, "dropdown"))
        elif field_type == "numeric":
            item["numeric"] = stripe_to_dict(stripe_get(field, "numeric"))
        elif field_type == "text":
            item["text"] = stripe_to_dict(stripe_get(field, "text"))

        cleaned.append(remove_none(item))

    return cleaned


def normalize_shipping_options(options: Any) -> List[Dict[str, Any]]:
    normalized = []

    for option in options or []:
        shipping_rate_id = stripe_id(stripe_get(option, "shipping_rate"))
        if shipping_rate_id:
            normalized.append({"shipping_rate": shipping_rate_id})

    return normalized


def price_product_id(price: Any) -> Optional[str]:
    product = stripe_get(price, "product")
    return stripe_id(product)


def line_item_price(line_item: Any) -> Any:
    return stripe_get(line_item, "price")


def line_item_price_id(line_item: Any) -> Optional[str]:
    return stripe_id(line_item_price(line_item))


def line_item_product_id(line_item: Any) -> Optional[str]:
    price = line_item_price(line_item)
    product_id = price_product_id(price)

    if product_id:
        return product_id

    price_id = stripe_id(price)
    if not price_id:
        return None

    retrieved_price = retrieve_price(price_id, expand_product=True)
    return price_product_id(retrieved_price)


def normalize_optional_items(
    optional_items: Any,
    product_to_new_price: Dict[str, str],
) -> List[Dict[str, Any]]:
    normalized = []

    for item in optional_items or []:
        old_price_id = stripe_id(stripe_get(item, "price"))
        if not old_price_id:
            continue

        price = retrieve_price(old_price_id, expand_product=True)
        product_id = price_product_id(price)
        new_price_id = old_price_id
        if product_id and product_id in product_to_new_price:
            new_price_id = product_to_new_price[product_id]

        new_item = {
            "price": new_price_id,
            "quantity": stripe_get(item, "quantity", 1),
            "adjustable_quantity": stripe_to_dict(stripe_get(item, "adjustable_quantity")),
        }

        normalized.append(remove_none(new_item))

    return normalized


def line_item_product_name_contains_market(item: Any) -> bool:
    product_id = line_item_product_id(item)
    if not product_id:
        return False

    product = retrieve_product(product_id)
    return contains_market(stripe_get(product, "name", ""))


def object_text_values(value: Any) -> Iterable[str]:
    plain = stripe_to_dict(value)

    if isinstance(plain, dict):
        for nested_value in plain.values():
            yield from object_text_values(nested_value)
        return

    if isinstance(plain, list):
        for nested_value in plain:
            yield from object_text_values(nested_value)
        return

    if plain is not None:
        yield str(plain)


def payment_link_contains_market(
    old_link: Any,
    old_line_items: Optional[List[Any]] = None,
) -> bool:
    fields_to_check = [
        stripe_get(old_link, "name"),
        stripe_get(old_link, "title"),
        stripe_get(old_link, "inactive_message"),
    ]

    metadata = metadata_to_dict(stripe_get(old_link, "metadata"))
    fields_to_check.extend(str(v) for v in metadata.values())
    fields_to_check.extend(object_text_values(stripe_get(old_link, "custom_text")))

    if any(contains_market(str(field)) for field in fields_to_check if field):
        return True

    if old_line_items:
        for item in old_line_items:
            if line_item_product_name_contains_market(item):
                return True

    return False


def build_new_line_items(
    old_line_items: List[Any],
    product_to_new_price: Dict[str, str],
) -> Tuple[List[Dict[str, Any]], bool]:
    new_items = []
    changed_any = False

    for item in old_line_items:
        old_price_id = line_item_price_id(item)
        if not old_price_id:
            continue

        product_id = line_item_product_id(item)
        new_price_id = old_price_id
        if product_id and product_id in product_to_new_price:
            new_price_id = product_to_new_price[product_id]

        if new_price_id != old_price_id:
            changed_any = True

        new_item = {
            "price": new_price_id,
            "quantity": stripe_get(item, "quantity", 1) or 1,
            "adjustable_quantity": stripe_to_dict(stripe_get(item, "adjustable_quantity")),
        }

        new_items.append(remove_none(new_item))

    return new_items, changed_any


def old_payment_link_has_recurring_line_item(old_line_items: List[Any]) -> bool:
    for item in old_line_items:
        price = line_item_price(item)

        if price and stripe_get(price, "recurring"):
            return True

        price_id = stripe_id(price)
        if price_id:
            retrieved_price = retrieve_price(price_id)
            if stripe_get(retrieved_price, "recurring"):
                return True

    return False


def copy_plain_field(params: Dict[str, Any], old_link: Any, key: str) -> None:
    if not stripe_has(old_link, key):
        return

    value = stripe_get(old_link, key)
    if value is not None:
        params[key] = stripe_to_dict(value)


def clean_consent_collection(consent_collection: Any) -> Optional[Dict[str, Any]]:
    plain = stripe_to_dict(consent_collection)
    if not isinstance(plain, dict):
        return None

    cleaned = dict(plain)

    if "promotions" in cleaned:
        print(
            "  NOTE: Not copying consent_collection.promotions; "
            "Stripe requires Checkout promotional consent terms acceptance to set it."
        )
        del cleaned["promotions"]

    if not cleaned:
        return None
    return cleaned


def clean_tax_id_collection(tax_id_collection: Any) -> Optional[Dict[str, Any]]:
    plain = stripe_to_dict(tax_id_collection)
    if not isinstance(plain, dict):
        return None

    enabled = plain["enabled"] if "enabled" in plain else None
    if enabled is not True:
        if "required" in plain:
            print(
                "  NOTE: Not copying tax_id_collection.required because "
                "tax_id_collection.enabled is not true."
            )
        return None

    cleaned = dict(plain)
    if not cleaned:
        return None
    return cleaned


def build_payment_link_create_params(
    old_link: Any,
    old_line_items: List[Any],
    product_to_new_price: Dict[str, str],
) -> Tuple[Optional[Dict[str, Any]], bool]:
    new_line_items, changed_any = build_new_line_items(
        old_line_items,
        product_to_new_price,
    )

    if not changed_any:
        return None, False

    old_link_id = stripe_id(old_link)
    if not old_link_id:
        raise RuntimeError("Payment Link is missing an ID.")

    old_url = stripe_get(old_link, "url", "") or ""
    old_metadata = metadata_to_dict(stripe_get(old_link, "metadata"))

    metadata = dict(old_metadata)
    metadata["migration_batch"] = BATCH_TAG
    metadata["old_payment_link_id"] = old_link_id
    metadata["old_payment_link_url"] = old_url

    params: Dict[str, Any] = {
        "line_items": new_line_items,
        "metadata": metadata,
    }

    for key in [
        "after_completion",
        "allow_promotion_codes",
        "automatic_tax",
        "billing_address_collection",
        "customer_creation",
        "phone_number_collection",
        "shipping_address_collection",
        "submit_type",
        "custom_text",
        "name_collection",
        "restrictions",
    ]:
        copy_plain_field(params, old_link, key)

    consent_collection = stripe_get(old_link, "consent_collection")
    if consent_collection:
        cleaned_consent_collection = clean_consent_collection(consent_collection)
        if cleaned_consent_collection:
            params["consent_collection"] = cleaned_consent_collection

    tax_id_collection = stripe_get(old_link, "tax_id_collection")
    if tax_id_collection:
        cleaned_tax_id_collection = clean_tax_id_collection(tax_id_collection)
        if cleaned_tax_id_collection:
            params["tax_id_collection"] = cleaned_tax_id_collection

    custom_fields = stripe_get(old_link, "custom_fields")
    if custom_fields:
        cleaned_custom_fields = clean_custom_fields(custom_fields)
        if cleaned_custom_fields:
            params["custom_fields"] = cleaned_custom_fields

    shipping_options = stripe_get(old_link, "shipping_options")
    if shipping_options:
        normalized_shipping = normalize_shipping_options(shipping_options)
        if normalized_shipping:
            params["shipping_options"] = normalized_shipping

    optional_items = stripe_get(old_link, "optional_items")
    if optional_items:
        normalized_optional = normalize_optional_items(optional_items, product_to_new_price)
        if normalized_optional:
            params["optional_items"] = normalized_optional

    invoice_creation = stripe_get(old_link, "invoice_creation")
    if invoice_creation and stripe_get(invoice_creation, "enabled"):
        params["invoice_creation"] = stripe_to_dict(invoice_creation)

    subscription_data = stripe_get(old_link, "subscription_data")
    if old_payment_link_has_recurring_line_item(old_line_items) and subscription_data:
        params["subscription_data"] = stripe_to_dict(subscription_data)

    return remove_none(params), True


def find_existing_duplicate_link(old_payment_link_id: str) -> Optional[Any]:
    links = stripe.PaymentLink.list(limit=100)

    for link in links.auto_paging_iter():
        metadata = metadata_to_dict(stripe_get(link, "metadata"))

        if (
            stripe_get(metadata, "migration_batch") == BATCH_TAG
            and stripe_get(metadata, "old_payment_link_id") == old_payment_link_id
        ):
            return link

    return None


def create_duplicate_payment_links(
    product_to_new_price: Dict[str, str],
    apply: bool,
) -> List[Dict[str, str]]:
    results = []
    payment_links = stripe.PaymentLink.list(limit=100)

    for old_link in payment_links.auto_paging_iter():
        old_link_id = stripe_id(old_link)
        if not old_link_id:
            print("SKIP Payment Link without ID.")
            continue

        line_items = get_payment_link_line_items(old_link_id)

        if payment_link_contains_market(old_link, line_items):
            print(f"SKIP market Payment Link: {old_link_id} / {stripe_get(old_link, 'url', '')}")
            continue

        existing = find_existing_duplicate_link(old_link_id)

        if existing:
            existing_id = stripe_id(existing) or ""
            print(f"Already duplicated: {old_link_id} -> {existing_id}")
            results.append({
                "old_payment_link_id": old_link_id,
                "old_url": stripe_get(old_link, "url", "") or "",
                "new_payment_link_id": existing_id,
                "new_url": stripe_get(existing, "url", "") or "",
                "status": "already_exists",
            })
            continue

        params, changed_any = build_payment_link_create_params(
            old_link,
            line_items,
            product_to_new_price,
        )

        if not changed_any or params is None:
            continue

        print(f"Payment Link uses repriced product: {old_link_id}")
        print(f"  Old URL: {stripe_get(old_link, 'url', '')}")

        if not apply:
            print("  Would create duplicate Payment Link.")
            results.append({
                "old_payment_link_id": old_link_id,
                "old_url": stripe_get(old_link, "url", "") or "",
                "new_payment_link_id": "DRY_RUN",
                "new_url": "DRY_RUN",
                "status": "dry_run",
            })
            continue

        new_link = stripe.PaymentLink.create(**params)
        new_link_id = stripe_id(new_link)
        if not new_link_id:
            raise RuntimeError("Stripe created a Payment Link without returning an ID.")

        print(f"  New Payment Link: {new_link_id}")
        print(f"  New URL: {stripe_get(new_link, 'url', '')}")

        results.append({
            "old_payment_link_id": old_link_id,
            "old_url": stripe_get(old_link, "url", "") or "",
            "new_payment_link_id": new_link_id,
            "new_url": stripe_get(new_link, "url", "") or "",
            "status": "created",
        })

    return results


def write_csv(rows: List[Dict[str, str]]) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"stripe_reprice_payment_links_{timestamp}.csv"

    fields = [
        "old_payment_link_id",
        "old_url",
        "new_payment_link_id",
        "new_url",
        "status",
    ]

    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    return filename


def print_first_product_debug(product_obj: Any) -> None:
    print("First product debug:")
    print(f"  Type: {type(product_obj)!r}")
    print(f"  ID: {stripe_id(product_obj) or ''}")
    print(f"  Name: {stripe_get(product_obj, 'name', '') or ''}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--debug-path",
        action="store_true",
        help="Print the exact script path being executed and exit.",
    )

    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--apply", action="store_true")

    args = parser.parse_args()

    if not args.debug_path and not args.dry_run and not args.apply:
        parser.error("one of --dry-run, --apply, or --debug-path is required")

    return args


def main() -> None:
    args = parse_args()

    if args.debug_path:
        print(script_path())
        return

    print(f"Executing script: {script_path()}")

    apply = bool(args.apply)

    api_key = os.environ["STRIPE_SECRET_KEY"] if "STRIPE_SECRET_KEY" in os.environ else None

    if not api_key:
        print("Missing STRIPE_SECRET_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    stripe.api_key = api_key

    product_to_new_price: Dict[str, str] = {}
    repriced_products = []

    print("Scanning active products...")

    products = stripe.Product.list(active=True, limit=100)
    first_product_seen = False

    for product_obj in products.auto_paging_iter():
        if not first_product_seen:
            print_first_product_debug(product_obj)
            first_product_seen = True

        product_id = stripe_id(product_obj)
        if not product_id:
            print("SKIP product without ID.")
            continue

        product = retrieve_product(product_id)
        name = stripe_get(product, "name", "") or ""

        if contains_market(name):
            print(f"SKIP market product: {name} / {product_id}")
            continue

        try:
            match = match_product_name(name)
        except ValueError as e:
            print(f"SKIP ambiguous: {e}")
            continue

        if not match:
            continue

        unit_amount, rule_label = match
        old_price = get_default_or_first_active_price(product)
        old_price_id = stripe_id(old_price)
        currency = stripe_get(old_price, "currency", "")

        if not old_price_id or not currency:
            print(f"SKIP incomplete price data for product: {name} / {product_id}")
            continue

        print()
        print(f"Matched product: {name}")
        print(f"  Product ID: {product_id}")
        print(f"  Rule: {rule_label}")
        print(
            f"  Old default price: {old_price_id} / "
            f"{stripe_get(old_price, 'unit_amount')} {currency}"
        )
        print(f"  New amount: {unit_amount} {currency}")

        new_price_id = create_replacement_price(
            product=product,
            old_price=old_price,
            unit_amount=unit_amount,
            rule_label=rule_label,
            apply=apply,
        )

        print(f"  New price: {new_price_id}")

        set_product_default_price(product_id, new_price_id, apply=apply)

        product_to_new_price[product_id] = new_price_id

        repriced_products.append({
            "product_id": product_id,
            "product_name": name,
            "old_price_id": old_price_id,
            "new_price_id": new_price_id,
            "new_amount": str(unit_amount),
            "currency": str(currency),
        })

    print()
    print(f"Matched {len(repriced_products)} products.")

    if not product_to_new_price:
        print("No products matched. Nothing else to do.")
        return

    print()
    print("Scanning Payment Links and creating duplicates where needed...")

    link_rows = create_duplicate_payment_links(
        product_to_new_price=product_to_new_price,
        apply=apply,
    )

    if link_rows:
        csv_file = write_csv(link_rows)
        print()
        print(f"Wrote mapping CSV: {csv_file}")
    else:
        print("No Payment Links used the repriced products.")

    print()

    if apply:
        print("Done. Old prices were NOT archived. Old Payment Links were NOT deactivated.")
    else:
        print("Dry run complete. No Stripe objects were changed.")


if __name__ == "__main__":
    main()
