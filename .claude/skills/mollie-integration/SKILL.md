---
name: mollie-integration
description: Implement Mollie payment processing for Dutch/European payment flows including iDEAL, credit cards, subscriptions, and webhooks. Use when integrating Mollie payments, building subscription systems, or implementing checkout flows for Dutch/European markets.
---

This skill guides implementation of Mollie payment processing — the leading Dutch PSP (Payment Service Provider) for European markets. Mollie offers a simple, developer-friendly API with support for iDEAL, credit cards, Bancontact, PayPal, Klarna, SEPA Direct Debit, and more.

## When to Use This Skill

- Implementing payment processing for Dutch/European customers
- Setting up subscription billing with recurring payments
- Handling one-time payments and recurring charges
- Processing refunds
- Managing customer payment methods and mandates
- Building checkout flows with iDEAL or other European payment methods

## Core Concepts

### 1. Payment Flow (3 Steps)

1. **Create payment** via Payments API
2. **Redirect customer** to Mollie hosted checkout
3. **Process webhook** when payment status changes

### 2. Payment Statuses

| Status | Description |
|--------|-------------|
| `open` | Payment created, waiting for customer |
| `pending` | Payment in progress (bank transfer) |
| `paid` | Payment successful ✓ |
| `failed` | Payment failed |
| `canceled` | Payment canceled by customer |
| `expired` | Payment expired |

### 3. Webhooks

Mollie calls your webhook when payment status changes. You receive only the payment ID — fetch full status via API.

**Important**: Never trust client-side redirects alone. Always verify via webhook.

### 4. Recurring Payments

**Components:**
- **Customer**: Required for recurring payments
- **Mandate**: Authorization to charge customer
- **First Payment**: `sequenceType: "first"` — creates mandate
- **Recurring Payment**: `sequenceType: "recurring"` — charges mandate
- **Subscription**: Automated periodic charges

### 5. Supported Payment Methods

| Method | Use Case |
|--------|----------|
| `ideal` | Dutch bank payments (most popular in NL) |
| `creditcard` | International payments |
| `bancontact` | Belgian payments |
| `paypal` | International alternative |
| `klarnapaylater` | Buy now, pay later |
| `klarnasliceit` | Installments |
| `sepadirectdebit` | SEPA recurring (B2B) |
| `banktransfer` | Manual bank transfer |

## Quick Start

```python
from mollie.api.client import Client

mollie_client = Client()
mollie_client.set_api_key("test_YourApiKey")

# Create a simple payment
payment = mollie_client.payments.create({
    "amount": {
        "currency": "EUR",
        "value": "10.00"  # Always string with 2 decimals
    },
    "description": "Order #12345",
    "redirectUrl": "https://yoursite.com/order/12345/return",
    "webhookUrl": "https://yoursite.com/mollie/webhook",
    "metadata": {
        "order_id": "12345"
    }
})

# Redirect customer to checkout
print(payment.checkout_url)
```

## Payment Implementation Patterns

### Pattern 1: One-Time Payment

```python
def create_payment(amount: str, description: str, order_id: str):
    """Create a one-time payment."""
    try:
        payment = mollie_client.payments.create({
            "amount": {
                "currency": "EUR",
                "value": amount  # e.g., "19.99"
            },
            "description": description,
            "redirectUrl": f"https://yoursite.com/order/{order_id}/return",
            "webhookUrl": "https://yoursite.com/mollie/webhook",
            "metadata": {
                "order_id": order_id
            }
        })
        return {
            "payment_id": payment.id,
            "checkout_url": payment.checkout_url
        }
    except Exception as e:
        print(f"Mollie error: {e}")
        raise
```

### Pattern 2: Payment with Specific Method (iDEAL)

