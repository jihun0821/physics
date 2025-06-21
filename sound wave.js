const canvas = document.getElementById('interferenceCanvas');
const ctx = canvas.getContext('2d');

const speakerY = canvas.height / 2;
const leftSpeakerX = 100;
const rightSpeakerBaseX = 800;

const speedOfSound = 340; // m/s

// Controls
const distanceInput = document.getElementById('distance');
const distanceVal = document.getElementById('distanceVal');
const freqInput = document.getElementById('frequency');
const updateBtn = document.getElementById('updateBtn');

let speakerDistance = parseFloat(distanceInput.value); // meters
let frequency = parseFloat(freqInput.value); // Hz

function drawSpeakers(speakerDist) {
  // Draw left speaker
  ctx.fillStyle = "#333";
  ctx.fillRect(leftSpeakerX - 10, speakerY - 30, 20, 60);
  // Draw right speaker
  ctx.fillRect(rightSpeakerBaseX - 10, speakerY - 30, 20, 60);
  // Draw line connecting them
  ctx.strokeStyle = "#bbb";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(leftSpeakerX, speakerY);
  ctx.lineTo(rightSpeakerBaseX, speakerY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawWavesAndInterference(speakerDist, freq) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSpeakers(speakerDist);

  // 실제 거리(m)와 픽셀 변환 비율
  const pxPerMeter = (rightSpeakerBaseX - leftSpeakerX) /  speakerDist;
  const rightSpeakerX = leftSpeakerX + speakerDist * pxPerMeter;

  // 다시 스피커 표시
  ctx.fillStyle = "#333";
  ctx.fillRect(leftSpeakerX - 10, speakerY - 30, 20, 60);
  ctx.fillRect(rightSpeakerX - 10, speakerY - 30, 20, 60);

  // 파장 계산
  const wavelength = speedOfSound / freq;

  // 화면에 0~canvas.width, 0~canvas.height로 격자 샘플링
  const sampleStep = 10; // px
  for (let x = leftSpeakerX; x <= rightSpeakerX; x += sampleStep) {
    for (let y = 80; y <= canvas.height - 80; y += sampleStep) {
      const d1 = Math.sqrt((x - leftSpeakerX)**2 + (y - speakerY)**2) / pxPerMeter;
      const d2 = Math.sqrt((x - rightSpeakerX)**2 + (y - speakerY)**2) / pxPerMeter;
      const pd = Math.abs(d1 - d2); // 경로차

      // 위상차(라디안): Δϕ = 2π * (경로차/파장)
      const phi = 2 * Math.PI * (pd / wavelength);
      // 간섭 조건
      // 보강 : 위상차 = 0, 2π, 4π ... (mod 2π == 0)
      // 상쇄 : 위상차 = π, 3π, 5π ... (mod 2π == π)
      const mod = phi % (2 * Math.PI);

      // 보강/상쇄 임계값 설정(약간의 오차 허용)
      if (Math.abs(mod) < 0.23 || Math.abs(mod - 2 * Math.PI) < 0.23) {
        // Constructive: 파란색
        ctx.fillStyle = 'rgba(0,170,255,0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2*Math.PI);
        ctx.fill();
      } else if (Math.abs(mod - Math.PI) < 0.23) {
        // Destructive: 빨간색
        ctx.fillStyle = 'rgba(255,40,40,0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2*Math.PI);
        ctx.fill();
      }
    }
  }
  // 스피커 다시 덮어 그림
  ctx.fillStyle = "#333";
  ctx.fillRect(leftSpeakerX - 10, speakerY - 30, 20, 60);
  ctx.fillRect(rightSpeakerX - 10, speakerY - 30, 20, 60);
}

function update() {
  speakerDistance = parseFloat(distanceInput.value);
  frequency = parseFloat(freqInput.value);
  distanceVal.textContent = speakerDistance.toFixed(2);
  drawWavesAndInterference(speakerDistance, frequency);
}

distanceInput.addEventListener('input', update);
freqInput.addEventListener('change', update);
updateBtn.addEventListener('click', update);

// 최초 실행
update();