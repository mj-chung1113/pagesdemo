const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");

let mediaRecorder;
let audioChunks = [];

recordBtn.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        startRecording();
    } else {
        stopRecording();
    }
});

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        statusText.innerText = "음성을 분석 중입니다...";
        
        // Flask API에 STT 요청
        const response = await fetch("https://your-backend-server.com/stt", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        statusText.innerText = "결과: " + data.text;

        // TTS 음성 재생
        if (data.audio_url) {
            audioPlayer.src = data.audio_url;
            audioPlayer.play();
        }
    };

    audioChunks = [];
    mediaRecorder.start();
    statusText.innerText = "녹음 중...";
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        statusText.innerText = "녹음 종료.";
    }
}
