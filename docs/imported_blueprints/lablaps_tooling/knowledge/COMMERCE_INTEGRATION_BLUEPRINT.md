# E-Commerce Integration Blueprint
*Status: Planned / Future Integration*

This document outlines the architectural strategy for integrating the LBMS (Laboratory Botanical Management System) with a commercial storefront (e.g., Shopify, WooCommerce, or custom Next.js).

The goal is to maintain LBMS as the **Master Source of Truth** for inventory, using an Event-Driven API to synchronize with the storefront.

## 1. Domain Mapping (LBMS -> E-Commerce)

To avoid duplicating data, LBMS models map directly to standard e-commerce structures:

| LBMS Model | E-Commerce Concept | Sync Behavior |
| :--- | :--- | :--- |
| `Especie` + `Linea` | **Product** (e.g., "Philodendron gloriosum") | Sync on creation/update. Contains base description and care guides. |
| `Variegacion` | **Product Variant / SKU** (e.g., "Albo", "Dark Form") | Dictates price multipliers. Represents the specific item type being bought. |
| `Especimen` | **Serialized Item / Stock Unit** (UID) | If `estado = "listo_venta"`, stock +1. When sold, status updates to `vendido`. |
| `LotePreparado` | **Batch Inventory** (Substrates/Agars) | A 50L Lote can be split into 50x "1L Bag" SKUs. Requires a commercial "Packaging" conversion event. |
| `RegistroEvolucion` | **Product Gallery (WYSIWYG)** | The most recent `frente` photo of a specimen is pushed as the listing image for "What You See Is What You Get" sales. |

## 2. Required Future Database Modifications
When the integration begins, these lightweight additions will be needed on the existing models:

*   **`Especie` / `Variegacion`**:
    *   `precio_base` (Float) - The default commercial value.
    *   `commerce_product_id` (String) - To link the LBMS record to the Shopify/Store ID.
*   **`Especimen`**:
    *   `commerce_order_id` (String) - To track which customer bought this specific UID.
    *   Expand `estado` string to handle: `listo_venta`, `reservado` (in cart/checkout), `vendido`, `enviado`.
*   **`Evento`**:
    *   New event types: `reserva_comercial`, `venta_comercial`, `despacho`. This ensures the lab timeline shows exactly when a plant left the facility.

## 3. The "Plant Passport" (Public Verification)
The QR codes currently used by technicians will serve a dual purpose.
*   **Future Requirement:** A new public, read-only API endpoint (e.g., `GET /public/passport/{uid}`).
*   **UX:** When a customer receives their plant and scans the QR code with their phone, they do not need to log in. They see a "Plant Passport" showing the plant's species, mother plant UID (Genealogy), birth date (cloning event), and a time-lapse of its `RegistroEvolucion` photos proving its authenticity.

## 4. API & Synchronization Strategy (Event-Driven)
Do not build a shopping cart in LBMS. LBMS must remain headless for commerce.

1.  **Outbound Webhooks (LBMS -> Store):**
    *   When a technician changes a Specimen's state to `listo_venta`, LBMS fires a webhook to the Store to increment stock for that Variant/SKU.
    *   If it's a WYSIWYG plant, LBMS pushes the latest evolution photo to the Store API.
2.  **Inbound Webhooks (Store -> LBMS):**
    *   When an order is paid on the Store, the Store sends an `order.paid` webhook containing the Specimen UID.
    *   LBMS intercepts this, marks the Specimen as `vendido`, logs the `Evento`, and alerts the lab packing team.

## 5. Fulfillment Workflow
1.  Store receives order for Specimen `UID:MOND-240101-01`.
2.  LBMS updates state to `vendido`.
3.  Packing technician goes to the greenhouse, scans the physical QR code on the pot.
4.  The LBMS Scanner recognizes it is `vendido`, displays the Customer Name and Order ID, and provides a button to "Print Shipping Label" or mark as `enviado`.