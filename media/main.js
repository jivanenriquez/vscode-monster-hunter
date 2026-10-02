// Runs inside the webview. Moves one pet on each tick from the extension.

const mediaUri = document.body.dataset.media;
const pet = document.getElementById('pet');
const bubble = document.getElementById('bubble');

const SPEED = 3; // px per tick
const RUN_MULTIPLIER = 1.6; // same as upstream
const RUN_LIMIT = 130; // ticks
const IDLE_MIN = 10; // ticks
const IDLE_MAX = 60;
const TURN_CHANCE = 0.02; // per tick while walking

// Each pet's sprites face one way, the other way is a horizontal flip.
const PET_ROOT = `${mediaUri}/${document.body.dataset.petRoot}`;
const SPRITE_FACING = document.body.dataset.facing;

let state = 'walk-right';
let heldState = null; // state to go back to after a hover swipe
let stateTicks = 0;
let idleLimit = IDLE_MIN;
let left = 0;
let hovering = false;

function setAnimation(name) {
    const src = `${PET_ROOT}_${name}_8fps.gif`;
    if (!pet.src.endsWith(`_${name}_8fps.gif`)) {
        pet.src = src;
    }
}

function setFacing(dir) {
    pet.style.transform = dir === SPRITE_FACING ? 'scaleX(1)' : 'scaleX(-1)';
}

// Which states may follow which, picked at random (the pet's personality).
const NEXT = {
    'walk-right': ['idle-right', 'walk-left', 'run-left'],
    'walk-left': ['idle-left', 'walk-right', 'run-right'],
    'run-right': ['walk-left', 'run-left'],
    'run-left': ['walk-right', 'run-right'],
    'idle-right': ['walk-right', 'walk-left'],
    'idle-left': ['walk-left', 'walk-right'],
};

function nextState(from) {
    const options = NEXT[from];
    return options[Math.floor(Math.random() * options.length)];
}

function changeState(next) {
    state = next;
    stateTicks = 0;
    idleLimit = IDLE_MIN + Math.floor(Math.random() * (IDLE_MAX - IDLE_MIN));
    setFacing(state.endsWith('left') ? 'left' : 'right');
    // State prefix is the gif name (walk, run, idle).
    setAnimation(state.split('-')[0]);
}

function onTick() {
    if (hovering) {
        return;
    }
    const maxLeft = window.innerWidth - pet.width;

    if (state.startsWith('idle')) {
        stateTicks++;
        if (stateTicks > idleLimit) {
            changeState(nextState(state));
        }
    } else {
        const running = state.startsWith('run');
        const dir = state.endsWith('right') ? 1 : -1;
        const speed = running ? SPEED * RUN_MULTIPLIER : SPEED;
        left = Math.min(Math.max(left + dir * speed, 0), maxLeft);
        stateTicks++;

        if (left >= maxLeft || left <= 0) {
            // Wall, so stop or turn back, never keep pushing into it.
            const back = dir === 1 ? 'left' : 'right';
            changeState(
                Math.random() < 0.5 ? `idle-${back}` : `walk-${back}`,
            );
        } else if (running && stateTicks > RUN_LIMIT) {
            changeState(nextState(state));
        } else if (!running && Math.random() < TURN_CHANCE) {
            changeState(nextState(state));
        }
    }
    pet.style.left = `${left}px`;
}

// Swipe is hover only. Idle animation plus the bubble, then back to what it was doing.
pet.addEventListener('mouseenter', () => {
    hovering = true;
    heldState = state;
    setAnimation('idle');
    bubble.style.left = `${left}px`;
    bubble.style.bottom = `${pet.height}px`;
    bubble.style.display = 'block';
});
pet.addEventListener('mouseleave', () => {
    hovering = false;
    bubble.style.display = 'none';
    changeState(heldState);
});

window.addEventListener('message', (event) => {
    if (event.data.command === 'tick') {
        onTick();
    }
});

changeState(state);
