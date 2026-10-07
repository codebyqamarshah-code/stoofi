STOOFI ERP - WEBSITE SOURCE
==========================

Complete static frontend source for the updated website with images and motion.

QUICK START
1. Extract this ZIP.
2. Open index.html in a modern browser.
3. For a local web server, open a terminal in this folder and run:
   python -m http.server 8000
   Then open http://localhost:8000
No npm installation or build step is needed.

FILES
index.html          Page content and structure
styles.css          Main design and responsive layout
motion.css          Hover, floating, and 3D tilt styles
app.js              Tabs, navigation, dialogs, FAQ-related content, scroll reveals
motion.js           Pointer-based 3D tilt and animation pause controls
logo.png            Logo extracted from the supplied layout
classroom.webp      Generated classroom illustration/photo
administration.webp Generated school office illustration/photo
education-3d.webp   Generated 3D education artwork

EDITING
- Edit index.html for the page headings, pricing, contact details, and testimonials.
- Edit the steps, portals, and features arrays in app.js for dynamic section content.
- Edit styles.css for typography, colors, spacing, and responsive styles.
- Edit motion.css and motion.js for animations and hover behavior.
- Google Fonts (Manrope and DM Sans) load from the internet. Sans-serif fallbacks
  are included if the fonts are unavailable.

HOSTING / CPANEL
Upload index.html, both CSS files, both JavaScript files, and all four images
into your chosen domain document root, keeping them together in one folder.
For a standalone domain, this is often public_html. If the domain already
hosts another site, back it up and choose the intended folder before uploading.
The README does not need to be uploaded.
No Node.js backend is required for this frontend.

CURRENT SCOPE
- This is a marketing website frontend, not the ERP application itself.
- Login shows a preview message; no authentication backend is connected.
- Trial and sales actions open the supplied support email address.
- Detailed guide buttons show available content or open an email request.
- Notice Board has an empty preview state.
- Photos are AI-generated illustrative assets, not photos of named customers.
- The supplied source content was preserved, including statistics, testimonials,
  contact details, pricing, and the Five Portals heading with four supplied
  portal cards. Verify those claims and details before using them commercially.
- Reduced-motion settings disable motion; the header control pauses animations.
