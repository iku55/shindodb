class SeismicScatterPlot {
  constructor(canvasElement, options = {}) {
    this.canvas = typeof canvasElement === 'string' 
      ? document.getElementById(canvasElement) 
      : canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.points = []; // ホバー判定用に描画座標を保持

    this.options = Object.assign({
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
      pointRadius: 5,
      axisColor: '#333',
      gridColor: '#e0e0e0',
      font: '12px sans-serif',
      xLabel: '震源距離 (km)',
      yLabel: '計測震度',
      maxY: 7.0,
    }, options);

    // 震度階級別の設定
    this.intensityBands = [
      { min: 0.5, max: 1.5, color: '#f2f2ff' },
      { min: 1.5, max: 2.5, color: '#00aaff' },
      { min: 2.5, max: 3.5, color: '#0041ff' },
      { min: 3.5, max: 4.5, color: '#fae696' },
      { min: 4.5, max: 5.0, color: '#ffe600' },
      { min: 5.0, max: 5.5, color: '#ff9900' },
      { min: 5.5, max: 6.0, color: '#ff2800' },
      { min: 6.0, max: 6.5, color: '#a50021' },
      { min: 6.5, max: 7.0, color: '#b40068' }
    ];

    this._initTooltip();
    this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
  }

  _initTooltip() {
    this.tooltip = document.createElement('div');
    Object.assign(this.tooltip.style, {
      position: 'absolute', display: 'none', padding: '8px',
      background: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '4px',
      pointerEvents: 'none', fontSize: '12px', zIndex: '2000'
    });
    document.body.appendChild(this.tooltip);
  }

  // 震度値から色を取得するヘルパー
  _getColorForIntensity(intensity) {
    const band = this.intensityBands.find(b => intensity >= b.min && intensity < b.max);
    return band ? band.color : null;
  }

  draw(data) {
    if (!data || data.length === 0) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.points = []; // 初期化

    const pad = this.options.padding;
    const plotWidth = this.canvas.width - pad.left - pad.right;
    const plotHeight = this.canvas.height - pad.top - pad.bottom;
    const maxX = Math.max(100, Math.ceil(Math.max(...data.map(d => d.distance)) / 50) * 50);
    const maxIntensityInData = Math.max(...data.map(d => d.intensity));
    const maxY = Math.max(1.0, Math.ceil(maxIntensityInData));

    // 1. 背景色の描画 (透明度 0.25)
    this.intensityBands.forEach(band => {
      if (band.min >= maxY) return; 

      const effectiveMax = Math.min(band.max, maxY);

      const yBottom = pad.top + plotHeight - (band.min / maxY) * plotHeight;
      const yTop = pad.top + plotHeight - (effectiveMax / maxY) * plotHeight;

      const drawY = Math.max(yTop, pad.top);
      const drawHeight = Math.min(yBottom - yTop, plotHeight - (drawY - pad.top));

      this.ctx.fillStyle = band.color + '40'; 
      this.ctx.fillRect(pad.left, drawY, plotWidth, drawHeight);
    });

    this._drawAxes(plotWidth, plotHeight, pad, maxX, maxY);

    // 2. データのプロット (透明度 1.0)
    data.forEach(item => {
      const x = pad.left + (item.distance / maxX) * plotWidth;
      const y = pad.top + plotHeight - (item.intensity / maxY) * plotHeight;
      const color = this._getColorForIntensity(item.intensity) || '#ccc';

      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.arc(x, y, this.options.pointRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();

      // ホバー判定用に保存
      this.points.push({ x, y, data: item });
    });
  }

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 最も近い点を探す（半径内）
    const hit = this.points.find(p => {
      const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
      return dist < this.options.pointRadius + 2;
    });

    if (hit) {
      this.canvas.style.cursor = 'pointer';
      this.tooltip.style.display = 'block';
      this.tooltip.style.left = `${e.pageX + 10}px`;
      this.tooltip.style.top = `${e.pageY + 10}px`;
      this.tooltip.innerHTML = `<strong>${hit.data.name}</strong><br>計測震度: ${hit.data.intensity.toFixed(1)}<br>距離: ${hit.data.distance.toFixed(3)}km`;
    } else {
      this.canvas.style.cursor = 'default';
      this.tooltip.style.display = 'none';
    }
  }

  _drawAxes(plotWidth, plotHeight, pad, maxX, maxY) {
    this.ctx.font = this.options.font;
    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (let i = 0; i <= maxY; i++) {
      const y = pad.top + plotHeight - (i / maxY) * plotHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, y);
      this.ctx.lineTo(pad.left + plotWidth, y);
      this.ctx.stroke();
      this.ctx.fillStyle = this.options.axisColor;
      this.ctx.fillText(i, pad.left - 10, y);
    }
    // (X軸の描画処理などは前回と同様のため省略可だが、一貫性のために維持)
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    for (let i = 0; i <= maxX; i += (maxX / 5)) {
      const x = pad.left + (i / maxX) * plotWidth;
      this.ctx.fillText(Math.round(i), x, pad.top + plotHeight + 10);
    }
  }
}