export namespace R.Images {
    export const images = "./resources/images";
    const tileImages = `${images}/tile`
    const multiImages = `${images}/multiplier`
    const iconImages = `${images}/icon`
    const uiImages = `${images}/ui`

    
    export const SlotFrame = `${uiImages}/slot.png`
    export const TileFrame = `${uiImages}/tileframe.png`
    export const SlotArrow = `${uiImages}/arrow.png`
    export const Background = `${uiImages}/background.png`
    export const SelectedFrame = `${uiImages}/selected.png`
    export const Title = `${uiImages}/title.png`
    export const BetFrame = `${uiImages}/betFrame.png`
    export const WinFrame = `${uiImages}/winFrame.png`
    export const BigWin = `${uiImages}/bigwin.png`
    export const MegaWin = `${uiImages}/megawin.png`
    export const SuperWin = `${uiImages}/superwin.png`
    export const TileOverlay = `${uiImages}/reel cover frame.png`


    export const SpinButton = `${iconImages}/spinButton.png`
    export const SpinButtonDown = `${iconImages}/spinButtonDown.png`
    export const TurboButton = `${iconImages}/turboButton.png`
    export const TurboButtonDown = `${iconImages}/turboButtonDown.png`
    export const Plus = `${iconImages}/increment.png`
    export const Minus = `${iconImages}/decrement.png`
    export const PlusDown = `${iconImages}/incrementDown.png`
    export const MinusDown = `${iconImages}/decrementDown.png`
    export const ToggleOn = `${iconImages}/exOn.png`
    export const ToggleOff = `${iconImages}/exOff.png`
    export const Logout = `${iconImages}/logout.png`
    export const Chip = `${iconImages}/casino-chip.png`
    export const Settings = `${iconImages}/management.png`


    export const Multi_1 = `${multiImages}/1x.png`
    export const Multi_2 = `${multiImages}/2x.png`
    export const Multi_3 = `${multiImages}/3x.png`
    export const Multi_5 = `${multiImages}/5x.png`
    export const Multi_10 = `${multiImages}/10x.png`
    export const Multi_15 = `${multiImages}/15x.png`

    export const Multi_EX2 = `${multiImages}/2xEx.png`
    export const Multi_EX3 = `${multiImages}/3xEx.png`
    export const Multi_EX5 = `${multiImages}/5xEx.png`
    export const Multi_EX10 = `${multiImages}/10xEx.png`
    export const Multi_EX15 = `${multiImages}/15xEx.png`


    export const Wild = `${tileImages}/wild.png`
    export const RedClown = `${tileImages}/redclown.png`
    export const BlueClown = `${tileImages}/blueclown.png`
    export const GreenClown = `${tileImages}/greenclown.png`
    export const Elephant = `${tileImages}/elephant.png`
    export const Tiger = `${tileImages}/tiger.png`
    export const Horse = `${tileImages}/horse.png`
    export const Monkey = `${tileImages}/monkey.png`
}

export namespace R.Sounds {
    const sounds = "./resources/sounds";
    export const BigWin = `${sounds}/big win.mp3`
    export const Decrement = `${sounds}/Decrease button sound.mp3`
    export const Turbo = `${sounds}/fast mode button sound.mp3`
    export const Increment = `${sounds}/increase-button-sound.mp3`
    export const MegaWin = `${sounds}/Mega win.mp3`
    export const SuperWin = `${sounds}/Superwin.mp3`
    export const Wild = `${sounds}/wild reveal.mp3`
    export const SubstanstialWin = `${sounds}/Wining sound- get price.mp3`
    export const Accumulate = `${sounds}/Accumulating sound.mp3`
    export const Background = `${sounds}/Background sound.mp3`
    export const Spin = `${sounds}/Click spin.mp3`
    export const ExOff = `${sounds}/ex off sound.wav`
    export const ExOn = `${sounds}/EX on sound.wav`
    export const Win = `${sounds}/WINPRICESOUND.mp3`
    export const ReelStop = `${sounds}/reel stop sound.mp3`
    export const Spinning = `${sounds}/slot spinning (standby).mp3`

}

export namespace R.Colours {
    export const Primary = 0x662413
}

export namespace R.Constants {
    export const BIG_WIN_AMOUNT = 100
    export const MEGA_WIN_AMOUNT = 200
    export const SUPER_WIN_AMOUNT = 300
}


export namespace R.Strings.English {
    export const Win = "You Won "
}

export namespace R.Strings.Chinese {
    export const Win = "NI HAO BING CHILING"
}


export namespace R{
    export const String = R.Strings.English;
    export const Font = "./resources/fonts/tuiven_trial.ttf"
}