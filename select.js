const chords=[["C5","G4","C5"], ["E4","D4","E4"], ["G4","B4","G4"]];
let part = 3;
let part_control_values = [];

function get_default_control_values(){
    return ({Octave:4, Tempo:120, Duration:4, Volume:15, Articulation:'ML'})
}
function make_chord(){
    return [...Array(part).keys()].map((part_num) => {
        let music_list = document.getElementById("code"+(part_num+1)).value;
        if (!music_list) return [];
        
        music_list = music_list.toUpperCase().split(/\s+/);
        console.log(music_list);
        music_list = music_list.flatMap((music) => {
            return music.match(/!|(O|T|L|V)\d+|MS|ML|((>|<)*[A-G](\+|#|-)?|R)(\d*)(\.*)/g)
        });
        console.log(music_list);

        var time = {"4n":0}; // 4n: 4分音符
        return music_list.flatMap((tone) => {
            let regex_result
            if (regex_result = tone.match(/O(?<number>\d+)/i)) {
                part_control_values[part_num].Octave = Number(regex_result.groups.number);
                return [];
            }
            if (regex_result = tone.match(/T(?<number>\d+)/i)) {
                part_control_values[part_num].Tempo = Number(regex_result.groups.number);
                return [];
            }
            if (regex_result = tone.match(/L(?<number>\d+)/i)) {
                part_control_values[part_num].Duration = Number(regex_result.groups.number);
                return [];
            }
            if (regex_result = tone.match(/V(?<number>\d+)/i)) {
                part_control_values[part_num].Volume = Number(regex_result.groups.number);
                return [];
            }
            if (tone == '!') {
                part_control_values[part_num] = get_default_control_values();
                return [];
            }
            if (tone == 'MS' || tone == 'ML') { // スタッカート or レガート
                part_control_values[part_num].Articulation = tone;
                return [];
            }
            if (regex_result = tone.match(/R(?<duration>\d*)(?<increasing>\.*)/i)) {
                if (!regex_result.groups.duration) regex_result.groups.duration = part_control_values[part_num].Duration; // 省略されたときはデフォルト値
                regex_result.groups.duration = Number(regex_result.groups.duration);

                time[`${regex_result.groups.duration}n${regex_result.groups.increasing}`] ??= 0; // Null 合体代入
                time[`${regex_result.groups.duration}n${regex_result.groups.increasing}`] ++;
                // console.log(typeof regex_result.groups.duration);
                return [];
            }
            if (regex_result = tone.match(/(?<octave>(>|<)*)(?<note>[A-G])(?<accidental>(\+|#|-)?)(?<duration>\d*)(?<increasing>\.*)/i)) {
                if (!regex_result.groups.duration) regex_result.groups.duration = part_control_values[part_num].Duration; // 省略されたときはデフォルト値
                regex_result.groups.duration = Number(regex_result.groups.duration);
                regex_result.groups.accidental = regex_result.groups.accidental.replace('+', '#').replace('-', 'b');

                // console.log(regex_result.groups.octave.match(/>/g));
                let retval = ({
                    time:Object.assign({}, time), 
                    note:regex_result.groups.note+regex_result.groups.accidental+(part_control_values[part_num].Octave+(regex_result.groups.octave.match(/>/g)?.length??0)-(regex_result.groups.octave.match(/</g)?.length??0)), 
                    velocity: part_control_values[part_num].Volume / 15, // 音の強さ
                    duration: `${regex_result.groups.duration}n${regex_result.groups.increasing}`
                });
                time[retval.duration] ??= 0; // Null 合体代入演算子
                time[retval.duration] ++;
                return [retval];
            }
            console.log("unknown tone", tone);
            return [];
        });
    });
}

function opt_make() {
    for(var i=0; i<part; ++i)
        part_control_values.push(get_default_control_values());

    document.getElementById("add").addEventListener("click", () => {
        let chord = document.getElementById("chord");
        chord.innerHTML += '\n<input type="text" id="code' + ++part +'" style="font-size:2em" /><br>';
    });
    document.getElementById("sub").addEventListener("click", () => {
        let chord = document.getElementById("chord");
        chord.lastElementChild.remove();
        chord.lastElementChild.remove();
        --part;
    });
}

async function play_chord() {
    await Tone.start();
    Tone.Transport.bpm.value = 60; // 1分あたり60

    const chords = make_chord();
    console.log(chords);
    
    chords.forEach(chord => {
        const synth = new Tone.Synth({
            portamento: 0,
            oscillator: {
                // type: "triangle"
                // type: "sine"
                type: "square"
            },
            envelope: {
                attack : 0.005 , // second?
                decay : 0.001 , // second?
                sustain : 0.9 , // range [0, 1] ???
                release : 0 // second?
            }
        }).toDestination();
        const part = new Tone.Part(((time, value) => {
            synth.triggerAttackRelease(value.note, value.duration, time, value.velocity)
            // synth.unsync();
            // Tone.Transport.bpm.value = 120; // 1分あたり60
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
