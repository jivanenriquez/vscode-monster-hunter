# VS Code Monster Hunter

A Monster Hunter reskin of the vscode-pets extension, built as a portfolio piece. Small animated creatures wander across a VS Code panel, and this project swaps the stock animals for Monster Hunter sprites.

## Language

**Upstream**:
The original tonybaloney/vscode-pets extension this project is cloned from (MIT licensed). Its behaviour is the baseline, and its code is cloned under `vscode-pets/`.
_Avoid_: Original, base repo

**Pet**:
One animated creature living in the panel, with a name, a position, and a current State. Upstream's word, kept as is even though ours will be monsters.
_Avoid_: Monster (reserved for the Monster Hunter subject matter, not the software object), character, creature

**Pet Type**:
The kind of creature a Pet is (dog, cat, and so on). Decides the Sequence and which sprite folder is used.
_Avoid_: Species, breed, class

**Colour**:
Upstream's name for a full alternate sprite set within one Pet Type. Not a tint, each Colour has its own complete set of Animations.
_Avoid_: Skin, variant, palette

**Sprite**:
The image shown for a Pet at a moment in time.
_Avoid_: Asset, texture, model

**Animation**:
One looping sprite clip for a named action (idle, walk, run, swipe, and so on). A Pet Type needs one per action its Sequence uses.
_Avoid_: Frame set, gif (the file format, not the concept)

**State**:
What a Pet is doing right now (sitting idle, walking right, chasing a ball). Each State shows one Animation.
_Avoid_: Mode, behaviour, action

**Sequence**:
The table of which States may follow which for one Pet Type. Next State is picked at random from the allowed list. This table is a Pet Type's personality.
_Avoid_: Behaviour tree, AI, script

**Tick**:
One step of the animation clock. Every Pet advances once per Tick.
_Avoid_: Frame (collides with sprite frames), update

**Size**:
How large Pets render in the panel (nano, small, medium, large).
_Avoid_: Scale, zoom

**Theme**:
A background and foreground scene behind the Pets, with optional particle effects.
_Avoid_: Skin, backdrop, level

**Floor**:
The ground line Pets stand on, set by the Theme and Size.
_Avoid_: Ground, baseline

**Ball**:
A thrown object a Pet runs to and catches.
_Avoid_: Toy, projectile

**Swipe**:
The Pet's reaction when the mouse passes over it.
_Avoid_: Hover animation, click

**Friend**:
Another Pet a Pet has paired with after overlapping it. A Pet follows its Friend when the Friend is running.
_Avoid_: Buddy, partner

## Hosts

**Panel**:
The editor tab that shows the Pets.
_Avoid_: Window, tab

**Explorer View**:
The Pets shown in the Explorer sidebar instead of an editor tab.
_Avoid_: Sidebar, side panel
