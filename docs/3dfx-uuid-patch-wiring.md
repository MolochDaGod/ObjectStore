<!-- Replace just the closing scripts section to add UUID patch -->
<!-- This file is too large to push in full via API. 
     Add this line manually at the bottom of 3dfx-viewer.html, 
     right after the nav.js script tag:
     
     <script src="./js/3dfx-uuid-patch.js" defer></script>
     
     The patch auto-loads UUIDs and adds:
     - UUID badge (last 8 chars) on each effect in sidebar
     - Click badge to copy full GRDG-3DFX-* UUID
     - Inspector panel shows full UUID + Copy button + Three.js snippet
-->
