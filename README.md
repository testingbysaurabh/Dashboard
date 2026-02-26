

# Dynamic Dashboard Builder – Full Stack Assignment

This project is my implementation of a **Dynamic Dashboard Builder**, similar to a lightweight version of Canva / Figma / Webflow-style canvas editors.

Users can add, move and resize components on a canvas (headings, paragraphs, cards, images and charts), and then **save the entire layout** to a MySQL database. Saved dashboards can be reloaded later, previewed, or deleted.


I’ve focused on:

- A clean and modern UI
- Simple and readable code
- A realistic full-stack flow: **HTML + CSS + JavaScript (Fabric.js) + PHP + MySQL**

---

## 🚀 Features

### 1. Canvas & Layout

- Central **dashboard canvas** built with `fabric.js`
- Components are **draggable and resizable**:
  - Heading (H1 style)
  - Paragraph text
  - Card (colored container section)
  - Image (uploaded from local device)
  - Chart (bar chart driven by custom data)
- Zoom control with smooth scaling (50%–150%)

### 2. Elements Palette (Left Panel)

- Typography section:
  - **Heading** – bold hero titles
  - **Paragraph** – body/description text
- Media section:
  - **Image** – upload and place image on canvas
  - **Chart** – creates a bar chart using user-provided data
- Layout section:
  - **Card** – colored container to create sections or highlight content

On mobile screens the left panel works as a **bottom sheet**, opened via a hamburger icon in the top bar.

### 3. Inspector Panel (Right Panel)

- Shows details of the currently selected element:
  - Position: X, Y
  - Size: Width, Height
  - Typography: Font size & color (for text)
- Layer controls:
  - Bring to front
  - Send to back
  - Delete selected element
- Chart controls:
  - Enter **comma-separated labels** (e.g. `Jan, Feb, Mar, Apr`)
  - Enter **comma-separated values** (e.g. `10, 30, 25, 45`)
  - `Create Chart from data` → adds new chart
  - `Update selected chart` → rebuilds the currently selected chart with new data

On small/medium screens the Inspector becomes a **slide-in drawer from the right**, opened/closed via buttons.

### 4. Saving, Loading & Managing Layouts

All layouts are stored as JSON in the database.

- **Save Layout**
  - Saves the current canvas state to `dashboard_layout` table (`layout_json` column).
- **Load Latest**
  - Fetches and renders the most recently saved layout.
- **Saved Layouts list**
  - Shows up to the last 20 saved layouts with:
    - `Dashboard #ID`
    - `Created at` timestamp
  - Click any layout to load it into the editor.
- **Delete saved layout**
  - Each saved layout has a **Delete** button.
  - On click → confirms delete → removes record from DB and refreshes the list.

### 5. Responsive UI

The layout is fully responsive and behaves differently on various screen sizes:

- **Desktop / Large**
  - Left palette, center canvas, right inspector shown side-by-side using CSS grid.
  - Topbar shows all action buttons (`Previous Saves`, `Load Latest`, `Save Layout`) directly.
- **Tablet / Medium**
  - Inspector becomes a slide-in drawer on the right.
- **Mobile / Small**
  - Left panel becomes a bottom sheet.
  - Right inspector is still a slide-in drawer.
  - Topbar:
    - Shows brand + **Design/Preview** toggle.
    - Actions (`Previous Saves`, `Load Latest`, `Save Layout`) moved into a dropdown menu behind a **☰ Actions** button.

---

## 🛠 Tech Stack

**Frontend**

- HTML5, CSS3 (custom styling, no CSS framework)
- Vanilla JavaScript (ES6)
- [Fabric.js](https://fabricjs.com/) – for canvas, drag/drop, resize, and grouping

**Backend**

- PHP 8 (built for LAMP stack / PHP dev server)
- MySQL (via `mysqli`)

---

## 📁 Folder Structure

```text
dashboard-builder/
  ├── frontend/
  │   ├── index.html      # Main UI
  │   ├── styles.css      # All styles (layout + responsive)
  │   └── app.js          # Canvas logic, API calls, UI interactions
  │
  └── backend/
      ├── db.php          # DB connection (MySQL)
      ├── init.sql        # Database + table setup script
      ├── save_layout.php # Save layout JSON
      ├── get_layout.php  # Get latest or specific layout by id
      ├── list_layouts.php# List recent layouts
      └── delete_layout.php # Delete a saved layout



****Important 
### 🚀 Run Project Locally;
```bash
cd backend
mysql -u root < init.sql  
cd ..
php -S localhost:8000




