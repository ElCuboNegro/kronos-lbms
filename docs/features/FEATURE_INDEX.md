# LBMS: Scientist Toolset & Feature Map

This document serves as a master index of all the tools and features provided to researchers, technicians, and lab managers within the Laboratory Botanical Management System (LBMS). It is directly backed by the behavioral scenarios defined in the `/docs/features/` directory.

## 1. Unified Scanning & Identification
*The bridge between physical items and digital records.*
*   **Agnostic QR Scanner:** A single scanner interface that intelligently routes users based on ID prefixes (`UID:` for biologicals, `ID:` for equipment/consumables).
*   **Instant Entity Resolution:** Instantly view the "Ficha" (Detail View) of any specimen, reagent, or piece of equipment.
*   **Rapid Onboarding:** Scanning an unrecognized UID immediately prompts a "Quick Register" workflow, pre-filling the scanned UID.
*   *(Ref: `qr_scanning.feature`, `global_inventory.feature`)*

## 2. Biological Taxonomy & Hierarchy
*Managing the genetic catalog.*
*   **Species Catalog:** Register species with scientific names, families, and Wikipedia integration for automatic botanical data fetching.
*   **Genetic Lines:** Define distinct lineages under a species (e.g., "Dark Form") with specific propagation methods (seed, clone, in vitro).
*   **Variegations & Phenotypes:** Track specific traits (e.g., "Albo", "Mint") within genetic lines, allowing for identical phenotype names across different species.
*   *(Ref: `species_management.feature`, `genetic_line_management.feature`, `variegation_management.feature`)*

## 3. Specimen & Genealogy Tracking
*Tracking individual plants from explant to maturity.*
*   **Individual & Bulk Creation (Lotes):** Register single specimens or bulk clone dozens of individuals simultaneously.
*   **Genealogy Trees:** Assign exact "Mother" (`madre_id`) and "Father" (`padre_id`) UIDs during registration, enabling complete upstream and downstream lineage tracing.
*   **Timeline Visualization:** A chronological feed of all events (birth, transfers, experiments) associated with a specific specimen.
*   *(Ref: `specimen_management.feature`, `genealogy_management.feature`, `specimen_timeline.feature`)*

## 4. Evolution & Environmental Monitoring
*Tracking growth and health over time.*
*   **High-Speed Evolution Logs:** Rapidly record morphological metrics (height, leaf count, variegation percentage) and environmental conditions.
*   **Directional Photography:** Upload photos locked to specific angles (frente, arriba, etc.) to create consistent visual time-lapses.
*   **Hierarchical Configuration Inheritance:** Automated cascading of environmental targets (Lux, pH, Temp). The system automatically falls back from Experiment -> Variegation -> Line -> Species, preventing manual data entry fatigue.
*   *(Ref: `photo_tracking.feature`, `configuration_inheritance.feature`)*

## 5. Laboratory Logistics & Media Preparation
*Managing the chemical and physical environment.*
*   **Reagent Inventory:** Catalog pure chemicals, hormones, and salts, tracking purity and hazard warnings.
*   **Formulation Recipes (Recetario):** Define complex media formulas (e.g., MS Medium) with exact base ratios.
*   **Automated Batching (Lotes):** Request a specific volume/concentration of a recipe, and the system auto-calculates the exact mass of reagents required.
*   **Substrate Catalog:** Register physical growth media (agars, soils, hydroponics) to be linked to specimen evolution logs.
*   *(Ref: `media_laboratory_management.feature`, `substrate_management.feature`)*

## 6. Frontend Lab Utilities (Micro-tools)
*Sterile-workflow mathematical tools.*
*   **Serial Dilution & Molarity:** On-device `C1V1` calculations ensuring precise liquid transfers without needing external calculators.
*   **Viability & Colony Counters:** Rapid screen-tapping tools with haptic feedback to count live/dead cells or CFUs while looking through a microscope, keeping hands clean.
*   *(Ref: `frontend_calculators.feature`)*

## 7. Protocol Digitization & Validation
*Standardizing lab procedures.*
*   **Protocol Management:** Define step-by-step procedures, required materials, and versioning for lab operations (e.g., *Desinfección*, *Extracción Meristema*).
*   **Document Import (Planned):** Support for attaching PDFs or linking Google Docs for OCR extraction.
*   **Validation State Machine:** Technicians execute protocols inside experiments and submit validation results. A protocol only becomes "Validado" after a mathematically/visually successful execution.
*   *(Ref: `protocol_management.feature`)*

## 7. Physical Label Printing
*Generating hardware stickers.*
*   **Context-Aware Print Payloads:** Triggering a print dynamically builds the payload based on the entity.
*   **Specimen Labels:** Automatically resolve the complex environmental hierarchy to print the exact watering, light, and pH needs on the sticker.
*   **Chemical Batch Labels:** Automatically print the calculated reagent composition, preparer name, and hazard warnings on chemical flasks.
*   *(Ref: `label_printing.feature`)*

## 8. Experiment & Research Management
*Conducting the science.*
*   **Formal Experiments:** Define hypotheses, link protocols, and assign specific Directors and Operators to an experiment.
*   **Cohort Assignment:** Link specimens and lab equipment to an active experiment, automatically changing specimen states to "en_experimento".
*   **Research Findings:** Log specific observational or measured findings (`ResultadosInvestigacion`) directly to the experiment timeline.
*   *(Ref: `experiment_management.feature`)*

## 9. Universal Event Logging
*Auditing all lab activities.*
*   **Arbitrary Event Triggers:** Record standard actions (transfers, sanitization, maintenance) on any physical asset (plants or hardware).
*   **State Machine Automation:** Logging a "contaminacion" event automatically flips the specimen's master status to "contaminado", ensuring the inventory reflects real-world health.
*   **Accountability:** Track both the user who registered the event and the user who physically executed it.
*   *(Ref: `event_logging.feature`)*

## 10. Authentication & Security
*Securing the system.*
*   **Role-Based Access Control:** Secure JWT authentication for all API routes, with specific roles (Admin vs Tecnico).
*   **Profile Management:** Password rotation, active/inactive account toggles, and profile photo uploads (with strict MIME type validation).
*   *(Ref: `authentication.feature`)*

## 11. Scientific Lineage & Multi-Generational Tracking
*Biological version control for research.*
*   **Research Outputs:** Explicitly identify specimens as the "Objective" or "Result" of an experiment, creating a permanent link between a physical plant and a scientific project.
*   **Deep Ancestry Tracing:** Navigate from a specimen to its mother, and then directly to the experiment that *created* that mother, providing a full audit trail of scientific succession.
*   **Trait Stability Monitoring:** Compare evolution metrics across multiple generations of research-derived specimens to monitor genetic stability.
*   *(Ref: `scientific_lineage.feature`)*

---

## 🚀 Future Roadmap & Backlog
For features currently under consideration for future expansion (Spatial Management, IoT, Task Scheduling, and Analytics), please refer to:
**`FUTURE_ROADMAP.md`** (Project Root)
