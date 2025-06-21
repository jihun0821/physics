// 전류 방향: 1(위), -1(아래)
let currentDirection = 1;
let voltage = 3;
let showIron = true;
let showCompass = true;

// 나침반 위치 (도선 주위 4방향)
const compassPositions = [
  { x: 300, y: 120 }, // 위
  { x: 300, y: 280 }, // 아래
  { x: 170, y: 200 }, // 왼쪽
  { x: 430, y: 200 }  // 오른쪽
];

// 도선 중심 좌표
const wire = { x: 300, y: 200, length: 180 };

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

// 컨트롤러 이벤트 바인딩
document.getElementById('voltageInput').addEventListener('input', e => {
  voltage = parseFloat(e.target.value) || 0;
  draw();
});
document.getElementById('directionBtn').addEventListener('click', () => {
  currentDirection *= -1;
  draw();
});
document.getElementById('showIron').addEventListener('change', e => {
  showIron = e.target.checked;
  draw();
});
document.getElementById('showCompass').addEventListener('change', e => {
  showCompass = e.target.checked;
  draw();
});

// 나침반 회전 각도 계산 (오른손 법칙)
function compassAngle(idx) {
  // idx: 0(위), 1(아래), 2(왼), 3(오)
  // 전류 위(1): 자기장 방향 (도선 기준 원, 오른손 법칙)
  // 위: 왼쪽, 아래: 오른쪽, 왼쪽: 아래, 오른쪽: 위 (전류 위로 흐를 때)
  // 각도 = (전류 방향) * (90도 × idx)
  // 실제 각도는 도선-나침반 상대 위치에 따라 다름
  const baseAngles = [180, 0, 90, -90]; // [위, 아래, 왼, 오]
  let angle = baseAngles[idx] * currentDirection;
  // 각도는 자기장 세기(전압)에 따라 최대 ±70도 제한 (자연스러운 회전)
  angle = angle * (Math.min(voltage, 10) / 10) * 0.7;
  return angle;
}

// 도선, 화살표, 철가루, 나침반 그리기
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 도선 (세로선)
  ctx.save();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(wire.x, wire.y - wire.length / 2);
  ctx.lineTo(wire.x, wire.y + wire.length / 2);
  ctx.stroke();
  ctx.restore();

  // 도선 위 화살표 (전류 방향)
  ctx.save();
  ctx.translate(wire.x, wire.y);
  ctx.rotate(currentDirection === 1 ? -Math.PI / 2 : Math.PI / 2);
  drawArrow(0, -wire.length / 2 + 30, 0, wire.length / 2 - 30);
  ctx.restore();

  // 철가루: 무작위로 원형 배치된 점들
  if (showIron) {
    ctx.save();
    for (let a = 0; a < 360; a += 10) {
      let r = 60 + Math.random() * 12;
      let rad = a * Math.PI / 180;
      let x = wire.x + r * Math.cos(rad);
      let y = wire.y + r * Math.sin(rad);
      ctx.fillStyle = "#888";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }

  // 나침반 4개
  if (showCompass) {
    for (let i = 0; i < 4; i++) {
      drawCompass(compassPositions[i].x, compassPositions[i].y, compassAngle(i));
    }
  }
}

// 화살표 그리기 함수
function drawArrow(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // 화살촉
  let angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 15 * Math.cos(angle - Math.PI / 8), y2 - 15 * Math.sin(angle - Math.PI / 8));
  ctx.lineTo(x2 - 15 * Math.cos(angle + Math.PI / 8), y2 - 15 * Math.sin(angle + Math.PI / 8));
  ctx.lineTo(x2, y2);
  ctx.fillStyle = '#1565c0';
  ctx.fill();
  ctx.restore();
}

// 나침반 그리기
function drawCompass(cx, cy, angle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle * Math.PI / 180);
  // 나침반 원
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  // N극(빨강)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -18);
  ctx.strokeStyle = '#e53935';
  ctx.lineWidth = 5;
  ctx.stroke();
  // S극(파랑)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 18);
  ctx.strokeStyle = '#3949ab';
  ctx.stroke();
  // 눈금
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(0, -20);
  ctx.moveTo(0, 24);
  ctx.lineTo(0, 20);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

draw();