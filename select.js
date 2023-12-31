const tone=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const Key=4; 

var synths=[];

function prepare_chord(){
}
function make_chord(){
}

function opt_make() {
    let chord = document.getElementById("chord");
    let opt = "";
    for (let i = 0; i < 3; i++) {
        opt += "<input type='text' id=code style='font-size:2em'" + i +"/><br>\n";
        synths.push( new Tone.Synth().toDestination() ); // 複音発生
    }
    chord.innerHTML = opt;
}

function play_chord() {
    Tone.Transport.start()
    Tone.Transport.bpm.value = 100; // 1分あたり100

    synths.forEach((synth,i) => {
      synth.triggerAttackRelease(tone[[0,4,7][i]]+Key, '4n');
    });
}

window.onload = function () {
    opt_make();
    document.getElementById("play").addEventListener("click", function () {
        play_chord();
    });
}
