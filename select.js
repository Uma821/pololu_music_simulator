const chords=[["C5","G4","C5"], ["E4","D4","E4"], ["G4","B4","G4"]];
const Key=4; 

// const music = "! L8 aa4baf+araa4>baf+ar dddef+4rdf+4raa2 dddef+2dddef+4.r eeederf+rargrf+rer aa4baf+araa4baf+erd1";
const music = "L8 aa4baf+araa4>baf+ar dddef+4rdf+4raa2 dddef+2dddef+4.r eeederf+rargrf+rer aa4baf+araa4baf+erd1";

function get_default_control_values(){
    return ({Octave:4, Tempo:120, Duration:4, Volume:15, Articulation:'ML'})
}
function make_chord(){
    var music_list = music.toUpperCase().split(/\s+/);
    console.log(music_list);
    music_list = music_list.flatMap((music) => {
        return music.match(/(O|T|L|V)\d+|MS|ML|((>|<)*[A-G](\+|#|-)?|R)(\d*)(\.*)/g)
    });
    console.log(music_list);

    var control_values = get_default_control_values();
    var time = {"4n":0}; // 4n: 4分音符
    return music_list.flatMap((tone) => {
        let regex_result
        if (regex_result = tone.match(/O(?<number>\d+)/i)) {
            control_values.Octave = Number(regex_result.groups.number);
            return [];
        }
        if (regex_result = tone.match(/T(?<number>\d+)/i)) {
            control_values.Tempo = Number(regex_result.groups.number);
            return [];
        }
        if (regex_result = tone.match(/L(?<number>\d+)/i)) {
            control_values.Duration = Number(regex_result.groups.number);
            return [];
        }
        if (regex_result = tone.match(/V(?<number>\d+)/i)) {
            control_values.Volume = Number(regex_result.groups.number);
            return [];
        }
        if (tone == 'MS' || tone == 'ML') { // スタッカート or レガート
            control_values.Articulation = tone;
            return [];
        }
        if (regex_result = tone.match(/R(?<duration>\d*)(?<increasing>\.*)/i)) {
            if (!regex_result.groups.duration) regex_result.groups.duration = control_values.Duration; // 省略されたときはデフォルト値
            regex_result.groups.duration = Number(regex_result.groups.duration);

            time[`${regex_result.groups.duration}n${regex_result.groups.increasing}`] ??= 0; // Null 合体代入
            time[`${regex_result.groups.duration}n${regex_result.groups.increasing}`] ++;
            // console.log(typeof regex_result.groups.duration);
            return [];
        }
        if (regex_result = tone.match(/(?<octave>(>|<)*)(?<note>[A-G])(?<accidental>(\+|#|-)?)(?<duration>\d*)(?<increasing>\.*)/i)) {
            if (!regex_result.groups.duration) regex_result.groups.duration = control_values.Duration; // 省略されたときはデフォルト値
            regex_result.groups.duration = Number(regex_result.groups.duration);
            regex_result.groups.accidental = regex_result.groups.accidental.replace('+', '#').replace('-', 'b');

            // console.log(regex_result.groups.octave.match(/>/g));
            let retval = ({
                time:Object.assign({}, time), 
                note:regex_result.groups.note+regex_result.groups.accidental+(control_values.Octave+(regex_result.groups.octave.match(/>/g)?.length??0)-(regex_result.groups.octave.match(/</g)?.length??0)), 
                velocity: control_values.Volume / 15, // 音の強さ
                duration: `${regex_result.groups.duration}n${regex_result.groups.increasing}`
            });
            time[retval.duration] ??= 0; // Null 合体代入演算子
            time[retval.duration] ++;
            return [retval];
        }
        console.log("unknown tone", tone);
        return [];
    });
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
    const chords = make_chord();
    console.log(chords);
    // Tone.Transport.bpm.value = 60; // 1分あたり60

    [chords].forEach((chord) => {
        const part = new Tone.Part(((time, value) => {
            const synth = new Tone.Synth({
                oscillator: {
                    // type: "triangle"
                    // type: "sine"
                    type: "square"
                },
                envelope: {
                    attack : 0.005 , // second
                    decay : 0.001 , // second
                    sustain : 0.4 , // range [0, 1] ???
                    release : 0 // second
                }
            }).toDestination();
            synth.triggerAttackRelease(value.note, value.duration, time, value.velocity).unsync();
        }), chord).start();
    });
    Tone.Transport.start();
}

window.onload = function () {
    opt_make();
    document.getElementById("play").addEventListener("click", async () => {
        play_chord();
    });
}