```python
def create_ideal_payment(amount: str, order_id: str, issuer: str = None):
    """Create an iDEAL payment with optional bank pre-selection."""
    payment_data = {
        "amount": {"currency": "EUR", "value": amount},
        "description": f"Order #{order_id}",
        "method": "ideal",
        "redirectUrl": f"https://yoursite.com/order/{order_id}/return",
        "webhookUrl": "https://yoursite.com/mollie/webhook",
        "metadata": {"order_id": order_id}
    }
    
    if issuer:
        payment_data["issuer"] = issuer  # e.g., "ideal_INGBNL2A"
    
    return mollie_client.payments.create(payment_data)


def get_ideal_issuers():
    """Get list of available iDEAL banks."""
    method = mollie_client.methods.get("ideal", include="issuers")
    return [
        {"id": issuer.id, "name": issuer.name}
        for issuer in method.issuers
    ]
```

### Pattern 3: Customer + First Payment (for Recurring)

```python
def create_customer(email: str, name: str):
    """Create a Mollie customer for recurring payments."""
    customer = mollie_client.customers.create({
        "name": name,
        "email": email,
        "metadata": {
            "user_id": "your_internal_id"
        }
    })
    return customer


def create_first_payment(customer_id: str, amount: str, description: str):
    """Create first payment to establish mandate for recurring."""
    payment = mollie_client.payments.create({
        "amount": {"currency": "EUR", "value": amount},
        "description": description,
        "customerId": customer_id,
        "sequenceType": "first",  # Creates mandate after success
        "redirectUrl": "https://yoursite.com/subscription/success",
        "webhookUrl": "https://yoursite.com/mollie/webhook"
    })
    return payment
```

### Pattern 4: Recurring Payment (Charge Existing Mandate)

```python
def create_recurring_payment(customer_id: str, amount: str, description: str):
    """Charge customer using existing mandate (no redirect needed)."""
    # Get customer's valid mandate
    mandates = mollie_client.customer_mandates.with_parent_id(customer_id).list()
    valid_mandate = next(
        (m for m in mandates if m.status == "valid"),
        None
    )
    
    if not valid_mandate:
        raise Exception("No valid mandate found")
    
    payment = mollie_client.payments.create({
        "amount": {"currency": "EUR", "value": amount},
        "description": description,
        "customerId": customer_id,
        "sequenceType": "recurring",
        "webhookUrl": "https://yoursite.com/mollie/webhook"
    })
    return payment  # No checkout_url — charged directly
```

### Pattern 5: Subscription (Automated Recurring)

```python
def create_subscription(customer_id: str, amount: str, interval: str):
    """Create automated subscription.
    
    interval examples: "1 month", "14 days", "1 year"
    """
    subscription = mollie_client.customer_subscriptions.with_parent_id(
        customer_id
    ).create({
        "amount": {"currency": "EUR", "value": amount},
        "interval": interval,
        "description": f"Subscription - {amount}/month",
        "webhookUrl": "https://yoursite.com/mollie/webhook"
    })
    return subscription


def cancel_subscription(customer_id: str, subscription_id: str):
    """Cancel a subscription."""
    mollie_client.customer_subscriptions.with_parent_id(
        customer_id
    ).delete(subscription_id)
```

## Webhook Handling

### Secure Webhook Endpoint

```python
from flask import Flask, request
import json

app = Flask(__name__)

@app.route("/mollie/webhook", methods=["POST"])
def mollie_webhook():
    """Handle Mollie webhook."""
    # Mollie sends payment ID as form data
    payment_id = request.form.get("id")
    
    if not payment_id:
        return "Missing payment ID", 400
    
    try:
        # Fetch actual payment status from Mollie
        payment = mollie_client.payments.get(payment_id)
        
        # Handle based on status
        if payment.is_paid():
            handle_successful_payment(payment)
        elif payment.is_failed():
            handle_failed_payment(payment)
        elif payment.is_canceled():
            handle_canceled_payment(payment)
        elif payment.is_expired():
            handle_expired_payment(payment)
        
        return "OK", 200
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return "Error", 500


def handle_successful_payment(payment):
    """Process successful payment."""
    metadata = payment.metadata
    order_id = metadata.get("order_id") if metadata else None
    
    # Update your database
    # Send confirmation email
    # Fulfill order
    print(f"Payment {payment.id} successful for order {order_id}")


def handle_failed_payment(payment):
    """Handle failed payment."""
    print(f"Payment {payment.id} failed")
    # Notify customer
    # Update order status
```

### Webhook Best Practices

