const chords=[["C5","G4","C5"], ["E4","D4","E4"], ["G4","B4","G4"]];
const Key=4; 

function prepare_chord(){
}
function make_chord(){
}

function opt_make() {
    let chord = document.getElementById("chord");
    let opt = "";
    for (let i = 0; i < 3; i++) {
        opt += "<input type='text' id=code style='font-size:2em'" + i +"/><br>\n";
    }
    chord.innerHTML = opt;
}

async function play_chord() {
    await Tone.start();
    Tone.Transport.bpm.value = 60; // 1分あたり60

    chords.forEach((chord) => {
        const tone = chord.map((tone,i) => ({time:{"4n":i}, note:tone, velocity: 0.9}));  
        const part = new Tone.Part(((time, value) => {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(value.note, "4n", time, value.velocity);
        }), tone).start();
    });
    Tone.Transport.start();
}

window.onload = function () {
    opt_make();
    document.getElementById("play").addEventListener("click", async () => {
        play_chord();
    });
}
