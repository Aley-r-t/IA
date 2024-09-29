let blobs = [];
let stream;
let rec;
let recordUrl;
let audioResponseHandler;

function recorder(url, handler) {
    recordUrl = url;
    if (typeof handler !== "undefined") {
        audioResponseHandler = handler;
    }
}

async function record() {
    try {
        document.getElementById("text").innerHTML = "<i>Grabando...</i>";
        document.getElementById("record").style.display = "none";
        document.getElementById("stop").style.display = "";

        blobs = [];

        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        rec = new MediaRecorder(stream);
        rec.ondataavailable = e => {
            if (e.data) {
                blobs.push(e.data);
            }
        };

        rec.onstop = doPreview;
        rec.start();
    } catch (e) {
        alert("No se pudo iniciar la grabación, verifica los permisos.");
    }
}

function doPreview() {
    if (!blobs.length) {
        console.log("No hay audio grabado.");
    } else {
        const blob = new Blob(blobs, { type: 'audio/wav' });

        const fd = new FormData();
        fd.append("audio", blob, "audio.wav");

        fetch(recordUrl, {
            method: "POST",
            body: fd,
        })
        .then(response => response.json())
        .then(audioResponseHandler)
        .catch(err => {
            console.log("Error al enviar el audio", err);
        });
    }
}

function stop() {
    rec.stop();
    stream.getTracks().forEach(track => track.stop());
}
