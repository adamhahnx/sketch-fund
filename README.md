# Sketch-Fund API

## Setup & Configuration

### Authentication
Include your API key in the request headers to authenticate calls:
```http
key: YOUR_API_KEY
```

### API Documentation
For a complete reference of all available endpoints, schemas, and usage examples, please refer to the generated **OpenAPI Specification**:
- [openapi.json](./openapi.json)
- **Live Base URL:** `https://sketch-fund.up.railway.app` (Defined in spec)

---

## Current Architecture

The system is built on a **Node.js** backend using **Prisma** for ORM and **PostgreSQL** for persistence.

### Core Features
- **Data Modeling:** Full relational models for `Merchants`, `Consumers`, `Products`, and `Orders` are implemented and fully interactive via the API.
- **Validation:** Basic request validation is in place for ensuring data integrity across routes.
- **Mural Integration:** `Counterparty` and `PayoutMethod` creation have been successfully integrated into the **Merchant** onboarding flow.

---

## Future Work

### Integrations For MVP
- **Full Mural API Mapping:** Extend mapping with the Mural API to manage the lifecycle of Merchants, Consumers, Products, and Orders.
- **Async Architecture:** Implement Notification Webhooks and Service Workers for non-blocking operations.

### Planned Service Layers
A pluggable service layer will be introduced to handle complex real-world payment scenarios:
- **Reconciliation:** Logic for handling duplicate transactions and timing mismatches on deposits.
- **Idempotency:** Robust payment metadata matching and fuzzy amount matching within configurable tolerances.
- **Variance Handling:** Support for partial payments, refunds, and payment amount variance.
- **On-Chain Identity:** Simplified on-chain customer identifiers for streamlined tracking.

### Planned Infrastructure
- **Framework Hardening:** Migration to **NestJS** for better modularity.
- **Validation:** Enhanced schema validation using **Zod**, and full validation coverage.
- **Security:** Implementation of Rate Limiting and strict CORS policies.
- **DevOps:** Switch to non-dev Prisma migration/deployment and add more complete error handling coverage (suppressing stack traces to clients).

> **Disclaimer:** Though AI helped me format the openapi.json and README.md, I built this project entirely by hand, without assistance, using my own reasoning.