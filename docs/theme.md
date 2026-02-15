# Bảng màu

<!-- Background: #18181B (Zinc 900)  
Surface: #27272A (Zinc 800)  
Accent: #22D3EE (Cyan 400)  
Highlight: #A78BFA (Purple 400)  
Success: #4ADE80 (Green 400)  
Warning: #FBBF24 (Yellow 400)  
Text Primary: #FAFAFA (Zinc 50)  
Text Secondary: #A1A1AA (Zinc 400) -->

---

<style>
  /* Container grid giữ nguyên để quản lý các nhóm card + text */
  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 30px 24px; /* Tăng khoảng cách hàng để chỗ cho text bên dưới */
    margin-top: 20px;
  }

  /* Style cho khối bao quanh mỗi card và label */
  .color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Label mã màu bên dưới */
  .color-label {
    text-align: center;
    padding-top: 12px;
    font-family: 'JetBrains Mono', monospace; /* Font code cho chuyên nghiệp */
    font-size: 0.85rem;
    color: #A1A1AA; /* Zinc 400 */
    letter-spacing: 0.5px;
  }

  /* Base Card Style (Logic Hover giữ nguyên như cũ) */
  .card {
    position: relative;
    width: 200px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    cursor: pointer;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .card::before,
  .card::after {
    position: absolute;
    content: "";
    width: 0%;
    height: 0%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 1;
  }

  .card::before {
    top: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.15);
  }

  .card::after {
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    color: inherit;
    font-weight: 800;
    font-size: 13px;
    text-align: center;
    white-space: pre-wrap;
    line-height: 1.4;
  }

  .card:hover::before,
  .card:hover::after {
    width: 100%;
    height: 100%;
    border-radius: 15px;
  }

  .card:hover::after {
    content: attr(data-detail);
  }
</style>

<div class="color-grid">

  <div class="color-item">
    <div class="card" style="background:#18181B; color:#FAFAFA;" data-detail="BACKGROUND&#10;#18181B&#10;ZINC 900"></div>
    <div class="color-label">#18181B</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#27272A; color:#FAFAFA;" data-detail="SURFACE&#10;#27272A&#10;ZINC 800"></div>
    <div class="color-label">#27272A</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#22D3EE; color:#000;" data-detail="ACCENT&#10;#22D3EE&#10;CYAN 400"></div>
    <div class="color-label">#22D3EE</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#A78BFA; color:#000;" data-detail="HIGHLIGHT&#10;#A78BFA&#10;PURPLE 400"></div>
    <div class="color-label">#A78BFA</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#4ADE80; color:#000;" data-detail="SUCCESS&#10;#4ADE80&#10;GREEN 400"></div>
    <div class="color-label">#4ADE80</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#FBBF24; color:#000;" data-detail="WARNING&#10;#FBBF24&#10;YELLOW 400"></div>
    <div class="color-label">#FBBF24</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#FAFAFA; color:#000;" data-detail="PRIMARY TEXT&#10;#FAFAFA&#10;ZINC 50"></div>
    <div class="color-label">#FAFAFA</div>
  </div>

  <div class="color-item">
    <div class="card" style="background:#A1A1AA; color:#000;" data-detail="SECONDARY TEXT&#10;#A1A1AA&#10;ZINC 400"></div>
    <div class="color-label">#A1A1AA</div>
  </div>

</div>

---
