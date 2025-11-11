# educational-establishments

An interactive web project visualising educational establishments across England

---

## Contents
1. [Overview](#1-overview)
2. [Repository Structure](#2-repository-structure)
3. [Features & Technologies](#3-features--technologies)
4. [Deployment](#4-deployment)
5. [Data Source & Processing](#5-data-source--processing)
6. [Screenshots](#6-screenshots)
7. [Disclaimer](#7-disclaimer)
8. [License](#8-license)
9. [Author](#9-author)

---

## 1. Overview

This project visualises educational establishments in England through **three separate web pages**, one for each data format: **JSON**, **GeoJSON**, and **CSV**.  
Each page provides the same interface and functions, allowing users to explore and compare how different data types can be fetched and visualised on an interactive map.  

Users can:
- View establishments across **England** or filter to **Birmingham only**.  
- Explore schools through **interactive marker clusters**.  
- Display details via **bindPopup** windows, including clickable links for additional information.  
- Filter establishments by type for better visual understanding.  

---

## 2. Repository Structure

HTML Files
- `index.html` - Landing page linking to visualisation pages
- `json.html` - JSON data visualisation page
- `geojson.html` - GeoJSON data visualisation page
- `csv.html` - CSV data visualisation page

Datasets
- `data/educational_establishment.json` - JSON dataset
- [`data/educational_establishment.geojson`](data/educational_establishment.geojson) - GeoJSON dataset
- `data/educational_establishment.csv` - CSV dataset
- `data/school_code_mappings.json` - Generated mapping file

JS Scripts
- `static/js/script_json.js` - JSON visualisation script
- `static/js/script_geojson.js` - GeoJSON visualisation script
- `static/js/script_csv.js` - CSV visualisation script

CSS Files
- `static/css/styles.css` - Global styles

Jupyter Notebooks
- [`school_mapping/school_mapping.ipynb`](school_mapping/school_mapping.ipynb) - Notebook for creating code mappings

Images
- [`images/`](images/) - Folder containing screenshots

---

## 3. Features & Technologies

### Features
- **Three separate web pages** demonstrating data fetching from different formats (**JSON**, **GeoJSON**, and **CSV**).  
- **Identical interface and functionality** across all three visualisations.  
- Switch between **England-wide** and **Birmingham-only** views.  
- **Marker clustering** for improved map readability.  
- **Randomised colours in legends** for quick visual differentiation.  
- **Interactive popups** with links to related resources.  
- **Filtering** by establishment type for easier data exploration.  

### Technologies Used
- **HTML**, **CSS**, **JavaScript**
- **Leaflet.js** - mapping and visualisation
- **PapaParse** - parsing CSV files
- **Python / Jupyter Notebook** - data mapping and preprocessing

---

## 4. Deployment

To run locally:

1. Clone the repository
   ```bash
   git clone https://github.com/bernardtse/educational-establishments.git
   ```

2. Navigate to the project folder 
   ```bash
   cd educational-establishments
   ```

3. Start a local HTTP server
   ```bash
   python -m http.server
   ```

4. Open your browser
  
   Visit `http://localhost:8000` (or the port shown in your terminal).

   Alternatively, view the live deployment at: [https://bernardtse.github.io/educational-establishments](https://bernardtse.github.io/educational-establishments)

---

## 5. Data Source & Processing

### Data Sources

### Planning and Housing Data (England)
[Educational Establishment Dataset](https://www.planning.data.gov.uk/dataset/educational-establishment)
- **JSON**: https://files.planning.data.gov.uk/dataset/educational-establishment.json
- **GeoJSON**: https://files.planning.data.gov.uk/dataset/educational-establishment.geojson
- **CSV**: https://files.planning.data.gov.uk/dataset/educational-establishment.csv

This dataset includes **latitude and longitude** coordinates, making it suitable for direct mapping in Leaflet.

### Official School Data Portal
[Get Information About Schools](https://get-information-schools.service.gov.uk/Downloads)  

The CSV files in this dataset contain coordinates in the **Ordnance Survey National Grid (OSGB)**, also known as the **British National Grid (BNG)**. Since there is a required conversion between BNG and the Latitude/Longitude system used by Leaflet.js, this dataset is **not** used as the project’s **primary** data source. However, it is still utilised in the school_mapping.ipynb notebook to generate mapping data for code translations.

### Date of Data Retrieval
- **Educational Establishment** Dataset stored in this repository was last retrieved on 01 November 2025 at https://www.planning.data.gov.uk/dataset/educational-establishment.
- `data/school_code_mappings.json` was last generated on 1 November 2025 based on the **Get Information about Schools** Dataset retrieved on 31 October 2025 at https://get-information-schools.service.gov.uk/Downloads.


---

### Data Processing

- Demonstrates fetching and visualising data from:  
  - **JSON** – Fetched using `fetch()` and parsed directly.  
  - **GeoJSON** – Similar to JSON but requires specific handling for its spatial structure.  
  - **CSV** – Parsed using **PapaParse** and structured to match the JSON format after parsing.

- Several fields (e.g., `educational-establishment-type`, `educational-establishment-status`) use numeric codes.  
  A [**Jupyter Notebook**](school_mapping/school_mapping.ipynb) is provided to generate a mapping file (`school_code_mappings.json`) translating these codes into meaningful text for display.  

- **CORS Restrictions:**  
  Many UK government data servers block direct requests from web browsers due to Cross-Origin Resource Sharing (CORS) policies.
  Therefore, copies of the data files (`educational_establishment.json`, [`educational_establishment.geojson`](data/educational_establishment.geojson), and `educational_establishment.csv`) are stored locally in this repository to ensure consistent access.

---

## 6. Screenshots

### Interactive Map Example
![Interactive Map](images/eduleaflet.png)

---

## 7. Disclaimer

This project relies on **external data sources and JavaScript libraries**.  
As these are hosted on third-party servers, some features, datasets, or external links **may become unavailable or broken over time**.  
Functionality of the visualisations may vary depending on the availability of these external resources.

---

## 8. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 9. Author

- Developed and maintained by [Bernard Tse](https://github.com/bernardtse), with support from [OpenAI](https://openai.com)’s ChatGPT for code refinement, optimisation, and debugging assistance.

- Inspired in part by the [Garden Stakes Project](https://github.com/NidaB-C/garden_stakes) by [NidaB-C](https://github.com/NidaB-C/).