```python
def handle_webhook_idempotently(payment_id: str):
    """Ensure webhook is processed exactly once."""
    # Check if already processed
    if is_payment_processed(payment_id):
        return  # Already handled
    
    payment = mollie_client.payments.get(payment_id)
    
    # Only process if status actually changed
    stored_status = get_stored_payment_status(payment_id)
    if stored_status == payment.status:
        return
    
    # Process and mark as handled
    process_payment_status_change(payment)
    mark_payment_processed(payment_id, payment.status)
```

## Refund Handling

```python
def create_refund(payment_id: str, amount: str = None, description: str = None):
    """Create a refund (full or partial)."""
    refund_data = {}
    
    if amount:
        refund_data["amount"] = {"currency": "EUR", "value": amount}
    
    if description:
        refund_data["description"] = description
    
    refund = mollie_client.payment_refunds.with_parent_id(
        payment_id
    ).create(refund_data)
    
    return refund


def get_refunds(payment_id: str):
    """List all refunds for a payment."""
    return mollie_client.payment_refunds.with_parent_id(payment_id).list()
```

## Testing

```python
# Use test API key
mollie_client.set_api_key("test_YourTestApiKey")

# Test amounts trigger specific behaviors:
# €10.00+ = successful payment
# Specific amounts for specific statuses (see Mollie docs)

def test_payment_flow():
    """Test complete payment flow."""
    # Create test payment
    payment = mollie_client.payments.create({
        "amount": {"currency": "EUR", "value": "10.00"},
        "description": "Test payment",
        "redirectUrl": "https://yoursite.com/test/return",
        "webhookUrl": "https://yoursite.com/test/webhook"
    })
    
    print(f"Test payment created: {payment.id}")
    print(f"Checkout URL: {payment.checkout_url}")
    
    # In test mode, you can complete payment manually
    # via the checkout URL
```

## Environment Setup

```python
import os
from mollie.api.client import Client

def get_mollie_client():
    """Get configured Mollie client."""
    client = Client()
    
    # Use environment variable
    api_key = os.getenv("MOLLIE_API_KEY")
    if not api_key:
        raise ValueError("MOLLIE_API_KEY not set")
    
    client.set_api_key(api_key)
    return client

# .env file:
# MOLLIE_API_KEY=test_xxxxx (test mode)
# MOLLIE_API_KEY=live_xxxxx (production)
```

## Best Practices

1. **Always Use Webhooks**: Never rely on redirect alone for payment confirmation
2. **Idempotency**: Handle webhooks idempotently (Mollie may retry)
3. **Store Payment ID**: Link Mollie payment ID to your order in database
4. **Use Metadata**: Store order_id/user_id in payment metadata
5. **Test Mode**: Use test API key during development
6. **Amount Format**: Always use string with 2 decimals ("10.00", not 10)
7. **Currency**: Specify currency explicitly (EUR, USD, GBP)
8. **HTTPS Required**: Webhook URLs must be HTTPS in production

## Common Pitfalls

- **Wrong Amount Format**: Use `"10.00"` not `10` or `"10"`
- **Missing Webhook**: Always implement webhook handler
- **Trusting Redirects**: Customer can manipulate redirect — verify via API
- **No Idempotency**: Same webhook may be called multiple times
- **Hardcoded URLs**: Use environment variables for webhook/redirect URLs
- **Missing Customer**: Recurring payments require customer + first payment first

## Mollie vs Stripe Comparison

| Aspect | Mollie | Stripe |
|--------|--------|--------|
| Focus | Dutch/European | Global |
| iDEAL | Native, excellent | Via SEPA |
| Pricing | Per transaction | Per transaction |
| Hosted Checkout | Yes | Yes (Checkout) |
| Custom UI | Mollie Components | Stripe Elements |
| Subscriptions | Yes | Yes |
| Webhooks | Payment ID only | Full event payload |

## Resources

- [Mollie API Docs](https://docs.mollie.com/)
- [Python Client](https://github.com/mollie/mollie-api-python)
- [Webhook Guide](https://docs.mollie.com/reference/webhooks)
- [Recurring Payments](https://docs.mollie.com/payments/recurring)
