# React Mini BI

A lightweight, interactive Business Intelligence (BI) workspace built with **React** and **TypeScript**.
The application enables users to load CSV data, explore fields, construct charts via drag-and-drop, and export visualizations.

This project was developed as part of a take-home assignment and emphasizes **clear data modeling, predictable behavior, and maintainable structure** over heavy UI abstraction.

---

## Overview

The Mini BI workspace supports a common analytical workflow:

1. Load structured data from CSV
2. Inspect inferred field types and basic statistics
3. Build visualizations by assigning fields to shelves
4. Apply aggregation, bucketing, filtering, and sorting
5. Export charts for downstream use

The implementation avoids external charting libraries and instead renders charts directly with SVG for transparency and control.

---

## Features

### Data handling

* CSV upload or loading from a predefined sample
* Automatic field type inference (string, number, date)
* Per-field summary statistics

### Visualization

* Drag-and-drop field assignment to shelves (X, Y, Color, Size)
* Supported chart types:

  * Bar
  * Stacked bar
  * Line
  * Area
  * Scatter
  * Pie
* Automatic chart type suggestion with manual override
* Date bucketing (day, month, year)

### Interaction

* Basic filtering (contains, equality, comparisons)
* Sorting by aggregated value
* Keyboard-accessible shelf interactions
* Dark and light theme support (persisted locally)

### Export

* Export charts as SVG
* Export charts as PNG

### Engineering

* Fully typed with TypeScript
* Clear separation between UI, hooks, and data logic
* Unit tests using Vitest and Testing Library

---

## Project Structure

```text
src/
  components/
    ChartCanvas.tsx
    DataTable.tsx
    FieldPanel.tsx
    Shelf.tsx
    ShelfChip.tsx
  hooks/
    useDataset.ts
    useChartSpec.ts
    useTheme.ts
  lib/
    aggregate.ts
    bucket.ts
    chartSuggestions.ts
    exportChart.ts
    inferTypes.ts
    parseCsv.ts
    sort.ts
    storage.ts
  pages/
    Workspace.tsx
  tests/
    aggregate.test.ts
    FieldPanel.test.tsx
public/
  data/sample.csv
```

---

## Running the Project

### Requirements

* Node.js 18+
* npm

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Tests

The project includes focused unit tests covering:

* Core aggregation logic
* Field panel rendering

Run tests in watch mode:

```bash
npm test
```

Run tests once:

```bash
npm run test:run
```

---

## Exporting Charts

Once a chart is rendered, it can be exported using the controls in the chart panel:

* **SVG export** for scalable, editable graphics
* **PNG export** for raster images suitable for sharing or embedding

Exports reflect the current chart configuration and filters.

---

## Design Notes

* Charts are rendered directly using SVG to keep the rendering logic explicit and debuggable.
* State management is handled with local React hooks rather than global stores to keep data flow easy to reason about.
* Optional features (exporting, additional chart types) are implemented in isolation to avoid coupling with core logic.
* Styling is intentionally minimal and theme-driven to focus on interaction and data clarity.

---

## Potential Extensions

* Legends for stacked and pie charts
* Support for multiple simultaneous filters
* Responsive chart resizing via `ResizeObserver`
* Export of filtered / aggregated data
* Saved chart configurations

---

## Author

Developed by **Aryan**
As part of a junior software engineer take-home assignment.


